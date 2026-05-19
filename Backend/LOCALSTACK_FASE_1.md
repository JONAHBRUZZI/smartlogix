# SmartLogix LocalStack Fase 1

## Objetivo

Esta fase deja una simulacion local util para seguir iterando sobre SmartLogix sin entrar todavia a `DMS` ni `Glue`.

Queda materializado:

- `SQS + SNS` en `LocalStack`
- bucket `S3` para artefactos frontend
- `Secrets Manager` con configuracion base de plataforma
- `Route53` y `Cognito` como opcion avanzada (con licencia/token)

## Requisito para Cognito

Para que `Cognito` quede activo en este stack, el contenedor debe arrancar con `LOCALSTACK_AUTH_TOKEN` y habilitar servicios extra.

Ejemplo:

```powershell
$env:LOCALSTACK_IMAGE="localstack/localstack-pro:latest"
$env:LOCALSTACK_AUTH_TOKEN="tu-token"
$env:LOCALSTACK_SERVICES="cloudformation,ecs,lambda,iam,ec2,elbv2,rds,sqs,sns,logs,cloudwatch,kms,secretsmanager,s3,route53,cognito-idp"
$env:ENABLE_LOCALSTACK_ROUTE53="true"
$env:ENABLE_LOCALSTACK_COGNITO="true"
docker compose up -d
```

Sin ese token, `LocalStack` cae en modo no autenticado y servicios como `cognito-idp` pueden no estar disponibles.

Nota sobre `Cognito`:

- el compose queda estable en modo OSS por defecto
- para `Route53` y `Cognito`, habilita `LOCALSTACK_SERVICES` y flags `ENABLE_LOCALSTACK_*` como en el ejemplo
- si el contenedor arranca sin `LOCALSTACK_AUTH_TOKEN`, el stack sigue levantando igual
- en ese caso se omite solo la parte de identidad y seguimos con login demo local en frontend

## Como levantarlo

Desde [Backend](C:\Microservicios\SmartLogix\Backend):

```powershell
docker compose up -d
```

Si ya tienes otro `LocalStack` ocupando `4566`, puedes mover solo el puerto publicado del stack de SmartLogix:

```powershell
$env:LOCALSTACK_PORT="4568"
docker compose up -d
```

## Endpoints principales

- `http://localhost:8080/api/orders`
- `http://localhost:8080/api/inventory`
- `http://localhost:8080/api/shipments`
- `http://localhost:8080/api/notifications`
- `http://localhost:8081/api/orders`
- `http://localhost:8082/api/inventory`
- `http://localhost:8084/api/shipments`
- `http://localhost:8085/api/notifications`
- `http://localhost:8081/actuator/health`
- `http://localhost:8082/actuator/health`
- `http://localhost:8084/actuator/health`
- `http://localhost:8085/actuator/health`
- `http://localhost:4567` -> endpoint AWS local

## Usuarios Cognito previstos

- `admin@smartlogix.cl`
- `operaciones@smartlogix.cl`
- `bodega@smartlogix.cl`
- `soporte@smartlogix.cl`
- `transportista@smartlogix.cl`

Password comun local:

```text
Smartlogix123!
```

En esta fase ya podemos probar:

- login real por rol (`admin`, `operaciones`, `bodega`, `soporte`, `transportista`)
- flujo core de microservicios con roles diferenciados
