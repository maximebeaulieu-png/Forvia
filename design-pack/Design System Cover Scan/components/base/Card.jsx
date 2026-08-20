import React from "react";

export function Card({ title, subtitle, actions, padded = true, children, style, bodyStyle }) {
  return (
    <section style={{
      background: "var(--card)", color: "var(--card-foreground)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      display: "flex", flexDirection: "column", minWidth: 0, ...style
    }}>
      {(title || actions) && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "14px var(--card-pad)", borderBottom: "1px solid var(--border)"
        }}>
          <div style={{ minWidth: 0 }}>
            {title && <h3 style={{ fontSize: "var(--text-h3)", fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h3>}
            {subtitle && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          {actions && <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>{actions}</div>}
        </header>
      )}
      <div style={{ padding: padded ? "var(--card-pad)" : 0, flex: 1, minWidth: 0, ...bodyStyle }}>{children}</div>
    </section>
  );
}
