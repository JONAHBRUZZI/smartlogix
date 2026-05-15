# Estructura de Datos - SmartLogix Microservicios (v2.0)

## Diagrama de Relaciones

```
                    +------------------+
                    |     Company      |  <--- Entidad separada (antes embebida en User)
                    | (identity-svc)   |
                    +--------+---------+
                             | 1
                             |
                             | *
                    +--------+---------+
                    |       Role       |  <--- Entidad separada (antes String en User)
                    | (identity-svc)   |
                    +--------+---------+
                             | 1
                             |
                             | *
                    +--------+---------+
                    |      User        |  <--- Refactorizado, FK a Role y Company
                    | (identity-svc)   |
                    +--------+---------+
                             | 1
                             |
                             | *
                    +--------+---------+
                    |  UserSetting     |  <--- Clave-Valor (1FN, antes era JSON)
                    | (identity-svc)   |
                    +------------------+

     +--------------------+
     |    Inventory       |
     |  (inventory-svc)   |
     +--------------------+
     | sku: Long          |
     +--------------------+

     +--------------------+
     |      Order         |
     |  (orders-svc)      |
     +--------+-----------+
              |
              +-------------------------------------+
              |                                     |
         +----v--------------+          +----------v------+
         |    Shipment       |          |NotificationRec  |
         | (shipping-svc)    |          |(notification)   |
         +----+--------------+          +-----------------+
              |
         +----v--------------+
         |  ProcessedEvent   |  <--- Todas las svc usan para idempotencia
         |  (cada servicio)  |
         +-------------------+
```

---

## Entidades Detalladas

### 0. Service: identity-service (NUEVO)

#### 0.1 Role
**Proposito:** Catalogo de roles del sistema

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `name` | String(50) | NOT NULL, UNIQUE | Nombre del rol: owner, ops, warehouse, support, customer, shipper |
| `description` | String(500) | Nullable | Descripcion del rol |

#### 0.2 Company
**Proposito:** Datos de la empresa/ecommerce (multi-tenant)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `name` | String(200) | NOT NULL | Nombre del ecommerce/empresa |
| `rut` | String(20) | UNIQUE | RUT de la empresa |
| `isActive` | Boolean | NOT NULL | Estado activo/inactivo |
| `tier` | String(30) | NOT NULL | Plan: STARTER, PROFESSIONAL, ENTERPRISE |
| `createdAt` | LocalDateTime | NOT NULL | Fecha de registro |

#### 0.3 User (REFACTORIZADO)
**Proposito:** Usuarios del sistema con FK a Role y Company

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `email` | String(255) | NOT NULL, UNIQUE | Email (usado para login) |
| `name` | String(200) | NOT NULL | Nombre completo |
| `passwordHash` | String(255) | Nullable | Hash de contrasena |
| `isActive` | Boolean | NOT NULL | Estado activo/inactivo (antes era String status) |
| `role_id` | Long | FK -> Role, NOT NULL | Rol del usuario |
| `company_id` | Long | FK -> Company, NOT NULL | Empresa a la que pertenece |
| `phone` | String(50) | Nullable | Telefono de contacto |
| `lastLogin` | LocalDateTime | Nullable | Ultimo acceso |
| `createdAt` | LocalDateTime | NOT NULL | Fecha de registro |
| `updatedAt` | LocalDateTime | NOT NULL | Ultima actualizacion |

**Cambios respecto a v1.1:**
- `id`: UUID -> Long con auto-increment
- `role`: String embebido -> FK a tabla Role
- `companyId`: String embebido -> FK a tabla Company
- `status`: String (ACTIVE/INACTIVE/SUSPENDED) -> Boolean isActive
- `settings`: JSON -> tabla UserSetting (cumple 1FN)
- `businessName`: movido a Company.name
- `tier`: movido a Company.tier
- `emailVerified` y `twoFactorEnabled`: removidos (se manejan en Cognito)

#### 0.4 UserSetting
**Proposito:** Configuraciones personalizadas clave-valor (1FN)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `user_id` | Long | FK -> User, NOT NULL | Usuario propietario |
| `setting_key` | String(100) | NOT NULL, UNIQUE compuesto | Clave de configuracion |
| `setting_value` | String(500) | Nullable | Valor de configuracion |

**Unique constraint:** (user_id, setting_key)

---

### 1. Order (orders-service)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `customerId` | **Long** | NOT NULL | ID del cliente (antes String) |
| `sku` | **Long** | NOT NULL | SKU del producto (antes String) |
| `quantity` | Integer | NOT NULL, >=1 | Cantidad ordenada |
| `status` | **OrderStatus** | NOT NULL, Enum STRING | Estado: CREATED, CONFIRMED, REJECTED, SHIPPED, DELIVERED, CANCELLED |
| `createdAt` | LocalDateTime | NOT NULL | Timestamp de creacion |

**Cambios:**
- `customerId`: String -> Long
- `sku`: String -> Long
- `status`: String -> Enum OrderStatus

---

