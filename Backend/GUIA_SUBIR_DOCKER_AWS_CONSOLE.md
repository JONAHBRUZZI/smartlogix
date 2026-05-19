# Guia de Pruebas Reales + Publicacion a ECR

Esta guia esta actualizada al flujo simplificado del repo:

- Solo se usa `docker-compose.yml` para levantar el entorno.
- La publicacion a ECR se hace con `push-ecr-compose.ps1`.

Servicios del backend:

- orders-service
- inventory-service
- shipping-service
- notification-service

## 1) Prerrequisitos

### Para pruebas reales en VM

- Docker instalado y activo.
- Docker Compose disponible (`docker compose version`).
- Recursos sugeridos: 4 vCPU y 8 GB RAM.
- Puertos libres: 8080, 8081, 8082, 8084, 8085, 5432, 4567.

### Para publicar imagenes a AWS ECR

- AWS CLI instalado y configurado (`aws configure`).
- Permisos en ECR: crear repos, autenticacion y push.
- Region definida (ejemplo: `us-east-1`).

## 2) Levantar entorno en VM (flujo principal)

Desde la raiz del backend:

```bash
docker compose up -d --build
```

Comandos utiles:

```bash
docker compose ps
docker compose logs -f
docker compose logs -f orders-service
docker compose down
docker compose down -v
```

Notas:

- `docker compose down -v` elimina volumenes (incluye datos de PostgreSQL).
- El gateway queda expuesto por `http://IP_DE_TU_VM:8080`.

## 3) Smoke tests rapidos (validacion inicial)

### 3.1 Validar salud general de contenedores

```bash
docker compose ps
```

Debes ver los servicios en estado `Up`.

### 3.2 Probar endpoint base del gateway

```bash
curl http://IP_DE_TU_VM:8080
```

Si no responde como esperas, revisa logs:

```bash
docker compose logs -f api-gateway
```

### 3.3 Verificar que LocalStack tenga colas

```bash
docker compose exec localstack awslocal sqs list-queues
```

Debes ver al menos:

- orders-queue
- shipping-queue
- notification-events-queue

## 4) Publicar imagenes a ECR (flujo recomendado)

Script del repo:

- `push-ecr-compose.ps1`

Desde la raiz (`Backend/`), en PowerShell:

```powershell
.\push-ecr-compose.ps1 -Region us-east-1 -ImageTag latest -CreateRepositories
```

Si los repositorios ya existen:

```powershell
.\push-ecr-compose.ps1 -Region us-east-1 -ImageTag latest
```

El script hace automaticamente:

1. Login en ECR.
2. Creacion opcional de repositorios.
3. Build y tag de cada microservicio.
4. Push de imagenes.

## 5) Verificacion en AWS Console

1. Ve a `ECR -> Repositories`.
2. Abre cada repo:
   - orders-service
   - inventory-service
   - shipping-service
   - notification-service
3. En `Images`, verifica que aparezca el tag (`latest` o el que uses).

## 6) URIs para ECS/CloudFormation

Con `Region=us-east-1` y `ImageTag=latest`:

- `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/orders-service:latest`
- `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/inventory-service:latest`
- `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/shipping-service:latest`
- `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/notification-service:latest`

Estas URIs se usan en los parametros:

- OrdersImageUri
- InventoryImageUri
- ShippingImageUri
- NotificationImageUri

## 7) Problemas comunes

- Error `no basic auth credentials`:
  - Repite login en ECR (el script ya lo hace).

- Error `repository does not exist`:
  - Ejecuta el script con `-CreateRepositories`.

- Error de region:
  - Confirma que la region del script coincida con la region de los repos en ECR.

- Error `AccessDenied`:
  - Revisa politicas IAM para ECR (auth token, create repo, push/pull).

- Servicios no levantan en VM:
  - Revisa `docker compose logs -f`.
  - Verifica puertos ocupados.
  - Verifica recursos de CPU/RAM.

## 8) Flujo resumido recomendado

1. Levantar pruebas reales: `docker compose up -d --build`.
2. Validar estado con `docker compose ps` y logs.
3. Publicar a ECR con `push-ecr-compose.ps1`.
4. Usar URIs de ECR en ECS/CloudFormation.

## 9) CI/CD recomendado (GitHub Actions + OIDC)

Importante para entornos de laboratorio (Vocareum/AWS Academy):

- Si aparece `You don't have permissions to access this resource`, normalmente el lab bloquea IAM/OIDC.
- En ese caso, omite temporalmente GitHub Actions para deploy y usa flujo manual con AWS CLI + ECS Console.

Si quieres dejar de hacer build/push/deploy manual en cada cambio, ya tienes workflow listo en:

- `.github/workflows/deploy-orders-ecs.yml`

Este workflow hace:

1. Build de `orders-service` usando contexto raiz.
2. Push a ECR con tag del commit (`github.sha`).
3. Actualizacion de Task Definition en ECS.
4. Deploy del service y espera estabilidad.

### 9.1 Crear rol IAM para GitHub OIDC (una sola vez)

1. En IAM, crea un Identity Provider OIDC para `token.actions.githubusercontent.com` si aun no existe.
2. Crea un rol para GitHub Actions con confianza OIDC al repositorio.
3. Permite al rol permisos minimos para:
  - ECR push (`ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:CompleteLayerUpload`, `ecr:UploadLayerPart`, `ecr:InitiateLayerUpload`, `ecr:PutImage`, `ecr:BatchGetImage`)
  - ECS deploy (`ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`, `ecs:UpdateService`)
  - IAM pass role de task execution/task role (`iam:PassRole`) si aplica.

### 9.2 Configurar secreto en GitHub

En tu repo de GitHub:

1. Ve a `Settings -> Secrets and variables -> Actions`.
2. Crea el secreto:
  - `AWS_GITHUB_ACTIONS_ROLE_ARN` = ARN del rol OIDC creado.

### 9.3 Ajustar variables del workflow

En `.github/workflows/deploy-orders-ecs.yml`, revisa que coincidan con tu entorno:

- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `ECS_TASK_DEFINITION`
- `CONTAINER_NAME`

### 9.4 Ejecutar

Se dispara automaticamente cuando hay cambios en:

- `orders-service/**`
- `event-contracts/**`

Tambien puedes lanzarlo manual desde `Actions -> Deploy Orders Service to ECS -> Run workflow`.

### 9.5 Verificacion

1. En GitHub Actions, confirma job en verde.
2. En ECS, verifica que el service tenga una nueva revision de task definition.
3. Revisa logs del contenedor para validar arranque correcto.

### 9.6 Modo laboratorio (sin permisos IAM/OIDC)

Si el lab no permite crear/usar el rol OIDC:

1. Publica imagenes manualmente (esto ya te funciona):
  - `.\push-ecr-compose.ps1 -Region us-east-1 -ImageTag latest`
2. Despliega en ECS desde consola con el rol disponible del lab.
3. Cuando salgas del lab y tengas cuenta propia con permisos IAM, activas nuevamente el flujo OIDC.
