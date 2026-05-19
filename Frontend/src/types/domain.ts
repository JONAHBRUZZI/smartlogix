export type Role = "owner" | "ops" | "warehouse" | "support" | "customer" | "shipper";

export type HealthState = "healthy" | "warning" | "critical" | "offline";
export type OrderStage = "new" | "confirmed" | "picking" | "packed" | "in_transit" | "delivered" | "incident";
export type ShipmentStage = "label_created" | "picked_up" | "hub" | "out_for_delivery" | "delivered" | "delayed";

export interface Product {
  id: string;
  sku: string;
  name: string;
  stock: number;
  status: HealthState;
  coverageDays: number;
  updatedAt: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  state: HealthState | "done";
}

export interface Order {
  id: string;
  customer: string;
  source: string;
  stage: OrderStage;
  sku: string;
  quantity: number;
  createdAt: string;
  eta: string | null;
  items: OrderItem[];
  timeline: TimelineEvent[];
}

export interface Shipment {
  id: string;
  orderId: string;
  customerId: string;
  sku: string;
  quantity: number;
  carrier: string;
  tracking: string;
  stage: ShipmentStage;
  eta: string | null;
  createdAt: string;
  shippedAt: string | null;
  exception?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  type: "stock" | "order" | "shipment" | "notification";
  severity: "critical" | "high" | "medium";
  createdAt: string;
  actionLabel: string;
}