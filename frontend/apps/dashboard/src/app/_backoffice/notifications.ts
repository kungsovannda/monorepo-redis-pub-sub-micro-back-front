/**
 * Mirrors the subscriber service's `NotificationResponse(String id, NotificationType type, Map details)`.
 * For ORDER_PLACED, `details` carries `orderId`, `customer` and `products` (a flat list of names).
 * The stream is reached through the gateway, which routes `/api/v1/notifications/**` to the subscriber.
 */
export const STREAM_ENDPOINT = "/api/v1/notifications/stream";

export type OrderPlaced = {
  notificationId: string;
  orderId: string;
  customer: string;
  products: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Returns null for anything that is not a well-formed ORDER_PLACED notification. */
export function parseOrderPlaced(raw: string): OrderPlaced | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.type !== "ORDER_PLACED" || !isRecord(data.details)) {
    return null;
  }
  const { orderId, customer, products } = data.details;
  if (typeof orderId !== "string" || !Array.isArray(products)) return null;
  return {
    notificationId: typeof data.id === "string" ? data.id : orderId,
    orderId,
    customer: typeof customer === "string" && customer.trim() ? customer.trim() : "Unsigned",
    products: products.filter((p): p is string => typeof p === "string"),
  };
}

/** The stream sends one entry per unit, so repeated names are folded into counts for display. */
export function groupProducts(products: readonly string[]) {
  const counts = new Map<string, number>();
  for (const name of products) counts.set(name, (counts.get(name) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}

export const shortRef = (orderId: string) =>
  orderId.replace(/-/g, "").slice(0, 6).toUpperCase();
