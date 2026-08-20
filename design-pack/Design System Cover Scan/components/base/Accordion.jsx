import React from "react";
import { Icon } from "./Icon.jsx";

export function Accordion({ items = [], defaultOpen = [], style }) {
  const [open, setOpen] = React.useState(() => new Set(defaultOpen));
  const toggle = id => setOpen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {items.map((it, i) => {
        const id = it.id != null ? it.id : i;
        const isOpen = open.has(id);
        return (
          <div key={id} style={{ borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => toggle(id)} aria-expanded={isOpen}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                background: "transparent", border: "none", cursor: "pointer",
                padding: "10px 4px", textAlign: "left", font: "inherit", color: "inherit"
              }}>
              <span style={{ color: "var(--muted-foreground)", display: "flex", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 120ms var(--ease-standard)" }}>
                <Icon name="chevron-right" size={14} />
              </span>
              {it.leading}
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500 }}>{it.title}</span>
              {it.trailing}
            </button>
            {isOpen && <div style={{ padding: "0 4px 12px 30px" }}>{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
