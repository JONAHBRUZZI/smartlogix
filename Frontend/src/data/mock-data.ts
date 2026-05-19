import type { AlertItem, HealthState, Order, OrderStage, Product, Role, Shipment, ShipmentStage } from "@/types/domain";

export const products: Product[] = [
  {
    id: "inv-1",
    sku: "COCA-COLA-2L",
    name: "Coca-Cola 2L",
    stock: 48,
    status: "healthy",
    coverageDays: 14,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-2",
    sku: "PEPSI-2L",
    name: "Pepsi 2L",
    stock: 72,
    status: "healthy",
    coverageDays: 20,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-3",
    sku: "SPRITE-2L",
    name: "Sprite 2L",
    stock: 65,
    status: "healthy",
    coverageDays: 18,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-4",
    sku: "AGUA-MINERAL-500",
    name: "Agua Mineral 500ml",
    stock: 120,
    status: "healthy",
    coverageDays: 30,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-5",
    sku: "JUGO-WATTS-1L",
    name: "Jugo Watt's 1L",
    stock: 35,
    status: "healthy",
    coverageDays: 10,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-6",
    sku: "CERVEZA-CORONA-355",
    name: "Cerveza Corona 355ml",
    stock: 90,
    status: "healthy",
    coverageDays: 25,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-7",
    sku: "CHOCOLATE-TRENCITO",
    name: "Chocolate Trencito",
    stock: 3,
    status: "warning",
    coverageDays: 3,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-8",
    sku: "GALLETAS-MCKAY",
    name: "Galletas McKay",
    stock: 15,
    status: "warning",
    coverageDays: 5,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-9",
    sku: "PAPAS-LAYS-200G",
    name: "Papas Lays 200g",
    stock: 8,
    status: "warning",
    coverageDays: 4,
    updatedAt: "2026-05-18T09:00:00-04:00"
  },
  {
    id: "inv-10",
    sku: "CHICLES-FRUGELE",
    name: "Chicles Frugelé",
    stock: 2,
    status: "critical",
    coverageDays: 0,
    updatedAt: "2026-05-18T09:00:00-04:00"
  }
];

