import React from "react";
import { Icon } from "./Icon.jsx";

export function Sheet({ open, title, subtitle, onClose, footer, width = 520, children, style }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(1,0,61,.32)" }} />
      <aside style={{
        position: "relative", width, maxWidth: "100%", height: "100%",
        background: "var(--card)", borderLeft: "1px solid var(--border)",
        boxShadow: "var(--shadow-sheet)", display: "flex", flexDirection: "column", ...style
      }}>
        <header style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600 }}>{title}</h2>
            {subtitle && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 2, display: "flex" }}>
            <Icon name="x" size={16} />
          </button>
        </header>
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
        {footer && <footer style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>{footer}</footer>}
      </aside>
    </div>
  );
}
