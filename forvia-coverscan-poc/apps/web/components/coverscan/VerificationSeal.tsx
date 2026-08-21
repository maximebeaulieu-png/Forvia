"use client";

import type * as React from "react";

/**
 * The admissibility checklist drawn as a seal: 8 gates as ticks around a circle,
 * count in the middle. Red ticks are the story — "broker-issued", "no stamp".
 * 96 px in the certificate header, 40 px in tables. Always pair the seal with
 * VerificationSealList on the Summary tab.
 */
export interface SealGateState {
  state: "pass" | "fail" | "review" | "na";
  /** one-line evidence, e.g. "broker's stamp found p.1, no insurer stamp" */
  note?: string;
}

export interface VerificationSealProps {
  /** keyed by gate id: stamp, signature, insurer, policyNumber, dates, entity, coinsurance, documentType */
  gates: Record<string, SealGateState>;
  /** 96 (header) or 40 (table); default 96 */
  size?: number;
  /** overrides the derived verdict; by default any failing gate means not admissible */
  admissible?: boolean;
  /** click a tick to scroll the document to that evidence */
  onGateClick?: (gateId: string) => void;
  style?: React.CSSProperties;
}

export interface VerificationSealListProps {
  gates: Record<string, SealGateState>;
  onGateClick?: (gateId: string) => void;
  style?: React.CSSProperties;
}

/** The 8 admissibility gates, in fixed order, starting at 12 o'clock. */
export const SEAL_GATES: { id: string; label: string }[] = [
  { id: "stamp", label: "Insurer stamp" },
  { id: "signature", label: "Insurer signature" },
  { id: "insurer", label: "Issuer is the insurer" },
  { id: "policyNumber", label: "Policy number" },
  { id: "dates", label: "Validity dates" },
  { id: "entity", label: "Contracting entity" },
  { id: "coinsurance", label: "Co-insurance shares" },
  { id: "documentType", label: "Document type" },
];

const COLOR: Record<SealGateState["state"], string> = {
  pass: "var(--status-go)",
  fail: "var(--status-red)",
  review: "var(--status-review)",
  na: "var(--muted-foreground)",
};

export function VerificationSeal({
  gates = {},
  size = 96,
  admissible,
  onGateClick,
  style,
}: VerificationSealProps) {
  const r = size / 2;
  const ringR = r - (size >= 72 ? 9 : 5);
  const tickLen = size >= 72 ? 7 : 4;
  const failing = SEAL_GATES.filter((g) => gates[g.id]?.state === "fail").length;
  const underReview = SEAL_GATES.filter((g) => gates[g.id]?.state === "review").length;
  // A gate under review has NOT passed: showing 8/8 next to two "?" marks read as
  // "everything is validated" in user testing. Only pass/na count towards the total.
  const passed = SEAL_GATES.filter((g) => {
    const st = gates[g.id]?.state;
    return st === "pass" || st === "na";
  }).length;
  // Admissible only when nothing failed AND nothing is still awaiting a human.
  const isAdmissible = admissible != null ? admissible : failing === 0 && underReview === 0;
  const verdictWord = failing > 0 ? "Not admissible" : underReview > 0 ? "Pending review" : "Admissible";
  const centreColor =
    failing > 0 ? "var(--status-red)" : underReview > 0 ? "var(--status-review)" : "var(--status-go)";
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${verdictWord} — ${passed} of 8 checks passed${underReview > 0 ? `, ${underReview} under review` : ""}${failing > 0 ? `, ${failing} failed` : ""}`}
      >
        <circle cx={r} cy={r} r={ringR} fill="none" stroke="var(--border)" strokeWidth="1" />
        {SEAL_GATES.map((g, i) => {
          const st = gates[g.id]?.state ?? "na";
          const a = (i / SEAL_GATES.length) * Math.PI * 2 - Math.PI / 2;
          const x1 = r + Math.cos(a) * ringR;
          const y1 = r + Math.sin(a) * ringR;
          const x2 = r + Math.cos(a) * (ringR + tickLen);
          const y2 = r + Math.sin(a) * (ringR + tickLen);
          return (
            <g
              key={g.id}
              onClick={onGateClick ? () => onGateClick(g.id) : undefined}
              style={{ cursor: onGateClick ? "pointer" : "default" }}
            >
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLOR[st]}
                strokeWidth={st === "na" ? 1.5 : 2.5}
                strokeLinecap="round"
              />
              {size >= 72 && st !== "na" && (
                <circle
                  cx={x2 + Math.cos(a) * 3}
                  cy={y2 + Math.sin(a) * 3}
                  r="1.6"
                  fill={COLOR[st]}
                />
              )}
            </g>
          );
        })}
        {size >= 72 ? (
          <>
            <text
              x={r}
              y={r - 2}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={size * 0.24}
              fontWeight="600"
              fill={centreColor}
              style={{ letterSpacing: "-0.02em" }}
            >
              {passed}
              <tspan fontSize={size * 0.15} fill="var(--muted-foreground)">
                /8
              </tspan>
            </text>
            <text
              x={r}
              y={r + size * 0.16}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontSize={size * 0.105}
              fill="var(--muted-foreground)"
            >
              {verdictWord}
            </text>
          </>
        ) : (
          <text
            x={r}
            y={r + size * 0.115}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={size * 0.34}
            fontWeight="600"
            fill={centreColor}
          >
            {passed}
          </text>
        )}
      </svg>
    </div>
  );
}

/** The checklist the seal summarises — always shown next to it on the Summary tab. */
export function VerificationSealList({
  gates = {},
  onGateClick,
  style,
}: VerificationSealListProps) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gap: 6,
        ...style,
      }}
    >
      {SEAL_GATES.map((g) => {
        const e = gates[g.id];
        const st = e?.state ?? "na";
        const mark =
          st === "pass" ? "✓" : st === "fail" ? "✗" : st === "review" ? "?" : "–";
        return (
          <li
            key={g.id}
            onClick={onGateClick ? () => onGateClick(g.id) : undefined}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "baseline",
              fontSize: 13,
              cursor: onGateClick ? "pointer" : "default",
            }}
          >
            <span
              style={{
                color: COLOR[st],
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                width: 12,
                flex: "0 0 12px",
              }}
            >
              {mark}
            </span>
            <span style={{ fontWeight: 500, flex: "0 0 auto" }}>{g.label}</span>
            {e?.note && (
              <span style={{ color: "var(--muted-foreground)", minWidth: 0 }}>
                — {e.note}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
