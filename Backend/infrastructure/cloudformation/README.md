# SmartLogix CloudFormation (Costo Optimizado para Lab Estudiantil)

Este paquete crea una arquitectura AWS con foco en bajo costo y servicios base para tu backend.

## Que incluye

0. `00-ecr.yml`
- ECR repos para los 4 microservicios
- Politica de lifecycle para limitar imagenes y costo

1. `01-network.yml`
- VPC con subredes publicas y privadas
- Sin NAT Gateway para ahorrar costo fijo mensual
- Security Groups para ALB, ECS y RDS

2. `02-rds.yml`
- RDS PostgreSQL single-AZ
- Clase `db.t3.micro` por defecto
- 20 GB iniciales
- Secret de conexion en Secrets Manager

3. `03-messaging-iam.yml`
- SQS por dominio + DLQ por cola
- SNS topic de notificaciones
- Subscription SNS -> SQS con filter policy por audiencia
- IAM roles minimos por microservicio (principio de minimo privilegio)

4. `04-compute-ecs.yml`
- ECS Fargate para 4 microservicios
- ALB con rutas por path
- CloudWatch Logs con retencion corta configurable (default 3 días)
- Credenciales DB inyectadas desde Secrets Manager (no texto plano)

5. `05-pipeline-single-service.yml`
- Pipeline reusable por microservicio
- Source (GitHub), Build (CodeBuild), Deploy (ECS)

## Orden de despliegue recomendado

1. ECR
2. Red
3. Messaging + IAM
4. RDS
5. Compute
6. Pipeline (uno por cada microservicio)

## Automatizacion recomendada (1 comando)

En lugar de ejecutar cada stack manualmente, puedes usar:

`infrastructure/cloudformation/deploy-lab.ps1`

Este script automatiza:
- validacion de templates
- deploy de `ECR -> Network -> Messaging -> RDS -> Compute`
- build/push de las 4 imagenes a ECR
- smoke test del ALB
- pipelines opcionales por microservicio

### Ejemplo (flujo completo)

```powershell
.\infrastructure\cloudformation\deploy-lab.ps1 `
  -Region us-east-1 `
  -ProjectName smartlogix `
  -DbMasterUsername smartlogix_admin `
  -DbMasterPassword 'CambiaEstaClave123!' `
  -FullRepositoryId 'JONAHBRUZZI/smartlogix-backend' `
  -ConnectionArn 'arn:aws:codestar-connections:us-east-1:123456789012:connection/xxxx' `
  -DeployPipelines
```

### Ejemplo rápido (sin build/push ni smoke)

```powershell
.\infrastructure\cloudformation\deploy-lab.ps1 `
  -Region us-east-1 `
  -ProjectName smartlogix `
  -DbMasterUsername smartlogix_admin `
  -DbMasterPassword 'CambiaEstaClave123!' `
  -SkipBuildPush `
  -SkipSmokeTest
```

Notas:
- si usas `-SkipBuildPush`, el script asume imagenes `:latest` en ECR.
- `-DeployPipelines` requiere `-ConnectionArn` y `-FullRepositoryId`.

### 0) ECR

```bash
aws cloudformation deploy \
  --stack-name smartlogix-ecr \
  --template-file infrastructure/cloudformation/00-ecr.yml
```

## Ejemplo de despliegue CLI

### 1) Network

```bash
aws cloudformation deploy \
  --stack-name smartlogix-network \
  --template-file infrastructure/cloudformation/01-network.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

### 2) Messaging + IAM

```bash
aws cloudformation deploy \
  --stack-name smartlogix-messaging \
  --template-file infrastructure/cloudformation/03-messaging-iam.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

### 3) RDS

```bash
aws cloudformation deploy \
  --stack-name smartlogix-rds \
  --template-file infrastructure/cloudformation/02-rds.yml \
  --parameter-overrides \
    PrivateSubnet1Id=subnet-aaa \
    PrivateSubnet2Id=subnet-bbb \
    RdsSecurityGroupId=sg-ccc \
    DbMasterUsername=smartlogix_admin \
    DbMasterPassword='CambiaEstaClave123!'
