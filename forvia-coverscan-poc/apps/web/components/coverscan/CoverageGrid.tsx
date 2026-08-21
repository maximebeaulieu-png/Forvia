"use client";

import * as React from "react";
import { Check, Globe, Minus, X } from "lucide-react";
import type { GuaranteeStatusT } from "@coverscan/schemas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BINARY_LABEL, binaryStatus, type BinaryStatus } from "@/lib/doctrine";
import { confidenceGlyph, formatCompactEur, formatEur, gapPercent } from "@/lib/format";
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

/**
 * Found column: what the certificate says when there is no readable amount — descriptive,
 * never a verdict. Extra keys cover the scope statuses the dataset uses for the
 * presence-type criteria (territory, aggregate basis).
 */
const STATUS_TEXT: Record<string, [string, string]> = {
  COMPLIANT: ["Confirmed", "var(--status-go)"],
  BELOW_MINIMUM: ["Not stated", "var(--muted-foreground)"],
  MISSING: ["Missing", "var(--status-red)"],
  COVERED_NO_AMOUNT: ["Covered, no amount", "var(--status-amber)"],
  EXCLUDED: ["Excluded", "var(--status-red)"],
  UNCLEAR: ["Unclear", "var(--status-review)"],
  PRESENT: ["Present", "var(--status-neutral)"],
  INCLUDED: ["Included", "var(--status-go)"],
  BOTH: ["Per occurrence + aggregate", "var(--status-neutral)"],
  AGGREGATE: ["Annual aggregate", "var(--status-neutral)"],
  PARTIAL_EXCLUDED: ["Territory exclusion", "var(--status-red)"],
};

/**
 * Dossier §1.3 — binary compliance. The verdict column shows "Compliant" or
 * "Non-compliant" and nothing in between; the dataset status becomes the *motive*
 * printed next to the verdict ("Non-compliant · not mentioned"), never a verdict of
 * its own, and never a partial-credit band.
 */
const MOTIVE: Record<string, string | undefined> = {
  BELOW_MINIMUM: "below the required minimum",
  MISSING: "not mentioned",
  COVERED_NO_AMOUNT: "covered, no amount stated",
  EXCLUDED: "excluded from the policy",
  UNCLEAR: "wording unclear",
  PRESENT: "present, no amount to compare",
};

/**
 * Presence-type criteria carry no figure; the dataset already answers them yes / no
 * (5 / 5 or 0 / 5), which is binary by nature — it is reproduced as such, with its motive.
 */
const PRESENCE_MET: Record<string, string | undefined> = {
  INCLUDED: "included as required",
  BOTH: "per occurrence and annual aggregate",
  AGGREGATE: "annual aggregate basis",
};

const PRESENCE_FAILED: Record<string, string | undefined> = {
  PARTIAL_EXCLUDED: "required territory not fully covered",
};

/** Statuses that cannot demonstrate the required cover, whatever figure was read. */
const DISQUALIFYING = new Set<CoverageRow["status"]>([
  "MISSING",
  "COVERED_NO_AMOUNT",
  "EXCLUDED",
  "UNCLEAR",
]);

const VERDICT_STYLE: Record<BinaryStatus, { color: string; Icon: typeof Check }> = {
  COMPLIANT_STRONG: { color: "var(--status-go)", Icon: Check },
  COMPLIANT: { color: "var(--status-go)", Icon: Check },
  NON_COMPLIANT: { color: "var(--status-red)", Icon: X },
  NOT_ASSESSABLE: { color: "var(--muted-foreground)", Icon: Minus },
};

/** The numeric requirement in EUR minor units, or null when the criterion has no threshold. */
function threshold(row: CoverageRow): number | null {
  return typeof row.required === "number" && row.required > 0 ? row.required : null;
}

/**
 * Binary verdict + its motive. Under the minimum there is no gradation: €18M against
 * €20M is non-compliant, exactly like a missing guarantee.
 */
