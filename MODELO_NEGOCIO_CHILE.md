# Modelo de Negocio — SmartLogix Chile

## 1. Problema que resuelve

Las PYMEs de eCommerce en Chile (tiendas Shopify, WooCommerce, MercadoLibre, Jumpseller) operan con planillas Excel, WhatsApp y correo para coordinar inventario, pedidos y despachos. Esto genera:

- **Quiebres de stock** no detectados a tiempo (10-15% de pedidos rechazados)
- **Sobreventa** por falta de sincronización entre canales
- **Despachos con tracking manual** y clientes sin visibilidad
- **Horas-hombre perdidas** conciliando datos entre el eCommerce y la bodega
- **Cero trazabilidad** cuando un pedido falla (no se sabe si fue stock, picking o transporte)

---

## 2. Propuesta de valor

> SmartLogix conecta automáticamente el eCommerce con la bodega y el transportista, dando trazabilidad completa desde que el cliente hace clic hasta que recibe el paquete.

**Diferenciadores vs competencia local:**

| Competidor | Qué hace | Qué NO hace |
|------------|----------|-------------|
| **Base.com** (chileno) | Sincroniza catálogo e inventario con marketplaces | No gestiona despachos ni trazabilidad de pedidos |
| **Shipit** (chileno) | Coordina envíos y compara tarifas de couriers | No maneja inventario ni pedidos pre-despacho |
| **Envíame** / **SimpliRoute** | Optimización de última milla | No cubre la operación completa pre-despacho |
| **SmartLogix** | Ciclo completo: pedido → inventario → picking → despacho → tracking → notificación | — |

---

## 3. Segmento objetivo (Chile)

| Segmento | Tamaño estimado | Volumen mensual | Dolor principal |
|----------|----------------|-----------------|-----------------|
| **Micro eCommerce** (1-50 pedidos/mes) | ~8,000 tiendas | Bajo | Quiebres de stock, tracking manual |
| **Small eCommerce** (50-500 pedidos/mes) | ~3,000 tiendas | Medio | Coordinación bodega-transportista, sobreventa |
| **Mid-market** (500-5,000 pedidos/mes) | ~500 tiendas | Alto | Trazabilidad, múltiples canales, reportería |
| **3PL / Operadores logísticos** | ~100 empresas | Muy alto | White-label para sus clientes, multi-tenant |

**Foco inicial:** Small + Mid-market eCommerce (mayor disposición a pagar, dolor agudo).

---

## 4. Planes y precios (CLP / UF)

### 4.1 Tier Starter — $49.900/mes (~1.3 UF)
250 pedidos/mes incluidos

- Sincronización con 1 canal de venta (Shopify, WooCommerce o Jumpseller)
- Inventario en tiempo real
- Gestión de pedidos y estados
- Tracking de envíos con 1 transportista integrado
- Notificaciones por email al cliente
- Soporte por email (24h hábil)
- **1 usuario operador + 1 admin**

### 4.2 Tier Professional — $129.900/mes (~3.4 UF)
1,500 pedidos/mes incluidos

- Todo lo de Starter
- Hasta 3 canales de venta sincronizados
- Integración con 3 transportistas (Chilexpress, Starken, Blue Express)
- Picking y packing con app móvil
- Notificaciones SMS + email al cliente
- Dashboard de reportería básica
- Soporte por chat (4h hábil)
- **5 usuarios (admin + operador + bodega + transportista)**

### 4.3 Tier Enterprise — $299.900/mes (~7.8 UF)
5,000 pedidos/mes incluidos

- Todo lo de Professional
- Canales de venta ilimitados
- Integración con cualquier transportista vía API
- Data Lake + dashboards personalizados (QuickSight)
- Sincronización CDC desde monolito/ERP
- API abierta para integraciones custom
- SLA 99.5% + soporte prioritario (1h)
- **Usuarios ilimitados + roles personalizados**

### 4.4 Excedentes
- Pedidos adicionales: $50 CLP por pedido extra
- SMS adicionales: $15 CLP por notificación

