import { useEffect, useMemo, useState } from "react";
import type { Order, Product, Shipment, ShipmentStage } from "@/types/domain";
import { calculateCoverageDays, calculateHealthFromStock } from "@/lib/api-adapters";

const STORAGE_KEY = "smartlogix-operational-workspace:v1";
const STORAGE_EVENT = "smartlogix-operational-workspace:updated";

export type OrderDecisionType = "approved" | "rejected" | "reprocess";

interface StoredOrderDecision {
  orderId: string;
  decision: OrderDecisionType;
  note: string;
  updatedAt: string;
}

interface StoredInventoryAdjustment {
  id: string;
  sku: string;
  delta: number;
  reason: string;
  updatedAt: string;
}

interface StoredShipmentUpdate {
  shipmentId: string;
  stage: ShipmentStage;
  note: string;
  updatedAt: string;
}

interface StoredManualShipment extends Shipment {
  note: string;
}

interface OperationalStore {
  version: 1;
  orderDecisions: Record<string, StoredOrderDecision>;
  inventoryAdjustments: StoredInventoryAdjustment[];
  manualShipments: StoredManualShipment[];
  shipmentUpdates: Record<string, StoredShipmentUpdate>;
}

export interface OperationalOrder extends Order {
  operationalDecision: OrderDecisionType | null;
  operationalNote: string | null;
  operationalUpdatedAt: string | null;
  needsReview: boolean;
  canDispatch: boolean;
}

export interface OperationalProduct extends Product {
  stockDelta: number;
  lastAdjustmentReason: string | null;
  lastAdjustmentAt: string | null;
}

export interface OperationalShipment extends Shipment {
  isManual: boolean;
  operationalNote: string | null;
  operationalUpdatedAt: string | null;
}

export interface OperationalActivity {
  id: string;
  type: "order" | "inventory" | "shipment";
  title: string;
  detail: string;
  createdAt: string;
  href: string;
}

function createEmptyStore(): OperationalStore {
  return {
    version: 1,
    orderDecisions: {},
    inventoryAdjustments: [],
    manualShipments: [],
    shipmentUpdates: {}
  };
}

function readStore(): OperationalStore {
  if (typeof window === "undefined") return createEmptyStore();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyStore();

  try {
    const parsed = JSON.parse(raw) as Partial<OperationalStore>;
    return {
      version: 1,
      orderDecisions: parsed.orderDecisions ?? {},
      inventoryAdjustments: parsed.inventoryAdjustments ?? [],
      manualShipments: parsed.manualShipments ?? [],
      shipmentUpdates: parsed.shipmentUpdates ?? {}
    };
  } catch {
    return createEmptyStore();
  }
}

