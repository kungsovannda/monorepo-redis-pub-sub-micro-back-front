import { PRODUCTS_BY_ID, type Product } from "./products";

export const MAX_QTY = 20;

/** Cart entries keep the order in which products were first added. */
export type CartEntry = { id: string; qty: number };
export type Cart = readonly CartEntry[];

export type CartAction =
  | { type: "add"; id: string; qty: number }
  | { type: "set"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

const clampQty = (qty: number) =>
  Math.min(MAX_QTY, Math.max(0, Math.floor(qty)));

export function cartReducer(cart: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "add": {
      if (!PRODUCTS_BY_ID.has(action.id)) return cart;
      const existing = cart.find((entry) => entry.id === action.id);
      if (!existing) {
        const qty = clampQty(action.qty);
        return qty > 0 ? [...cart, { id: action.id, qty }] : cart;
      }
      return cartReducer(cart, {
        type: "set",
        id: action.id,
        qty: existing.qty + action.qty,
      });
    }
    case "set": {
      const qty = clampQty(action.qty);
      if (qty === 0) return cartReducer(cart, { type: "remove", id: action.id });
      return cart.map((entry) =>
        entry.id === action.id ? { ...entry, qty } : entry,
      );
    }
    case "remove":
      return cart.filter((entry) => entry.id !== action.id);
    case "clear":
      return [];
  }
}

export type CartLine = { product: Product; qty: number; amountCents: number };

export function toLines(cart: Cart): CartLine[] {
  return cart.flatMap(({ id, qty }) => {
    const product = PRODUCTS_BY_ID.get(id);
    return product
      ? [{ product, qty, amountCents: product.priceCents * qty }]
      : [];
  });
}

export function summarize(lines: readonly CartLine[]) {
  return lines.reduce(
    (sum, line) => ({
      itemCount: sum.itemCount + line.qty,
      totalCents: sum.totalCents + line.amountCents,
    }),
    { itemCount: 0, totalCents: 0 },
  );
}
