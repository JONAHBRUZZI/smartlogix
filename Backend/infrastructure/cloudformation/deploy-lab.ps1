[CmdletBinding()]
param(
    [string]$Region = "us-east-1",
    [string]$ProjectName = "smartlogix",
    [string]$DbMasterUsername = "smartlogix_admin",
    [Parameter(Mandatory = $true)]
    [string]$DbMasterPassword,
    [string]$DbInstanceClass = "db.t3.micro",
    [int]$AllocatedStorage = 20,
    [int]$OrdersDesiredCount = 1,
    [int]$InventoryDesiredCount = 1,
    [int]$ShippingDesiredCount = 1,
    [int]$NotificationDesiredCount = 1,
    [ValidateSet(1, 3, 7, 14)]
    [int]$LogRetentionDays = 3,
    [string]$ImageTag = "",
    [string]$OrdersQueueName = "orders-queue",
    [string]$ShippingQueueName = "shipping-queue",
    [string]$NotificationEventsQueueName = "notification-events-queue",
    [string]$NotificationTopicName = "notification-events-topic",
    [switch]$SkipBuildPush,
    [switch]$SkipSmokeTest,
    [switch]$DeployPipelines,
    [string]$ConnectionArn = "",
    [string]$FullRepositoryId = "",
    [string]$BranchName = "main",
    [string]$AwsProfile = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ImageTag)) {
    $ImageTag = (Get-Date -Format "yyyyMMdd-HHmmss")
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$cloudformationDir = Resolve-Path $PSScriptRoot

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host ("=== {0} ===" -f $Message) -ForegroundColor Cyan
}

function Assert-Tool {
    param([string]$ToolName)
    if (-not (Get-Command $ToolName -ErrorAction SilentlyContinue)) {
        throw "No se encontro el comando requerido: $ToolName"
    }
}

function Get-AwsBaseArgs {
    $args = @()
    if (-not [string]::IsNullOrWhiteSpace($AwsProfile)) {
        $args += @("--profile", $AwsProfile)
    }
    $args += @("--region", $Region)
    return $args
}

function Invoke-Aws {
    param([string[]]$Args)
    $fullArgs = @()
    $fullArgs += Get-AwsBaseArgs
    $fullArgs += $Args
    & aws @fullArgs
    if ($LASTEXITCODE -ne 0) {
        throw "AWS CLI fallo: aws $($fullArgs -join ' ')"
    }
}

function Invoke-AwsCapture {
    param([string[]]$Args)
    $fullArgs = @()
    $fullArgs += Get-AwsBaseArgs
    $fullArgs += $Args
    $output = & aws @fullArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "AWS CLI fallo: aws $($fullArgs -join ' ')`n$output"
    }
    return ($output | Out-String).Trim()
}

function Deploy-Stack {
    param(
        [string]$StackName,
        [string]$TemplatePath,
        [hashtable]$ParameterOverrides,
        [switch]$UseNamedIamCapability
    )

    $args = @(
        "cloudformation", "deploy",
        "--stack-name", $StackName,
        "--template-file", $TemplatePath
    )

    if ($UseNamedIamCapability) {
        $args += @("--capabilities", "CAPABILITY_NAMED_IAM")
    }

    if ($ParameterOverrides.Count -gt 0) {
        $args += "--parameter-overrides"
        foreach ($key in ($ParameterOverrides.Keys | Sort-Object)) {
            $args += ("{0}={1}" -f $key, $ParameterOverrides[$key])
        }
    }

    Invoke-Aws -Args $args
}

function Get-StackOutput {
    param(
        [string]$StackName,
        [string]$OutputKey
    )

    $query = "Stacks[0].Outputs[?OutputKey=='$OutputKey'].OutputValue | [0]"
    $value = Invoke-AwsCapture -Args @(
        "cloudformation", "describe-stacks",
        "--stack-name", $StackName,
        "--query", $query,
        "--output", "text"
    )

    if ([string]::IsNullOrWhiteSpace($value) -or $value -eq "None") {
        throw "No se encontro el output '$OutputKey' en el stack '$StackName'."
    }

    return $value
}

