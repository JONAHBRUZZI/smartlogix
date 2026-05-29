import { describe, it, expect } from "vitest";
import {
  adaptOrder,
  adaptInventory,
  adaptShipment,
  adaptNotifications,
  adaptCustomer,
  normalizeOrderStage,
  normalizeShipmentStage,
  calculateHealthFromStock,
  normalizeIntegrationHealth
} from "@/lib/api-adapters";
import type { ApiOrder, ApiInventory, ApiShipment, ApiNotificationRecord, ApiCustomer } from "@/types/api";

describe("normalizeOrderStage", () => {
  it("normaliza CREATED a created", () => {
    expect(normalizeOrderStage("CREATED")).toBe("created");
  });

  it("normaliza EN_PREPARACION a en_preparacion", () => {
    expect(normalizeOrderStage("EN_PREPARACION")).toBe("en_preparacion");
  });

  it("normaliza EN_REPARTO a en_reparto", () => {
    expect(normalizeOrderStage("EN_REPARTO")).toBe("en_reparto");
  });

  it("normaliza ENTREGADO a entregado", () => {
    expect(normalizeOrderStage("ENTREGADO")).toBe("entregado");
  });

  it("normaliza CANCELADO a cancelado", () => {
    expect(normalizeOrderStage("CANCELADO")).toBe("cancelado");
  });

  it("maneja variantes con prefijos comunes", () => {
    expect(normalizeOrderStage("cancel")).toBe("cancelado");
    expect(normalizeOrderStage("reject")).toBe("cancelado");
  });

  it("retorna 'created' como fallback para estados desconocidos", () => {
    expect(normalizeOrderStage("DESCONOCIDO")).toBe("created");
    expect(normalizeOrderStage("xyz")).toBe("created");
  });
});

describe("normalizeShipmentStage", () => {
  it("normaliza EN_PREPARACION correctamente", () => {
    expect(normalizeShipmentStage("EN_PREPARACION")).toBe("en_preparacion");
  });

  it("normaliza EN_REPARTO correctamente", () => {
    expect(normalizeShipmentStage("EN_REPARTO")).toBe("en_reparto");
  });

  it("normaliza ENTREGADO correctamente", () => {
    expect(normalizeShipmentStage("ENTREGADO")).toBe("entregado");
  });

  it("normaliza 'deliver' a entregado", () => {
    expect(normalizeShipmentStage("deliver")).toBe("entregado");
  });

  it("fallback a en_preparacion para desconocido", () => {
    expect(normalizeShipmentStage("UNKNOWN")).toBe("en_preparacion");
  });
});

describe("calculateHealthFromStock", () => {
  it("retorna critical si stock <= 0", () => {
    expect(calculateHealthFromStock(0)).toBe("critical");
    expect(calculateHealthFromStock(-5)).toBe("critical");
  });

  it("retorna warning si stock entre 1 y 5", () => {
    expect(calculateHealthFromStock(1)).toBe("warning");
    expect(calculateHealthFromStock(3)).toBe("warning");
    expect(calculateHealthFromStock(5)).toBe("warning");
  });

  it("retorna healthy si stock > 5", () => {
    expect(calculateHealthFromStock(6)).toBe("healthy");
    expect(calculateHealthFromStock(100)).toBe("healthy");
  });
});

