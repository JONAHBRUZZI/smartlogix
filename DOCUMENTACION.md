# SmartLogix - Documentacion del Proyecto

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                      │
│               React + TypeScript + Vite                  │
│                   shadcn/ui + Tailwind                   │
│                     http://localhost:3000                 │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP (REST)
               ▼
┌─────────────────────────────────────────────────────────┐
│               API GATEWAY (nginx:8080)                    │
│                  smartlogix-api-gateway                   │
└──────┬────────────┬──────────────┬──────────┬───────────┘
       │            │              │          │
       ▼            ▼              ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Orders  │ │Inventory │ │ Shipping │ │Notific.  │
│ Service  │ │ Service  │ │ Service  │ │ Service  │
│ :8081    │ │ :8082    │ │ :8084    │ │ :8085    │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                        │
                        ▼
               ┌────────────────┐
               │   PostgreSQL    │
               │     :5433      │
               │ (5 databases)   │
               └────────────────┘
```

## Bases de Datos (PostgreSQL)

| Database       | Tablas principales              |
|----------------|---------------------------------|
| `orders_db`    | orders, customers               |
| `inventory_db` | inventory, sales                |
| `shipping_db`  | shipments                       |
| `notification_db` | notifications               |
| `identity_db`  | users                           |

## Servicios Backend (Java 21, Spring Boot 3.4)

### 1. orders-service (:8081)
| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `GET /api/orders` | GET | Lista todas las ordenes |
| `POST /api/orders` | POST | Crea orden (stock validation) |
| `PUT /api/orders/{id}/confirm` | PUT | Confirma orden → descuenta stock + crea envio |
| `PUT /api/orders/{id}/cancel` | PUT | Cancela orden con motivo + restaura stock |
| `PUT /api/orders/{id}/status?status=` | PUT | Cambia estado manual |
| `PUT /api/orders/{id}/assign?transporter=` | PUT | Asigna transportista |
| `GET /api/customers` | GET | Lista clientes |
| `POST /api/customers` | POST | Crea cliente |

### 2. inventory-service (:8082)
| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `GET /api/inventory` | GET | Lista inventario |
| `GET /api/inventory/{sku}` | GET | Producto por SKU |
| `POST /api/inventory` | POST | Agrega producto |
| `PUT /api/inventory/{sku}` | PUT | Actualiza producto |
| `DELETE /api/inventory/{sku}` | DELETE | Elimina producto |
| `POST /api/inventory/{sku}/adjust?delta=` | POST | Ajusta stock (+/-) |
| `GET /api/sales` | GET | Lista ventas |
| `POST /api/sales` | POST | Registra venta |

### 3. shipping-service (:8084)
| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `GET /api/shipments` | GET | Lista envios |
| `GET /api/shipments/{orderId}` | GET | Envio por orderId |
| `POST /api/shipments` | POST | Crea envio |
| `PUT /api/shipments/{id}/stage?stage=` | PUT | Cambia etapa (EN_REPARTO, ENTREGADO, CANCELADO) |
| `GET /api/shipments/{id}/qr` | GET | Obtiene codigo QR |

### 4. notification-service (:8085)
Servicio de notificaciones (pendiente de integracion real).

## Estados del Flujo

```
Orden: CREATED → EN_PREPARACION → EN_REPARTO → ENTREGADO
                  ↘       CANCELADO (con motivo)      ↗
                          (restaura stock)

Envio: EN_PREPARACION → EN_REPARTO → ENTREGADO
         ↘    CANCELADO                        ↗
