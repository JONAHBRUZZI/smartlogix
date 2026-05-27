# SmartLogix Backend

## Objetivo de la solucion

Este backend resuelve el flujo logistico de SmartLogix con arquitectura de microservicios orientada a eventos.

Dominio cubierto en esta version:
- pedidos
- inventario
- envios
- notificaciones

## Como se resuelve cada modulo

### Gestion de Inventario
Objetivo del modulo:
- mantener actualizados los niveles de stock en tiempo real
- optimizar la sincronizacion entre multiples bodegas y tiendas

Resolucion tecnica:
- `inventory-service` centraliza la validacion y descuento de stock por SKU
- el flujo por eventos evita bloqueos y mantiene consistencia operativa ante picos
- la persistencia por servicio permite control de stock desacoplado del resto del dominio

### Procesamiento de Pedidos
Objetivo del modulo:
- automatizar validacion, aprobacion y asignacion de pedidos
- asegurar trazabilidad y reducir errores

Resolucion tecnica:
- `orders-service` registra y publica el pedido al flujo asincrono
- validaciones de negocio y estados quedan registrados con trazabilidad por evento
- el patron idempotente en consumidores reduce errores por reproceso y duplicidad

### Coordinacion de Envios
Objetivo del modulo:
- mejorar planificacion de envios y comunicacion con transportistas
- garantizar tiempos de entrega eficientes

Resolucion tecnica:
- `shipping-service` crea el envio, tracking y estado logistico por pedido
- las notificaciones operativas y al cliente se emiten como eventos desacoplados
- `notification-service` persiste historial para seguimiento de cumplimiento y SLA

## Microservicios y responsabilidad

### event-contracts
Modulo compartido con los contratos de eventos (`OrderEvent`, `ShippingEvent`, `NotificationEvent`) para mantener compatibilidad entre productores y consumidores.

### orders-service
Responsable de:
- exponer API para crear y consultar pedidos
- persistir pedidos
- publicar evento de pedido creado para el flujo asincrono

### inventory-service
Responsable de:
- consumir eventos de pedidos
- validar y descontar stock
- publicar solicitud de envio cuando hay disponibilidad

### shipping-service
Responsable de:
- consumir solicitudes de envio
- crear y persistir el envio con tracking
- publicar eventos de notificacion para seguimiento operacional y cliente

### notification-service
Responsable de:
- consumir eventos de notificacion
- validar payload recibido
- persistir trazabilidad por orden, etapa y audiencia

## Flujo interno de extremo a extremo

1. El pedido se registra en `orders-service`.
2. `orders-service` persiste el pedido y publica `OrderEvent`.
3. `inventory-service` consume `OrderEvent` y ejecuta validacion de stock.
4. Si hay stock, `inventory-service` publica `ShippingEvent`.
5. `shipping-service` consume `ShippingEvent`, crea el envio y tracking.
6. `shipping-service` publica `NotificationEvent` al topic de notificaciones.
7. `notification-service` consume `NotificationEvent` y guarda la trazabilidad.

## Como viaja la informacion

### API sincrona
- Protocolo: HTTP REST
- Formato: JSON
- Uso: operaciones de consulta y alta de pedidos/envios/notificaciones

### Integracion asincrona entre microservicios
- Mecanismo: mensajeria por colas y topic
- Formato: JSON serializado de contratos compartidos en `event-contracts`
- Beneficio: desacoplamiento temporal entre servicios y mejor tolerancia a picos

### Persistencia
- Motor: PostgreSQL
- Estrategia: cada servicio persiste su propio contexto de dominio

## Ejemplos practicos y evidencia en la arquitectura

1. Alta de pedido y publicacion de evento
- Caso practico: cuando se crea un pedido, se guarda en base de datos y se emite un evento de dominio para continuar el flujo.
- Evidencia:
	- `orders-service` persiste y construye `OrderEvent` en `createOrder` (orders-service/src/main/java/com/smartlogix/orders_service/service/OrderService.java).
	- `orders-service` publica a la cola de pedidos con `SqsTemplate` (orders-service/src/main/java/com/smartlogix/orders_service/publisher/OrderPublisher.java).

2. Validacion de inventario y disparo de envio
- Caso practico: al consumir un pedido, inventario valida stock y solo si hay disponibilidad publica `ShippingEvent`.
- Evidencia:
	- `inventory-service` consume `orders-queue` con `@SqsListener` (inventory-service/src/main/java/com/inventory_service/consumer/OrderConsumer.java).
	- `inventory-service` orquesta validacion y publicacion de envio en `InventoryOrderOrchestrator` (inventory-service/src/main/java/com/inventory_service/service/InventoryOrderOrchestrator.java).

3. Creacion de envio y fan-out de notificaciones
- Caso practico: shipping crea el envio con tracking y emite notificacion para cliente y operacion.
- Evidencia:
	- `shipping-service` consume `shipping-queue` con `@SqsListener` (shipping-service/src/main/java/com/smartlogix/shipping_service/consumer/ShippingConsumer.java).
	- `shipping-service` persiste `Shipment` y construye `NotificationEvent` (shipping-service/src/main/java/com/smartlogix/shipping_service/service/ShippingService.java).
	- `shipping-service` publica via REST a `notification-service` con `RestTemplate` (shipping-service/src/main/java/com/smartlogix/shipping_service/publisher/NotificationPublisher.java).

