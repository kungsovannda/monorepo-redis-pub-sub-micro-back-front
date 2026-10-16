"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
} from "react";
import { MAX_QTY, summarize, type CartAction, type CartLine } from "./cart";
import { Stepper } from "./catalogue";
import { buildOrderPayload, OrderError, submitOrder } from "./order";
import { formatPrice } from "./products";

const PREVIEW_LINES = 5;

type Ticket = { name: string; qty: number; nonce: number } | null;

/* ------------------------------------------------------------------ */
/* The printer: always-present receipt that grows as things are added. */
/* ------------------------------------------------------------------ */

export function Printer({
  lines,
  ticket,
  onOpen,
}: {
  lines: readonly CartLine[];
  ticket: Ticket;
  onOpen: () => void;
}) {
  const { itemCount, totalCents } = summarize(lines);
  const hidden = Math.max(0, lines.length - PREVIEW_LINES);
  const visible = lines.slice(hidden);

  return (
    <aside className="k-printer" aria-label="Receipt">
      <div className="k-slot">
        <span
          className="k-led"
          key={ticket?.nonce ?? "idle"}
          data-blink={ticket ? true : undefined}
          aria-hidden="true"
        />
        <span className="k-slot-label">Receipt printer</span>
        <span className="k-slot-count">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="k-paper">
        <div className="k-paper-body">
          {lines.length === 0 ? (
            <p className="k-paper-empty">
              Nothing printed yet.
              <br />
              Add an object and watch the paper move.
            </p>
          ) : (
            <>
              {hidden > 0 && (
                <p className="k-paper-more">
                  ⋮ {hidden} earlier {hidden === 1 ? "line" : "lines"}
                </p>
              )}
              <ul className="k-paper-lines">
                {visible.map((line) => (
                  <li key={`${line.product.id}-${line.qty}`}>
                    <span>
                      {line.qty} × {line.product.name}
                    </span>
                    <span>{formatPrice(line.amountCents)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="k-paper-total">
            <span>Total</span>
            <span>{formatPrice(totalCents)}</span>
          </p>
        </div>
        <button
          type="button"
          className="k-tear-button"
          onClick={onOpen}
          aria-haspopup="dialog"
        >
          <span className="k-tear-label-wide">Tear off &amp; review</span>
          <span className="k-tear-label-narrow">
            Review · {formatPrice(totalCents)}
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <div className="k-tear" aria-hidden="true" />
      </div>

      {ticket && (
        <p className="k-ticket" key={ticket.nonce} aria-hidden="true">
          + {ticket.qty} × {ticket.name}
        </p>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* The torn-off receipt: review, sign, publish.                        */
/* ------------------------------------------------------------------ */

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string }
  | {
      state: "success";
      customer: string;
      lines: readonly CartLine[];
      at: Date;
    };

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Phnom_Penh",
});

function validateName(raw: string): string | null {
  const name = raw.trim();
  if (name.length === 0) return "Sign with your name so we know whose order it is.";
  if (name.length < 2) return "That signature is a little short — at least 2 characters.";
  if (name.length > 60) return "Keep the signature under 60 characters.";
  return null;
}

export function ReceiptDialog({
  open,
  lines,
  dispatch,
  onClose,
  onPublished,
}: {
  open: boolean;
  lines: readonly CartLine[];
  dispatch: Dispatch<CartAction>;
  onClose: () => void;
  onPublished: (itemCount: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const nameId = useId();
  const errorId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submitting = status.state === "submitting";
  const shown = status.state === "success" ? status.lines : lines;
  const { itemCount, totalCents } = summarize(shown);
  const nameError = touched ? validateName(name) : null;

  const requestClose = () => {
    if (inFlight.current) return;
    onClose();
  };

  const handleClosed = () => {
    if (status.state !== "submitting") setStatus({ state: "idle" });
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || lines.length === 0) return;

    setTouched(true);
    if (validateName(name)) {
      document.getElementById(nameId)?.focus();
      return;
    }

    inFlight.current = true;
    setStatus({ state: "submitting" });
    const snapshot = lines;
    const payload = buildOrderPayload(name, snapshot);
    try {
      await submitOrder(payload);
      setStatus({
        state: "success",
        customer: payload.customer,
        lines: snapshot,
        at: new Date(),
      });
      dispatch({ type: "clear" });
      onPublished(payload.products.length);
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof OrderError
            ? error.message
            : "Something unexpected went wrong.",
      });
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="k-dialog"
      aria-labelledby="receipt-title"
      aria-busy={submitting}
      onClose={handleClosed}
      onCancel={(event) => {
        if (inFlight.current) event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className="k-receipt" data-state={status.state}>
        <header className="k-receipt-head">
          <p className="k-receipt-brand">Kiosk Nº 6379</p>
          <h2 id="receipt-title" className="k-receipt-title">
            {status.state === "success" ? "Order published" : "Your receipt"}
          </h2>
          <p className="k-receipt-meta">
            Objects of daily use · Phnom Penh
            <br />
            Channel <code>order.placed</code>
          </p>
          <button
            type="button"
            className="k-close-button"
            onClick={requestClose}
            disabled={submitting}
            aria-label="Close receipt"
          >
            ×
          </button>
        </header>

        {shown.length === 0 ? (
          <div className="k-receipt-empty">
            <p className="k-receipt-empty-title">The paper is blank.</p>
            <p>Nothing has been printed yet. Pick something from the index and it will appear here, line by line.</p>
            <button type="button" className="k-ghost-button" onClick={requestClose}>
              Back to the index
            </button>
          </div>
        ) : (
          <>
            <ul className="k-receipt-lines" aria-label="Order lines">
              {shown.map((line) => (
                <li key={line.product.id} className="k-receipt-line">
                  <div className="k-receipt-line-text">
                    <span className="k-receipt-line-name">{line.product.name}</span>
                    <span className="k-receipt-line-unit">
                      {formatPrice(line.product.priceCents)} each
                    </span>
                  </div>
                  {status.state === "success" ? (
                    <span className="k-receipt-qty">×{line.qty}</span>
                  ) : (
                    <Stepper
                      compact
                      label={`Quantity of ${line.product.name}`}
                      value={line.qty}
                      min={1}
                      max={MAX_QTY}
                      disabled={submitting}
                      onChange={(qty) =>
                        dispatch({ type: "set", id: line.product.id, qty })
                      }
                    />
                  )}
                  <span className="k-receipt-amount">
                    {formatPrice(line.amountCents)}
                  </span>
                  {status.state !== "success" && (
                    <button
                      type="button"
                      className="k-remove-button"
                      disabled={submitting}
                      onClick={() =>
                        dispatch({ type: "remove", id: line.product.id })
                      }
                      aria-label={`Remove ${line.product.name}`}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <dl className="k-receipt-totals">
              <div>
                <dt>Items</dt>
                <dd>{itemCount}</dd>
              </div>
              <div className="k-receipt-grand">
                <dt>Total</dt>
                <dd>{formatPrice(totalCents)}</dd>
              </div>
            </dl>

            {status.state === "success" ? (
              <div className="k-receipt-done">
                <div className="k-stamp" aria-hidden="true">
                  <span>Published</span>
                  <small>order.placed · {timeFormat.format(status.at)}</small>
                </div>
                <p role="status">
                  Thank you, <em>{status.customer}</em>. Your order of {itemCount}{" "}
                  {itemCount === 1 ? "item" : "items"} was accepted by the order
                  service at {timeFormat.format(status.at)}.
                </p>
                <button type="button" className="k-primary-button" onClick={requestClose}>
                  Start a new receipt
                </button>
              </div>
            ) : (
              <form className="k-sign-form" onSubmit={handleSubmit} noValidate>
                <label htmlFor={nameId} className="k-sign-label">
                  Signed
                </label>
                <input
                  id={nameId}
                  className="k-sign-input"
                  name="customer"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  maxLength={80}
                  disabled={submitting}
                  required
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? errorId : undefined}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => name && setTouched(true)}
                />
                <p className="k-field-error" id={errorId} aria-live="polite">
                  {nameError}
                </p>

                {status.state === "error" && (
                  <div className="k-failure" role="alert">
                    <strong>Not published.</strong> {status.message} Your receipt
                    is kept as it is — try again in a moment.
                  </div>
                )}

                <button
                  type="submit"
                  className="k-primary-button"
                  disabled={submitting}
                  data-busy={submitting || undefined}
                >
                  {submitting ? (
                    <span className="k-publishing">
                      Publishing<span aria-hidden="true">...</span>
                    </span>
                  ) : (
                    <>
                      {status.state === "error" ? "Try again" : "Publish order"}
                      <span className="k-add-amount">{formatPrice(totalCents)}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        <div className="k-barcode" aria-hidden="true" />
        <div className="k-tear" aria-hidden="true" />
      </div>
    </dialog>
  );
}
