"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { parseOrderPlaced, STREAM_ENDPOINT, type OrderPlaced } from "./notifications";
import { orders } from "./orders-store";

/**
 * connecting   — first handshake (the gateway only flushes headers on the first
 *                event or the 15 s heartbeat, so this can last a little while)
 * live         — stream open
 * reconnecting — dropped; EventSource is retrying on its own
 * closed       — the browser gave up; the owner can retry by hand
 */
export type Connection = "connecting" | "live" | "reconnecting" | "closed";

export function useOrderStream(onArrival: (order: OrderPlaced) => void) {
  const [connection, setConnection] = useState<Connection>("connecting");
  const [attempt, setAttempt] = useState(0);
  const arrive = useEffectEvent(onArrival);

  useEffect(() => {
    const source = new EventSource(STREAM_ENDPOINT);

    source.onopen = () => setConnection("live");
    source.onmessage = (event: MessageEvent<string>) => {
      setConnection("live");
      const order = parseOrderPlaced(event.data);
      if (order && orders.receive(order)) arrive(order);
    };
    source.onerror = () => {
      setConnection(
        source.readyState === EventSource.CLOSED ? "closed" : "reconnecting",
      );
    };

    return () => source.close();
  }, [attempt]);

  const reconnect = () => {
    setConnection("connecting");
    setAttempt((n) => n + 1);
  };

  return { connection, reconnect };
}
