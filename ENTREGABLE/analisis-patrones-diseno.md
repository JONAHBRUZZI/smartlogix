# Análisis de Patrones de Diseño y Arquetipos Arquitectónicos

**Proyecto:** SmartLogix — Plataforma de POS, Inventario y Despachos  
**Equipo:** SmartLogix Team  
**Fecha:** Mayo 2026  
**Repositorio:** https://github.com/JONAHBRUZZI/smartlogix

---

## 1. Introducción

SmartLogix es una plataforma todo-en-uno para pequeños comercios en Chile que integra Punto de Venta (POS), control de inventario, gestión de pedidos y despachos en un solo sistema. La arquitectura del sistema está compuesta por:

- **Frontend:** Aplicación SPA en React + Vite + TypeScript (sistema interno) y Landing Page en Next.js + Tailwind CSS v4
- **Backend:** 4 microservicios Spring Boot + API Gateway (Nginx) + PostgreSQL
- **Infraestructura:** Docker Compose (desarrollo local y producción)

---

## 2. Patrones de Diseño Implementados

### 2.1 Frontend — React + TypeScript

#### 2.1.1 Patrón Adapter (Adaptador)
**Ubicación:** `Frontend/src/lib/api-adapters.ts`

**Problema que resuelve:** La API del backend retorna datos en formato plano (snake_case, strings, tipos crudos) que no coinciden con el modelo de dominio del frontend. Sin un adaptador, cada componente tendría que realizar transformaciones repetitivas, generando código duplicado y acoplando la UI al formato de la API.

**Solución:** El archivo `api-adapters.ts` implementa funciones puras de transformación (`adaptOrder`, `adaptInventory`, `adaptShipment`) que convierten respuestas de la API (`ApiOrder`, `ApiInventory`, `ApiShipment`) en objetos del dominio (`Order`, `Product`, `Shipment`). Utiliza mapeos de estados (`normalizeOrderStage`, `normalizeShipmentStage`) para unificar los valores provenientes del backend.

**Justificación:** Permite que la UI trabaje con tipos fuertemente tipados del dominio sin preocuparse por el formato de la API. Si el backend cambia su formato, solo se modifica el adaptador, no los componentes.

```
API Response (JSON plano) → adaptInventory() → Product (dominio tipado)
```

---

#### 2.1.2 Patrón Custom Hook (useApiQuery)
**Ubicación:** `Frontend/src/hooks/use-api-query.ts`

**Problema que resuelve:** Cada página del sistema (inventario, pedidos, despachos) necesita consultar endpoints de la API, manejar estados de carga, errores y refresco de datos. Sin un hook reutilizable, cada página implementaría su propia lógica de fetching con useEffect + useState, resultando en código redundante y propenso a errores.

**Solución:** El hook `useApiQuery<TResponse, TData>` encapsula toda la lógica de consulta HTTP: 
- Gestión de estados `loading`, `error`, `source` 
- Transformación de datos mediante callback genérico
- Refresco manual (`refresh()`) 
- Cancelación de requests al desmontar el componente

**Justificación:** Reduce drásticamente la duplicación de código. Todas las páginas que consultan la API usan el mismo hook, garantizando comportamiento consistente en manejo de errores, estados de carga y timeouts.

---

#### 2.1.3 Patrón Proxy / API Client
**Ubicación:** `Frontend/src/lib/api-client.ts`

**Problema que resuelve:** El frontend necesita comunicarse con el backend mediante HTTP, pero las llamadas directas con `fetch()` requieren configuración repetitiva de headers (Authorization, Content-Type), manejo de timeouts, refresco de token JWT y manejo centralizado de errores 401/403.

**Solución:** La clase `ApiClient` actúa como proxy entre la aplicación y la API real, agregando:
- Headers automáticos (Authorization Bearer token, Content-Type)
- Timeout configurable con AbortController
- Refresco automático de token JWT ante errores 401/403
- Manejo centralizado de errores con reintentos
- Instancia singleton (`apiClient`) compartida por toda la app

**Justificación:** Centraliza toda la lógica de comunicación HTTP, permitiendo cambios (nueva URL base, nuevos headers, estrategia de timeout) sin modificar ninguna página o componente.

---

#### 2.1.4 Patrón Composite (Workspace Hook)
**Ubicación:** `Frontend/src/hooks/use-operational-workspace.ts`

