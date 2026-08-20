import * as React from "react";
import { Check, Loader, Minus } from "lucide-react";

/** Fixed pipeline order — the 8 steps of the analysis, total must stay under 30 s. */
export const PIPELINE_STEPS: string[] = [
  "Ingest",
  "Text layer / OCR",
  "Classify",
  "Extract (vision)",
  "Normalize & convert",
  "Verify insurer & entity",
  "Score",
  "Explain",
];

export interface ProcessingStepperProps {
  /** defaults to PIPELINE_STEPS */
  steps?: string[];
  /** index of the running step; steps.length means finished */
  current: number;
  /** milliseconds per completed step, same order as steps */
  timings?: number[];
  /** overrides the summed total, in ms */
  totalMs?: number;
  style?: React.CSSProperties;
}

/**
 * The 8-step pipeline with per-step timings and a total that must stay under 30 s.
 * Under prefers-reduced-motion the steps still change state, they just don't animate.
 */
export function ProcessingStepper({
  steps = PIPELINE_STEPS,
  current = 0,
  timings = [],
  totalMs,
  style,
}: ProcessingStepperProps) {
  const total =
    totalMs != null
      ? totalMs
      : timings.slice(0, current).reduce((a, b) => a + (b || 0), 0);
  return (
    <div className="grid gap-0.5" style={style}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const color = done
          ? "var(--status-go)"
          : active
            ? "var(--foreground)"
            : "var(--muted-foreground)";
        return (
          <div
            key={label}
            className="flex h-7 items-center gap-2.5 text-[13px] transition-colors duration-(--dur-step) ease-(--ease-out)"
            style={{ color }}
          >
            <span className="flex w-4 flex-none" style={{ color }}>
              {done ? (
                <Check size={14} />
              ) : active ? (
                <Loader size={14} className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Minus size={14} />
              )}
            </span>
            <span className={active ? "flex-1 font-semibold" : "flex-1 font-normal"}>
              {label}
            </span>
            <span className="cs-num text-xs text-muted-foreground">
              {done && timings[i] != null
                ? `${(timings[i] / 1000).toFixed(1)} s`
                : active
                  ? "…"
                  : ""}
            </span>
          </div>
        );
      })}
      <div className="mt-1.5 flex items-center gap-2.5 border-t border-border pt-2">
        <span className="flex-1 text-xs text-muted-foreground">
          {current >= steps.length
            ? "Analysis complete"
            : `Step ${Math.min(current + 1, steps.length)} of ${steps.length}`}
        </span>
        <span className="cs-num text-sm font-semibold">
          {(total / 1000).toFixed(1)} s
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-xs bg-(--gap-track)">
        <div
          className="h-full bg-(--gap-fill) transition-[width] duration-(--dur-step) ease-(--ease-out)"
          style={{ width: `${(current / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
