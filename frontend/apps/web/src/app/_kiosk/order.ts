import type { CartLine } from "./cart";

/**
 * Mirrors the publisher service's `PlaceOrderRequest(String customer, List<String> products)`.
 * The endpoint is reached through the Spring Cloud Gateway, which routes
 * `/api/v1/orders/**` to the publisher and everything else to this app.
 */
export type OrderPayload = {
  customer: string;
  products: string[];
};

export const ORDER_ENDPOINT = "/api/v1/orders";
const TIMEOUT_MS = 15_000;

/** `products` is a flat list of names, so quantity is expressed by repetition. */
export function buildOrderPayload(
  customer: string,
  lines: readonly CartLine[],
): OrderPayload {
  return {
    customer: customer.trim(),
    products: lines.flatMap((line) =>
      Array.from({ length: line.qty }, () => line.product.name),
    ),
  };
}

export class OrderError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "OrderError";
    this.status = status;
  }
}

export async function submitOrder(payload: OrderPayload): Promise<void> {
  let response: Response;
  try {
    response = await fetch(ORDER_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (reason) {
    const timedOut =
      reason instanceof DOMException && reason.name === "TimeoutError";
    throw new OrderError(
      timedOut
        ? "The order service took too long to answer."
        : "The order service could not be reached.",
    );
  }

  if (!response.ok) {
    throw new OrderError(
      `The order service answered ${response.status}${
        response.statusText ? ` ${response.statusText}` : ""
      }.`,
      response.status,
    );
  }
}