```

## Frontend (React + TypeScript)

### Paginas y Rutas
| Ruta | Pagina | Descripcion |
|------|--------|-------------|
| `/dashboard` | DashboardPage | Panel general con metricas |
| `/orders` | OrdersPage | Gestion de pedidos |
| `/orders/:id` | OrderDetailPage | Detalle del pedido |
| `/inventory` | InventoryPage | Control de stock |
| `/inventory/:sku` | InventoryDetailPage | Detalle producto |
| `/customers` | CustomersPage | Gestion de clientes |
| `/customers/:id` | CustomerDetailPage | Historial por cliente |
| `/shipments` | ShipmentsPage | Seguimiento de envios |
| `/shipments/:id` | ShipmentDetailPage | Detalle del envio |
| `/deliveries` | ShipperDeliveryPage | Panel del transportista |
| `/deliveries/:id` | ShipmentDetailPage | Detalle envio |
| `/pos` | PosPage | Punto de venta |
| `/reports` | ReportsPage | Reportes |
| `/notifications` | NotificationsPage | Notificaciones |
| `/calendar` | CalendarPage | Calendario de envios |
| `/profile` | ProfilePage | Perfil de usuario |
| `/users` | UsersPage | Gestion de usuarios |

### Roles y Permisos
| Rol | Acceso |
|-----|--------|
| **owner** | Todo (inventario, pedidos, envios, usuarios) |
| **ops** | Pedidos, envios, inventario solo ver |
| **warehouse** | Inventario (ajustar), pedidos (revisar) |
| **shipper** | Solo envios (cambiar etapas) |
| **vendor** | POS, inventario solo ver (alertar stock critico) |
| **support** | Pedidos, envios solo ver |
| **customer** | Pedidos, envios solo ver |

### Tecnologias Frontend
- React 19 + TypeScript
- Vite 6 (build)
- Tailwind CSS 4
- shadcn/ui (componentes)
- React Router DOM
- Lucide React (iconos)

## Despliegue Local

```powershell
# 1. Iniciar backend
cd Backend
docker compose up -d

# 2. Iniciar frontend
cd Frontend
npm run dev
# Abre http://localhost:3000
```

## Credenciales por Defecto
- **Admin**: `admin@smartlogix.cl` / `admin123`
- **Transportista**: `transportista@smartlogix.cl` / `transportista123`
- **Vendedor**: `vendedor@smartlogix.cl` / `vendedor123`

## Despliegue a Produccion

### Paso 1: Reconstruir imagenes Docker
```powershell
cd Backend
docker compose up -d --build
```

### Paso 2: Construir imagenes para Docker Hub
```powershell
# Backend
docker build -t jonahbruzzi/orders-service:latest -f Backend/Dockerfile Backend/orders-service
docker build -t jonahbruzzi/inventory-service:latest -f Backend/Dockerfile Backend/inventory-service
docker build -t jonahbruzzi/shipping-service:latest -f Backend/Dockerfile Backend/shipping-service
docker build -t jonahbruzzi/notification-service:latest -f Backend/Dockerfile Backend/notification-service

# Frontend
docker build -t jonahbruzzi/frontend:latest -f Frontend/Dockerfile Frontend

# Subir a Docker Hub
docker push jonahbruzzi/orders-service:latest
docker push jonahbruzzi/inventory-service:latest
docker push jonahbruzzi/shipping-service:latest
docker push jonahbruzzi/notification-service:latest
docker push jonahbruzzi/frontend:latest
```

### Paso 3: Desplegar en Digital Ocean VM
```powershell
ssh pruebas
cd smartlogix
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Paso 4: Frontend en Vercel
```powershell
cd Frontend
npm run build
vercel --prod
```

## Estructura de Archivos
```
C:\Microservicios\SmartLogix\
├── Backend/
│   ├── docker-compose.yml          # Docker compose local
│   ├── docker-compose.prod.yml     # Docker compose produccion
│   ├── Dockerfile                  # Multi-stage builder (Java)
│   ├── init-db.sql                 # Creacion de bases de datos
│   ├── seed.sql                    # Datos de prueba
│   ├── nginx.conf                  # API Gateway config
│   ├── orders-service/
│   ├── inventory-service/
│   ├── shipping-service/
│   ├── notification-service/
│   └── event-contracts/            # Eventos compartidos (SQS)
├── Frontend/
│   ├── src/
│   │   ├── app/                    # Auth, router, permisos
│   │   ├── components/             # Componentes UI (shadcn)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilidades, API client
│   │   ├── pages/                  # Paginas de la app
│   │   └── types/                  # TypeScript types
│   ├── Dockerfile                  # Multi-stage (Node → nginx)
│   ├── nginx.prod.conf             # Nginx produccion
│   └── vercel.json                 # Config Vercel
└── DOCUMENTACION.md                # Este documento
```
