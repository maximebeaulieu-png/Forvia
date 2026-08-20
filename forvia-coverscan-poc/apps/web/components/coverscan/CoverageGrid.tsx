"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import type { GuaranteeStatusT } from "@coverscan/schemas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { confidenceGlyph, formatCompactEur, formatEur } from "@/lib/format";
import { GapBar } from "./GapBar";

export interface CoverageRow {
  id: string;
  guarantee: string;
  /** requirement in EUR minor units; omit for guarantees with no threshold */
  required?: number;
  /** verbatim original, e.g. "USD 5,000,000" */
  foundOriginal?: string;
  /** converted amount in EUR minor units */
  foundEur?: number | null;
  /** shown under the guarantee name, e.g. "per occurrence" */
  basis?: string;
  deductible?: string;
  /** e.g. "Worldwide excl. USA/Canada" */
  territory?: string;
  /** colours the territory cell red */
  territoryExcluded?: boolean;
  status: GuaranteeStatusT | "PRESENT";
  /** 0–1 */
  confidence?: number;
  page?: number;
  /** verbatim source quote for the tooltip */
  quote?: string;
  /** FX provenance, e.g. "ECB 1.07 · 26 Apr 2024" */
  fxNote?: string;
  /** default "critical" */
  group?: "critical" | "secondary" | "other";
}

export interface CoverageGridProps {
  rows: CoverageRow[];
  /** click a value or gap bar → scroll + highlight the page region */
  onEvidenceClick?: (row: CoverageRow) => void;
  /** id of the row currently highlighted on the document */
  activeId?: string;
  style?: React.CSSProperties;
}

const STATUS_TEXT: Record<CoverageRow["status"], [string, string]> = {
  COMPLIANT: ["Compliant", "var(--status-go)"],
  BELOW_MINIMUM: ["Below minimum", "var(--status-red)"],
  MISSING: ["Missing", "var(--status-red)"],
  COVERED_NO_AMOUNT: ["Covered, no amount", "var(--status-amber)"],
  EXCLUDED: ["Excluded", "var(--status-red)"],
  UNCLEAR: ["Unclear", "var(--status-review)"],
  PRESENT: ["Present", "var(--status-neutral)"],
};

const GROUPS: Array<[NonNullable<CoverageRow["group"]>, string]> = [
  ["critical", "Critical guarantees"],
  ["secondary", "Secondary guarantees"],
  ["other", "Other guarantees found"],
];

const headStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  background: "var(--card)",
  borderBottom: "1px solid var(--border)",
  fontWeight: 500,
  fontSize: 11,
  color: "var(--muted-foreground)",
  padding: "0 10px",
  height: 30,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "middle",
};