function Build-And-Push-ServiceImage {
    param(
        [string]$ServiceName,
        [string]$ImageUri
    )

    $dockerfilePath = Join-Path $repoRoot "$ServiceName\Dockerfile"
    if (-not (Test-Path $dockerfilePath)) {
        throw "No existe Dockerfile para $ServiceName en: $dockerfilePath"
    }

    Write-Host ("Build: {0}" -f $ImageUri) -ForegroundColor Yellow
    & docker build -f $dockerfilePath -t $ImageUri $repoRoot
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo docker build para $ServiceName"
    }

    Write-Host ("Push:  {0}" -f $ImageUri) -ForegroundColor Yellow
    & docker push $ImageUri
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo docker push para $ServiceName"
    }
}

function Invoke-SmokeRequest {
    param(
        [string]$Url,
        [int]$Attempts = 8,
        [int]$DelaySeconds = 12
    )

    for ($i = 1; $i -le $Attempts; $i++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 20
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                Write-Host ("[OK] {0} -> {1}" -f $Url, $response.StatusCode) -ForegroundColor Green
                return
            }
            Write-Host ("[WAIT] {0} -> {1}" -f $Url, $response.StatusCode) -ForegroundColor DarkYellow
        } catch {
            $statusCode = $null
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }
            if ($statusCode) {
                Write-Host ("[WAIT] {0} -> HTTP {1}" -f $Url, $statusCode) -ForegroundColor DarkYellow
            } else {
                Write-Host ("[WAIT] {0} -> {1}" -f $Url, $_.Exception.Message) -ForegroundColor DarkYellow
            }
        }
        Start-Sleep -Seconds $DelaySeconds
    }

    throw "Smoke test fallo para $Url despues de $Attempts intentos."
}

Assert-Tool -ToolName "aws"
Assert-Tool -ToolName "docker"

Write-Step "Obteniendo identidad AWS"
$accountId = Invoke-AwsCapture -Args @("sts", "get-caller-identity", "--query", "Account", "--output", "text")
$ecrRegistry = "$accountId.dkr.ecr.$Region.amazonaws.com"

$stackEcr = "$ProjectName-ecr"
$stackNetwork = "$ProjectName-network"
$stackMessaging = "$ProjectName-messaging"
$stackRds = "$ProjectName-rds"
$stackCompute = "$ProjectName-compute"

Write-Step "Validando templates CloudFormation"
Get-ChildItem -Path $cloudformationDir -Filter "*.yml" -File | ForEach-Object {
    Invoke-Aws -Args @(
        "cloudformation", "validate-template",
        "--template-body", ("file://{0}" -f $_.FullName)
    )
    Write-Host ("Validado: {0}" -f $_.Name) -ForegroundColor Green
}

Write-Step "Desplegando stack ECR"
Deploy-Stack -StackName $stackEcr -TemplatePath (Join-Path $cloudformationDir "00-ecr.yml") -ParameterOverrides @{}

Write-Step "Desplegando stack Network"
Deploy-Stack -StackName $stackNetwork -TemplatePath (Join-Path $cloudformationDir "01-network.yml") -ParameterOverrides @{
    ProjectName = $ProjectName
}

Write-Step "Desplegando stack Messaging + IAM"
Deploy-Stack -StackName $stackMessaging -TemplatePath (Join-Path $cloudformationDir "03-messaging-iam.yml") -UseNamedIamCapability -ParameterOverrides @{
    ProjectName = $ProjectName
    OrdersQueueName = $OrdersQueueName
    ShippingQueueName = $ShippingQueueName
    NotificationEventsQueueName = $NotificationEventsQueueName
    NotificationTopicName = $NotificationTopicName
}

Write-Step "Leyendo outputs de red/messaging"
$vpcId = Get-StackOutput -StackName $stackNetwork -OutputKey "VpcId"
$publicSubnet1Id = Get-StackOutput -StackName $stackNetwork -OutputKey "PublicSubnet1Id"
$publicSubnet2Id = Get-StackOutput -StackName $stackNetwork -OutputKey "PublicSubnet2Id"
$privateSubnet1Id = Get-StackOutput -StackName $stackNetwork -OutputKey "PrivateSubnet1Id"
$privateSubnet2Id = Get-StackOutput -StackName $stackNetwork -OutputKey "PrivateSubnet2Id"
$albSecurityGroupId = Get-StackOutput -StackName $stackNetwork -OutputKey "AlbSecurityGroupId"
$serviceSecurityGroupId = Get-StackOutput -StackName $stackNetwork -OutputKey "ServiceSecurityGroupId"
$rdsSecurityGroupId = Get-StackOutput -StackName $stackNetwork -OutputKey "RdsSecurityGroupId"