4. Persistencia de notificaciones con control de duplicidad
- Caso practico: notificaciones consume eventos y evita registrar duplicados por `eventId + audience`.
- Evidencia:
	- `notification-service` consume `notification-events-queue` y valida constraints del contrato (notification-service/src/main/java/com/smartlogix/notification_service/consumer/NotificationConsumer.java).
	- `notification-service` verifica existencia previa antes de guardar (notification-service/src/main/java/com/smartlogix/notification_service/service/NotificationService.java).
	- `notification-service` captura `DataIntegrityViolationException` para suprimir duplicados (notification-service/src/main/java/com/smartlogix/notification_service/service/NotificationService.java).

5. Idempotencia en consumidores para resiliencia
- Caso practico: si llega el mismo evento dos veces, el servicio lo descarta sin reprocesar negocio.
- Evidencia:
	- `inventory-service` usa `ConsumerIdempotencyService.beginProcessing` antes de procesar (inventory-service/src/main/java/com/inventory_service/service/ConsumerIdempotencyService.java).
	- `inventory-service` marca `PROCESSED` al finalizar y libera en fallo (inventory-service/src/main/java/com/inventory_service/service/ConsumerIdempotencyService.java).

6. Contratos compartidos y validacion de payload
- Caso practico: los eventos viajan con esquema estable y validaciones de campos obligatorios/formato.
- Evidencia:
	- contratos en `event-contracts`: `OrderEvent`, `ShippingEvent`, `NotificationEvent` (event-contracts/src/main/java/com/smartlogix/contracts/events/).
	- uso de anotaciones `jakarta.validation` para reglas de negocio en los DTO de evento (event-contracts/src/main/java/com/smartlogix/contracts/events/).

7. Evidencia de desacoplamiento por infraestructura de mensajeria
- Caso practico: el shipping-service publica notificaciones via REST directo al notification-service en vez de SNS.
- Evidencia:
	- script de inicializacion crea `orders-queue`, `shipping-queue`, `notification-events-queue` (init-sqs.sh/).
	- `NotificationPublisher` usa `RestTemplate` para enviar eventos al endpoint `POST /api/notifications` del notification-service.

## Patrones de diseno aplicados

Patrones implementados en el codigo actual:
- Event-Driven Architecture: la orquestacion del flujo core viaja por eventos en lugar de acoplamiento directo por llamadas entre servicios.
- Publisher/Consumer: cada servicio publica eventos de su dominio y consume eventos necesarios para su responsabilidad.
- Shared Kernel (contract-first): contratos de eventos centralizados en `event-contracts` para versionado y consistencia.
- Idempotency en consumidores: control de reprocesamiento para evitar duplicidad en escenarios de reentrega.

### Repository Pattern (persistencia)
Como esta implementado en el proyecto:
- cada microservicio encapsula acceso a datos en repositorios Spring Data JPA
- los servicios de dominio no acceden directamente a SQL, sino a interfaces de repositorio
- ejemplos: `OrderRepository`, `InventoryRepository`, `ShipmentRepository`, `NotificationRecordRepository`

Alternativa documentada:
- si se requiere mayor control de consultas complejas, se puede combinar Repository + Specification o QueryDSL
- para casos de alto rendimiento puntual, se puede usar un adaptador de consulta dedicado sin romper el contrato del repositorio

### Factory Method (creacion de instancias)
Como se implementa en nuestro proyecto:
- Spring Boot actua como fabrica de instancias mediante inyeccion de dependencias
- las clases de configuracion (`@Configuration` + `@Bean`) centralizan creacion de clientes e infraestructura
- ejemplo actual: configuraciones de clientes SQS y componentes tecnicos por servicio

Alternativa documentada:
- cuando la construccion de objetos de dominio sea mas compleja, se puede introducir una fabrica explicita de dominio
- ejemplo: `ShippingFactory` para construir envios segun canal, prioridad o transportista

### Circuit Breaker (fallos entre servicios)
Como se implementaria en nuestro proyecto:
- aplicar Circuit Breaker en llamadas sincronas expuestas por API Gateway o clientes HTTP internos
- usar Resilience4j para definir politicas por ruta: umbral de error, timeout, ventana y fallback
- complementar con retry acotado y timeout para evitar cascada de fallos

Alternativa documentada:
- dado que el core actual es asincrono por eventos, una alternativa es priorizar resiliencia por mensajeria
- esto se logra con reintentos de consumidor, idempotencia y colas de error (DLQ) sin acoplar servicios por HTTP

## Justificacion de los patrones seleccionados

La seleccion de patrones responde a problemas tecnicos concretos del dominio logistico:

