import React from "react";
import { Icon } from "./Icon.jsx";

export function Tabs({ tabs = [], value, onChange, right, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      <div role="tablist" style={{
        display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid var(--border)",
        paddingLeft: 4, flex: "0 0 auto"
      }}>
        {tabs.map(t => {
          const id = typeof t === "string" ? t : t.id;
          const label = typeof t === "string" ? t : t.label;
          const count = typeof t === "string" ? null : t.count;
          const icon = typeof t === "string" ? null : t.icon;
          const active = id === value;
          return (
            <button key={id} role="tab" aria-selected={active} onClick={() => onChange && onChange(id)}
              style={{
                appearance: "none", background: "transparent", cursor: "pointer",
                border: "none", borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
                padding: "0 10px", height: 38, fontSize: 13, fontFamily: "var(--font-sans)",
                fontWeight: active ? 600 : 500, color: active ? "var(--primary)" : "var(--muted-foreground)",
                display: "inline-flex", alignItems: "center", gap: 6, marginBottom: -1,
                transition: "color 120ms var(--ease-standard)"
              }}>
              {icon && <Icon name={icon} size={14} />}
              {label}
              {count != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{count}</span>}
            </button>
          );
        })}
        {right && <div style={{ marginLeft: "auto", paddingRight: 8 }}>{right}</div>}
      </div>
      <div role="tabpanel" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
    </div>
  );
}
