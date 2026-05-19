import type { ApiInventory, ApiNotificationRecord, ApiOrder, ApiShipment } from "@/types/api";
import type { HealthState, Order, OrderStage, Product, Shipment, ShipmentStage, TimelineEvent } from "@/types/domain";

type StatusMap<T extends string> = readonly (readonly [string, T])[];

const ORDER_STAGE_MAP: StatusMap<OrderStage> = [
  ["deliver", "delivered"],
  ["transit", "in_transit"],
  ["ship", "in_transit"],
  ["pack", "packed"],
  ["pick", "picking"],
  ["confirm", "confirmed"],
  ["approve", "confirmed"],
  ["reject", "incident"],
  ["cancel", "incident"],
  ["error", "incident"],
  ["incident", "incident"]
];

const SHIPMENT_STAGE_MAP: StatusMap<ShipmentStage> = [
  ["deliver", "delivered"],
  ["delay", "delayed"],
  ["error", "delayed"],
  ["out", "out_for_delivery"],
  ["hub", "hub"],
  ["transit", "hub"],
  ["pick", "picked_up"]
];

const HEALTH_MAP: StatusMap<HealthState> = [
  ["up", "healthy"],
  ["ok", "healthy"],
  ["healthy", "healthy"],
  ["warn", "warning"],
  ["degrad", "warning"],
  ["offline", "offline"]
];

const normalizeFromMap = <T extends string>(maps: StatusMap<T>, fallback: T) => (status: string): T => {
  const normalized = status.toLowerCase();
  for (const [keyword, stage] of maps) {
    if (normalized.includes(keyword)) return stage;
  }
  return fallback;
};

export const normalizeOrderStage = normalizeFromMap(ORDER_STAGE_MAP, "new");
export const normalizeShipmentStage = normalizeFromMap(SHIPMENT_STAGE_MAP, "label_created");
export const normalizeHealth = normalizeFromMap(HEALTH_MAP, "critical");

export function calculateHealthFromStock(stock: number): HealthState {
  if (stock <= 0) return "critical";
  if (stock <= 5) return "warning";
  return "healthy";
}

export function calculateCoverageDays(stock: number): number {
  if (stock <= 0) return 0;
  return Math.max(2, Math.round(stock / 2));
}

export function adaptOrder(apiOrder: ApiOrder): Order {
  return {
    id: String(apiOrder.id),
    customer: String(apiOrder.customerId),
    source: "Sincronizacion BD",
    stage: normalizeOrderStage(apiOrder.status),
    sku: String(apiOrder.sku),
    quantity: apiOrder.quantity,
    createdAt: apiOrder.createdAt ?? new Date().toISOString(),
    eta: null,
    items: [
      {
        sku: String(apiOrder.sku),
        name: String(apiOrder.sku),
        quantity: apiOrder.quantity
      }
    ],
    timeline: []
  };
}

export function adaptInventory(apiInventory: ApiInventory): Product {
  return {
    id: String(apiInventory.id),
    sku: String(apiInventory.sku),
    name: String(apiInventory.sku),
    stock: apiInventory.stock,
    status: calculateHealthFromStock(apiInventory.stock),
    coverageDays: calculateCoverageDays(apiInventory.stock),
    updatedAt: new Date().toISOString()
  };
}

export function adaptShipment(apiShipment: ApiShipment): Shipment {
  const stage = normalizeShipmentStage(apiShipment.status);
  return {
    id: String(apiShipment.id),
    orderId: String(apiShipment.orderId),
    customerId: String(apiShipment.customerId),
    sku: String(apiShipment.sku),
    quantity: apiShipment.quantity,
    carrier: apiShipment.trackingNumber ? "Transportista asignado" : "Pendiente de asignacion",
    tracking: apiShipment.trackingNumber ?? "Pendiente",
    stage,
    eta: apiShipment.shippedAt ?? apiShipment.createdAt ?? null,
    createdAt: apiShipment.createdAt ?? new Date().toISOString(),
    shippedAt: apiShipment.shippedAt ?? null,
    exception: stage === "delayed" ? "El servicio de envios reporto una demora que requiere seguimiento." : undefined
  };
}

export function adaptNotifications(records: ApiNotificationRecord[]): TimelineEvent[] {
  return records
    .slice()
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime())
    .map((record) => ({
      id: String(record.id),
      title: record.stage,
      detail: `${record.message} | ${record.sourceService}`,
      timestamp: record.occurredAt,
      state: normalizeHealth(record.status)
    }));
}

export function normalizeIntegrationHealth(rawStatus: string): HealthState {
  return normalizeHealth(rawStatus);
}
