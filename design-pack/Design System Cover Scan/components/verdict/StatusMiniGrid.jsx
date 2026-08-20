import React from "react";
import { Tooltip } from "../base/Tooltip.jsx";

const STATE = {
  COMPLIANT:        { mark: "✓", fg: "var(--status-go)", bg: "var(--status-go-bg)" },
  BELOW_MINIMUM:    { mark: "✗", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  MISSING:          { mark: "–", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  COVERED_NO_AMOUNT:{ mark: "≈", fg: "var(--status-amber)", bg: "var(--status-amber-bg)" },
  EXCLUDED:         { mark: "✗", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  UNCLEAR:          { mark: "?", fg: "var(--status-review)", bg: "var(--status-review-bg)" },
  PRESENT:          { mark: "•", fg: "var(--status-neutral)", bg: "var(--status-neutral-bg)" }
};
const LABEL = { pl: "Product liability", recall: "Product recall", pfl: "Pure financial loss" };

export function StatusMiniGrid({ pl, recall, pfl, tooltips = {}, style }) {
  const cells = [["pl", pl], ["recall", recall], ["pfl", pfl]];
  return (
    <span style={{ display: "inline-flex", gap: 2, ...style }}>
      {cells.map(([key, st]) => {
        const s = STATE[st] || STATE.PRESENT;
        const cell = (
          <span style={{
            width: 16, height: 16, borderRadius: 3, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            background: s.bg, color: s.fg, fontFamily: "var(--font-mono)",
            fontSize: 11, fontWeight: 600, lineHeight: 1
          }}>{s.mark}</span>
        );
        const tip = tooltips[key] || `${LABEL[key]} · ${String(st || "").toLowerCase().replace(/_/g, " ")}`;
        return <Tooltip key={key} content={tip}>{cell}</Tooltip>;
      })}
    </span>
  );
}
