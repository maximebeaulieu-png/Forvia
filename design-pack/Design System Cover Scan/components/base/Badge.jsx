import React from "react";

const TONES = {
  neutral: { fg: "var(--status-neutral)", bg: "var(--status-neutral-bg)" },
  go:      { fg: "var(--status-go)", bg: "var(--status-go-bg)" },
  amber:   { fg: "var(--status-amber)", bg: "var(--status-amber-bg)" },
  red:     { fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  review:  { fg: "var(--status-review)", bg: "var(--status-review-bg)" },
  ink:     { fg: "var(--foreground)", bg: "var(--muted)" }
};

export function Badge({ tone = "neutral", variant = "solid", size = "sm", icon, mono, children, style, title }) {
  const t = TONES[tone] || TONES.neutral;
  const h = size === "lg" ? 28 : size === "md" ? 24 : 20;
  return (
    <span title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: h,
      padding: size === "lg" ? "0 12px" : "0 8px",
      borderRadius: "var(--radius-full)", fontSize: size === "lg" ? 13 : 12,
      fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontVariantNumeric: mono ? "tabular-nums" : undefined,
      color: t.fg,
      background: variant === "solid" ? t.bg : "transparent",
      border: `1px solid ${variant === "outline" ? t.fg : "transparent"}`,
      ...style
    }}>{icon}{children}</span>
  );
}
