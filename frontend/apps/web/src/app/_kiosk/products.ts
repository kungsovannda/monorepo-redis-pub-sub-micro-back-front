export type Art =
  | "can"
  | "book"
  | "notebook"
  | "mug"
  | "tin"
  | "krama"
  | "tote"
  | "matches";

export type Product = {
  /** Stable identifier used for cart state and React keys. */
  id: string;
  /** Sent verbatim in the order payload's `products` list. */
  name: string;
  kind: string;
  priceCents: number;
  blurb: string;
  description: string;
  details: ReadonlyArray<readonly [label: string, value: string]>;
  art: Art;
};

export const PRODUCTS: readonly Product[] = [
  {
    id: "cola-can",
    name: "Cola Can",
    kind: "Drink",
    priceCents: 125,
    blurb: "330 ml, kept cold",
    description:
      "A plain aluminium can of cola, kept at four degrees in the kiosk fridge. Sharp, sweet, and gone in eleven minutes on a hot afternoon.",
    details: [
      ["Volume", "330 ml"],
      ["Served", "4 °C"],
      ["Material", "Aluminium, recyclable"],
    ],
    art: "can",
  },
  {
    id: "paperback",
    name: "Paperback Book",
    kind: "Reading",
    priceCents: 1400,
    blurb: "212 pages, sewn spine",
    description:
      "A pocket-sized novel printed on cream stock with a sewn spine that lies flat. The title changes monthly; this month it is a slow story about a night ferry.",
    details: [
      ["Pages", "212"],
      ["Size", "110 × 178 mm"],
      ["Binding", "Sewn softcover"],
    ],
    art: "book",
  },
  {
    id: "graph-notebook",
    name: "Graph Notebook",
    kind: "Stationery",
    priceCents: 650,
    blurb: "A5, 5 mm grid",
    description:
      "Ninety-six sheets of 5 mm grid on 90 gsm paper that takes a fountain pen without bleeding. A red elastic keeps it shut inside a bag.",
    details: [
      ["Format", "A5"],
      ["Paper", "96 sheets, 90 gsm"],
      ["Ruling", "5 mm grid"],
    ],
    art: "notebook",
  },
  {
    id: "enamel-mug",
    name: "Enamel Mug",
    kind: "Kitchen",
    priceCents: 1100,
    blurb: "350 ml, red rim",
    description:
      "Steel coated in white enamel with a hand-painted red rim. Survives camp stoves, office sinks and the occasional drop on tile.",
    details: [
      ["Capacity", "350 ml"],
      ["Body", "Enamelled steel"],
      ["Care", "Hand wash"],
    ],
    art: "mug",
  },
  {
    id: "kampot-pepper",
    name: "Kampot Pepper",
    kind: "Pantry",
    priceCents: 850,
    blurb: "Whole black, 50 g tin",
    description:
      "Whole black peppercorns from Kampot province, sun-dried and packed in a resealable tin. Floral, warm, and loud enough to stand up to grilled fish.",
    details: [
      ["Weight", "50 g"],
      ["Origin", "Kampot, Cambodia"],
      ["Form", "Whole corns"],
    ],
    art: "tin",
  },
  {
    id: "krama-scarf",
    name: "Krama Scarf",
    kind: "Textile",
    priceCents: 1200,
    blurb: "Hand-loomed cotton check",
    description:
      "The checked cotton krama: scarf, towel, sunshade, carrier. Woven on a wooden loom in Takeo, in red and white.",
    details: [
      ["Size", "60 × 160 cm"],
      ["Fibre", "Cotton"],
      ["Woven in", "Takeo, Cambodia"],
    ],
    art: "krama",
  },
  {
    id: "canvas-tote",
    name: "Canvas Tote",
    kind: "Carry",
    priceCents: 1800,
    blurb: "12 oz natural canvas",
    description:
      "Heavy natural canvas with handles long enough for the shoulder and a gusset that swallows a week of market shopping.",
    details: [
      ["Size", "38 × 42 × 10 cm"],
      ["Fabric", "12 oz canvas"],
      ["Handles", "64 cm"],
    ],
    art: "tote",
  },
  {
    id: "matchbox",
    name: "Matchbox",
    kind: "Small things",
    priceCents: 75,
    blurb: "45 safety matches",
    description:
      "A sliding paper box of forty-five safety matches with red heads. Strikes on the side, lights the candle, never needs charging.",
    details: [
      ["Count", "45 matches"],
      ["Size", "52 × 36 × 14 mm"],
      ["Strike", "Side panel"],
    ],
    art: "matches",
  },
];

export const PRODUCTS_BY_ID: ReadonlyMap<string, Product> = new Map(
  PRODUCTS.map((product) => [product.id, product]),
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}