```

### 4) Compute

```bash
aws cloudformation deploy \
  --stack-name smartlogix-compute \
  --template-file infrastructure/cloudformation/04-compute-ecs.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    VpcId=vpc-xxx \
    PublicSubnet1Id=subnet-aaa \
    PublicSubnet2Id=subnet-bbb \
    AlbSecurityGroupId=sg-alb \
    ServiceSecurityGroupId=sg-svc \
    DbEndpoint=mydb.xxxxx.us-east-1.rds.amazonaws.com \
    DbSecretArn=arn:aws:secretsmanager:us-east-1:123456789012:secret:smartlogix/rds/app-xxxxx \
    OrdersTaskRoleArn=arn:aws:iam::123456789012:role/smartlogix-orders-task-role \
    InventoryTaskRoleArn=arn:aws:iam::123456789012:role/smartlogix-inventory-task-role \
    ShippingTaskRoleArn=arn:aws:iam::123456789012:role/smartlogix-shipping-task-role \
    NotificationTaskRoleArn=arn:aws:iam::123456789012:role/smartlogix-notification-task-role \
    OrdersQueueName=orders-queue \
    ShippingQueueName=shipping-queue \
    NotificationEventsQueueName=notification-events-queue \
    NotificationTopicArn=arn:aws:sns:us-east-1:123456789012:notification-events-topic \
    OrdersImageUri=123456789012.dkr.ecr.us-east-1.amazonaws.com/orders-service:latest \
    InventoryImageUri=123456789012.dkr.ecr.us-east-1.amazonaws.com/inventory-service:latest \
    ShippingImageUri=123456789012.dkr.ecr.us-east-1.amazonaws.com/shipping-service:latest \
    NotificationImageUri=123456789012.dkr.ecr.us-east-1.amazonaws.com/notification-service:latest \
    OrdersDesiredCount=1 \
    InventoryDesiredCount=1 \
    ShippingDesiredCount=1 \
    NotificationDesiredCount=1 \
    LogRetentionDays=3
```

### 5) Pipeline (ejemplo orders-service)

```bash
aws cloudformation deploy \
  --stack-name smartlogix-pipeline-orders \
  --template-file infrastructure/cloudformation/05-pipeline-single-service.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    PipelineNameSuffix=orders \
    ConnectionArn=arn:aws:codestar-connections:us-east-1:123456789012:connection/xxxx \
    FullRepositoryId=tu-org/tu-repo \
    BranchName=main \
    ServiceDirectory=orders-service \
    EcrRepositoryName=orders-service \
    EcsClusterName=smartlogix-cluster \
    EcsServiceName=smartlogix-orders-svc \
    ContainerName=orders-service
```

## Recomendaciones de costo para no pasar tu presupuesto

1. Usa una sola instancia RDS micro para los 4 servicios (como ya haces con DBs separadas).
2. Para ahorrar al maximo, deja solo `orders-service` en 1 replica y los otros en `DesiredCount=0` cuando no los uses.
3. Mantente en 1 tarea por servicio y ajusta CPU/Memoria solo si hay errores de memoria.
4. Mantiene CloudWatch Logs en 3 días de retencion.
5. Usa Secrets Manager para credenciales (ya aplicado en `04-compute-ecs.yml`).
6. Desactiva stacks al terminar laboratorios largos.
7. Evita NAT Gateway en este escenario; aquí no se crea para ahorrar costo fijo.
8. Usa llaves administradas AWS (`alias/aws/sqs` y `alias/aws/sns`) para evitar costo fijo de CMK propia.

## Nota importante

Tus servicios hoy exponen LocalStack en host por `localhost:4567` (mapeo `4567 -> 4566` del contenedor).
En este stack ya se inyectan endpoints AWS reales por variables de entorno en ECS.
Si luego creas perfiles `prod`, quedara aun mas limpio y estable.