export const orders: Order[] = [
  {
    id: "1",
    customer: "Bar El Rincon",
    source: "Pedido Telefonico",
    stage: "confirmed",
    sku: "COCA-COLA-2L",
    quantity: 6,
    createdAt: "2026-05-18T09:15:00-04:00",
    eta: "2026-05-18T14:00:00-04:00",
    items: [{ sku: "COCA-COLA-2L", name: "Coca-Cola 2L", quantity: 6 }],
    timeline: [
      { id: "1-a", title: "Pedido recibido", detail: "Llamada de Bar El Rincon. 6 Coca-Cola 2L para reposicion.", timestamp: "2026-05-18T09:15:00-04:00", state: "done" },
      { id: "1-b", title: "Stock validado", detail: "Inventario confirmo 48 unidades disponibles.", timestamp: "2026-05-18T09:16:00-04:00", state: "done" },
      { id: "1-c", title: "Pedido confirmado", detail: "Listo para despacho. Asignado a Luis Castro.", timestamp: "2026-05-18T09:20:00-04:00", state: "done" }
    ]
  },
  {
    id: "2",
    customer: "Bar El Rincon",
    source: "Pedido Telefonico",
    stage: "in_transit",
    sku: "AGUA-MINERAL-500",
    quantity: 12,
    createdAt: "2026-05-18T09:30:00-04:00",
    eta: "2026-05-18T12:00:00-04:00",
    items: [{ sku: "AGUA-MINERAL-500", name: "Agua Mineral 500ml", quantity: 12 }],
    timeline: [
      { id: "2-a", title: "Pedido recibido", detail: "12 Agua Mineral 500ml. Cliente frecuente.", timestamp: "2026-05-18T09:30:00-04:00", state: "done" },
      { id: "2-b", title: "Despachado", detail: "Envio generado. Tracking TRK-7591A2 con Luis C.", timestamp: "2026-05-18T09:45:00-04:00", state: "done" }
    ]
  },
  {
    id: "3",
    customer: "Kiosco Don Pepe",
    source: "WhatsApp",
    stage: "new",
    sku: "CHOCOLATE-TRENCITO",
    quantity: 2,
    createdAt: "2026-05-18T10:00:00-04:00",
    eta: null,
    items: [{ sku: "CHOCOLATE-TRENCITO", name: "Chocolate Trencito", quantity: 2 }],
    timeline: [
      { id: "3-a", title: "Pedido recibido", detail: "WhatsApp de Don Pepe. Solicita 2 Choc. Trencito.", timestamp: "2026-05-18T10:00:00-04:00", state: "done" },
      { id: "3-b", title: "Pendiente revision", detail: "Stock bajo (3 unids). Operaciones debe revisar.", timestamp: "2026-05-18T10:01:00-04:00", state: "warning" }
    ]
  },
  {
    id: "4",
    customer: "Bar El Rincon",
    source: "Pedido Telefonico",
    stage: "incident",
    sku: "CHICLES-FRUGELE",
    quantity: 1,
    createdAt: "2026-05-18T10:22:00-04:00",
    eta: null,
    items: [{ sku: "CHICLES-FRUGELE", name: "Chicles Frugelé", quantity: 1 }],
    timeline: [
      { id: "4-a", title: "Pedido recibido", detail: "1 caja Chicles Frugelé.", timestamp: "2026-05-18T10:22:00-04:00", state: "done" },
      { id: "4-b", title: "Stock insuficiente", detail: "Solo 2 unidades. Pedido rechazado. Se requiere reposicion urgente.", timestamp: "2026-05-18T10:23:00-04:00", state: "critical" }
    ]
  },
  {
    id: "5",
    customer: "Distribuidora Sur",
    source: "Correo",
    stage: "confirmed",
    sku: "CERVEZA-CORONA-355",
    quantity: 24,
    createdAt: "2026-05-18T11:05:00-04:00",
    eta: "2026-05-19T10:00:00-04:00",
    items: [{ sku: "CERVEZA-CORONA-355", name: "Cerveza Corona 355ml", quantity: 24 }],
    timeline: [
      { id: "5-a", title: "Pedido recibido", detail: "Correo de Distribuidora Sur. 24 Coronas.", timestamp: "2026-05-18T11:05:00-04:00", state: "done" },
      { id: "5-b", title: "Pedido confirmado", detail: "Stock validado (90 unids). Listo para preparar.", timestamp: "2026-05-18T11:06:00-04:00", state: "done" }
    ]
  },
  {
    id: "6",
    customer: "Kiosco Don Pepe",
    source: "WhatsApp",
    stage: "new",
    sku: "SPRITE-2L",
    quantity: 8,
    createdAt: "2026-05-18T11:45:00-04:00",
    eta: null,
    items: [{ sku: "SPRITE-2L", name: "Sprite 2L", quantity: 8 }],
    timeline: [
      { id: "6-a", title: "Pedido recibido", detail: "Don Pepe pide 8 Sprite. Cliente recurrente.", timestamp: "2026-05-18T11:45:00-04:00", state: "done" }
    ]
  },
  {
    id: "7",
    customer: "Bar El Rincon",
    source: "Pedido Telefonico",
    stage: "in_transit",
    sku: "JUGO-WATTS-1L",
    quantity: 10,
    createdAt: "2026-05-18T12:00:00-04:00",
    eta: "2026-05-18T15:00:00-04:00",
    items: [{ sku: "JUGO-WATTS-1L", name: "Jugo Watt's 1L", quantity: 10 }],
    timeline: [
      { id: "7-a", title: "Pedido recibido", detail: "10 Jugos Watt's. Preparando envio.", timestamp: "2026-05-18T12:00:00-04:00", state: "done" },
      { id: "7-b", title: "Envio en ruta", detail: "Tracking TRK-4820C3. Reparto local zona centro.", timestamp: "2026-05-18T12:15:00-04:00", state: "done" }
    ]
  },
  {
    id: "8",
    customer: "Distribuidora Sur",
    source: "Correo",
    stage: "delivered",
    sku: "COCA-COLA-2L",
    quantity: 4,
    createdAt: "2026-05-17T16:30:00-04:00",
    eta: null,
    items: [{ sku: "COCA-COLA-2L", name: "Coca-Cola 2L", quantity: 4 }],
    timeline: [
      { id: "8-a", title: "Pedido recibido", detail: "Correo de Distribuidora Sur.", timestamp: "2026-05-17T16:30:00-04:00", state: "done" },
      { id: "8-b", title: "Confirmado y despachado", detail: "4 Coca-Cola 2L entregadas.", timestamp: "2026-05-17T17:10:00-04:00", state: "done" },
      { id: "8-c", title: "Entregado", detail: "Cliente recibio conforme. Tracking TRK-1265F7.", timestamp: "2026-05-17T17:30:00-04:00", state: "done" }
    ]
  },
  {
    id: "9",
    customer: "Kiosco Don Pepe",
    source: "WhatsApp",
    stage: "incident",
    sku: "PAPAS-LAYS-200G",
    quantity: 3,
    createdAt: "2026-05-18T08:50:00-04:00",
    eta: null,
    items: [{ sku: "PAPAS-LAYS-200G", name: "Papas Lays 200g", quantity: 3 }],
    timeline: [
      { id: "9-a", title: "Pedido recibido", detail: "3 Papas Lays. Stock bajo.", timestamp: "2026-05-18T08:50:00-04:00", state: "done" },
      { id: "9-b", title: "Cancelado por cliente", detail: "Don Pepe cancelo. Esperara reposicion.", timestamp: "2026-05-18T09:10:00-04:00", state: "critical" }
    ]
  },
  {
    id: "10",
    customer: "Bar El Rincon",
    source: "Pedido Telefonico",
    stage: "confirmed",
    sku: "PEPSI-2L",
    quantity: 15,
    createdAt: "2026-05-18T13:10:00-04:00",
    eta: "2026-05-18T17:00:00-04:00",
    items: [{ sku: "PEPSI-2L", name: "Pepsi 2L", quantity: 15 }],
    timeline: [
      { id: "10-a", title: "Pedido recibido", detail: "15 Pepsi 2L para evento fin de semana.", timestamp: "2026-05-18T13:10:00-04:00", state: "done" },
      { id: "10-b", title: "Confirmado", detail: "Stock suficiente (72 unids). Preparando despacho.", timestamp: "2026-05-18T13:12:00-04:00", state: "done" }
    ]
  }
];