describe("adaptOrder", () => {
  const apiOrder: ApiOrder = {
    id: 1,
    customerId: 10,
    sku: "COCA-2L",
    quantity: 5,
    status: "EN_PREPARACION",
    createdAt: "2026-05-01T10:00:00Z",
    assignedTo: "Luis Castro",
    cancelReason: null
  };

  it("convierte ApiOrder a Order con los campos correctos", () => {
    const result = adaptOrder(apiOrder, "Bar El Rincon");

    expect(result.id).toBe("1");
    expect(result.customer).toBe("Bar El Rincon");
    expect(result.customerId).toBe("10");
    expect(result.sku).toBe("COCA-2L");
    expect(result.quantity).toBe(5);
    expect(result.stage).toBe("en_preparacion");
    expect(result.createdAt).toBe("2026-05-01T10:00:00Z");
    expect(result.assignedTo).toBe("Luis Castro");
    expect(result.cancelReason).toBeNull();
  });

  it("usa nombre por defecto cuando no se proporciona customerName", () => {
    const result = adaptOrder(apiOrder);

    expect(result.customer).toBe("Cliente #10");
  });

  it("inicializa items con el SKU del pedido", () => {
    const result = adaptOrder(apiOrder);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].sku).toBe("COCA-2L");
    expect(result.items[0].quantity).toBe(5);
  });

  it("inicializa timeline vacio y eta null", () => {
    const result = adaptOrder(apiOrder);

    expect(result.timeline).toEqual([]);
    expect(result.eta).toBeNull();
  });

  it("usa fecha actual cuando createdAt es null", () => {
    const orderSinFecha: ApiOrder = { ...apiOrder, createdAt: null };
    const result = adaptOrder(orderSinFecha);

    expect(result.createdAt).toBeTruthy();
    expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe("adaptInventory", () => {
  const apiInventory: ApiInventory = {
    id: 5,
    sku: "COCA-2L",
    name: "Coca-Cola 2L",
    stock: 48,
    price: 2200,
    cost: 1500,
    category: "bebidas"
  };

  it("convierte ApiInventory a Product correctamente", () => {
    const result = adaptInventory(apiInventory);

    expect(result.id).toBe("5");
    expect(result.sku).toBe("COCA-2L");
    expect(result.name).toBe("Coca-Cola 2L");
    expect(result.stock).toBe(48);
    expect(result.price).toBe(2200);
    expect(result.cost).toBe(1500);
    expect(result.category).toBe("bebidas");
  });

  it("asigna status healthy cuando stock > 5", () => {
    const result = adaptInventory({ ...apiInventory, stock: 50 });
    expect(result.status).toBe("healthy");
  });

  it("asigna status warning cuando stock entre 1 y 5", () => {
    const result = adaptInventory({ ...apiInventory, stock: 3 });
    expect(result.status).toBe("warning");
  });

  it("asigna status critical cuando stock es 0", () => {
    const result = adaptInventory({ ...apiInventory, stock: 0 });
    expect(result.status).toBe("critical");
  });

  it("asigna updatedAt como fecha actual", () => {
    const result = adaptInventory(apiInventory);
    expect(result.updatedAt).toBeTruthy();
  });
});

describe("adaptShipment", () => {
  const apiShipment: ApiShipment = {
    id: 3,
    orderId: 10,
    customerId: 5,
    sku: 100001,
    quantity: 5,
    status: "EN_REPARTO",
    trackingNumber: "TRACK-12345678",
    createdAt: "2026-05-27T18:00:00Z",
    shippedAt: "2026-05-28T09:00:00Z",
    proofOfDeliveryImage: null,
    recipientRut: null,
    customerCode: null
  };

  it("convierte ApiShipment a Shipment correctamente", () => {
    const result = adaptShipment(apiShipment);

    expect(result.id).toBe("3");
    expect(result.orderId).toBe("10");
    expect(result.customerId).toBe("5");
    expect(result.sku).toBe("100001");
    expect(result.quantity).toBe(5);
    expect(result.stage).toBe("en_reparto");
    expect(result.tracking).toBe("TRACK-12345678");
    expect(result.carrier).toBe("Transportista asignado");
    expect(result.createdAt).toBe("2026-05-27T18:00:00Z");
    expect(result.shippedAt).toBe("2026-05-28T09:00:00Z");
  });

  it("asigna carrier pendiente cuando no hay trackingNumber", () => {
    const sinTracking: ApiShipment = { ...apiShipment, trackingNumber: null };
    const result = adaptShipment(sinTracking);

    expect(result.carrier).toBe("Pendiente de asignacion");
    expect(result.tracking).toBe("Pendiente");
  });

  it("agrega exception cuando el envio esta cancelado", () => {
    const cancelado: ApiShipment = { ...apiShipment, status: "CANCELADO" };
    const result = adaptShipment(cancelado);

    expect(result.stage).toBe("cancelado");
    expect(result.exception).toBe("Envio cancelado");
  });
});

describe("adaptNotifications", () => {
  const records: ApiNotificationRecord[] = [
    {
      id: 1,
      eventId: "evt-001",
      orderId: 10,
      customerId: 5,
      stage: "Pedido creado",
      status: "up",
      message: "El pedido fue registrado exitosamente",
      targetAudience: "OPERATOR",
      sourceService: "orders-service",
      occurredAt: "2026-05-27T18:00:00Z",
      receivedAt: "2026-05-27T18:00:01Z"
    },
    {
      id: 2,
      eventId: "evt-002",
      orderId: 10,
      customerId: 5,
      stage: "Stock validado",
      status: "ok",
      message: "Inventario confirmado",
      targetAudience: "OPERATOR",
      sourceService: "inventory-service",
      occurredAt: "2026-05-27T18:01:00Z",
      receivedAt: "2026-05-27T18:01:01Z"
    }
  ];

  it("convierte ApiNotificationRecord[] a TimelineEvent[]", () => {
    const result = adaptNotifications(records);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Pedido creado");
    expect(result[1].title).toBe("Stock validado");
  });

  it("ordena eventos por occurredAt ascendente", () => {
    const result = adaptNotifications(records);

    expect(new Date(result[0].timestamp).getTime())
      .toBeLessThan(new Date(result[1].timestamp).getTime());
  });

  it("incluye sourceService en el detalle", () => {
    const result = adaptNotifications(records);

    expect(result[0].detail).toContain("orders-service");
    expect(result[1].detail).toContain("inventory-service");
  });

  it("retorna array vacio sin entradas", () => {
    expect(adaptNotifications([])).toEqual([]);
  });
});

describe("adaptCustomer", () => {
  const apiCustomer: ApiCustomer = {
    id: 1,
    name: "Bar El Rincon",
    phone: "+56912345678",
    address: "Av. Principal 123",
    email: "contacto@elrincon.cl",
    createdAt: "2026-01-15T10:00:00Z"
  };

  it("convierte ApiCustomer a Customer", () => {
    const result = adaptCustomer(apiCustomer);

    expect(result.id).toBe("1");
    expect(result.name).toBe("Bar El Rincon");
    expect(result.phone).toBe("+56912345678");
    expect(result.address).toBe("Av. Principal 123");
    expect(result.email).toBe("contacto@elrincon.cl");
    expect(result.createdAt).toBe("2026-01-15T10:00:00Z");
  });

  it("maneja campos opcionales nulos", () => {
    const sinOpcionales: ApiCustomer = {
      id: 2,
      name: "Kiosco Don Pepe",
      phone: null,
      address: null,
      email: null,
      createdAt: null
    };
    const result = adaptCustomer(sinOpcionales);

    expect(result.phone).toBeUndefined();
    expect(result.address).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.createdAt).toBeTruthy();
  });
});

describe("normalizeIntegrationHealth", () => {
  it("mapea up a healthy", () => {
    expect(normalizeIntegrationHealth("up")).toBe("healthy");
  });

  it("mapea warn a warning", () => {
    expect(normalizeIntegrationHealth("warn")).toBe("warning");
  });

  it("mapea offline a offline", () => {
    expect(normalizeIntegrationHealth("offline")).toBe("offline");
  });

  it("fallback a critical para estados desconocidos", () => {
    expect(normalizeIntegrationHealth("desconocido")).toBe("critical");
  });
});
