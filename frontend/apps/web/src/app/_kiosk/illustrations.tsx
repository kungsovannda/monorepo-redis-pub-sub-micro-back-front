import type { ReactNode } from "react";
import type { Art } from "./products";

const SIGNAL = "var(--signal)";
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

const DRAWINGS: Record<Art, ReactNode> = {
  can: (
    <>
      <path d="M56 106 C80 92 118 128 144 112 V138 C118 154 80 118 56 132 Z" fill={SIGNAL} stroke="none" />
      <path d="M56 46 V196 A44 11 0 0 0 144 196 V46" />
      <ellipse cx="100" cy="46" rx="44" ry="11" />
      <ellipse cx="100" cy="46" rx="34" ry="7.5" />
      <path d="M90 42.5 h18 a3.5 3.5 0 0 1 0 7 h-18 a3.5 3.5 0 0 1 0 -7 z" />
      <path d="M56 62 A44 11 0 0 0 144 62" />
      <path d="M56 106 C80 92 118 128 144 112 M56 132 C80 118 118 154 144 138" />
      <path d="M70 162 h22 M70 170 h40 M70 178 h14" />
      <path d="M64 72 V96" opacity="0.45" />
    </>
  ),
  book: (
    <>
      <circle cx="107" cy="96" r="22" fill={SIGNAL} stroke="none" />
      <path d="M62 34 L152 26 V208 L62 216 Z" />
      <path d="M62 34 L46 42 V224 L62 216" />
      <path d="M46 224 L136 216 L152 208" />
      <path d="M52 52 V206" opacity="0.45" />
      <path d="M80 150 L134 145 M80 162 L122 158 M80 186 L104 184" />
    </>
  ),
  notebook: (
    <>
      <g opacity="0.3">
        {range(66, 150, 12).map((x) => (
          <path key={`v${x}`} d={`M${x} 36 V206`} />
        ))}
        {range(48, 204, 12).map((y) => (
          <path key={`h${y}`} d={`M58 ${y} H150`} />
        ))}
      </g>
      <rect x="128" y="28" width="7" height="186" fill={SIGNAL} stroke="none" />
      <rect x="50" y="28" width="104" height="186" rx="3" />
      <path d="M58 28 V214" />
    </>
  ),
  mug: (
    <>
      <path d="M86 52 C78 40 94 32 86 20 M108 52 C100 40 116 32 108 20" opacity="0.6" />
      <path d="M50 72 V178 Q50 200 72 200 H128 Q150 200 150 178 V72" />
      <ellipse cx="100" cy="72" rx="50" ry="12" stroke={SIGNAL} strokeWidth="4" />
      <ellipse cx="100" cy="72" rx="44" ry="8.5" />
      <path d="M150 98 C184 98 184 162 150 162 M150 110 C168 110 168 150 150 150" />
      <path d="M58 194 Q100 206 142 194" stroke={SIGNAL} strokeWidth="4" />
      <path d="M72 148 l7 -3 l4 6 l-6 4 z" fill="currentColor" />
    </>
  ),
  tin: (
    <>
      <path d="M48 134 A52 13 0 0 0 152 134 V166 A52 13 0 0 1 48 166 Z" fill={SIGNAL} stroke="none" />
      <path d="M48 110 V190 A52 13 0 0 0 152 190 V110" />
      <path d="M44 92 V108 A56 14 0 0 0 156 108 V92" />
      <ellipse cx="100" cy="92" rx="56" ry="14" />
      <ellipse cx="100" cy="92" rx="40" ry="8" opacity="0.45" />
      <path d="M48 134 A52 13 0 0 0 152 134 M48 166 A52 13 0 0 0 152 166" />
      {[
        [36, 214, true],
        [50, 222, false],
        [164, 212, true],
        [152, 224, false],
        [176, 222, true],
        [64, 214, true],
      ].map(([cx, cy, filled]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx as number}
          cy={cy as number}
          r="4.5"
          fill={filled ? "currentColor" : "none"}
        />
      ))}
    </>
  ),
  krama: (
    <>
      <path d="M40 46 L58 32 H170 V178 L150 190" opacity="0.55" />
      {range(0, 5, 1).flatMap((col) =>
        range(0, 6, 1).map((row) => {
          const stripe = (col % 2 === 0 ? 1 : 0) + (row % 2 === 0 ? 1 : 0);
          return stripe === 0 ? null : (
            <rect
              key={`${col}-${row}`}
              x={40 + col * 20}
              y={46 + row * 20}
              width="20"
              height="20"
              fill={SIGNAL}
              stroke="none"
              opacity={stripe === 2 ? 1 : 0.42}
            />
          );
        }),
      )}
      <rect x="40" y="46" width="120" height="140" />
      <path d={range(44, 156, 7).map((x) => `M${x} 186 L${x - 2} 206`).join(" ")} />
    </>
  ),
  tote: (
    <>
      <rect x="86" y="142" width="28" height="18" fill={SIGNAL} stroke="none" />
      <path d="M72 94 C72 28 128 28 128 94 M82 94 C82 42 118 42 118 94" />
      <path d="M44 94 H156 L150 216 H50 Z" />
      <path d="M48 106 H152" strokeDasharray="3 4" />
      <path d="M128 94 L124 108 M72 94 L76 108" opacity="0.45" />
    </>
  ),
  matches: (
    <>
      <path d="M44 126 L86 143 V158 L44 141 Z" fill={SIGNAL} stroke="none" opacity="0.85" />
      <path d="M40 120 L120 100 L170 120 L90 140 Z" />
      <path d="M40 120 V148 L90 168 V140 M90 168 L170 148 V120" />
      <path d="M58 116 L118 101 L150 114" opacity="0.45" />
      {[
        [62, 206, 128, 188],
        [74, 220, 146, 214],
        [110, 196, 168, 166],
      ].map(([x1, y1, x2, y2]) => (
        <g key={x1}>
          <path d={`M${x1} ${y1} L${x2} ${y2}`} />
          <circle cx={x2} cy={y2} r="5.5" fill={SIGNAL} stroke="none" />
        </g>
      ))}
    </>
  ),
};

export function Drawing({ art, className }: { art: Art; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {DRAWINGS[art]}
    </svg>
  );
}