$ordersTaskRoleArn = Get-StackOutput -StackName $stackMessaging -OutputKey "OrdersTaskRoleArn"
$inventoryTaskRoleArn = Get-StackOutput -StackName $stackMessaging -OutputKey "InventoryTaskRoleArn"
$shippingTaskRoleArn = Get-StackOutput -StackName $stackMessaging -OutputKey "ShippingTaskRoleArn"
$notificationTaskRoleArn = Get-StackOutput -StackName $stackMessaging -OutputKey "NotificationTaskRoleArn"
$notificationTopicArn = Get-StackOutput -StackName $stackMessaging -OutputKey "NotificationTopicArn"

Write-Step "Desplegando stack RDS"
Deploy-Stack -StackName $stackRds -TemplatePath (Join-Path $cloudformationDir "02-rds.yml") -ParameterOverrides @{
    ProjectName = $ProjectName
    PrivateSubnet1Id = $privateSubnet1Id
    PrivateSubnet2Id = $privateSubnet2Id
    RdsSecurityGroupId = $rdsSecurityGroupId
    DbMasterUsername = $DbMasterUsername
    DbMasterPassword = $DbMasterPassword
    DbInstanceClass = $DbInstanceClass
    AllocatedStorage = $AllocatedStorage
}

Write-Step "Leyendo outputs de RDS"
$dbEndpoint = Get-StackOutput -StackName $stackRds -OutputKey "DbEndpoint"
$dbSecretArn = Get-StackOutput -StackName $stackRds -OutputKey "DbSecretArn"

$serviceNames = @("orders-service", "inventory-service", "shipping-service", "notification-service")
$imageByService = @{}

if ($SkipBuildPush) {
    Write-Step "SkipBuildPush activo: usando imagenes ':latest'"
    foreach ($serviceName in $serviceNames) {
        $imageByService[$serviceName] = "$ecrRegistry/${serviceName}:latest"
        Write-Host ("Imagen asumida: {0}" -f $imageByService[$serviceName]) -ForegroundColor Yellow
    }
} else {
    Write-Step "Login ECR"
    $loginPassword = Invoke-AwsCapture -Args @("ecr", "get-login-password")
    $loginPassword | docker login --username AWS --password-stdin $ecrRegistry | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo autenticar docker contra ECR ($ecrRegistry)."
    }

    Write-Step "Build + Push de imagenes"
    foreach ($serviceName in $serviceNames) {
        $imageUri = "$ecrRegistry/${serviceName}:$ImageTag"
        Build-And-Push-ServiceImage -ServiceName $serviceName -ImageUri $imageUri
        $imageByService[$serviceName] = $imageUri
    }
}

Write-Step "Desplegando stack Compute/ECS"
Deploy-Stack -StackName $stackCompute -TemplatePath (Join-Path $cloudformationDir "04-compute-ecs.yml") -UseNamedIamCapability -ParameterOverrides @{
    ProjectName = $ProjectName
    VpcId = $vpcId
    PublicSubnet1Id = $publicSubnet1Id
    PublicSubnet2Id = $publicSubnet2Id
    AlbSecurityGroupId = $albSecurityGroupId
    ServiceSecurityGroupId = $serviceSecurityGroupId
    DbEndpoint = $dbEndpoint
    DbSecretArn = $dbSecretArn
    OrdersTaskRoleArn = $ordersTaskRoleArn
    InventoryTaskRoleArn = $inventoryTaskRoleArn
    ShippingTaskRoleArn = $shippingTaskRoleArn
    NotificationTaskRoleArn = $notificationTaskRoleArn
    OrdersQueueName = $OrdersQueueName
    ShippingQueueName = $ShippingQueueName
    NotificationEventsQueueName = $NotificationEventsQueueName
    NotificationTopicArn = $notificationTopicArn
    OrdersImageUri = $imageByService["orders-service"]
    InventoryImageUri = $imageByService["inventory-service"]
    ShippingImageUri = $imageByService["shipping-service"]
    NotificationImageUri = $imageByService["notification-service"]
    OrdersDesiredCount = $OrdersDesiredCount
    InventoryDesiredCount = $InventoryDesiredCount
    ShippingDesiredCount = $ShippingDesiredCount
    NotificationDesiredCount = $NotificationDesiredCount
    LogRetentionDays = $LogRetentionDays
}

