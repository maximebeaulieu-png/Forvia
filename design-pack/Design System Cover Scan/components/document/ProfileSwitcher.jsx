import React from "react";
import { Icon } from "../base/Icon.jsx";

export function ProfileSwitcher({ value, profiles = [], onChange, style }) {
  const [open, setOpen] = React.useState(false);
  const active = profiles.find(p => p.id === value) || profiles[0] || {};
  return (
    <div style={{ position: "relative", ...style }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 10px",
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
        cursor: "pointer", font: "inherit", fontSize: 13, color: "var(--foreground)"
      }}>
        <Icon name="sliders-horizontal" size={14} color="var(--muted-foreground)" />
        <span style={{ color: "var(--muted-foreground)" }}>Profile</span>
        <span style={{ fontWeight: 500 }}>{active.label}</span>
        {active.version && <span className="cs-code">{active.version}</span>}
        <Icon name="chevron-down" size={14} color="var(--muted-foreground)" />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, minWidth: 280,
          background: "var(--popover)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", boxShadow: "var(--shadow-popover)", padding: 4
        }}>
          {profiles.map(p => (
            <button key={p.id} onClick={() => { onChange && onChange(p.id); setOpen(false); }} style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, width: "100%",
              padding: "8px 10px", background: p.id === value ? "var(--accent)" : "transparent",
              border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left", font: "inherit"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
                {p.label}{p.version && <span className="cs-code">{p.version}</span>}
              </span>
              {p.note && <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{p.note}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