export const shipments: Shipment[] = [
  {
    id: "shp-1",
    orderId: "2",
    customerId: "1",
    sku: "AGUA-MINERAL-500",
    quantity: 12,
    carrier: "Luis Castro (local)",
    tracking: "TRK-7591A2",
    stage: "hub",
    eta: "2026-05-18T12:00:00-04:00",
    createdAt: "2026-05-18T09:35:00-04:00",
    shippedAt: "2026-05-18T09:45:00-04:00"
  },
  {
    id: "shp-2",
    orderId: "7",
    customerId: "1",
    sku: "JUGO-WATTS-1L",
    quantity: 10,
    carrier: "Luis Castro (local)",
    tracking: "TRK-4820C3",
    stage: "out_for_delivery",
    eta: "2026-05-18T15:00:00-04:00",
    createdAt: "2026-05-18T12:05:00-04:00",
    shippedAt: "2026-05-18T12:15:00-04:00"
  },
  {
    id: "shp-3",
    orderId: "8",
    customerId: "3",
    sku: "COCA-COLA-2L",
    quantity: 4,
    carrier: "Luis Castro (local)",
    tracking: "TRK-1265F7",
    stage: "delivered",
    eta: null,
    createdAt: "2026-05-17T16:35:00-04:00",
    shippedAt: "2026-05-17T17:10:00-04:00"
  },
  {
    id: "shp-4",
    orderId: "10",
    customerId: "1",
    sku: "PEPSI-2L",
    quantity: 15,
    carrier: "Luis Castro (local)",
    tracking: "TRK-9931H4",
    stage: "delayed",
    eta: "2026-05-18T17:00:00-04:00",
    createdAt: "2026-05-18T13:15:00-04:00",
    shippedAt: "2026-05-18T13:20:00-04:00",
    exception: "Direccion de entrega no encontrada. Contactando al cliente."
  }
];

