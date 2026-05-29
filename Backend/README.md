# SmartLogix Backend -- Node.js

## Servicios

| Servicio | Puerto | Stack | DB |
|----------|--------|-------|-----|
| orders-service | 8081 | Express + pg + AWS SDK SQS | orders_db |
| inventory-service | 8082 | Express + pg + AWS SDK SQS | inventory_db |
| shipping-service | 8084 | Express + pg + AWS SDK SQS | shipping_db |
| notification-service | 8085 | Express + pg | notification_db |

## Flujo de eventos

```
orders-service --SQS--> inventory-service --SQS--> shipping-service --REST--> notification-service
```

1. **orders-service**: publica `ORDER_CONFIRMED` en `orders-queue` (SQS)
2. **inventory-service**: consume `orders-queue`, ajusta stock, publica `SHIPPING_CREATED` en `shipping-queue`
3. **shipping-service**: consume `shipping-queue`, crea envio con tracking, envia notificacion via REST
4. **notification-service**: recibe notificaciones via `POST /api/notifications`, persiste con deduplicacion

## Estructura de cada servicio

```
service-name/
├── Dockerfile          # node:22-alpine, npm install, COPY src/
├── package.json        # express, pg, uuid, cors, @aws-sdk/client-sqs
└── src/
    ├── index.js        # Express app, rutas REST, SQS consumer
    ├── db.js           # Pool de PostgreSQL
    └── sqs.js          # Cliente SQS (solo si usa SQS)
```

## Bases de datos

Cada servicio es dueno de su base. Las tablas se crean automaticamente al iniciar (`CREATE TABLE IF NOT EXISTS`).

```
orders_db       -> orders
inventory_db    -> inventory, sales, processed_events
shipping_db     -> shipments, processed_events
notification_db -> notification_records
```

## Comandos

```bash
# Dev (build local)
docker compose -f docker-compose.node.yml up -d

# VM (imagenes pre-built)
docker compose -f docker-compose.vm.yml up -d

# Verificar salud
curl http://localhost:80/healthz

# Logs de un servicio
docker logs smartlogix-orders -f
```

## Notificaciones sin SNS

El shipping-service envia notificaciones directamente al notification-service via `POST /api/notifications` con RestTemplate/fetch. No requiere SNS ni fan-out. En produccion se puede migrar a SNS si se necesita routing por audiencia.

## Health checks

Todos los servicios exponen `GET /health` que devuelve `{"status":"UP"}`.
