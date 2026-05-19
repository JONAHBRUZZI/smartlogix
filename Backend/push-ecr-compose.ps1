param(
  [string]$Region = "us-east-1",
  [string]$ImageTag = "latest",
  [string]$AccountId = "",
  [switch]$CreateRepositories
)

$ErrorActionPreference = "Stop"

function Assert-CommandExists {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "No se encontro el comando requerido: $Name"
  }
}

Assert-CommandExists -Name "aws"
Assert-CommandExists -Name "docker"

if ([string]::IsNullOrWhiteSpace($AccountId)) {
  $AccountId = aws sts get-caller-identity --query Account --output text
}

if ([string]::IsNullOrWhiteSpace($AccountId)) {
  throw "No fue posible resolver AccountId. Pasalo con -AccountId o revisa aws configure."
}

$Registry = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$Repositories = @(
  "orders-service",
  "inventory-service",
  "shipping-service",
  "notification-service"
)

Write-Host "[1/4] Login en ECR ($Registry)..." -ForegroundColor Cyan
aws ecr get-login-password --region $Region |
  docker login --username AWS --password-stdin $Registry

if ($CreateRepositories) {
  Write-Host "[2/4] Verificando/creando repositorios ECR..." -ForegroundColor Cyan
  foreach ($repo in $Repositories) {
    $null = aws ecr describe-repositories --region $Region --repository-names $repo 2>$null
    if ($LASTEXITCODE -ne 0) {
      aws ecr create-repository --region $Region --repository-name $repo | Out-Null
      Write-Host "  - Creado: $repo"
    } else {
      Write-Host "  - Existe: $repo"
    }
  }
} else {
  Write-Host "[2/4] Saltando creacion de repositorios (usa -CreateRepositories para habilitar)." -ForegroundColor Yellow
}

Write-Host "[3/4] Build y tag de imagenes..." -ForegroundColor Cyan
foreach ($repo in $Repositories) {
  $servicePath = Join-Path -Path $PSScriptRoot -ChildPath $repo
  if (-not (Test-Path $servicePath)) {
    throw "No se encontro el directorio del servicio: $servicePath"
  }

  $dockerfilePath = Join-Path -Path $servicePath -ChildPath "Dockerfile"
  if (-not (Test-Path $dockerfilePath)) {
    throw "No se encontro el Dockerfile del servicio: $dockerfilePath"
  }

  Write-Host "  - Building $repo..." -ForegroundColor DarkCyan
  docker build -f $dockerfilePath -t "$repo`:$ImageTag" $PSScriptRoot
  if ($LASTEXITCODE -ne 0) {
    throw "Fallo el build de $repo"
  }

  docker tag "$repo`:$ImageTag" "$Registry/$repo`:$ImageTag"
  if ($LASTEXITCODE -ne 0) {
    throw "Fallo el tag de $repo"
  }
}

Write-Host "[4/4] Push de imagenes a ECR..." -ForegroundColor Cyan
foreach ($repo in $Repositories) {
  Write-Host "  - Pushing $repo..." -ForegroundColor DarkCyan
  docker push "$Registry/$repo`:$ImageTag"
  if ($LASTEXITCODE -ne 0) {
    throw "Fallo el push de $repo"
  }
}

Write-Host "\nImagenes publicadas:" -ForegroundColor Green
foreach ($repo in $Repositories) {
  Write-Host "- $Registry/$repo`:$ImageTag"
}
