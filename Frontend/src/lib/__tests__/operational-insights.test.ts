import { describe, it, expect } from "vitest";
import { buildOperationalAlerts, buildOrderTimeline } from "@/lib/operational-insights";
import type { ApiNotificationRecord } from "@/types/api";
import type { AlertItem, Order, Product, Shipment, TimelineEvent } from "@/types/domain";

const baseOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "1", customer: "Cliente X", customerId: "10", source: "Test",
  stage: "created", sku: "SKU-001", quantity: 5,
  createdAt: "2026-05-29T10:00:00Z", eta: null,
  items: [{ sku: "SKU-001", name: "Producto X", quantity: 5 }],
  timeline: [], assignedTo: undefined, cancelReason: null,
  ...overrides
});

const baseProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "1", sku: "SKU-001", name: "Producto X", stock: 50,
  price: 1000, cost: 500, category: "bebidas",
  status: "healthy", updatedAt: "2026-05-29T10:00:00Z",
  ...overrides
});

const baseShipment = (overrides: Partial<Shipment> = {}): Shipment => ({
  id: "1", orderId: "1", customerId: "10", sku: "SKU-001",
  quantity: 5, carrier: "Transportista", tracking: "TRACK-1234",
  stage: "en_preparacion", eta: null,
  createdAt: "2026-05-29T10:00:00Z", shippedAt: null,
  ...overrides
});

// ─── buildOperationalAlerts ───────────────────────────────────

