import { useSyncExternalStore } from "react";
import type { OrderPlaced } from "./notifications";

/**
 * The backend stream is live-only (no replay), so received orders and the owner's
 * progress on them are kept in this browser to survive a refresh.
 * Status is local to this screen; the backend has no endpoint for it.
 */
export type Stage = "rail" | "bench" | "spike";

export type Ticket = OrderPlaced & {
  receivedAt: number;
  stage: Stage;
  picked: string[];
  handedAt?: number;
};

type State = { tickets: readonly Ticket[]; bell: boolean };

const STORAGE_KEY = "kiosk-6379.backoffice.v1";
const MAX_TICKETS = 200;
const EMPTY: State = { tickets: [], bell: false };

let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
      bell: parsed.bell === true,
    };
  } catch {
    return EMPTY;
  }
}

function current(): State {
  state ??= load();
  return state;
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked; the board keeps working in memory.
  }
  listeners.forEach((listener) => listener());
}

const update = (id: string, change: (ticket: Ticket) => Ticket) => {
  const s = current();
  commit({
    ...s,
    tickets: s.tickets.map((t) => (t.orderId === id ? change(t) : t)),
  });
};

export const orders = {
  /** Returns false when the order was already on the board. */
  receive(order: OrderPlaced): boolean {
    const s = current();
    if (s.tickets.some((t) => t.orderId === order.orderId)) return false;
    const ticket: Ticket = { ...order, receivedAt: Date.now(), stage: "rail", picked: [] };
    commit({ ...s, tickets: [...s.tickets, ticket].slice(-MAX_TICKETS) });
    return true;
  },
  toBench: (id: string) => update(id, (t) => ({ ...t, stage: "bench" })),
  toRail: (id: string) => update(id, (t) => ({ ...t, stage: "rail", picked: [] })),
  handOver: (id: string) =>
    update(id, (t) => ({ ...t, stage: "spike", handedAt: Date.now() })),
  reopen: (id: string) =>
    update(id, (t) => ({ ...t, stage: "bench", handedAt: undefined })),
  togglePicked: (id: string, name: string) =>
    update(id, (t) => ({
      ...t,
      picked: t.picked.includes(name)
        ? t.picked.filter((n) => n !== name)
        : [...t.picked, name],
    })),
  clearSpike: () => {
    const s = current();
    commit({ ...s, tickets: s.tickets.filter((t) => t.stage !== "spike") });
  },
  setBell: (bell: boolean) => commit({ ...current(), bell }),
  bellOn: () => current().bell,
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export function useBoard(): State {
  return useSyncExternalStore(subscribe, current, () => EMPTY);
}
