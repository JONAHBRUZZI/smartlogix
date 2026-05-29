# Estructura de Datos -- SmartLogix (v3.0 Node.js)

## Bases de datos y tablas

Cada microservicio es dueno de su base de datos. Las tablas se crean automaticamente al iniciar el servicio.

---

## orders_db (orders-service)
### `orders`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PRIMARY KEY | Identificador unico |
| customer_id | INTEGER NOT NULL | ID del cliente |
| sku | INTEGER NOT NULL | SKU del producto |
| quantity | INTEGER NOT NULL | Cantidad solicitada |
| status | VARCHAR(30) DEFAULT 'CREATED' | Estado del pedido |
| created_at | TIMESTAMP DEFAULT NOW() | Fecha de creacion |
| assigned_to | VARCHAR(100) | Transportista asignado |
| cancel_reason | VARCHAR(255) | Motivo de cancelacion |

**Estados:** CREATED, EN_PREPARACION, EN_REPARTO, ENTREGADO, CANCELADO

---

## inventory_db (inventory-service)
### `inventory`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PRIMARY KEY | Identificador |
| sku | INTEGER NOT NULL | SKU del producto |
| stock | INTEGER DEFAULT 0 | Cantidad disponible |

### `sales`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PRIMARY KEY | Identificador |
| sku | INTEGER NOT NULL | Producto vendido |
| quantity | INTEGER NOT NULL | Cantidad vendida |
| sale_date | TIMESTAMP DEFAULT NOW() | Fecha de venta |

### `processed_events`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| event_type | VARCHAR(64) NOT NULL | Tipo de evento |
| event_key | VARCHAR(128) NOT NULL | Clave unica del evento |
| processed_at | TIMESTAMP DEFAULT NOW() | Fecha de procesamiento |

**Primary Key:** (event_type, event_key) -- garantiza idempotencia

---

## shipping_db (shipping-service)
### `shipments`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PRIMARY KEY | Identificador |
| order_id | INTEGER NOT NULL | Orden asociada |
| customer_id | INTEGER NOT NULL | Cliente destino |
| sku | INTEGER NOT NULL | Producto |
| quantity | INTEGER NOT NULL | Cantidad |
| status | VARCHAR(30) DEFAULT 'EN_PREPARACION' | Estado del envio |
| tracking_number | VARCHAR(20) | Numero de seguimiento |
| created_at | TIMESTAMP DEFAULT NOW() | Fecha de creacion |
| shipped_at | TIMESTAMP | Fecha de despacho |
| customer_code | VARCHAR(20) | Codigo de cliente en entrega |
| recipient_rut | VARCHAR(15) | RUT del receptor |
| proof_of_delivery_image | TEXT | Imagen de comprobante |

**Estados:** EN_PREPARACION, EN_REPARTO, ENTREGADO, CANCELADO

### `processed_events`
(Identica a inventory_db.processed_events)

---

## notification_db (notification-service)
### `notification_records`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PRIMARY KEY | Identificador |
| event_id | VARCHAR(64) NOT NULL | ID unico del evento |
| order_id | INTEGER NOT NULL | Orden asociada |
| customer_id | INTEGER NOT NULL | Cliente |
| stage | VARCHAR(40) NOT NULL | Etapa (SHIPMENT_CREATED, etc.) |
| status | VARCHAR(30) NOT NULL | Estado |
| message | VARCHAR(500) NOT NULL | Mensaje descriptivo |
| target_audience | VARCHAR(20) NOT NULL | Audiencia (CLIENT, OPERATOR, BOTH) |
| source_service | VARCHAR(50) NOT NULL | Servicio origen |
| occurred_at | TIMESTAMP NOT NULL | Cuando ocurrio el evento |
| received_at | TIMESTAMP DEFAULT NOW() | Cuando se recibio |

**Unique constraint:** (event_id, target_audience) -- evita duplicados

**Indices:**
- `idx_notification_order_id` ON (order_id)
- `idx_notification_audience` ON (target_audience)

---

## Relaciones entre servicios

```
orders-service          inventory-service       shipping-service        notification-service
orders_db               inventory_db            shipping_db             notification_db
    |                        |                       |                        |
orders                  inventory               shipments               notification_records
    |                    sales                   processed_events
    |                    processed_events
    |
    +--[REST]--> POST /api/inventory/:sku/adjust (confirm)
    +--[SQS] --> orders-queue -> inventory-service (async)
                        |
                        +--[SQS] --> shipping-queue -> shipping-service (async)
                                                        |
                                                        +--[REST]--> POST /api/notifications
```
