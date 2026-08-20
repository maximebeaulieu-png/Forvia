import React from "react";
import { Icon } from "./Icon.jsx";

export function Select({ value, options = [], onChange, label, size = "md", width, style }) {
  const h = size === "sm" ? 28 : 32;
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      {label && <span style={{ fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{label}</span>}
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", width }}>
        <select value={value} onChange={e => onChange && onChange(e.target.value)}
          style={{
            appearance: "none", height: h, width: width || undefined,
            padding: "0 28px 0 10px", fontSize: 13, fontFamily: "var(--font-sans)",
            color: "var(--foreground)", background: "var(--card)",
            border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer"
          }}>
          {options.map(o => {
            const val = typeof o === "string" ? o : o.value;
            const lab = typeof o === "string" ? o : o.label;
            return <option key={val} value={val}>{lab}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 8, pointerEvents: "none", color: "var(--muted-foreground)", display: "flex" }}>
          <Icon name="chevron-down" size={14} />
        </span>
      </span>
    </label>
  );
}