### 4.5 Setup y Onboarding
- Setup estándar: **$199.900** (configuración de canal, transportista, training 2h)
- Setup con migración desde monolito: **$599.900** (DMS, SCT, validación de datos, training 4h)

---

## 5. Canales de venta (Chile)

| Canal | Estrategia |
|-------|------------|
| **Partners de eCommerce** | Integración nativa con Jumpseller, Shopify Chile, WooCommerce. Listado en sus marketplaces de apps. |
| **Agencias digitales** | Comisión del 15% recurrente. Hay ~200 agencias Shopify/WooCommerce en Chile. |
| **Transportistas** | Co-branding con Chilexpress/Starken: "Potenciado por SmartLogix". El transportista ofrece tracking premium. |
| **MercadoLibre** | Vendor Tool para sellers medianos que necesitan coordinar inventario propio + Full. |
| **Consultores SII/contables** | Referidos de contadores que ven el dolor operativo de sus clientes eCommerce. |
| **Contenido** | Webinars con la CCS (Cámara de Comercio de Santiago), podcast de logística, LinkedIn. |

---

## 6. Economía unitaria (por cliente promedio)

```
Cliente típico Professional: 800 pedidos/mes
Ingreso mensual:              $129,900
Costo infra AWS (ECS+RDS+SQS): $35,000
Costo SMS (~200 notif):        $3,000
Costo soporte (~1.5h):         $22,500
Costo adquisición (amortizado): $18,000
─────────────────────────────────────
Margen bruto mensual:          $51,400  (39.5%)
```

Punto de equilibrio por cliente: **mes 4** (recupera setup + CAC en 4 meses de suscripción).

---

## 7. Proyección financiera (CLP)

| | Año 1 | Año 2 | Año 3 |
|---|-------|-------|-------|
| Clientes activos | 30 | 120 | 350 |
| ARPU mensual | $130,000 | $145,000 | $155,000 |
| **MRR** | $3.9M | $17.4M | $54.3M |
| **ARR** | $46.8M | $208.8M | $651M |
| Setup + onboarding | $9M | $18M | $35M |
| **Ingreso total** | **$55.8M** | **$226.8M** | **$686M** |
| Costos infra + soporte | $25M | $72M | $175M |
| **Margen bruto** | **$30.8M** | **$154.8M** | **$511M** |
| Equipo (4-8-15 personas) | $48M | $120M | $270M |
| Marketing y ventas | $18M | $48M | $90M |
| **EBITDA** | **-$35M** | **-$13M** | **+$151M** |

---

## 8. Diferenciación regulatoria (Chile)

- **Facturación electrónica SII**: integración con el DTE del cliente para asociar guías de despacho a pedidos
- **Boleta electrónica**: opción de notificar tracking en la boleta al consumidor final
- **Ley del Consumidor (SERNAC)**: trazabilidad completa como evidencia en caso de reclamos por no entrega
- **Aduanas**: soporte futuro para pedidos internacionales con tracking de internación

---

## 9. Estrategia de salida

- **Adquisición por un ERP chileno** (Nubox, Defontana, Rex) que quiera añadir capa logística
- **Adquisición por un courier** (Chilexpress, Starken) que quiera subir en la cadena de valor
- **Adquisición por plataforma regional** (Tiendanube, Mercado Libre) para integrar sellers chilenos
- **Roll-up de logtech latam**: consolidación con startups similares en México, Colombia, Perú

---

## 10. Métricas clave (KPI)

| Métrica | Target Año 1 | Target Año 3 |
|---------|-------------|-------------|
| MRR | $3.9M CLP | $54M CLP |
| Churn mensual | <5% | <3% |
| LTV / CAC | >3x | >5x |
| NPS | >40 | >50 |
| Tiempo go-live (desde contrato) | <7 días | <3 días |
| Uptime | 99% | 99.5% |
| Tickets soporte / cliente / mes | <3 | <1.5 |
