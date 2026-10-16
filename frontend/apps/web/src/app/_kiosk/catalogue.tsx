"use client";

import { useRef, useState, type PointerEvent } from "react";
import { MAX_QTY } from "./cart";
import { Drawing } from "./illustrations";
import { formatPrice, type Product } from "./products";

type Props = {
  products: readonly Product[];
  qtyById: ReadonlyMap<string, number>;
  onAdd: (id: string, qty: number) => void;
};

const PLATE_W = 260;
const PLATE_H = 300;

export function Catalogue({ products, qtyById, onAdd }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  const movePlate = (event: PointerEvent) => {
    const plate = plateRef.current;
    if (!plate || event.pointerType !== "mouse") return;
    const flip = event.clientX + PLATE_W + 48 > window.innerWidth;
    const x = flip ? event.clientX - PLATE_W - 32 : event.clientX + 32;
    const y = Math.min(
      Math.max(event.clientY - PLATE_H / 2, 16),
      window.innerHeight - PLATE_H - 16,
    );
    plate.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const hovered = products.find((p) => p.id === hoverId && p.id !== openId);

  return (
    <section className="k-index" aria-labelledby="index-title">
      <div className="k-index-head">
        <h2 id="index-title" className="k-section-label">
          <span>§1</span> The index
        </h2>
        <p className="k-index-hint">
          Open a line to read the specimen. <kbd>+</kbd> drops it straight on
          the receipt.
        </p>
      </div>

      <div className="k-columns" aria-hidden="true">
        <span>Nº</span>
        <span>Object</span>
        <span>Kind</span>
        <span>Price</span>
      </div>

      <ol
        className="k-rows"
        onPointerMove={movePlate}
        onPointerLeave={() => setHoverId(null)}
      >
        {products.map((product, index) => {
          const open = product.id === openId;
          const inCart = qtyById.get(product.id) ?? 0;
          const number = String(index + 1).padStart(2, "0");
          const panelId = `specimen-${product.id}`;
          return (
            <li
              key={product.id}
              className="k-row"
              data-open={open || undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setHoverId(product.id);
              }}
            >
              <div className="k-row-line">
                <button
                  type="button"
                  className="k-row-main"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : product.id)}
                >
                  <span className="k-row-num">{number}</span>
                  <span className="k-row-name">
                    {product.name}
                    {inCart > 0 && (
                      <span className="k-row-count">
                        <span className="k-sr-only">, on receipt: </span>×
                        {inCart}
                      </span>
                    )}
                  </span>
                  <span className="k-row-kind">{product.kind}</span>
                  <span className="k-row-price">
                    {formatPrice(product.priceCents)}
                  </span>
                </button>
                <button
                  type="button"
                  className="k-quick-add"
                  onClick={() => onAdd(product.id, 1)}
                  disabled={inCart >= MAX_QTY}
                  aria-label={`Add one ${product.name} to the receipt`}
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>

              <div className="k-panel" id={panelId} inert={!open}>
                <div className="k-panel-inner">
                  <Specimen
                    product={product}
                    number={number}
                    inCart={inCart}
                    onAdd={onAdd}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div
        ref={plateRef}
        className="k-plate"
        data-visible={hovered ? true : undefined}
        aria-hidden="true"
      >
        {hovered && (
          <>
            <Drawing art={hovered.art} className="k-plate-art" />
            <span className="k-plate-caption">
              Fig. {String(products.indexOf(hovered) + 1).padStart(2, "0")} —{" "}
              {hovered.blurb}
            </span>
          </>
        )}
      </div>
    </section>
  );
}

function Specimen({
  product,
  number,
  inCart,
  onAdd,
}: {
  product: Product;
  number: string;
  inCart: number;
  onAdd: (id: string, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const room = MAX_QTY - inCart;
  const effective = Math.min(qty, Math.max(room, 1));

  return (
    <div className="k-specimen">
      <figure className="k-figure">
        <Drawing art={product.art} className="k-figure-art" />
        <figcaption>
          Fig. {number} · {product.name}
        </figcaption>
      </figure>

      <div className="k-specimen-text">
        <p className="k-blurb">{product.blurb}</p>
        <p className="k-description">{product.description}</p>
        <dl className="k-details">
          {product.details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="k-buy">
          <Stepper
            label={`Quantity of ${product.name} to add`}
            value={effective}
            min={1}
            max={Math.max(room, 1)}
            onChange={setQty}
          />
          <button
            type="button"
            className="k-add-button"
            disabled={room <= 0}
            onClick={() => {
              onAdd(product.id, effective);
              setQty(1);
            }}
          >
            {room <= 0 ? (
              "Limit reached"
            ) : (
              <>
                Add to receipt
                <span className="k-add-amount">
                  {formatPrice(product.priceCents * effective)}
                </span>
              </>
            )}
          </button>
        </div>
        {inCart > 0 && (
          <p className="k-already-note">
            Already on your receipt ×{inCart}. Adjust it when you review.
          </p>
        )}
      </div>
    </div>
  );
}

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
  compact,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className="k-stepper"
      data-compact={compact || undefined}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease"
      >
        <span aria-hidden="true">−</span>
      </button>
      <output aria-live="polite" aria-atomic="true">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
