# SmartLogix

## Descripción

SmartLogix es una solución de software orientada a microservicios para pequeñas y medianas empresas (PYMEs) de comercio electrónico. El sistema se enfoca en la gestión de inventario en tiempo real, procesamiento de pedidos con trazabilidad completa, coordinación de envíos y generación de reportes y analíticas para el negocio.

La arquitectura del sistema está diseñada para ser moderna, escalable y robusta, utilizando tecnologías de contenedores y servicios en la nube de AWS.

## Arquitectura

La arquitectura de SmartLogix se basa en un enfoque de microservicios desplegados en AWS, con una clara separación entre el frontend, el backend y la capa de datos.

*   **Frontend:** Una aplicación de una sola página (SPA) estática alojada en **S3** y distribuida a través de **CloudFront** para baja latencia.
*   **Autenticación:** Se utiliza **AWS Cognito** para la gestión de usuarios, autenticación y autorización.
*   **Backend (Microservicios):**
    *   **API Gateway:** Una instancia de **Nginx** en una **EC2** pequeña actúa como reverse proxy para enrutar las peticiones a los microservicios correspondientes.
    *   **Contenedores:** Los microservicios están construidos como contenedores Docker y orquestados con **ECS Fargate**.
    *   **Servicios:**
        *   `orders-service`: Gestión de pedidos.
        *   `inventory-service`: Control de inventario.
        *   `shipping-service`: Coordinación de envíos.
        *   `notification-service`: Envío de notificaciones.
*   **Base de Datos:** Se utiliza **RDS PostgreSQL** como base de datos operacional para los microservicios.
*   **Mensajería Asíncrona:** **SQS** y **SNS** se utilizan para la comunicación asíncrona entre microservicios, desacoplando los flujos de negocio.
*   **Integración:** **AWS DMS** se utiliza para la migración y sincronización de datos desde sistemas monolíticos existentes.
*   **Analítica y BI:** Un Data Lake en **S3**, con **Glue** para el catálogo de datos, **Redshift** para el análisis y **QuickSight** para la visualización de dashboards.

## Instalación

### Prerrequisitos

*   Node.js (v16+)
*   npm / yarn
*   Docker
*   AWS CLI configurada

### Frontend

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/SmartLogix.git
    cd SmartLogix/Frontend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Configura las variables de entorno. Crea un archivo `.env.local` y añade las URLs de la API y la configuración de Cognito.

### Backend

Los microservicios están diseñados para ser desplegados como contenedores Docker en AWS ECS. Consulta la documentación de cada microservicio para obtener instrucciones de despliegue detalladas.

## Uso

### Iniciar el entorno de desarrollo del Frontend

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo de Vite en `http://localhost:5173`.

### Construir para producción

```bash
npm run build
```

Esto generará los archivos estáticos en el directorio `dist`, listos para ser desplegados en S3.

## Contribución

Las contribuciones son bienvenidas. Si deseas contribuir al proyecto, por favor sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz commit (`git commit -am 'Añade nueva funcionalidad'`).
4.  Empuja tus cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
