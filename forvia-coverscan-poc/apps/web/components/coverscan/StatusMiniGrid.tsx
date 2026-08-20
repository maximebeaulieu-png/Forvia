"use client";

import type * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Three 16-px cells — product liability / product recall / pure financial loss —
 * for table rows. Order is always PL · Recall · PFL. Hover shows found vs required.
 * Marks: ✓ compliant · ✗ below minimum or excluded · – missing · ≈ covered
 * without an amount · ? unclear · • present, no threshold.
 */
export type GuaranteeStatus =
  | "COMPLIANT"
  | "BELOW_MINIMUM"
  | "MISSING"
  | "COVERED_NO_AMOUNT"
  | "EXCLUDED"
  | "UNCLEAR"
  | "PRESENT";

export interface StatusMiniGridProps {
  pl: GuaranteeStatus;
  recall: GuaranteeStatus;
  pfl: GuaranteeStatus;
  /** per-cell tooltip: { pl, recall, pfl } — put found vs required here */
  tooltips?: { pl?: React.ReactNode; recall?: React.ReactNode; pfl?: React.ReactNode };
  style?: React.CSSProperties;
}

const STATE: Record<GuaranteeStatus, { mark: string; fg: string; bg: string }> = {
  COMPLIANT: { mark: "✓", fg: "var(--status-go)", bg: "var(--status-go-bg)" },
  BELOW_MINIMUM: { mark: "✗", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  MISSING: { mark: "–", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  COVERED_NO_AMOUNT: { mark: "≈", fg: "var(--status-amber)", bg: "var(--status-amber-bg)" },
  EXCLUDED: { mark: "✗", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  UNCLEAR: { mark: "?", fg: "var(--status-review)", bg: "var(--status-review-bg)" },
  PRESENT: { mark: "•", fg: "var(--status-neutral)", bg: "var(--status-neutral-bg)" },
};

const LABEL = {
  pl: "Product liability",
  recall: "Product recall",
  pfl: "Pure financial loss",
} as const;

type CellKey = keyof typeof LABEL;

export function StatusMiniGrid({
  pl,
  recall,
  pfl,
  tooltips = {},
  style,
}: StatusMiniGridProps) {
  const cells: Array<[CellKey, GuaranteeStatus]> = [
    ["pl", pl],
    ["recall", recall],
    ["pfl", pfl],
  ];
  return (
    <TooltipProvider>
      <span style={{ display: "inline-flex", gap: 2, ...style }}>
        {cells.map(([key, st]) => {
          const s = STATE[st] ?? STATE.PRESENT;
          const tip =
            tooltips[key] ??
            `${LABEL[key]} · ${String(st ?? "").toLowerCase().replace(/_/g, " ")}`;
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: s.bg,
                    color: s.fg,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {s.mark}
                </span>
              </TooltipTrigger>
              <TooltipContent>{tip}</TooltipContent>
            </Tooltip>
          );
        })}
      </span>
    </TooltipProvider>
  );
}
