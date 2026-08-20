import type * as React from "react";
import {
  Eye,
  FileQuestion,
  Loader,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react";

/**
 * The certificate verdict. Icon + word always — status is never colour-only.
 * Labels are locked: Compliant · Request changes · Not admissible · resubmit ·
 * Not admissible · Needs review · Processing · Pending. Never "Rejected" —
 * rejection is a human action and lives on the Reject button.
 */
export interface DecisionChipProps {
  /** FORMAL_DEFECT renders outlined (paperwork); STRUCTURAL renders solid (real risk) */
  decision:
    | "GO"
    | "REQUEST_CHANGES"
    | "FORMAL_DEFECT"
    | "STRUCTURAL"
    | "NEEDS_REVIEW"
    | "PROCESSING"
    | "PENDING";
  /** 20 / 24 / 28 px — "lg" in the screen-3 header, "sm" in tables */
  size?: "sm" | "md" | "lg";
  /** override the label only when the spec explicitly requires it */
  label?: string;
  style?: React.CSSProperties;
}

type Tone = "go" | "amber" | "red" | "review" | "neutral";
type Variant = "solid" | "outline" | "dashed";

const MAP: Record<
  DecisionChipProps["decision"],
  { label: string; tone: Tone; icon: LucideIcon; variant: Variant }
> = {
  GO: { label: "Compliant", tone: "go", icon: ShieldCheck, variant: "solid" },
  REQUEST_CHANGES: {
    label: "Request changes",
    tone: "amber",
    icon: ShieldAlert,
    variant: "solid",
  },
  FORMAL_DEFECT: {
    label: "Not admissible · resubmit",
    tone: "red",
    icon: ShieldX,
    variant: "outline",
  },
  STRUCTURAL: {
    label: "Not admissible",
    tone: "red",
    icon: ShieldX,
    variant: "solid",
  },
  NEEDS_REVIEW: {
    label: "Needs review",
    tone: "review",
    icon: Eye,
    variant: "solid",
  },
  PROCESSING: {
    label: "Processing",
    tone: "neutral",
    icon: Loader,
    variant: "solid",
  },
  PENDING: {
    label: "Pending",
    tone: "neutral",
    icon: FileQuestion,
    variant: "dashed",
  },
};

const TONES: Record<Tone, [fg: string, bg: string]> = {
  go: ["var(--status-go)", "var(--status-go-bg)"],
  amber: ["var(--status-amber)", "var(--status-amber-bg)"],
  red: ["var(--status-red)", "var(--status-red-bg)"],
  review: ["var(--status-review)", "var(--status-review-bg)"],
  neutral: ["var(--status-neutral)", "var(--status-neutral-bg)"],
};

const SIZES = {
  sm: { h: 20, fs: 12, ic: 12, pad: "0 8px" },
  md: { h: 24, fs: 13, ic: 13, pad: "0 10px" },
  lg: { h: 28, fs: 14, ic: 15, pad: "0 12px" },
} as const;

export function DecisionChip({
  decision,
  size = "md",
  label,
  style,
}: DecisionChipProps) {
  const m = MAP[decision] ?? MAP.GO;
  const [fg, bg] = TONES[m.tone];
  const s = SIZES[size] ?? SIZES.md;
  const outline = m.variant === "outline";
  const dashed = m.variant === "dashed";
  const IconGlyph = m.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: s.h,
        padding: s.pad,
        borderRadius: "var(--radius-full)",
        fontSize: s.fs,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: fg,
        background: outline || dashed ? "transparent" : bg,
        border: `1px ${dashed ? "dashed" : "solid"} ${outline || dashed ? fg : "transparent"}`,
        ...style,
      }}
    >
      <IconGlyph size={s.ic} aria-hidden="true" />
      {label || m.label}
    </span>
  );
}
