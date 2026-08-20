"use client";

import * as React from "react";
import { Ban, ChevronRight, Info, TriangleAlert } from "lucide-react";
import type { SeverityT } from "@coverscan/schemas";

export interface Finding {
  /** rule identifier, shown in mono — e.g. "ISSUER_IS_BROKER" */
  ruleId: string;
  severity: SeverityT;
  /** one plain-English line, sentence case */
  title: string;
  /** verbatim quote in the source language — never translated */
  quote?: string;
  page?: number;
  /** page language code, e.g. "fr" */
  lang?: string;
  /** the sentence that goes into the supplier email */
  fix?: string;
}

export interface FindingsListProps {
  findings: Finding[];
  /** rule ids open on mount; defaults to every BLOCK finding */
  defaultOpen?: string[];
  /** click the quote → scroll + highlight on the document */
  onEvidenceClick?: (finding: Finding) => void;
  style?: React.CSSProperties;
}

const SEVERITY: Record<
  SeverityT,
  { tone: string; bg: string; icon: React.ComponentType<{ size?: number }>; rank: number }
> = {
  BLOCK: { tone: "var(--status-red)", bg: "var(--status-red-bg)", icon: Ban, rank: 0 },
  CRITICAL: {
    tone: "var(--status-red)",
    bg: "var(--status-red-bg)",
    icon: TriangleAlert,
    rank: 1,
  },
  WARNING: {
    tone: "var(--status-amber)",
    bg: "var(--status-amber-bg)",
    icon: TriangleAlert,
    rank: 2,
  },
  INFO: {
    tone: "var(--status-neutral)",
    bg: "var(--status-neutral-bg)",
    icon: Info,
    rank: 3,
  },
};

/**
 * Severity-sorted findings: BLOCK > CRITICAL > WARNING > INFO. Each expands to the rule id,
 * the verbatim evidence quote and the fix to request. BLOCK findings are open on mount.
 */
export function FindingsList({ findings, defaultOpen, onEvidenceClick, style }: FindingsListProps) {
  const sorted = [...findings].sort(
    (a, b) =>
      (SEVERITY[a.severity] ?? SEVERITY.INFO).rank - (SEVERITY[b.severity] ?? SEVERITY.INFO).rank,
  );
  const [open, setOpen] = React.useState<Set<string>>(
    () =>
      new Set(
        defaultOpen ?? findings.filter((f) => f.severity === "BLOCK").map((f) => f.ruleId),
      ),
  );

  const toggle = (ruleId: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {sorted.map((finding) => {
        const s = SEVERITY[finding.severity] ?? SEVERITY.INFO;
        const SeverityIcon = s.icon;
        const isOpen = open.has(finding.ruleId);
        return (
          <div
            key={finding.ruleId}
            data-slot="finding"
            data-rule-id={finding.ruleId}
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              type="button"
              onClick={() => toggle(finding.ruleId)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
                color: "inherit",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  color: "var(--muted-foreground)",
                  display: "flex",
                  transform: isOpen ? "rotate(90deg)" : "none",
                  transition: "transform var(--dur-recolour) var(--ease-standard)",
                }}
              >
                <ChevronRight size={14} />
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  height: 20,
                  padding: "0 7px",
                  borderRadius: "var(--radius-full)",
                  background: s.bg,
                  color: s.tone,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".02em",
                  flex: "0 0 auto",
                }}
              >
                <SeverityIcon size={11} />
                {finding.severity}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500 }}>
                {finding.title}
              </span>
              <span className="cs-code" style={{ flex: "0 0 auto" }}>
                {finding.ruleId}
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 4px 12px 30px", display: "grid", gap: 8 }}>
                {finding.quote && (
                  <div
                    onClick={onEvidenceClick ? () => onEvidenceClick(finding) : undefined}
                    style={{ cursor: onEvidenceClick ? "pointer" : "default" }}
                  >
                    <div className="cs-quote">« {finding.quote} »</div>
                    {finding.page != null && (
                      <div className="cs-code" style={{ marginTop: 2 }}>
                        Page {finding.page}
                        {finding.lang ? ` · ${finding.lang}` : ""} — click to highlight
                      </div>
                    )}
                  </div>
                )}
                {finding.fix && (
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.45,
                      borderLeft: "2px solid var(--border)",
                      paddingLeft: 10,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--muted-foreground)",
                        fontSize: 11,
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        marginBottom: 2,
                      }}
                    >
                      Fix to request
                    </span>
                    {finding.fix}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