function SectionRow({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={3}
        style={{
          padding: "10px 12px 4px",
          fontSize: 11,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function ConfidenceGlyph({
  confidence,
  page,
  quote,
}: {
  confidence: number;
  page?: number;
  quote?: string;
}) {
  const glyph = confidenceGlyph(confidence);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-slot="confidence-glyph"
          style={{ color: "var(--muted-foreground)", fontSize: 11 }}
        >
          {glyph}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Confidence {Math.round(confidence * 100)} %
        {page != null && (
          <>
            <br />
            Page {page}
          </>
        )}
        {quote && (
          <>
            <br />« {quote} »
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The heart of the certificate screen: one row per guarantee of the active requirements profile,
 * grouped critical → secondary → other. Every figure links to its evidence on the document.
 * Compact 3-column grid: Guarantee (with requirement), Found, Against requirement.
 * Original value + FX live in the Found tooltip; territory becomes an icon only when excluded.
 */
export function CoverageGrid({ rows, onEvidenceClick, activeId, style }: CoverageGridProps) {
  return (
    <TooltipProvider>
      <div style={{ overflow: "auto", ...style }}>
        <table
          style={{
            width: "100%",
            minWidth: 540,
            fontSize: "var(--text-dense)",
            tableLayout: "auto",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={headStyle}>Guarantee</th>
              <th style={{ ...headStyle, textAlign: "right" }}>Found</th>
              <th style={{ ...headStyle, width: "34%" }}>Against requirement</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map(([group, label]) => {
              const items = rows.filter((r) => (r.group ?? "critical") === group);
              if (items.length === 0) return null;
              return (
                <React.Fragment key={group}>
                  <SectionRow label={label} />
                  {items.map((row) => {
                    const [statusText, statusColor] =
                      STATUS_TEXT[row.status] ?? STATUS_TEXT.PRESENT;
                    const active = activeId != null && activeId === row.id;
                    const originalDiffers =
                      row.foundOriginal != null &&
                      row.foundEur != null &&
                      !row.foundOriginal.startsWith("€");
                    return (
                      <tr
                        key={row.id}
                        data-row-id={row.id}
                        style={{
                          background: active ? "var(--accent)" : "transparent",
                          transition: "background var(--dur-recolour) var(--ease-standard)",
                        }}
                      >
                        <td style={{ ...cellStyle, minWidth: 140 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{row.guarantee}</span>
                            {row.territoryExcluded && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    data-slot="territory-excluded"
                                    style={{
                                      color: "var(--status-red)",
                                      display: "inline-flex",
                                    }}
                                  >
                                    <Globe size={13} aria-label="Territory exclusion" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Territory: {row.territory ?? "exclusion applies"}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted-foreground)",
                              marginTop: 2,
                            }}
                          >
                            {row.required != null ? (
                              <span className="cs-num">required {formatEur(row.required)}</span>
                            ) : (
                              <span>{row.basis ?? "no threshold"}</span>
                            )}
                            {row.required != null && row.basis && <span> · {row.basis}</span>}
                            {row.deductible && <span> · deductible {row.deductible}</span>}
                          </div>
                        </td>
                        <td style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                          <span
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            {row.foundEur != null ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    onClick={
                                      onEvidenceClick
                                        ? () => onEvidenceClick(row)
                                        : undefined
                                    }
                                    style={{
                                      cursor: onEvidenceClick ? "pointer" : "default",
                                      display: "inline-block",
                                    }}
                                  >
                                    <span
                                      className="cs-num"
                                      style={{
                                        borderBottom:
                                          "1px dotted var(--muted-foreground)",
                                        fontSize: 13,
                                      }}
                                    >
                                      {formatEur(row.foundEur)}
                                    </span>
                                    {originalDiffers && (
                                      <span
                                        className="cs-num"
                                        style={{
                                          display: "block",
                                          fontSize: 10,
                                          color: "var(--muted-foreground)",
                                          marginTop: 1,
                                        }}
                                      >
                                        {row.foundOriginal}
                                      </span>
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  {originalDiffers && (
                                    <>
                                      {row.foundOriginal} → {formatEur(row.foundEur)}
                                      <br />
                                    </>
                                  )}
                                  {row.fxNote ??
                                    (originalDiffers
                                      ? null
                                      : "As stated on the certificate")}
                                  {row.page != null && (
                                    <>
                                      <br />
                                      Page {row.page}
                                    </>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span
                                style={{
                                  color: statusColor,
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                {statusText}
                              </span>
                            )}
                            {row.confidence != null && (
                              <ConfidenceGlyph
                                confidence={row.confidence}
                                page={row.page}
                                quote={row.quote}
                              />
                            )}
                          </span>
                        </td>
                        <td style={cellStyle}>
                          {row.status === "COMPLIANT" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                color: "var(--status-go)",
                                fontSize: 12,
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Check size={13} aria-hidden="true" />
                              Meets{" "}
                              {row.required != null
                                ? formatCompactEur(row.required)
                                : "requirement"}
                            </span>
                          ) : row.status === "PRESENT" ? (
                            <span
                              style={{ color: "var(--muted-foreground)", fontSize: 12 }}
                            >
                              —
                            </span>
                          ) : (
                            <GapBar
                              found={row.foundEur}
                              required={row.required ?? 0}
                              status={row.status}
                              width={110}
                              stacked
                              onClick={
                                onEvidenceClick ? () => onEvidenceClick(row) : undefined
                              }
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