### 2. Inventory (inventory-service)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `sku` | **Long** | NOT NULL, UNIQUE | SKU del producto (antes String) |
| `stock` | Integer | NOT NULL, >=0 | Cantidad disponible |

**Cambios:**
- `sku`: String -> Long

---

### 3. Shipment (shipping-service)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `orderId` | **Long** | NOT NULL | Referencia a Order (antes String) |
| `customerId` | **Long** | NOT NULL | ID del cliente (antes String) |
| `sku` | **Long** | NOT NULL | SKU del producto (antes String) |
| `quantity` | Integer | NOT NULL, >=1 | Cantidad enviada |
| `status` | **ShipmentStatus** | NOT NULL, Enum STRING | Estado: PENDING, IN_TRANSIT, DELIVERED, FAILED |
| `trackingNumber` | String | Unique | Tracking generado |
| `createdAt` | LocalDateTime | NOT NULL | Fecha de creacion |
| `shippedAt` | LocalDateTime | Nullable | Fecha de envio |

**Cambios:**
- `orderId`: String -> Long
- `customerId`: String -> Long
- `sku`: String -> Long
- `status`: String -> Enum ShipmentStatus

---

### 4. NotificationRecord (notification-service)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `eventId` | String(64) | NOT NULL | ID del evento |
| `orderId` | **Long** | NOT NULL | Referencia a Order (antes String) |
| `customerId` | **Long** | NOT NULL | ID del cliente (antes String) |
| `stage` | String(40) | NOT NULL | Etapa del proceso |
| `status` | String(30) | NOT NULL | Estado de notificacion |
| `message` | String(500) | NOT NULL | Contenido del mensaje |
| `targetAudience` | String(20) | NOT NULL | Destino: CLIENT, OPERATOR, BOTH |
| `sourceService` | String(50) | NOT NULL | Servicio origen |
| `occurredAt` | LocalDateTime | NOT NULL | Cuando ocurrio |
| `receivedAt` | LocalDateTime | NOT NULL | Cuando se registro |

**Cambios:**
- `orderId`: String -> Long
- `customerId`: String -> Long

---

### 5. ProcessedEvent (Todos los servicios, sin cambios)

| Campo | Tipo | Restriccion | Descripcion |
|-------|------|------------|-------------|
| `id` | Long | PK, Auto-increment | Identificador unico |
| `eventType` | String(100) | NOT NULL, Composite UNIQUE | Tipo de evento |
| `eventKey` | String(150) | NOT NULL, Composite UNIQUE | Clave unica del evento |
| `status` | String(20) | NOT NULL | PROCESSING, SUCCESS, FAILED |
| `createdAt` | LocalDateTime | NOT NULL | Timestamp de recepcion |
| `processedAt` | LocalDateTime | Nullable | Timestamp de procesamiento |

---

## Resumen de Cambios de Tipos (v1.x -> v2.0)

| Archivo | Campo | Antes | Ahora |
|---------|-------|-------|-------|
| Order.java | customerId | String | Long |
| Order.java | sku | String | Long |
| Order.java | status | String | OrderStatus (Enum) |
| OrderRequest.java | customerId | String | Long |
| OrderRequest.java | sku | String | Long |
| OrderResponse.java | orderId | String | Long |
| Inventory.java | sku | String | Long |
| Shipment.java | orderId | String | Long |
| Shipment.java | customerId | String | Long |
| Shipment.java | sku | String | Long |
| Shipment.java | status | String | ShipmentStatus (Enum) |
| NotificationRecord.java | orderId | String | Long |
| NotificationRecord.java | customerId | String | Long |
| OrderEvent.java | orderId | String | Long |
| OrderEvent.java | customerId | String | Long |
| OrderEvent.java | sku | String | Long |
| ShippingEvent.java | orderId | String | Long |
| ShippingEvent.java | customerId | String | Long |
| ShippingEvent.java | sku | String | Long |
| NotificationEvent.java | orderId | String | Long |
| NotificationEvent.java | customerId | String | Long |
| InventoryResponse.java | orderId | String | Long |

## Bases de Datos

| Base de datos | Microservicio | Puerto |
|--------------|---------------|--------|
| orders_db | orders-service | 8081 |
| inventory_db | inventory-service | 8082 |
| identity_db | identity-service (NUEVO) | 8083 |
| shipping_db | shipping-service | 8084 |
| notification_db | notification-service | 8085 |

---

## Versioning

- **Version:** 2.0
- **Ultima actualizacion:** 2026-05-05
- **Cambios en v2.0:**
  - Tabla User refactorizada con FK a Role y Company
  - Creada entidad Role (tabla separada)
  - Creada entidad Company (tabla separada)
  - Creada entidad UserSetting (clave-valor, cumple 1FN)
  - status: Boolean para User (isActive)
  - customerId, orderId, sku: String -> Long en todas las entidades y event contracts
  - Status enums para Order (OrderStatus) y Shipment (ShipmentStatus)
  - Creado microservicio identity-service (puerto 8083)
