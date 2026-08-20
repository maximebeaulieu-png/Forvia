import React from "react";
import { Icon } from "../base/Icon.jsx";

const MAP = {
  GO:            { label: "Compliant", tone: "go", icon: "shield-check", variant: "solid" },
  REQUEST_CHANGES:{ label: "Request changes", tone: "amber", icon: "shield-alert", variant: "solid" },
  FORMAL_DEFECT: { label: "Not admissible · resubmit", tone: "red", icon: "shield-x", variant: "outline" },
  STRUCTURAL:    { label: "Not admissible", tone: "red", icon: "shield-x", variant: "solid" },
  NEEDS_REVIEW:  { label: "Needs review", tone: "review", icon: "eye", variant: "solid" },
  PROCESSING:    { label: "Analysing…", tone: "neutral", icon: "loader", variant: "solid" },
  PENDING:       { label: "Awaiting certificate", tone: "neutral", icon: "file-question-mark", variant: "dashed" }
};
const TONES = {
  go: ["var(--status-go)", "var(--status-go-bg)"],
  amber: ["var(--status-amber)", "var(--status-amber-bg)"],
  red: ["var(--status-red)", "var(--status-red-bg)"],
  review: ["var(--status-review)", "var(--status-review-bg)"],
  neutral: ["var(--status-neutral)", "var(--status-neutral-bg)"]
};
const SIZES = { sm: { h: 20, fs: 12, ic: 12, pad: "0 8px" }, md: { h: 24, fs: 13, ic: 13, pad: "0 10px" }, lg: { h: 28, fs: 14, ic: 15, pad: "0 12px" } };

export function DecisionChip({ decision = "GO", size = "md", label, style }) {
  const m = MAP[decision] || MAP.GO;
  const [fg, bg] = TONES[m.tone];
  const s = SIZES[size] || SIZES.md;
  const outline = m.variant === "outline";
  const dashed = m.variant === "dashed";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: s.h, padding: s.pad,
      borderRadius: "var(--radius-full)", fontSize: s.fs, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap",
      color: fg, background: outline || dashed ? "transparent" : bg,
      border: `1px ${dashed ? "dashed" : "solid"} ${outline || dashed ? fg : "transparent"}`, ...style
    }}>
      <Icon name={m.icon} size={s.ic} />{label || m.label}
    </span>
  );
}
