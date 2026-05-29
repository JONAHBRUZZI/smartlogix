# Analisis de Patrones de Diseno -- SmartLogix

**Proyecto:** SmartLogix
**Stack:** Node.js 22 + Express + PostgreSQL + SQS
**Fecha:** Mayo 2026

---

## 1. Patrones Creacionales

### 1.1 Factory Method (Pool de conexiones)
**Ubicacion:** Todos los servicios (`Backend/*-service/src/db.js`)

**Problema que resuelve:** Crear conexiones a base de datos bajo demanda sin exponer la logica de configuracion.

**Solucion:** Cada servicio define un modulo `db.js` que exporta un `Pool` de `pg` preconfigurado. Los modulos que necesitan acceso a datos importan el pool sin preocuparse por la configuracion.

```js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DB_URL, max: 3 });
module.exports = pool;
```

**Justificacion:** Encapsula la creacion del pool. Cambios en la configuracion de BD no afectan al resto del codigo.

---

## 2. Patrones de Comportamiento

### 2.1 Patron Repository
**Ubicacion:** Todos los servicios (`src/index.js`)

**Problema que resuelve:** Separar la logica de negocio del acceso a datos.

**Solucion:** Las consultas SQL se definen directamente en los handlers de Express usando el pool. Para consultas complejas se usa `CREATE TABLE IF NOT EXISTS` en funciones `ensureTables()`.

**Justificacion:** Simple y directo para servicios con pocas entidades. Si el proyecto crece, se puede refactorizar a modulos repository separados.

### 2.2 Patron Observer / Event-Driven (SQS + REST)
**Ubicacion:** orders-service, inventory-service, shipping-service

**Problema que resuelve:** Los microservicios necesitan comunicarse sin acoplamiento directo. Cuando se confirma un pedido, se debe notificar a inventory y shipping sin depender de HTTP sincrono.

**Solucion:** La comunicacion core usa SQS (via ElasticMQ en dev). Las notificaciones al cliente usan REST directo del shipping-service al notification-service.

```
orders-service --SQS--> inventory-service --SQS--> shipping-service --REST--> notification-service
```

**Justificacion:** Desacopla los servicios. Cada uno evoluciona y escala independientemente. Si un servicio esta caido, los eventos quedan en la cola.

---

## 3. Patrones Arquitectonicos

### 3.1 Microservicios con Database per Service
**Ubicacion:** `docker-compose.node.yml`

**Problema que resuelve:** Un sistema monolitico con una sola base de datos crea acoplamiento en el esquema.

**Solucion:** Cada microservicio tiene su propia base de datos:
- `orders_db` -> orders-service
- `inventory_db` -> inventory-service
- `shipping_db` -> shipping-service
- `notification_db` -> notification-service

**Justificacion:** Aislamiento total entre servicios. Cada servicio puede modificar su esquema sin afectar a otros.

### 3.2 API Gateway
**Ubicacion:** `Backend/nginx/nginx.conf`

**Problema que resuelve:** Un punto unico de entrada para todas las APIs, ocultando la topologia interna de microservicios.

**Solucion:** Nginx actua como reverse proxy enrutando por path:
- `/api/orders` -> orders-service:8081
- `/api/inventory`, `/api/sales` -> inventory-service:8082
- `/api/shipments` -> shipping-service:8084
- `/api/notifications` -> notification-service:8085

### 3.3 Saga Pattern (Orquestacion de Pedidos)
**Ubicacion:** orders-service, inventory-service, shipping-service

**Problema que resuelve:** El proceso "crear pedido -> validar stock -> confirmar -> generar despacho" es una transaccion distribuida entre servicios.

**Solucion:** Saga orquestada donde orders-service actua como orquestador:
1. Crea el pedido en `orders_db`
2. Confirma: ajusta inventario via REST, publica evento SQS
3. inventory-service consume SQS, valida stock, publica envio
4. shipping-service consume SQS, crea envio, notifica

---

## 4. Decisiones Tecnicas

### 4.1 Node.js sobre Java
- **Peso**: Imagenes ~100 MB vs ~428 MB (Java)
- **RAM**: ~50 MB por servicio vs ~250 MB
- **Arranque**: ~2 segundos vs ~3 minutos
- **Productividad**: Mismo codigo JS en front y back

### 4.2 REST para notificaciones en vez de SNS
- Simplifica la arquitectura eliminando fan-out y filtros
- Suficiente para el caso de uso actual (una audiencia BOTH)
- Escalable a SNS en produccion si se necesita

### 4.3 ElasticMQ para desarrollo local
- Imagen de ~100 MB (vs ~800 MB de LocalStack)
- Colas configuradas por archivo (elasticmq.conf)
- Compatible con AWS SDK SQS