function rowVerdict(row: CoverageRow): { verdict: BinaryStatus; motive?: string } {
  const required = threshold(row);
  if (required != null) {
    const verdict = DISQUALIFYING.has(row.status)
      ? ("NON_COMPLIANT" as const)
      : binaryStatus(row.foundEur, required);
    return {
      verdict,
      motive:
        verdict === "NON_COMPLIANT"
          ? (MOTIVE[row.status] ?? MOTIVE.BELOW_MINIMUM)
          : undefined,
    };
  }
  // No figure to compare against: keep the dataset's own binary verdict, or stay neutral.
  const met = PRESENCE_MET[row.status];
  if (met != null) return { verdict: "COMPLIANT", motive: met };
  const failed = PRESENCE_FAILED[row.status];
  if (failed != null) return { verdict: "NON_COMPLIANT", motive: failed };
  switch (row.status) {
    case "COMPLIANT":
      return { verdict: "COMPLIANT" };
    case "MISSING":
    case "EXCLUDED":
    case "BELOW_MINIMUM":
      return { verdict: "NON_COMPLIANT", motive: MOTIVE[row.status] };
    default:
      return { verdict: "NOT_ASSESSABLE", motive: MOTIVE[row.status] };
  }
}

/**
 * The gap line — information only. It always names both figures so a percentage can
 * never be mistaken for a degree of compliance ("€305k of €15M required · 2 % of the
 * requirement").
 */
function gapLine(row: CoverageRow, verdict: BinaryStatus): string | undefined {
  const required = threshold(row);
  if (required == null) return undefined;
  const req = formatCompactEur(required);
  if (row.status === "EXCLUDED") {
    return row.foundEur != null
      ? `${formatCompactEur(row.foundEur)} stated but excluded · ${req} required`
      : `excluded · ${req} required`;
  }
  if (row.status === "COVERED_NO_AMOUNT") return `no amount stated · ${req} required`;
  if (row.foundEur == null || row.foundEur <= 0) return `nothing found · ${req} required`;
  const found = formatCompactEur(row.foundEur);
  if (verdict === "COMPLIANT_STRONG") return `${found} of ${req} required · strong cover`;
  if (verdict !== "NON_COMPLIANT") return `${found} of ${req} required`;
  return `${found} of ${req} required · ${gapPercent(row.foundEur, required)} % of the requirement`;
}

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
 * Compact 3-column grid: Guarantee (with requirement), Found, Verdict vs requirement.
 * Original value + FX live in the Found tooltip; territory becomes an icon only when excluded.
 *
 * The verdict column is binary by doctrine (dossier §1.3): "Compliant" or "Non-compliant",
 * icon + word, with the dataset status as the motive beside it. The gap bar and the
 * percentage underneath are gap *information* — never a partial-compliance band.
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
              <th style={{ ...headStyle, width: "42%", minWidth: 240 }}>Verdict vs requirement</th>
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
                    const { verdict, motive } = rowVerdict(row);
                    const verdictStyle = VERDICT_STYLE[verdict];
                    const VerdictIcon = verdictStyle.Icon;
                    const gapText = gapLine(row, verdict);
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
                        <td style={cellStyle} data-slot="verdict-cell">
                          <div style={{ display: "grid", gap: 4, justifyItems: "start" }}>
                            <span
                              data-slot="binary-verdict"
                              data-verdict={verdict}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                fontWeight: 500,
                                color: verdictStyle.color,
                              }}
                            >
                              <VerdictIcon size={13} aria-hidden="true" />
                              <span>{BINARY_LABEL[verdict]}</span>
                              {motive && (
                                <span
                                  style={{
                                    color: "var(--muted-foreground)",
                                    fontWeight: 400,
                                  }}
                                >{` · ${motive}`}</span>
                              )}
                            </span>
                            {gapText &&
                              (verdict === "NON_COMPLIANT" ? (
                                <GapBar
                                  found={row.foundEur}
                                  required={row.required ?? 0}
                                  status={row.status === "PRESENT" ? "BELOW_MINIMUM" : row.status}
                                  width={110}
                                  stacked
                                  nonCompliant
                                  label={gapText}
                                  onClick={
                                    onEvidenceClick ? () => onEvidenceClick(row) : undefined
                                  }
                                />
                              ) : (
                                <span
                                  className="cs-num"
                                  style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                                >
                                  {gapText}
                                </span>
                              ))}
                          </div>
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