describe("buildOperationalAlerts", () => {
  it("devuelve array vacio sin datos", () => {
    const r = buildOperationalAlerts({ orders: [], inventory: [], shipments: [], notifications: [] });
    expect(r).toEqual([]);
  });

  it("alerta de stock agotado (<=0)", () => {
    const r = buildOperationalAlerts({ orders: [], inventory: [baseProduct({ sku: "SKU-X", stock: 0, name: "Agotado" })], shipments: [], notifications: [] });
    expect(r).toHaveLength(1);
    expect(r[0].severity).toBe("critical");
    expect(r[0].type).toBe("stock");
    expect(r[0].title).toContain("agotado");
  });

  it("alerta de stock bajo (1-5)", () => {
    const r = buildOperationalAlerts({ orders: [], inventory: [baseProduct({ stock: 3 })], shipments: [], notifications: [] });
    expect(r).toHaveLength(1);
    expect(r[0].severity).toBe("high");
    expect(r[0].type).toBe("stock");
    expect(r[0].title).toContain("bajo");
  });

  it("sin alerta con stock > 5", () => {
    const r = buildOperationalAlerts({ orders: [], inventory: [baseProduct({ stock: 50 })], shipments: [], notifications: [] });
    expect(r.filter(a => a.type === "stock")).toHaveLength(0);
  });

  it("alerta de pedido cancelado", () => {
    const r = buildOperationalAlerts({ orders: [baseOrder({ stage: "cancelado", cancelReason: "Cliente desistio" })], inventory: [], shipments: [], notifications: [] });
    expect(r).toHaveLength(1);
    expect(r[0].type).toBe("order");
    expect(r[0].severity).toBe("high");
    expect(r[0].description).toContain("Cliente desistio");
  });

  it("sin alerta para pedidos no cancelados", () => {
    const r = buildOperationalAlerts({ orders: [baseOrder({ stage: "created" })], inventory: [], shipments: [], notifications: [] });
    expect(r.filter(a => a.type === "order")).toHaveLength(0);
  });

  it("alerta de envio cancelado", () => {
    const r = buildOperationalAlerts({ orders: [], inventory: [], shipments: [baseShipment({ stage: "cancelado" })], notifications: [] });
    expect(r).toHaveLength(1);
    expect(r[0].type).toBe("shipment");
    expect(r[0].severity).toBe("medium");
  });

  it("alerta de notificacion con error", () => {
    const notif: ApiNotificationRecord = { id: 1, eventId: "e1", orderId: 1, customerId: 1, stage: "Envio", status: "error", message: "Fallo envio", targetAudience: "OPERATOR", sourceService: "shipping", occurredAt: "2026-05-29T10:00:00Z", receivedAt: "2026-05-29T10:00:01Z" };
    const r = buildOperationalAlerts({ orders: [], inventory: [], shipments: [], notifications: [notif] });
    expect(r).toHaveLength(1);
    expect(r[0].severity).toBe("critical");
    expect(r[0].type).toBe("notification");
  });

  it("alerta de notificacion con warn", () => {
    const notif: ApiNotificationRecord = { id: 2, eventId: "e2", orderId: 2, customerId: 2, stage: "Stock", status: "warn", message: "Stock bajo", targetAudience: "OPERATOR", sourceService: "inventory", occurredAt: "2026-05-29T10:00:00Z", receivedAt: "2026-05-29T10:00:01Z" };
    const r = buildOperationalAlerts({ orders: [], inventory: [], shipments: [], notifications: [notif] });
    expect(r).toHaveLength(1);
    expect(r[0].severity).toBe("high");
  });

  it("ignora notificaciones para CLIENT", () => {
    const notif: ApiNotificationRecord = { id: 1, eventId: "e1", orderId: 1, customerId: 1, stage: "Envio", status: "info", message: "En camino", targetAudience: "CLIENT", sourceService: "shipping", occurredAt: "2026-05-29T10:00:00Z", receivedAt: "2026-05-29T10:00:01Z" };
    const r = buildOperationalAlerts({ orders: [], inventory: [], shipments: [], notifications: [notif] });
    expect(r).toHaveLength(0);
  });

  it("prioriza criticas sobre high", () => {
    const r = buildOperationalAlerts({
      orders: [baseOrder({ stage: "cancelado" })],
      inventory: [baseProduct({ sku: "A", stock: 0 }), baseProduct({ sku: "B", stock: 3 })],
      shipments: [], notifications: []
    });
    expect(r[0].severity).toBe("critical");
  });

  it("ordena por severidad descendente", () => {
    const r = buildOperationalAlerts({
      orders: [baseOrder({ stage: "cancelado", id: "order-1" })],
      inventory: [],
      shipments: [baseShipment({ stage: "cancelado", id: "ship-1" })],
      notifications: []
    });
    expect(r[0].severity).toBe("high"); // order cancelado es high
    expect(r[1].severity).toBe("medium"); // shipment cancelado es medium
  });

  it("maneja notifications null", () => {
    const r = buildOperationalAlerts({ orders: [], inventory: [baseProduct({ stock: 0 })], shipments: [], notifications: null as unknown as ApiNotificationRecord[] });
    expect(r).toHaveLength(1);
    expect(r[0].type).toBe("stock");
  });

  it("multiple alertas combinadas", () => {
    const r = buildOperationalAlerts({
      orders: [baseOrder({ id: "1", stage: "cancelado" }), baseOrder({ id: "2", stage: "created" })],
      inventory: [baseProduct({ sku: "A", stock: 2 }), baseProduct({ sku: "B", stock: 0 })],
      shipments: [baseShipment({ id: "s1", stage: "cancelado" })],
      notifications: []
    });
    expect(r.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── buildOrderTimeline ───────────────────────────────────────

describe("buildOrderTimeline", () => {
  it("linea de tiempo desde notificaciones", () => {
    const notif: ApiNotificationRecord[] = [
      { id: 1, eventId: "e1", orderId: 1, customerId: 1, stage: "Pedido", status: "CREADO", message: "Pedido creado", targetAudience: "CLIENT", sourceService: "orders", occurredAt: "2026-05-29T10:00:00Z", receivedAt: "2026-05-29T10:00:01Z" },
      { id: 2, eventId: "e2", orderId: 1, customerId: 1, stage: "Envio", status: "EN_CAMINO", message: "En camino", targetAudience: "CLIENT", sourceService: "shipping", occurredAt: "2026-05-29T11:00:00Z", receivedAt: "2026-05-29T11:00:01Z" }
    ];
    const r = buildOrderTimeline({ order: baseOrder(), shipment: null, notifications: notif });
    expect(r).toHaveLength(2);
    expect(r[0].title).toBe("Pedido");
    expect(r[1].title).toBe("Envio");
  });

  it("linea de tiempo sin notificaciones usa order + shipment", () => {
    const r = buildOrderTimeline({ order: baseOrder(), shipment: baseShipment(), notifications: [] });
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(r[0].title).toBe("Pedido recibido");
    expect(r[1].title).toBe("Despacho generado");
  });

  it("pedido cancelado muestra incidente", () => {
    const r = buildOrderTimeline({ order: baseOrder({ stage: "cancelado" }), shipment: null, notifications: [] });
    const incident = r.find(e => e.title === "Incidencia detectada");
    expect(incident).toBeDefined();
    expect(incident!.state).toBe("critical");
  });

  it("pedido entregado muestra timeline completo", () => {
    const r = buildOrderTimeline({ order: baseOrder({ stage: "entregado" }), shipment: baseShipment({ stage: "en_preparacion", tracking: "TRACK-OK" }), notifications: [] });
    expect(r.some(e => e.title === "Pedido recibido")).toBe(true);
    expect(r.some(e => e.title === "Pedido confirmado")).toBe(true);
    expect(r.some(e => e.title === "Despacho generado")).toBe(true);
  });

  it("shipment con tracking muestra tracking asignado", () => {
    const r = buildOrderTimeline({ order: baseOrder({ stage: "en_reparto" }), shipment: baseShipment({ tracking: "TRACK-OK", shippedAt: "2026-05-29T11:00:00Z" }), notifications: [] });
    const trackingEvent = r.find(e => e.title === "Tracking asignado");
    expect(trackingEvent).toBeDefined();
    expect(trackingEvent!.detail).toContain("TRACK-OK");
  });

  it("shipment con tracking Pendiente no muestra tracking asignado", () => {
    const r = buildOrderTimeline({ order: baseOrder(), shipment: baseShipment({ tracking: "Pendiente" }), notifications: [] });
    expect(r.find(e => e.title === "Tracking asignado")).toBeUndefined();
  });

  it("maneja notifications null", () => {
    const r = buildOrderTimeline({ order: baseOrder(), shipment: null, notifications: null as unknown as ApiNotificationRecord[] });
    expect(r).toHaveLength(1);
    expect(r[0].title).toBe("Pedido recibido");
  });

  it("maneja order null", () => {
    const r = buildOrderTimeline({ order: null, shipment: baseShipment({ tracking: "Pendiente" }), notifications: [] });
    expect(r).toHaveLength(1);
    expect(r[0].title).toBe("Despacho generado");
  });

  it("timeline ordenada por fecha", () => {
    const r = buildOrderTimeline({ order: baseOrder({ createdAt: "2026-05-29T10:00:00Z", stage: "en_reparto" }), shipment: baseShipment({ createdAt: "2026-05-29T11:00:00Z" }), notifications: [] });
    for (let i = 1; i < r.length; i++) {
      expect(new Date(r[i].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(r[i-1].timestamp).getTime());
    }
  });

  it("shipment cancelado muestra warning en tracking", () => {
    const r = buildOrderTimeline({ order: baseOrder(), shipment: baseShipment({ stage: "cancelado", tracking: "TRACK-OK", shippedAt: "2026-05-29T11:00:00Z" }), notifications: [] });
    const trackingEvent = r.find(e => e.title === "Tracking asignado");
    expect(trackingEvent).toBeDefined();
    expect(trackingEvent!.state).toBe("warning");
  });
});
