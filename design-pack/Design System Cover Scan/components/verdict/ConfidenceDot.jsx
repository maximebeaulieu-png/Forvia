import React from "react";
import { Tooltip } from "../base/Tooltip.jsx";

export function ConfidenceDot({ value = 0, size = 10, showValue, page, quote, style }) {
  const level = value >= 0.85 ? "high" : value >= 0.6 ? "mid" : "low";
  const color = level === "high" ? "var(--foreground)" : level === "mid" ? "var(--muted-foreground)" : "var(--muted-foreground)";
  const glyph = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="4" fill={level === "high" ? color : "none"} stroke={color} strokeWidth="1.25" />
        {level === "mid" && <path d="M5 1 A4 4 0 0 0 5 9 Z" fill={color} />}
      </svg>
      {showValue && <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{Math.round(value * 100)} %</span>}
    </span>
  );
  const tip = (page || quote)
    ? <>{page != null && <>Page {page}</>}{page != null && quote ? " · " : ""}{quote && <em>« {quote} »</em>}<br />Confidence {Math.round(value * 100)} %</>
    : `Confidence ${Math.round(value * 100)} %`;
  return <Tooltip content={tip} style={style}>{glyph}</Tooltip>;
}
