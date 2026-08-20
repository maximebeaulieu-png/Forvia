import React from "react";
import { Icon } from "../base/Icon.jsx";
import { Badge } from "../base/Badge.jsx";
import { Button } from "../base/Button.jsx";

export function DocumentViewer({ pages = [], activePage, onPageChange, highlights = [], activeHighlightId, showEvidence = true, onToggleEvidence, ocrUsed, fileName, style }) {
  const [zoom, setZoom] = React.useState(1);
  const [page, setPage] = React.useState(activePage || (pages[0] && pages[0].n) || 1);
  React.useEffect(() => { if (activePage) setPage(activePage); }, [activePage]);
  const current = pages.find(p => p.n === page) || pages[0] || {};
  const pageHighlights = highlights.filter(h => h.page === page);

  const go = n => { setPage(n); onPageChange && onPageChange(n); };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: "1px solid var(--border)", flex: "0 0 auto" }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Page</span>
        <span className="cs-num" style={{ fontSize: 12 }}>{page} / {pages.length}</span>
        {current.lang && <Badge tone="neutral" mono>{current.lang}</Badge>}
        {(ocrUsed || current.ocrUsed) && <Badge tone="amber" icon={<Icon name="triangle-alert" size={11} />}>OCR</Badge>}
        <span style={{ flex: 1 }} />
        <Button size="sm" variant="ghost" onClick={onToggleEvidence} iconLeft={<Icon name={showEvidence ? "eye" : "eye-off"} size={14} />}>Evidence</Button>
        <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1)))} title="Zoom out"><Icon name="zoom-out" size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.min(2.4, +(z + 0.2).toFixed(1)))} title="Zoom in"><Icon name="zoom-in" size={14} /></Button>
        <Button size="sm" variant="ghost" iconLeft={<Icon name="download" size={14} />} title={fileName}>Original file</Button>
      </div>

      <div style={{ display: "flex", minHeight: 0, flex: 1 }}>
        <div style={{ width: 76, flex: "0 0 76px", borderRight: "1px solid var(--border)", overflow: "auto", padding: 8, display: "grid", gap: 8, background: "var(--background)" }}>
          {pages.map(p => (
            <button key={p.n} onClick={() => go(p.n)} style={{
              padding: 0, cursor: "pointer", background: "var(--card)",
              border: `1px solid ${p.n === page ? "var(--primary)" : "var(--border)"}`,
              boxShadow: p.n === page ? "var(--focus-ring)" : "none", borderRadius: 3, overflow: "hidden", display: "block"
            }}>
              <img src={p.imageUrl} alt={`Page ${p.n}`} style={{ width: "100%", display: "block" }} />
              <span className="cs-num" style={{ fontSize: 10, color: "var(--muted-foreground)", display: "block", padding: "2px 0" }}>{p.n}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, overflow: "auto", background: "var(--background)", padding: 16, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          <div style={{ position: "relative", width: `${zoom * 100}%`, maxWidth: zoom <= 1 ? "100%" : "none", flex: "0 0 auto" }}>
            <img src={current.imageUrl} alt={`Certificate page ${page}`} style={{ width: "100%", display: "block", border: "1px solid var(--border)", background: "#fff" }} />
            {showEvidence && pageHighlights.map(h => {
              const active = h.id === activeHighlightId;
              return (
                <span key={h.id} className={active ? "cs-pulse" : undefined} style={{
                  position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`,
                  width: `${h.w * 100}%`, height: `${h.h * 100}%`,
                  background: "var(--evidence)",
                  outline: `1.5px solid ${active ? "var(--evidence-solid)" : "transparent"}`,
                  borderRadius: 2, pointerEvents: "none"
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
