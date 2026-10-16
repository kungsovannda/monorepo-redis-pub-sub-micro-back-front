"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { primeBell, ringBell } from "./bell";
import { groupProducts, shortRef, type OrderPlaced } from "./notifications";
import { orders, useBoard, type Ticket } from "./orders-store";
import { useOrderStream, type Connection } from "./use-order-stream";
import "./backoffice.css";

/* ---------- time ---------- */

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Phnom_Penh",
});

let now = 0;
const subscribeNow = (tick: () => void) => {
  const update = () => {
    now = Date.now();
    tick();
  };
  update();
  const timer = setInterval(update, 1000);
  return () => clearInterval(timer);
};
const useNow = () => useSyncExternalStore(subscribeNow, () => now, () => 0);

function age(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

const LATE_AFTER_MS = 5 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, "0");
const itemsLabel = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;
const tilt = (id: string) => ((id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % 5) - 2;

/* ---------- board ---------- */

const CONNECTION_COPY: Record<Connection, string> = {
  connecting: "Connecting to order.placed",
  live: "Listening on order.placed",
  reconnecting: "Connection lost — retrying",
  closed: "Disconnected",
};

export function BackOffice() {
  const { tickets, bell } = useBoard();
  const time = useNow();
  const [freshId, setFreshId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const { connection, reconnect } = useOrderStream((order: OrderPlaced) => {
    setFreshId(order.orderId);
    setAnnouncement(
      `New order ${shortRef(order.orderId)} from ${order.customer}, ${itemsLabel(order.products.length)}.`,
    );
    if (orders.bellOn()) ringBell();
  });

  const rail = tickets.filter((t) => t.stage === "rail");
  const bench = tickets.filter((t) => t.stage === "bench");
  const spike = tickets
    .filter((t) => t.stage === "spike")
    .sort((a, b) => (b.handedAt ?? 0) - (a.handedAt ?? 0));
  const toPick = [...rail, ...bench].reduce(
    (sum, t) => sum + t.products.length,
    0,
  );
  const open = rail.length + bench.length;

  useEffect(() => {
    document.title = rail.length
      ? `(${rail.length}) New orders — Back office`
      : "Back office — Kiosk Nº 6379";
  }, [rail.length]);

  // A bell left switched on needs one gesture after a reload before it may sound.
  useEffect(() => {
    if (!bell) return;
    const wake = () => primeBell();
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("keydown", wake, { once: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [bell]);

  const listening = connection === "live";

  return (
    <div className="b-root">
      <header className="b-strip">
        <span className="b-brand">
          Kiosk Nº 6379 <span className="b-brand-sub">/ Back office</span>
        </span>
        <span className="b-clock">
          Phnom Penh{" "}
          <time suppressHydrationWarning>
            {time ? clockFormat.format(time) : "--:--:--"}
          </time>
        </span>
        <span className="b-conn" data-state={connection} role="status">
          <span className="b-conn-dot" aria-hidden="true" />
          {CONNECTION_COPY[connection]}
          {connection === "closed" && (
            <button type="button" className="b-text-button" onClick={reconnect}>
              Reconnect
            </button>
          )}
        </span>
      </header>

      {(connection === "reconnecting" || connection === "closed") && (
        <p className="b-alert" role="alert">
          The order stream is down. It does not replay, so orders placed until
          it returns will not print here.
        </p>
      )}

      <main className="b-main">
        <section className="b-hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="b-hero-title">
            <span className="b-hero-count">{pad(open)}</span>
            <span className="b-hero-words">
              open {open === 1 ? "order" : "orders"}
              <br />
              <em>waiting on you.</em>
            </span>
          </h1>
          <div className="b-hero-side">
            <dl className="b-stats">
              <div>
                <dt>On the rail</dt>
                <dd>{pad(rail.length)}</dd>
              </div>
              <div>
                <dt>On the bench</dt>
                <dd>{pad(bench.length)}</dd>
              </div>
              <div>
                <dt>Items to pick</dt>
                <dd>{pad(toPick)}</dd>
              </div>
              <div>
                <dt>Handed over</dt>
                <dd>{pad(spike.length)}</dd>
              </div>
            </dl>
            <div className="b-controls">
              <button
                type="button"
                className="b-toggle"
                aria-pressed={bell}
                onClick={() => {
                  if (!bell) primeBell();
                  orders.setBell(!bell);
                }}
              >
                <span className="b-toggle-lamp" aria-hidden="true" /> Counter bell{" "}
                {bell ? "on" : "off"}
              </button>
              <a className="b-text-button" href="/">
                Open the kiosk ↗
              </a>
            </div>
          </div>
        </section>

        {/* §1 Rail */}
        <section className="b-section" aria-labelledby="rail-title">
          <SectionHead
            id="rail-title"
            number="§1"
            title="The rail"
            note="New tickets print here, oldest on the left."
          />
          <div className="b-rail">
            <div className="b-rail-bar" aria-hidden="true" />
            {rail.length === 0 ? (
              <div className="b-rail-empty">
                {listening ? (
                  <>
                    <p className="b-empty-title">The rail is empty.</p>
                    <p>A ticket prints here the moment someone publishes an order at the kiosk.</p>
                  </>
                ) : connection === "connecting" ? (
                  <>
                    <p className="b-empty-title">Warming up the printer…</p>
                    <p>Opening the order stream. The first handshake can take up to fifteen seconds.</p>
                  </>
                ) : (
                  <>
                    <p className="b-empty-title">Not listening.</p>
                    <p>Orders placed while the stream is down are not replayed.</p>
                  </>
                )}
              </div>
            ) : (
              <ol className="b-rail-tickets">
                {rail.map((ticket) => (
                  <RailTicket
                    key={ticket.orderId}
                    ticket={ticket}
                    now={time}
                    fresh={ticket.orderId === freshId}
                  />
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* §2 Bench */}
        <section className="b-section" aria-labelledby="bench-title">
          <SectionHead
            id="bench-title"
            number="§2"
            title="The bench"
            note="Tick each object as it goes into the bag."
          />
          {bench.length === 0 ? (
            <p className="b-quiet">
              Nothing on the bench. Take a ticket off the rail to start picking.
            </p>
          ) : (
            <ol className="b-bench">
              {bench.map((ticket) => (
                <BenchTicket key={ticket.orderId} ticket={ticket} now={time} />
              ))}
            </ol>
          )}
        </section>

        {/* §3 Spike */}
        <section className="b-section" aria-labelledby="spike-title">
          <SectionHead
            id="spike-title"
            number="§3"
            title="The spike"
            note="Handed over. Kept on this screen only."
            action={
              spike.length > 0 && (
                <button
                  type="button"
                  className="b-text-button"
                  onClick={() => {
                    if (window.confirm(`Clear ${spike.length} handed-over orders from this screen?`)) {
                      orders.clearSpike();
                    }
                  }}
                >
                  Clear the spike
                </button>
              )
            }
          />
          {spike.length === 0 ? (
            <p className="b-quiet">No orders handed over yet.</p>
          ) : (
            <table className="b-ledger">
              <thead>
                <tr>
                  <th scope="col">Handed</th>
                  <th scope="col">Nº</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Items</th>
                  <th scope="col">
                    <span className="b-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {spike.map((t) => (
                  <tr key={t.orderId}>
                    <td>{clockFormat.format(t.handedAt ?? t.receivedAt)}</td>
                    <td>{shortRef(t.orderId)}</td>
                    <td className="b-ledger-name">{t.customer}</td>
                    <td>{t.products.length}</td>
                    <td>
                      <button
                        type="button"
                        className="b-text-button"
                        onClick={() => orders.reopen(t.orderId)}
                        aria-label={`Reopen order ${shortRef(t.orderId)}`}
                      >
                        Reopen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="b-colophon">
          <p>
            Tickets arrive over server-sent events from{" "}
            <code>/api/v1/notifications/stream</code>, fed by Redis pub/sub.
          </p>
          <p>Picking progress and hand-overs are stored in this browser.</p>
        </footer>
      </main>

      <p className="b-sr" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

function SectionHead({
  id,
  number,
  title,
  note,
  action,
}: {
  id: string;
  number: string;
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="b-section-head">
      <h2 id={id} className="b-section-label">
        <span>{number}</span> {title}
      </h2>
      <p className="b-section-note">{note}</p>
      {action}
    </div>
  );
}

function TicketHead({ ticket, now }: { ticket: Ticket; now: number }) {
  const waited = now ? now - ticket.receivedAt : 0;
  return (
    <header className="b-ticket-head">
      <p className="b-ticket-ref">
        <span className="b-sr">Order </span>Nº {shortRef(ticket.orderId)}
      </p>
      <p className="b-ticket-time" data-late={waited > LATE_AFTER_MS || undefined}>
        {clockFormat.format(ticket.receivedAt)}
        {now ? ` · ${age(waited)}` : ""}
      </p>
      <p className="b-ticket-customer">{ticket.customer}</p>
    </header>
  );
}

function RailTicket({
  ticket,
  now,
  fresh,
}: {
  ticket: Ticket;
  now: number;
  fresh: boolean;
}) {
  const lines = groupProducts(ticket.products);
  return (
    <li
      className="b-ticket"
      data-fresh={fresh || undefined}
      style={{ "--tilt": `${tilt(ticket.orderId) * 0.7}deg` } as CSSProperties}
    >
      <span className="b-clip" aria-hidden="true" />
      <TicketHead ticket={ticket} now={now} />
      <ul className="b-ticket-lines">
        {lines.map((line) => (
          <li key={line.name}>
            <span className="b-count">{line.count}×</span> {line.name}
          </li>
        ))}
      </ul>
      <p className="b-ticket-total">{itemsLabel(ticket.products.length)}</p>
      <button
        type="button"
        className="b-primary"
        onClick={() => orders.toBench(ticket.orderId)}
      >
        Take to bench <span aria-hidden="true">↓</span>
      </button>
      <span className="b-tear" aria-hidden="true" />
    </li>
  );
}

function BenchTicket({ ticket, now }: { ticket: Ticket; now: number }) {
  const lines = groupProducts(ticket.products);
  const pickedUnits = lines
    .filter((l) => ticket.picked.includes(l.name))
    .reduce((sum, l) => sum + l.count, 0);
  const total = ticket.products.length;
  const done = pickedUnits === total;

  return (
    <li className="b-bench-ticket" data-done={done || undefined}>
      <TicketHead ticket={ticket} now={now} />
      <fieldset className="b-picklist">
        <legend className="b-sr">Pick list for order {shortRef(ticket.orderId)}</legend>
        {lines.map((line) => {
          const checked = ticket.picked.includes(line.name);
          return (
            <label key={line.name} className="b-pick" data-checked={checked || undefined}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => orders.togglePicked(ticket.orderId, line.name)}
              />
              <span className="b-box" aria-hidden="true" />
              <span className="b-count">{line.count}×</span>
              <span className="b-pick-name">{line.name}</span>
            </label>
          );
        })}
      </fieldset>
      <div className="b-progress" aria-hidden="true">
        <span style={{ width: `${(pickedUnits / Math.max(total, 1)) * 100}%` }} />
      </div>
      <p className="b-progress-label">
        {pickedUnits} of {itemsLabel(total)} picked
      </p>
      <div className="b-bench-actions">
        <button
          type="button"
          className="b-primary"
          disabled={!done}
          onClick={() => orders.handOver(ticket.orderId)}
        >
          {done ? "Hand over" : "Pick everything first"}
        </button>
        <button
          type="button"
          className="b-text-button"
          onClick={() => orders.toRail(ticket.orderId)}
        >
          Back to rail
        </button>
      </div>
    </li>
  );
}
