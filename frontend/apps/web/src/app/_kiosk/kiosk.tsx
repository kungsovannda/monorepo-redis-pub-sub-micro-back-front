"use client";

import { useMemo, useReducer, useState, useSyncExternalStore } from "react";
import { cartReducer, summarize, toLines } from "./cart";
import { Catalogue } from "./catalogue";
import { formatPrice, PRODUCTS, PRODUCTS_BY_ID } from "./products";
import { Printer, ReceiptDialog } from "./receipt";
import "./kiosk.css";

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Phnom_Penh",
});

let clockNow = "";

const subscribeClock = (tick: () => void) => {
  const update = () => {
    clockNow = clockFormat.format(Date.now());
    tick();
  };
  update();
  const timer = setInterval(update, 1000);
  return () => clearInterval(timer);
};

function useClock() {
  return useSyncExternalStore(
    subscribeClock,
    () => clockNow || null,
    () => null,
  );
}

export function Kiosk() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [ticket, setTicket] = useState<{
    name: string;
    qty: number;
    nonce: number;
  } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const time = useClock();

  const lines = useMemo(() => toLines(cart), [cart]);
  const qtyById = useMemo(
    () => new Map(cart.map((entry) => [entry.id, entry.qty])),
    [cart],
  );

  const handleAdd = (id: string, qty: number) => {
    const product = PRODUCTS_BY_ID.get(id);
    if (!product) return;
    const next = cartReducer(cart, { type: "add", id, qty });
    dispatch({ type: "add", id, qty });
    setTicket({ name: product.name, qty, nonce: Date.now() });
    const { itemCount, totalCents } = summarize(toLines(next));
    setAnnouncement(
      `Added ${qty} ${product.name}. Receipt: ${itemCount} ${
        itemCount === 1 ? "item" : "items"
      }, ${formatPrice(totalCents)}.`,
    );
  };

  return (
    <div className="k-root">
      <header className="k-strip">
        <span className="k-brand">Kiosk Nº 6379</span>
        <span className="k-strip-mid">
          Phnom Penh{" "}
          <time className="k-clock" suppressHydrationWarning>
            {time ?? "--:--:--"}
          </time>
        </span>
        <span className="k-strip-end">
          <span className="k-open-dot" aria-hidden="true" /> Open — orders
          published live
        </span>
      </header>

      <main className="k-main">
        <section className="k-intro" aria-labelledby="intro-title">
          <p className="k-eyebrow">Catalogue Nº 01 — Objects of daily use</p>
          <h1 id="intro-title" className="k-headline">
            <span className="k-headline-a">Small objects,</span>
            <span className="k-headline-b">
              published on demand<span className="k-dot">.</span>
            </span>
          </h1>
          <div className="k-intro-cols">
            <dl className="k-facts">
              <div>
                <dt>Objects</dt>
                <dd>{String(PRODUCTS.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>USD</dd>
              </div>
              <div>
                <dt>Channel</dt>
                <dd>order.placed</dd>
              </div>
            </dl>
            <p className="k-lede">
              Eight ordinary things, chosen with unreasonable care. Pick what
              you need and the receipt prints as you go. Sign it, and your
              order is published — straight onto the wire, to whoever is
              listening.
            </p>
          </div>
        </section>

        <Catalogue products={PRODUCTS} qtyById={qtyById} onAdd={handleAdd} />

        <section className="k-method" aria-labelledby="method-title">
          <h2 id="method-title" className="k-section-label">
            <span>§2</span> How the kiosk works
          </h2>
          <ol className="k-steps">
            <li>
              <span className="k-step-num">i.</span>
              <strong>Choose.</strong> Open any line in the index for the full
              specimen, or tap <kbd>+</kbd> to add one at once.
            </li>
            <li>
              <span className="k-step-num">ii.</span>
              <strong>Print.</strong> Every object you add prints onto the
              receipt. Tear it off to change quantities or strike lines out.
            </li>
            <li>
              <span className="k-step-num">iii.</span>
              <strong>Publish.</strong> Sign with your name. The order is
              published once — the button locks until the service answers.
            </li>
          </ol>
        </section>

        <footer className="k-colophon">
          <p>
            Kiosk Nº 6379 is named after the port it listens on. Set in
            Bricolage Grotesque, Instrument Serif and JetBrains Mono.
          </p>
          <p>Drawings made for this catalogue. Prices include tax.</p>
        </footer>
      </main>

      <Printer
        lines={lines}
        ticket={ticket}
        onOpen={() => setReceiptOpen(true)}
      />

      <ReceiptDialog
        open={receiptOpen}
        lines={lines}
        dispatch={dispatch}
        onClose={() => setReceiptOpen(false)}
        onPublished={(count) => {
          setTicket(null);
          setAnnouncement(`Order of ${count} items published.`);
        }}
      />

      <p className="k-sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
