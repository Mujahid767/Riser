export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED";

export type PaymentMethod = "COD" | "BKASH" | "NAGAD";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export type OrderTrackingEventName = "CODOrderPlaced" | "QualifiedOrder" | "Purchase";
export type OrderTrackingEventStatus = "PENDING" | "SENT" | "FAILED";

export type OrderTrackingEvent = {
  id: string;
  orderId: string;
  orderNumber: string;
  eventName: OrderTrackingEventName;
  eventId: string;
  status: OrderTrackingEventStatus;
  attempts: number;
  lastError?: string;
  lastAttemptAt?: string;
  sentAt?: string;
  createdAt: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  imageUrl: string;
  size: string;
  color: string;
  qty: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  district: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  /** Internal note, written by staff */
  note?: string;
  /** Instructions the customer typed at checkout */
  customerNote?: string;
  trackingNumber?: string;
  /** Steadfast consignment — set once the admin presses "Send to Steadfast" */
  courier?: {
    provider: string;
    consignmentId: string;
    trackingCode: string;
    status: string;
    sentAt: string;
  };
  /** Client-generated key — a retried/double-clicked submit returns the same order */
  idempotencyKey?: string;
  /** Automatic review flags, e.g. "repeat_phone_24h" */
  flags?: string[];
  /** Server-side Meta CAPI delivery log persisted in Neon */
  trackingEvents?: OrderTrackingEvent[];
  createdAt: string;
  updatedAt: string;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-blue-500/15 text-blue-400",
  PROCESSING: "bg-purple-500/15 text-purple-400",
  PACKED: "bg-indigo-500/15 text-indigo-400",
  SHIPPED: "bg-cyan-500/15 text-cyan-400",
  DELIVERED: "bg-emerald-500/15 text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  RETURN_REQUESTED: "bg-orange-500/15 text-orange-400",
  RETURNED: "bg-rose-500/15 text-rose-400",
};