**Problema que resuelve:** Las operaciones del sistema (ajustar inventario, confirmar pedidos, gestionar despachos) requieren combinar datos de múltiples fuentes (API + estado local + reglas de negocio) en objetos enriquecidos que la UI pueda consumir directamente.

**Solución:** El hook `useOperationalWorkspace` compone datos crudos (orders, inventory, shipments) con:
- Decisiones operacionales (aprobado/rechazado)
- Cálculos derivados (stockDelta, needsReview, canConfirm)
- Métodos de mutación (adjustInventory, confirmOrder, cancelOrder)

Retorna objetos enriquecidos `OperationalOrder`, `OperationalProduct`, `OperationalShipment` listos para la UI.

**Justificación:** Evita que la lógica de negocio se filtre en los componentes de UI. Cada página recibe datos ya procesados con decisiones operacionales calculadas, manteniendo la separación de responsabilidades.

---

### 2.2 Backend — Spring Boot Microservicios

#### 2.2.1 Patrón Repository (Spring Data JPA)
**Ubicación:** `Backend/orders-service`, `Backend/inventory-service`, etc.

**Problema que resuelve:** El acceso a la base de datos PostgreSQL requiere consultas SQL, mapeo de resultados a objetos Java y manejo de transacciones. Implementar esto manualmente genera código boilerplate extenso y propenso a errores.