### Repository Pattern
Justificacion:
- separa reglas de negocio de detalles de acceso a datos
- facilita pruebas unitarias y evolucion de persistencia sin reescribir servicios
- mejora mantenibilidad al centralizar consultas por agregado de dominio

### Factory Method
Justificacion:
- estandariza la creacion de componentes tecnicos y reduce acoplamiento de construccion
- permite cambiar implementaciones (por entorno, proveedor o estrategia) sin tocar consumidores
- habilita extensibilidad para futuras variantes de creacion de objetos de dominio

### Circuit Breaker
Justificacion:
- evita propagacion de fallos en llamadas sincronas entre capas
- protege la estabilidad del sistema bajo degradacion parcial
- mejora resiliencia operacional al permitir fallback controlado en lugar de caida global

### Coherencia entre patrones
Combinados, estos patrones permiten:
- evolucionar cada modulo sin afectar el funcionamiento global
- escalar y desplegar cambios de forma incremental
- reducir riesgo tecnico en integraciones futuras

## Por que esta arquitectura

Esta arquitectura se eligio para cumplir requerimientos tecnicos clave del producto:

### Requerimientos funcionales
- procesamiento de pedidos con validacion de inventario
- generacion de envios solo cuando el stock es suficiente
- trazabilidad completa del ciclo de la orden

### Requerimientos no funcionales
- escalabilidad horizontal por servicio
- desacoplamiento entre etapas del flujo
- resiliencia ante fallos parciales
- mantenibilidad y evolucion independiente por dominio

### Justificacion tecnica
- Microservicios por dominio reducen acoplamiento y permiten despliegues independientes.
- Mensajeria asincrona elimina dependencias fuertes entre tiempos de respuesta de servicios.
- Contratos compartidos reducen errores de integracion y facilitan la evolucion controlada del esquema de eventos.
- Persistencia separada por contexto mejora aislamiento de datos y ownership funcional.

## Escalabilidad y desacoplamiento

La arquitectura fue definida para escalar de forma modular y evolucionar sin interrumpir el flujo operativo.

Como se logra la escalabilidad:
- cada microservicio puede escalar horizontalmente de manera independiente segun su carga
- el procesamiento por eventos absorbe picos sin bloquear el flujo completo
- la separacion por dominio evita cuellos de botella de un monolito compartido

Como se logra el desacoplamiento:
- los servicios se comunican por contratos de eventos y no por dependencias directas de implementacion
- cada servicio mantiene su propia persistencia y sus propias reglas de negocio
- cambios internos en un servicio no obligan a rediseñar a los demas, mientras se respete el contrato

Impacto en mejoras futuras:
- permite agregar nuevas capacidades (por ejemplo, integracion de transportistas, analitica o nuevos canales) sin detener los modulos actuales
- facilita versionado progresivo de APIs y eventos
- reduce riesgo de regresiones globales al desplegar mejoras por servicio

## Diseno del API Gateway para frontend

El API Gateway se disena como punto de entrada unico entre frontend y backend para centralizar seguridad, enrutamiento y control operativo.

Objetivos del gateway:
- exponer una URL unica para el frontend
- aplicar autenticacion y autorizacion antes de llegar a los servicios
- evitar que el frontend conozca detalles internos de red o despliegue
- estandarizar respuestas, manejo de errores y politicas de observabilidad

Capacidades de diseno:
- Enrutamiento por dominio:
	- /api/orders -> orders-service
	- /api/inventory -> inventory-service
	- /api/shipments -> shipping-service
	- /api/notifications -> notification-service
- Seguridad:
	- validacion de token (Cognito JWT)
	- autorizacion por rol y por ruta
	- CORS y politicas de cabeceras
- Confiabilidad:
	- rate limiting y throttling por cliente
	- timeouts y reintentos controlados en llamadas sincronas
	- circuit breaker para aislar fallos de servicios aguas abajo
- Observabilidad:
	- correlation-id por request
	- logs centralizados por ruta, latencia y codigo de estado
	- metricas de error rate, p95/p99 y saturacion

Estrategia de implementacion:
1. Definir contrato de rutas publicas para frontend.
2. Configurar autorizacion por scopes/roles en cada endpoint.
3. Incorporar trazabilidad distribuida con correlation-id.
4. Publicar versionado de API para evolucion sin ruptura (v1, v2).
5. Activar dashboards y alertas de latencia y errores.

Beneficio tecnico esperado:
- menor acoplamiento frontend-backend
- mejor control de seguridad transversal
- operacion mas estable bajo carga y cambios de infraestructura
- evolucion de microservicios sin impacto directo en el cliente web

## Requerimientos tecnicos de plataforma

- Runtime Java 21 y Spring Boot para servicios de dominio.
- Base de datos PostgreSQL para persistencia transaccional.
- Infraestructura de mensajeria compatible con SQS para intercambio de eventos entre servicios y REST para notificaciones.
- Observabilidad por logs y metricas para seguimiento operativo.
- Despliegue objetivo en AWS con API Gateway/ALB, ECS, ECR, CloudWatch, Cognito y RDS + KMS.
