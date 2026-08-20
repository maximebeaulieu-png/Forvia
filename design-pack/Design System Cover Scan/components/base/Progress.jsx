import React from "react";

export function Progress({ value = 0, max = 100, tone = "ink", height = 6, label, style }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = tone === "ink" ? "var(--gap-fill)"
    : tone === "go" ? "var(--status-go)"
    : tone === "amber" ? "var(--status-amber)"
    : tone === "red" ? "var(--status-red)" : "var(--primary)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, ...style }}>
      <div role="progressbar" aria-valuenow={value} aria-valuemax={max} style={{
        flex: 1, height, background: "var(--gap-track)", borderRadius: height / 2, overflow: "hidden"
      }}>
        <div style={{ width: `${pct}%`, height: "100%", background: fill, transition: "width var(--dur-step) var(--ease-out)" }} />
      </div>
      {label && <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</span>}
    </div>
  );
}