if ($DeployPipelines) {
    if ([string]::IsNullOrWhiteSpace($ConnectionArn) -or [string]::IsNullOrWhiteSpace($FullRepositoryId)) {
        throw "Para -DeployPipelines debes informar -ConnectionArn y -FullRepositoryId."
    }

    Write-Step "Desplegando pipelines por microservicio"
    $clusterName = Get-StackOutput -StackName $stackCompute -OutputKey "ClusterName"
    $ordersServiceName = Get-StackOutput -StackName $stackCompute -OutputKey "OrdersServiceName"
    $inventoryServiceName = Get-StackOutput -StackName $stackCompute -OutputKey "InventoryServiceName"
    $shippingServiceName = Get-StackOutput -StackName $stackCompute -OutputKey "ShippingServiceName"
    $notificationServiceName = Get-StackOutput -StackName $stackCompute -OutputKey "NotificationServiceName"

    $pipelineItems = @(
        @{
            Suffix = "orders"
            ServiceDirectory = "orders-service"
            EcrRepositoryName = "orders-service"
            EcsServiceName = $ordersServiceName
            ContainerName = "orders-service"
        },
        @{
            Suffix = "inventory"
            ServiceDirectory = "inventory-service"
            EcrRepositoryName = "inventory-service"
            EcsServiceName = $inventoryServiceName
            ContainerName = "inventory-service"
        },
        @{
            Suffix = "shipping"
            ServiceDirectory = "shipping-service"
            EcrRepositoryName = "shipping-service"
            EcsServiceName = $shippingServiceName
            ContainerName = "shipping-service"
        },
        @{
            Suffix = "notification"
            ServiceDirectory = "notification-service"
            EcrRepositoryName = "notification-service"
            EcsServiceName = $notificationServiceName
            ContainerName = "notification-service"
        }
    )

    foreach ($item in $pipelineItems) {
        $stackName = "$ProjectName-pipeline-$($item.Suffix)"
        Deploy-Stack -StackName $stackName -TemplatePath (Join-Path $cloudformationDir "05-pipeline-single-service.yml") -UseNamedIamCapability -ParameterOverrides @{
            ProjectName = $ProjectName
            PipelineNameSuffix = $item.Suffix
            ConnectionArn = $ConnectionArn
            FullRepositoryId = $FullRepositoryId
            BranchName = $BranchName
            ServiceDirectory = $item.ServiceDirectory
            EcrRepositoryName = $item.EcrRepositoryName
            EcsClusterName = $clusterName
            EcsServiceName = $item.EcsServiceName
            ContainerName = $item.ContainerName
        }
    }
}

$albDnsName = Get-StackOutput -StackName $stackCompute -OutputKey "AlbDnsName"
$albBaseUrl = "http://$albDnsName"

if (-not $SkipSmokeTest) {
    Write-Step "Smoke test sobre ALB"
    $smokeUrls = @(
        "$albBaseUrl/api/orders",
        "$albBaseUrl/api/inventory",
        "$albBaseUrl/api/shipments",
        "$albBaseUrl/api/notifications/audience/OPERATOR"
    )

    foreach ($url in $smokeUrls) {
        Invoke-SmokeRequest -Url $url
    }
}

Write-Step "Despliegue finalizado"
Write-Host ("Region:          {0}" -f $Region) -ForegroundColor Green
Write-Host ("ProjectName:     {0}" -f $ProjectName) -ForegroundColor Green
Write-Host ("ImageTag:        {0}" -f $ImageTag) -ForegroundColor Green
Write-Host ("ALB URL:         {0}" -f $albBaseUrl) -ForegroundColor Green
Write-Host ("ECR Registry:    {0}" -f $ecrRegistry) -ForegroundColor Green
Write-Host ("Stack Compute:   {0}" -f $stackCompute) -ForegroundColor Green