**Solución:** Cada microservicio utiliza Spring Data JPA con interfaces Repository que extienden `JpaRepository<T, ID>`. Spring genera automáticamente las implementaciones para operaciones CRUD y consultas derivadas del nombre del método.

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStage(OrderStage stage);
    List<Order> findByCustomerId(Long customerId);
}
```

**Justificación:** Elimina el 90% del código de acceso a datos. Las consultas se expresan declarativamente como nombres de métodos, y Spring se encarga de la implementación SQL y el mapeo objeto-relacional.

---

#### 2.2.2 Patron Observer / Event-Driven (SQS/REST)
**Ubicacion:** Todos los microservicios (`Backend/*-service`)

**Problema que resuelve:** Los microservicios necesitan comunicarse entre si sin acoplamiento directo. Por ejemplo, cuando se confirma un pedido en `orders-service`, se debe notificar a `shipping-service` para crear un despacho y a `notification-service` para enviar alertas. Un acoplamiento directo mediante HTTP crearia dependencias rigidas y puntos unicos de falla.

**Solucion:** La comunicacion entre servicios se realiza mediante eventos asincronos a traves de AWS SQS (colas) para el flujo core (orders -> inventory -> shipping). Las notificaciones del shipping-service se envian via REST directo al notification-service. En desarrollo local se usa LocalStack para emular SQS.

```
OrderService --publica--> [ORDER-CONFIRMED] --SQS--> ShippingService
                                                  --> [REST] --> NotificationService
```

**Justificacion:** Desacopla completamente los servicios. Cada servicio puede evolucionar, desplegarse y escalar independientemente. Si un servicio esta caido, los eventos quedan en la cola hasta que se recupere, garantizando eventual consistency.

---

#### 2.2.3 Patrón Strategy (Notificaciones)
**Ubicación:** `Backend/notification-service`

**Problema que resuelve:** El sistema debe enviar notificaciones por múltiples canales (email, push, dashboard) según el tipo de evento y las preferencias del usuario. Implementar la lógica de envío para cada canal con condicionales (if/else) haría el código difícil de extender.

**Solución:** Cada canal de notificación implementa una interfaz común `NotificationStrategy` con el método `send(NotificationEvent)`. La fábrica de estrategias selecciona la implementación adecuada según el tipo de evento y las preferencias configuradas.

**Justificación:** Agregar un nuevo canal (WhatsApp, SMS) solo requiere crear una nueva clase que implemente `NotificationStrategy`, sin modificar el código existente (Open/Closed Principle).

---

#### 2.2.4 Patrón Factory (Dependency Injection)
**Ubicación:** Todos los microservicios

**Problema que resuelve:** La creación manual de objetos con `new` acopla el código a implementaciones concretas y dificulta las pruebas unitarias (no se pueden mockear dependencias).

**Solución:** Spring Boot implementa Inversion of Control (IoC) mediante Dependency Injection. El contenedor de Spring actúa como fábrica, creando y cableando automáticamente los beans (repositorios, servicios, clientes SQS) según las anotaciones `@Service`, `@Repository`, `@Component`.

**Justificación:** El código dependiente no necesita saber cómo se construyen sus colaboradores. Esto facilita las pruebas unitarias (se inyectan mocks) y permite cambiar implementaciones sin modificar el código consumidor.

---

## 3. Patrones Arquitectónicos

### 3.1 Backend For Frontend (BFF)
**Ubicación:** `Backend/nginx/nginx.conf`

**Problema que resuelve:** El frontend React consume datos de 4 microservicios distintos (orders, inventory, shipping, notification), cada uno en su propio puerto/URL. Exponer todos los endpoints directamente al cliente web crea problemas de CORS, obliga al frontend a conocer la topología del backend y expone endpoints internos innecesariamente.

**Solución:** Nginx actúa como BFF (API Gateway), exponiendo una única URL (`/api/*`) y enrutando las peticiones al microservicio correspondiente según el path:
- `/api/orders/*` → `orders-service:8081`
- `/api/inventory/*` → `inventory-service:8082`
- `/api/shipments/*` → `shipping-service:8084`
- `/api/notifications/*` → `notification-service:8085`

**Justificación:** El frontend solo conoce `http://localhost:8080/api/*`. El BFF oculta la complejidad de los microservicios, permite agregar autenticación centralizada y facilita cambios en la topología del backend sin afectar al frontend.

---

### 3.2 Microservicios con Database per Service
**Ubicación:** `Backend/docker-compose.yml`

**Problema que resuelve:** Un sistema monolítico con una sola base de datos crea acoplamiento en el esquema, dificulta el escalado independiente de módulos y convierte cualquier cambio de schema en un riesgo para todo el sistema.

**Solución:** Cada microservicio tiene su propia base de datos independiente:
- `orders_db` → orders-service
- `inventory_db` → inventory-service
- `shipping_db` → shipping-service
- `notification_db` → notification-service

Cada servicio es dueño de sus datos y solo se comunica con otros servicios mediante eventos asíncronos (SQS) o REST, nunca accediendo directamente a la base de datos de otro servicio.

**Justificación:** Garantiza aislamiento total entre servicios. Cada equipo puede modificar el esquema de su base de datos sin afectar a otros. Permite escalar y optimizar cada base de datos según las necesidades específicas del servicio.

---

### 3.3 Saga Pattern (Orquestación de Pedidos)
**Ubicación:** `Backend/orders-service` + `Backend/shipping-service`

**Problema que resuelve:** El proceso de negocio "crear pedido → validar stock → confirmar → generar despacho → notificar" es una transacción distribuida que atraviesa múltiples servicios. No se puede usar una transacción ACID tradicional porque cada servicio tiene su propia base de datos.

**Solución:** Se implementa una Saga orquestada donde `orders-service` actúa como orquestador:
1. Crea el pedido en `orders_db`
2. Publica evento `ORDER_CREATED`
3. `inventory-service` consume el evento y valida/reserva stock
4. `shipping-service` consume el evento y genera el despacho
5. `notification-service` consume eventos y envía notificaciones
6. Si algún paso falla, se publican eventos de compensación (cancelación, liberación de stock)

**Justificación:** Mantiene la consistencia eventual del sistema sin requerir transacciones distribuidas complejas. Cada paso es atómico dentro de su servicio y las compensaciones garantizan que el sistema converja a un estado consistente.

---

## 4. Arquetipos Maven

### 4.1 Estructura del Arquetipo Base

Cada microservicio sigue el mismo arquetipo de proyecto Spring Boot multi-módulo:

```
{service}-service/
├── pom.xml                    # Maven POM padre con Spring Boot, JPA, SQS, CloudWatch
├── src/
│   ├── main/
│   │   ├── java/com/smartlogix/{service}/
│   │   │   ├── {Service}Application.java    # Punto de entrada @SpringBootApplication
│   │   │   ├── controller/                   # REST Controllers (@RestController)
│   │   │   │   └── {Service}Controller.java
│   │   │   ├── model/                        # Entidades JPA (@Entity)
│   │   │   │   └── {Entity}.java
│   │   │   ├── repository/                   # Spring Data JPA Repositories
│   │   │   │   └── {Entity}Repository.java
│   │   │   ├── service/                      # Lógica de negocio (@Service)
│   │   │   │   └── {Service}Service.java
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   └── {Entity}DTO.java
│   │   │   ├── config/                       # Configuraciones (SQS, CloudWatch)
│   │   │   │   └── SqsConfig.java
│   │   │   └── listener/                     # Listeners SQS (@SqsListener)
│   │   │       └── {Event}Listener.java
│   │   └── resources/
│   │       └── application.properties        # Configuración Spring Boot
│   └── test/
│       └── java/com/smartlogix/{service}/
│           ├── controller/                   # Tests de Controllers
│           └── service/                      # Tests de Servicios
├── Dockerfile                   # Imagen Docker para despliegue
└── README.md                    # Documentación del servicio
```

### 4.2 Dependencias Comunes (pom.xml)

Todos los servicios comparten las mismas dependencias base:

| Dependencia | Propósito | Versión |
|---|---|---|
| `spring-boot-starter-web` | REST API | 3.x |
| `spring-boot-starter-data-jpa` | Acceso a datos JPA | 3.x |
| `postgresql` | Driver PostgreSQL | 42.x |
| `spring-cloud-aws-sqs` | Mensajeria SQS | 3.x |
| `spring-cloud-aws-sns` | Notificaciones SNS (solo shipping-service, para produccion) | 3.x |
| `spring-boot-starter-actuator` | Health checks | 3.x |
| `spring-boot-starter-test` | Testing (JUnit 5) | 3.x |
| `lombok` | Reducción boilerplate | latest |

### 4.3 Cómo generar un nuevo servicio desde el arquetipo

```bash
# 1. Copiar estructura base
cp -r inventory-service/ nuevo-service/

# 2. Renombrar paquetes y clases
# Reemplazar "inventory" → "nuevo" en todos los archivos Java,
# pom.xml, application.properties y Dockerfile

# 3. Configurar puerto único en application.properties
server.port=8086  # Puerto no usado por otros servicios

# 4. Agregar base de datos en init-db.sql
CREATE DATABASE nuevo_db;

# 5. Agregar al docker-compose.yml
# Copiar bloque de inventory-service y adaptar
```

---

## 5. Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                   CLIENTE WEB                         │
│  React + Vite SPA (Frontend/)                        │
│  Next.js Landing (Landing/)                          │
└──────────────┬───────────────────────────────────────┘
               │ HTTP :80 (Vercel/Localhost)
               ▼
┌──────────────────────────────────────────────────────┐
│                 API GATEWAY (BFF)                     │
│  Nginx — smartlogix-api-gateway :80                  │
│  /api/orders/*     → orders-service:8081             │
│  /api/inventory/*  → inventory-service:8082          │
│  /api/shipments/*  → shipping-service:8084           │
│  /api/notifications/* → notification-service:8085    │
└──────┬──────────┬───────────┬────────────────────────┘
       │          │           │
       ▼          ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Orders   │ │Inventory │ │ Shipping │
│ Service  │ │ Service  │ │ Service  │
│ :8081    │ │ :8082    │ │ :8084    │
│ orders_db│ │inv_db    │ │ ship_db  │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     └────────────┼────────────┘
                   │ SQS + REST (eventos asincronos y notificaciones)
                  ▼
┌─────────────────────────────────┐
│     Notification Service       │
│     :8085   notification_db    │
└─────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│       PostgreSQL :5432          │
│  (4 bases de datos aisladas)    │
└─────────────────────────────────┘
```

---

## 6. Conclusión

El proyecto SmartLogix implementa una arquitectura moderna de microservicios con patrones de diseño probados en la industria:

- **Frontend:** Adapter, Custom Hook, Proxy, Composite — garantizan código mantenible, desacoplado de la API y reutilizable
- **Backend:** Repository, Observer/Event-Driven, Strategy, Factory/DI — proporcionan acceso a datos limpio, comunicación desacoplada entre servicios y extensibilidad
- **Arquitectura:** BFF, Database-per-Service, Saga Pattern — aseguran que el sistema sea escalable, resiliente y mantenible

Cada patrón fue seleccionado para resolver un problema específico del dominio y está implementado siguiendo las mejores prácticas de la industria.
