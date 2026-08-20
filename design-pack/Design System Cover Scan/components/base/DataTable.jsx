import React from "react";

export function DataTable({ columns = [], rows = [], dense, onRowClick, selectedId, rowKey = "id", stickyHeader = true, transition, emptyMessage = "No certificates match. Clear filters or upload one.", style }) {
  const h = dense ? "var(--row-h-dense)" : "var(--row-h)";
  return (
    <div style={{ overflow: "auto", ...style }}>
      <table style={{ width: "100%", fontSize: "var(--text-dense)", tableLayout: "auto" }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{
                position: stickyHeader ? "sticky" : undefined, top: 0, zIndex: 2,
                textAlign: c.align || "left", fontWeight: 500, fontSize: 12,
                color: "var(--muted-foreground)", background: "var(--card)",
                padding: "0 10px", height: 32, whiteSpace: "nowrap",
                borderBottom: "1px solid var(--border)", width: c.width
              }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)" }}>{emptyMessage}</td></tr>
          )}
          {rows.map((r, i) => {
            const key = r[rowKey] != null ? r[rowKey] : i;
            const selected = selectedId != null && selectedId === r[rowKey];
            return (
              <tr key={key} onClick={onRowClick ? () => onRowClick(r) : undefined}
                style={{
                  height: h, cursor: onRowClick ? "pointer" : "default",
                  background: selected ? "var(--accent)" : "transparent",
                  transition: transition ? `background var(--dur-recolour) var(--ease-standard)` : undefined
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--accent)"; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}>
                {columns.map(c => (
                  <td key={c.key} style={{
                    padding: "0 10px", borderBottom: "1px solid var(--border)",
                    textAlign: c.align || "left", whiteSpace: c.wrap ? "normal" : "nowrap",
                    fontFamily: c.mono ? "var(--font-mono)" : undefined,
                    fontVariantNumeric: c.mono ? "tabular-nums" : undefined,
                    color: c.muted ? "var(--muted-foreground)" : undefined
                  }}>{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
