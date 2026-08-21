"use client";

import type * as React from "react";
import type { GuaranteeStatusT } from "@coverscan/schemas";
import { formatCompactEur, gapPercent } from "@/lib/format";

export interface GapBarProps {
  /** amount found, in EUR minor units; null/undefined with status MISSING */
  found?: number | null;
  /** the requirement, in EUR minor units — defines the scale */
  required: number;
  /** COVERED_NO_AMOUNT renders hatched; MISSING renders an empty track */
  status?: GuaranteeStatusT;
  /** px number, or any CSS width (e.g. "100%"); default 180 */
  width?: number | string;
  /** px, default 6 */
  height?: number;
  showLabel?: boolean;
  /** overrides the generated label, e.g. "€305k of €15M · 2 % of requirement" */
  label?: string;
  /** label under the bar at 11 px instead of beside it — for narrow table cells */
  stacked?: boolean;
  /**
   * Binary verdict from lib/doctrine: the cover is under the minimum, so it is
   * non-compliant — the label turns red and the requirement tick is reinforced.
   * There is no intermediate band: the fill is gap *information*, never partial credit.
   */
  nonCompliant?: boolean;
  /** scrolls the document to the matching evidence */
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Signature element #2. One scale 0 → required; ink fill for what was found; a hard tick at the requirement.
 * The bar is always ink — the label carries the status colour.
 *
 * Doctrine (dossier §1.3, binary_minimum): the fill shows HOW FAR the cover is from the
 * requirement, it never grants partial compliance. No wording here may suggest a degree
 * of conformity ("minor", "partial", "underinsurance" are banned); below the minimum the
 * only verdict is non-compliant, rendered by the caller from `binaryStatus()`.
 */
export function GapBar({
  found,
  required,
  status = "BELOW_MINIMUM",
  width = 180,
  height = 6,
  showLabel = true,
  label,
  stacked = false,
  nonCompliant = false,
  onClick,
  style,
}: GapBarProps) {
  const missing = status === "MISSING";
  const noAmount = status === "COVERED_NO_AMOUNT";
  const excluded = status === "EXCLUDED";
  const compliant = status === "COMPLIANT";

  const pct = compliant
    ? 100
    : found
      ? Math.max(1, gapPercent(found, required))
      : 0;
  const hasFill = !missing && !noAmount && pct > 0;

  const autoLabel = missing
    ? "missing"
    : noAmount
      ? "no amount"
      : excluded
        ? `${formatCompactEur(found ?? 0)} · excluded`
        : compliant
          ? `${formatCompactEur(found ?? 0)} · meets requirement`
          : `${formatCompactEur(found ?? 0)} of ${formatCompactEur(required)} · ${pct} % of requirement`;

  const labelColor = nonCompliant
    ? "var(--status-red)"
    : missing || excluded
      ? "var(--status-red)"
      : noAmount
        ? "var(--status-amber)"
        : compliant
          ? "var(--status-go)"
          : "var(--foreground)";

  return (
    <span
      data-slot="gap-bar"
      data-non-compliant={nonCompliant ? "true" : undefined}
      onClick={onClick}
      style={{
        display: "inline-flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "flex-start" : "center",
        gap: stacked ? 4 : 8,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      <span
        data-slot="gap-bar-track"
        style={{
          position: "relative",
          width,
          height,
          flex: typeof width === "number" ? `0 0 ${width}px` : `1 1 auto`,
          background: "var(--gap-track)",
          borderRadius: height / 2,
        }}
      >
        {noAmount && (
          <span
            data-slot="gap-bar-hatch"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: height / 2,
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--gap-fill) 0 2px, transparent 2px 5px)",
              opacity: 0.55,
            }}
          />
        )}
        {hasFill && (
          <span
            data-slot="gap-bar-fill"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: "var(--gap-fill)",
              borderRadius: height / 2,
              transition: "width var(--dur-recolour) var(--ease-standard)",
            }}
          />
        )}
        <span
          data-slot="gap-bar-tick"
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: nonCompliant ? -Math.round(height * 0.95) : -(height * 0.7),
            width: nonCompliant ? 3 : 2,
            height: nonCompliant ? Math.round(height * 2.9) : height * 2.4,
            background: nonCompliant ? "var(--status-red)" : "var(--required-marker)",
            borderRadius: 1,
          }}
        />
      </span>
      {showLabel && (
        <span
          className="cs-num"
          style={{
            fontSize: stacked ? 11 : 13,
            color: labelColor,
            whiteSpace: stacked ? "normal" : "nowrap",
            fontWeight: 500,
          }}
        >
          {label ?? autoLabel}
        </span>
      )}
    </span>
  );
}