function persistStore(store: OperationalStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function buildId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapDecisionToStage(decision: OrderDecisionType, currentStage: Order["stage"]): Order["stage"] {
  if (decision === "approved") return "confirmed";
  if (decision === "rejected") return "incident";
  if (currentStage === "delivered") return currentStage;
  return "new";
}

function createTracking(orderId: string) {
  const suffix = Date.now().toString().slice(-6);
  return `SLX-${orderId.padStart(4, "0")}-${suffix}`;
}

function applyShipmentUpdate(shipment: Shipment, update?: StoredShipmentUpdate | null): OperationalShipment {
  if (!update) {
    return {
      ...shipment,
      isManual: false,
      operationalNote: null,
      operationalUpdatedAt: null
    };
  }

  return {
    ...shipment,
    stage: update.stage,
    exception: update.stage === "delayed" ? update.note || shipment.exception : shipment.exception,
    isManual: false,
    operationalNote: update.note,
    operationalUpdatedAt: update.updatedAt
  };
}

export function useOperationalWorkspace({
  orders = [],
  inventory = [],
  shipments = []
}: {
  orders?: Order[];
  inventory?: Product[];
  shipments?: Shipment[];
}) {
  const [store, setStore] = useState<OperationalStore>(() => readStore());

  useEffect(() => {
    const sync = () => setStore(readStore());
    window.addEventListener("storage", sync);
    window.addEventListener(STORAGE_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(STORAGE_EVENT, sync as EventListener);
    };
  }, []);

  function commit(next: OperationalStore) {
    setStore(next);
    persistStore(next);
  }

  const operationalInventory = useMemo<OperationalProduct[]>(() => {
    return inventory.map((product) => {
      const adjustments = store.inventoryAdjustments.filter((entry) => entry.sku === product.sku);
      const stockDelta = adjustments.reduce((sum, entry) => sum + entry.delta, 0);
      const sorted = adjustments.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const latest = sorted[0] ?? null;
      const stock = Math.max(product.stock + stockDelta, 0);

      return {
        ...product,
        stock,
        status: calculateHealthFromStock(stock),
        coverageDays: calculateCoverageDays(stock),
        updatedAt: latest?.updatedAt ?? product.updatedAt,
        stockDelta,
        lastAdjustmentReason: latest?.reason ?? null,
        lastAdjustmentAt: latest?.updatedAt ?? null
      };
    });
  }, [inventory, store.inventoryAdjustments]);

  const mergedShipments = useMemo<OperationalShipment[]>(() => {
    const base = shipments.map((shipment) => applyShipmentUpdate(shipment, store.shipmentUpdates[shipment.id] ?? null));
    const manual = store.manualShipments.map((shipment) => {
      const update = store.shipmentUpdates[shipment.id] ?? null;
      const stage = update?.stage ?? shipment.stage;
      return {
        ...shipment,
        stage,
        exception: stage === "delayed" ? update?.note || shipment.note : shipment.exception,
        isManual: true,
        operationalNote: update?.note ?? shipment.note,
        operationalUpdatedAt: update?.updatedAt ?? shipment.createdAt
      } satisfies OperationalShipment;
    });
    return [...base, ...manual].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [shipments, store.manualShipments, store.shipmentUpdates]);

  const shipmentOrderIds = useMemo(() => new Set(mergedShipments.map((s) => s.orderId)), [mergedShipments]);

  const operationalOrders = useMemo<OperationalOrder[]>(() => {
    return orders
      .map((order) => {
        const decision = store.orderDecisions[order.id] ?? null;
        const stage = decision ? mapDecisionToStage(decision.decision, order.stage) : order.stage;
        return {
          ...order,
          stage,
          operationalDecision: decision?.decision ?? null,
          operationalNote: decision?.note ?? null,
          operationalUpdatedAt: decision?.updatedAt ?? null,
          needsReview: decision ? decision.decision !== "approved" && stage !== "delivered" : stage !== "delivered",
          canDispatch: stage === "confirmed" && !shipmentOrderIds.has(order.id)
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, shipmentOrderIds, store.orderDecisions]);

  const validationQueue = useMemo(() => operationalOrders.filter((o) => o.needsReview), [operationalOrders]);
  const dispatchQueue = useMemo(() => operationalOrders.filter((o) => o.canDispatch), [operationalOrders]);
  const stockQueue = useMemo(() => operationalInventory.filter((p) => p.stock <= 5), [operationalInventory]);

  const activities = useMemo<OperationalActivity[]>(() => {
    const orderActivities = Object.values(store.orderDecisions).map((entry) => ({
      id: `order-${entry.orderId}`,
      type: "order" as const,
      title: `Pedido ${entry.orderId}`,
      detail: entry.note,
      createdAt: entry.updatedAt,
      href: `/orders/${entry.orderId}`
    }));

    const inventoryActivities = store.inventoryAdjustments.map((entry) => ({
      id: entry.id,
      type: "inventory" as const,
      title: `Stock ${entry.sku}`,
      detail: `${entry.delta > 0 ? "+" : ""}${entry.delta} unidades | ${entry.reason}`,
      createdAt: entry.updatedAt,
      href: `/inventory/${encodeURIComponent(entry.sku)}`
    }));

    const shipmentActivities = [
      ...store.manualShipments.map((entry) => ({
        id: entry.id,
        type: "shipment" as const,
        title: `Despacho ${entry.orderId}`,
        detail: `${entry.carrier} | tracking ${entry.tracking}`,
        createdAt: entry.createdAt,
        href: "/shipments"
      })),
      ...Object.values(store.shipmentUpdates).map((entry) => ({
        id: `update-${entry.shipmentId}`,
        type: "shipment" as const,
        title: `Envio ${entry.shipmentId}`,
        detail: entry.note,
        createdAt: entry.updatedAt,
        href: "/shipments"
      }))
    ];

    return [...orderActivities, ...inventoryActivities, ...shipmentActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [store.inventoryAdjustments, store.manualShipments, store.orderDecisions, store.shipmentUpdates]);

  function validateOrder(order: Order, decision: OrderDecisionType, note?: string) {
    const updatedAt = new Date().toISOString();
    const next: OperationalStore = {
      ...store,
      orderDecisions: {
        ...store.orderDecisions,
        [order.id]: {
          orderId: order.id,
          decision,
          note:
            note?.trim() ||
            (decision === "approved"
              ? `Pedido aprobado por operaciones para ${order.customer}.`
              : decision === "rejected"
                ? `Pedido rechazado por revision operativa para ${order.customer}.`
                : `Pedido enviado a reproceso para nueva validacion.`),
          updatedAt
        }
      }
    };
    commit(next);
  }

  function adjustInventory(product: Product, delta: number, reason?: string) {
    const entry: StoredInventoryAdjustment = {
      id: buildId("adj"),
      sku: product.sku,
      delta,
      reason: reason?.trim() || `Ajuste manual de ${delta > 0 ? "reposicion" : "reserva"}.`,
      updatedAt: new Date().toISOString()
    };
    commit({ ...store, inventoryAdjustments: [entry, ...store.inventoryAdjustments] });
  }

  function createDispatch(order: Order, carrier: string, note?: string) {
    const createdAt = new Date().toISOString();
    const shipment: StoredManualShipment = {
      id: buildId("shp"),
      orderId: order.id,
      customerId: order.customer,
      sku: order.sku,
      quantity: order.quantity,
      carrier: carrier.trim() || "Transportista local",
      tracking: createTracking(order.id),
      stage: "picked_up",
      eta: null,
      createdAt,
      shippedAt: createdAt,
      note: note?.trim() || `Despacho generado manualmente para el pedido ${order.id}.`
    };
    commit({ ...store, manualShipments: [shipment, ...store.manualShipments] });
  }

  function updateShipmentStage(shipment: Shipment, stage: ShipmentStage, note?: string) {
    const next: OperationalStore = {
      ...store,
      shipmentUpdates: {
        ...store.shipmentUpdates,
        [shipment.id]: {
          shipmentId: shipment.id,
          stage,
          note:
            note?.trim() ||
            (stage === "out_for_delivery"
              ? `Envio ${shipment.id} marcado en reparto.`
              : stage === "delivered"
                ? `Envio ${shipment.id} entregado al cliente.`
                : `Envio ${shipment.id} requiere seguimiento por retraso.`),
          updatedAt: new Date().toISOString()
        }
      }
    };
    commit(next);
  }

  return {
    operationalOrders,
    operationalInventory,
    operationalShipments: mergedShipments,
    validationQueue,
    dispatchQueue,
    stockQueue,
    activities,
    validateOrder,
    adjustInventory,
    createDispatch,
    updateShipmentStage
  };
}
