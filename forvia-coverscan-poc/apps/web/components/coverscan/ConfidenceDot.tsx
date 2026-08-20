"use client";

import type * as React from "react";
import { confidenceGlyph } from "@/lib/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Extraction confidence: ● ≥ 0.85 · ◐ 0.6–0.85 · ○ < 0.6.
 * Shape carries the level, not colour — the dot stays ink so it never competes
 * with status. Tooltip carries the source page and verbatim quote.
 */
export interface ConfidenceDotProps {
  /** 0–1 */
  value: number;
  /** px, default 10 */
  size?: number;
  /** append the percentage next to the dot — used in the accuracy column */
  showValue?: boolean;
  /** source page number */
  page?: number;
  /** verbatim quote, in the source language, never translated */
  quote?: string;
  style?: React.CSSProperties;
}

export function ConfidenceDot({
  value,
  size = 10,
  showValue,
  page,
  quote,
  style,
}: ConfidenceDotProps) {
  const glyph = confidenceGlyph(value);
  const color = glyph === "●" ? "var(--foreground)" : "var(--muted-foreground)";
  const pct = Math.round(value * 100);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              ...style,
            }}
          >
            <span
              aria-label={`Confidence ${pct} %`}
              style={{ fontSize: size, lineHeight: 1, color }}
            >
              {glyph}
            </span>
            {showValue && (
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted-foreground)",
                }}
              >
                {pct} %
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {page != null || quote ? (
            <>
              {page != null && <>Page {page}</>}
              {page != null && quote ? " · " : ""}
              {quote && <em>« {quote} »</em>}
              <br />
              Confidence {pct} %
            </>
          ) : (
            <>Confidence {pct} %</>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
