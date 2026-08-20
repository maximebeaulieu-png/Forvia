"use client";

import * as React from "react";
import { icons } from "lucide-react";

export type KpiTone = "ink" | "go" | "amber" | "red" | "review";

export interface KpiCardProps {
  label: React.ReactNode;
  /** pre-formatted — "9 / 150", "64", "23" */
  value: React.ReactNode;
  /** small mono suffix, e.g. "%" */
  unit?: string;
  /** the interpretation line, small and muted — intermediate info lives here */
  sub?: React.ReactNode;
  /** tints the icon tile; keep "ink" unless the number IS a status count */
  tone?: KpiTone;
  /** lucide icon name shown in the tile, e.g. "shield-check" */
  icon?: string;
  /** small trend chip, e.g. "+2" or "−3 %" */
  delta?: string;
  /** tint of the delta chip */
  deltaTone?: KpiTone;
  /** optional <ScoreRing> on the right */
  ring?: React.ReactNode;
  /** clicking a KPI filters the certificates table */
  onClick?: () => void;
  style?: React.CSSProperties;
}

const TILE: Record<KpiTone, [string, string]> = {
  ink: ["var(--secondary)", "var(--primary)"],
  go: ["var(--status-go-bg)", "var(--status-go)"],
  amber: ["var(--status-amber-bg)", "var(--status-amber)"],
  red: ["var(--status-red-bg)", "var(--status-red)"],
  review: ["var(--status-review-bg)", "var(--status-review)"],
};

function lucideByName(name: string): React.ComponentType<{ size?: number }> | undefined {
  const pascal = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (icons as Record<string, React.ComponentType<{ size?: number }>>)[pascal];
}

/**
 * Portfolio KPI: tinted icon tile, big mono number, label, one small interpretation line.
 * The number stays ink; the tile and the delta chip carry the tone.
 */
export function KpiCard({
  label,
  value,
  unit,
  sub,
  tone = "ink",
  icon,
  delta,
  deltaTone,
  ring,
  onClick,
  style,
}: KpiCardProps) {
  const [tileBg, tileFg] = TILE[tone] ?? TILE.ink;
  const [deltaBg, deltaFg] = TILE[deltaTone ?? "ink"] ?? TILE.ink;
  const [hover, setHover] = React.useState(false);
  const TileIcon = icon ? lucideByName(icon) : undefined;

  return (
    <section
      data-slot="kpi-card"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: hover && onClick ? "var(--shadow-popover)" : "var(--shadow-sm)",
        transition: "box-shadow var(--dur-recolour) var(--ease-standard)",
        padding: "var(--card-pad)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {TileIcon && (
          <span
            data-slot="kpi-tile"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: tileBg,
              color: tileFg,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 36px",
            }}
          >
            <TileIcon size={17} />
          </span>
        )}
        <span style={{ flex: 1 }} />
        {delta && (
          <span
            data-slot="kpi-delta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              height: 22,
              padding: "0 9px",
              borderRadius: "var(--radius-full)",
              background: deltaBg,
              color: deltaFg,
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {delta}
          </span>
        )}
        {ring}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums",
              fontWeight: 600,
              fontSize: "var(--text-kpi)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                color: "var(--muted-foreground)",
              }}
            >
              {unit}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8 }}>{label}</div>
        {sub && (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginTop: 3,
              lineHeight: 1.35,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </section>
  );
}
