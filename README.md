# SmartLogix

Plataforma de gestion logistica para PYMEs -- inventario, pedidos, envios y notificaciones en tiempo real.

> **Caso real:** Negocio "Don Juan -- Bebidas y Confites" (10 SKUs, 3 clientes, reparto local).

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│ Frontend -- React 18 + Vite + Tailwind + PWA        │
│ Despliegue: Vercel / S3 + CloudFront                │
├─────────────────────────────────────────────────────┤
│ API Gateway -- Nginx (reverse proxy, port 80)       │
├──────────┬──────────┬──────────┬────────────────────┤
│ orders   │ inventory│ shipping │ notification       │
│ Express  │ Express  │ Express  │ Express            │
│ Node.js  │ Node.js  │ Node.js  │ Node.js            │
│ :8081    │ :8082    │ :8084    │ :8085              │
├──────────┴──────────┴──────────┴────────────────────┤
│ PostgreSQL 15 -- 4 bases, una por bounded context   │
├─────────────────────────────────────────────────────┤
│ SQS (ElasticMQ) -- mensajeria asincrona             │
└─────────────────────────────────────────────────────┘
```

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Frontend** | React 18, TypeScript 5.7, Vite 6, Tailwind CSS 3, shadcn, PWA |
| **Backend** | Node.js 22, Express 4, pg, AWS SDK SQS |
| **Mensajeria** | ElasticMQ (dev) / AWS SQS (prod) |
| **Persistencia** | PostgreSQL 15 -- 4 bases (orders_db, inventory_db, shipping_db, notification_db) |
| **API Gateway** | Nginx Alpine (reverse proxy) |
| **Infra** | Docker Compose (dev), ECS Fargate (prod), CloudFormation |
| **RAM en VM** | ~500 MB total (vs ~1.6 GB con Java) |

---

## Inicio rapido

### 1. Clonar

```bash
git clone https://github.com/JONAHBRUZZI/smartlogix.git
cd SmartLogix
```

### 2. Levantar backend

```bash
docker compose -f docker-compose.node.yml up -d
```

### 3. Verificar

```bash
curl http://localhost:80/healthz
curl http://localhost:80/api/orders/test
```

### 4. Desplegar en VM (1 vCPU / 2 GB)

```bash
docker compose -f docker-compose.vm.yml up -d
```

---

## Flujo de negocio

```
POST /api/orders (crear pedido)
  -> PUT /api/orders/{id}/confirm
    -> POST inventory-service (ajusta stock)
    -> SQS orders-queue (evento ORDER_CONFIRMED)
    -> POST shipping-service (crea envio)
      -> POST notification-service (REST, notificacion SHIPMENT_CREATED)
```

- **Mensajeria asincrona**: orders-service -> SQS -> inventory-service -> SQS -> shipping-service
- **Notificaciones**: shipping-service -> REST POST -> notification-service

---

## Endpoints API

### Orders Service (:8081)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/orders | Crear orden |
| GET | /api/orders | Listar todas |
| GET | /api/orders/test | Health check |
| PUT | /api/orders/:id/status?status={STATUS} | Cambiar estado |
| PUT | /api/orders/:id/confirm | Confirmar orden |
| PUT | /api/orders/:id/cancel | Cancelar orden |
| PUT | /api/orders/:id/assign?transporter={NAME} | Asignar transportista |

### Inventory Service (:8082)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/inventory | Listar inventario |
| GET | /api/inventory/:sku | Consultar SKU |
| POST | /api/inventory | Agregar producto |
| PUT | /api/inventory/:sku | Actualizar stock |
| POST | /api/inventory/:sku/adjust?delta={N} | Ajustar stock (+/-) |
| GET | /api/sales | Listar ventas |
| POST | /api/sales | Registrar venta |

### Shipping Service (:8084)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/shipments | Listar envios |
| GET | /api/shipments/:orderId | Envio por orden |
| POST | /api/shipments | Crear envio |
| PUT | /api/shipments/:id/stage?stage={STATUS} | Cambiar etapa |
| GET | /api/shipments/:id/qr | QR del envio |

### Notification Service (:8085)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/notifications | Persistir notificacion |
| GET | /api/notifications/order/:orderId | Notificaciones por orden |
| GET | /api/notifications/audience/:audience | Notificaciones por audiencia |

---

## Estructura del proyecto

```
SmartLogix/
├── Backend/
│   ├── orders-service/           # Express + pg + SQS
│   ├── inventory-service/        # Express + pg + SQS
│   ├── shipping-service/         # Express + pg + REST notificaciones
│   ├── notification-service/     # Express + pg
│   ├── nginx/                    # API Gateway config
│   ├── scripts/                  # Utilidades
│   ├── infrastructure/           # CloudFormation (AWS prod)
│   ├── init-db.sql               # Creacion de bases de datos
│   └── seed.sql                  # Datos de prueba
├── Frontend/                     # React SPA + Vite + TypeScript
├── Landing/                      # Next.js landing page
├── docker-compose.node.yml       # Dev con build local
├── docker-compose.vm.yml         # VM con imagenes pre-built
├── docker-compose.optimized.yml  # Produccion optimizado
├── docker-compose.prod.yml       # Produccion completo
├── elasticmq.conf                # Configuracion de colas SQS
├── README.md
├── MODELO_NEGOCIO_CHILE.md
└── ESTRUCTURA_DATOS.md
```