export const fallbackAlerts: AlertItem[] = [
  {
    id: "alt-stock-chicles",
    title: "Stock critico: Chicles Frugele",
    description: "Solo 2 unidades disponibles. Pedido #4 rechazado por falta de stock. Se requiere reposicion urgente del proveedor.",
    type: "stock",
    severity: "critical",
    createdAt: "2026-05-18T10:23:00-04:00",
    actionLabel: "Reponer inventario"
  },
  {
    id: "alt-stock-chocolate",
    title: "Stock bajo: Chocolate Trencito",
    description: "Quedan 3 unidades. Pedido #3 de Kiosco Don Pepe esta pendiente de revision.",
    type: "stock",
    severity: "high",
    createdAt: "2026-05-18T10:00:00-04:00",
    actionLabel: "Revisar inventario"
  },
  {
    id: "alt-order-4",
    title: "Pedido #4 rechazado - Bar El Rincon",
    description: "Chicles Frugele sin stock suficiente. Cliente frecuente afectado.",
    type: "order",
    severity: "high",
    createdAt: "2026-05-18T10:23:00-04:00",
    actionLabel: "Ver pedido"
  },
  {
    id: "alt-shipment-10",
    title: "Envio #10 retrasado - Pepsi 2L",
    description: "Tracking TRK-9931H4. Direccion no encontrada. Contactar a Bar El Rincon.",
    type: "shipment",
    severity: "medium",
    createdAt: "2026-05-18T13:20:00-04:00",
    actionLabel: "Resolver envio"
  },
  {
    id: "alt-order-9",
    title: "Pedido #9 cancelado - Kiosco Don Pepe",
    description: "Cliente cancelo pedido de Papas Lays. Stock bajo (8 unids).",
    type: "order",
    severity: "medium",
    createdAt: "2026-05-18T09:10:00-04:00",
    actionLabel: "Ver pedido"
  }
];

const HEALTH_VARIANT: Record<HealthState, "success" | "warning" | "danger"> = {
  healthy: "success",
  warning: "warning",
  critical: "danger",
  offline: "warning"
};

const ORDER_STAGE_VARIANT: Record<OrderStage, "info" | "success" | "warning" | "neutral" | "danger"> = {
  new: "info",
  confirmed: "success",
  picking: "warning",
  packed: "neutral",
  in_transit: "success",
  delivered: "success",
  incident: "danger"
};

const SHIPMENT_STAGE_VARIANT: Record<ShipmentStage, "neutral" | "info" | "warning" | "success" | "danger"> = {
  label_created: "neutral",
  picked_up: "info",
  hub: "warning",
  out_for_delivery: "warning",
  delivered: "success",
  delayed: "danger"
};

export function getHealthVariant(state: HealthState) {
  return HEALTH_VARIANT[state];
}

export function getOrderStageVariant(stage: OrderStage) {
  return ORDER_STAGE_VARIANT[stage];
}

export function getShipmentStageVariant(stage: ShipmentStage) {
  return SHIPMENT_STAGE_VARIANT[stage];
}

import { getRoleLabel as getRoleLabelFromRegistry } from "@/lib/user-registry";
export { getRoleLabelFromRegistry as getRoleLabel };
