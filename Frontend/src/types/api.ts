export interface ApiErrorResponse {
  error: string;
}

export interface ApiLoginRequest {
  username: string;
  password: string;
}

export interface ApiOrder {
  id: number;
  customerId: number;
  sku: number;
  quantity: number;
  status: string;
  createdAt: string | null;
}

export interface ApiCreateOrderRequest {
  customerId: number;
  sku: number;
  quantity: number;
}

export interface ApiCreateOrderResponse {
  orderId: number;
  status: string;
  message: string;
  createdAt?: string | null;
}

export interface ApiInventory {
  id: number;
  sku: number;
  stock: number;
}

export interface ApiShipment {
  id: number;
  orderId: number;
  customerId: number;
  sku: number;
  quantity: number;
  status: string;
  trackingNumber: string | null;
  createdAt: string | null;
  shippedAt: string | null;
}

export interface ApiNotificationRecord {
  id: number;
  eventId: string;
  orderId: number;
  customerId: number;
  stage: string;
  status: string;
  message: string;
  targetAudience: string;
  sourceService: string;
  occurredAt: string;
  receivedAt: string;
}
