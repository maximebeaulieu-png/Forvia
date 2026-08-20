"use client";

import * as React from "react";
import { Download, Eye, EyeOff, TriangleAlert, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface DocumentPage {
  n: number;
  imageUrl: string;
  /** page language code shown as a badge, e.g. "fr" */
  lang?: string;
  ocrUsed?: boolean;
}

export interface EvidenceHighlight {
  id: string;
  page: number;
  /** normalised 0–1 rectangle on the page image */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DocumentViewerProps {
  pages: DocumentPage[];
  /** controlled page number — set it when a grid row is clicked */
  activePage?: number;
  onPageChange?: (n: number) => void;
  highlights?: EvidenceHighlight[];
  /** the highlight that pulses (300 ms) and gets an outline */
  activeHighlightId?: string;
  /** default true */
  showEvidence?: boolean;
  onToggleEvidence?: () => void;
  /** forces the OCR-quality badge on regardless of per-page flags */
  ocrUsed?: boolean;
  /** original file name, shown on the download button */
  fileName?: string;
  style?: React.CSSProperties;
}

/**
 * Left pane of the certificate screen: page thumbnails, the rendered page, and the evidence highlight layer.
 * Signature element #1 — clicking a value in the coverage grid lights up the exact line here.
 */
export function DocumentViewer({
  pages = [],
  activePage,
  onPageChange,
  highlights = [],
  activeHighlightId,
  showEvidence = true,
  onToggleEvidence,
  ocrUsed,
  fileName,
  style,
}: DocumentViewerProps) {
  const [zoom, setZoom] = React.useState(1);
  const [page, setPage] = React.useState(activePage || pages[0]?.n || 1);
  React.useEffect(() => {
    if (activePage) setPage(activePage);
  }, [activePage]);
  const current = pages.find((p) => p.n === page) || pages[0];
  const pageHighlights = highlights.filter((h) => h.page === page);

  const go = (n: number) => {
    setPage(n);
    onPageChange?.(n);
  };

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden rounded-(--radius) border border-border bg-card"
      style={style}
    >
      <div className="flex flex-none items-center gap-2 border-b border-border px-2.5 py-2">
        <span className="text-xs text-muted-foreground">Page</span>
        <span className="cs-num text-xs">
          {page} / {pages.length}
        </span>
        {current?.lang && (
          <span className="cs-num inline-flex items-center rounded-full bg-(--status-neutral-bg) px-2 py-0.5 text-[11px] text-(--status-neutral)">
            {current.lang}
          </span>
        )}
        {(ocrUsed || current?.ocrUsed) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-(--status-amber-bg) px-2 py-0.5 text-[11px] text-(--status-amber)">
            <TriangleAlert size={11} />
            OCR
          </span>
        )}
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onToggleEvidence}>
          {showEvidence ? <Eye size={14} /> : <EyeOff size={14} />}
          Evidence
        </Button>
        <Button
          size="sm"
          variant="ghost"
          title="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
        >
          <ZoomOut size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          title="Zoom in"
          onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))}
        >
          <ZoomIn size={14} />
        </Button>
        <Button size="sm" variant="ghost" title={fileName}>
          <Download size={14} />
          Original file
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="grid w-[76px] flex-none content-start gap-2 overflow-auto border-r border-border bg-background p-2">
          {pages.map((p) => (
            <button
              key={p.n}
              type="button"
              onClick={() => go(p.n)}
              className="block cursor-pointer overflow-hidden rounded-[3px] bg-card p-0"
              style={{
                border: `1px solid ${p.n === page ? "var(--primary)" : "var(--border)"}`,
                boxShadow: p.n === page ? "var(--focus-ring)" : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={`Page ${p.n}`} className="block w-full" />
              <span className="cs-num block py-0.5 text-[10px] text-muted-foreground">
                {p.n}
              </span>
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-start justify-center overflow-auto bg-background p-4">
          <div
            className="relative flex-none"
            style={{ width: `${zoom * 100}%`, maxWidth: zoom <= 1 ? "100%" : "none" }}
          >
            {current && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={current.imageUrl}
                alt={`Certificate page ${page}`}
                className="block w-full border border-border bg-card"
              />
            )}
            {showEvidence &&
              pageHighlights.map((h) => {
                const active = h.id === activeHighlightId;
                return (
                  <span
                    key={h.id}
                    data-highlight-id={h.id}
                    className={`pointer-events-none absolute rounded-xs bg-(--evidence) ${
                      active ? "cs-pulse" : ""
                    }`}
                    style={{
                      left: `${h.x * 100}%`,
                      top: `${h.y * 100}%`,
                      width: `${h.w * 100}%`,
                      height: `${h.h * 100}%`,
                      outline: `1.5px solid ${active ? "var(--evidence-solid)" : "transparent"}`,
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
