import React from "react";
import { Icon } from "../base/Icon.jsx";

export const PIPELINE_STEPS = [
  "Ingest", "Text layer / OCR", "Classify", "Extract (vision)",
  "Normalize & convert", "Verify insurer & entity", "Score", "Explain"
];

export function ProcessingStepper({ steps = PIPELINE_STEPS, current = 0, timings = [], totalMs, style }) {
  const total = totalMs != null ? totalMs : timings.slice(0, current).reduce((a, b) => a + (b || 0), 0);
  return (
    <div style={{ display: "grid", gap: 2, ...style }}>
      {steps.map((label, i) => {
        const done = i < current, active = i === current;
        const color = done ? "var(--status-go)" : active ? "var(--foreground)" : "var(--muted-foreground)";
        return (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 10, height: 28,
            fontSize: 13, color, transition: "color var(--dur-step) var(--ease-out)"
          }}>
            <span style={{ width: 16, display: "flex", flex: "0 0 16px", color }}>
              {done ? <Icon name="check" size={14} /> : active ? <Icon name="loader" size={14} /> : <Icon name="minus" size={14} />}
            </span>
            <span style={{ flex: 1, fontWeight: active ? 600 : 400 }}>{label}</span>
            <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {done && timings[i] != null ? `${(timings[i] / 1000).toFixed(1)} s` : active ? "…" : ""}
            </span>
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <span style={{ flex: 1, fontSize: 12, color: "var(--muted-foreground)" }}>
          {current >= steps.length ? "Analysis complete" : `Step ${Math.min(current + 1, steps.length)} of ${steps.length}`}
        </span>
        <span className="cs-num" style={{ fontSize: 14, fontWeight: 600 }}>{(total / 1000).toFixed(1)} s</span>
      </div>
      <div style={{ height: 4, background: "var(--gap-track)", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
        <div style={{ width: `${(current / steps.length) * 100}%`, height: "100%", background: "var(--gap-fill)", transition: "width var(--dur-step) var(--ease-out)" }} />
      </div>
    </div>
  );
}
