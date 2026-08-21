"use client";

import * as React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export interface RequirementsProfile {
  id: string;
  /** e.g. "GPTC default", "Expert (R. Mekouar)" */
  label: string;
  /** version stamp recorded with every analysis, e.g. "v3" */
  version?: string;
  /** one-line description of what differs */
  note?: string;
  /** Sprint 0: the Expert profile is not selectable yet (client-side rescoring lands in Sprint 1) */
  disabled?: boolean;
}

export interface ProfileSwitcherProps {
  value: string;
  profiles: RequirementsProfile[];
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}

/** Sprint 0: recomputation ships in Sprint 1, so the Expert profile stays disabled. */
const EXPERT_DISABLED_TITLE = "Rescoring arrives in Sprint 1";

/**
 * Header control for the active requirements profile. Changing it rescores client-side and recolours
 * table rows over 150 ms — the demo's configurability moment.
 */
export function ProfileSwitcher({
  value,
  profiles = [],
  onChange,
  style,
}: ProfileSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const active = profiles.find((p) => p.id === value) || profiles[0];
  return (
    <div className="relative" style={style}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-(--radius) border border-border bg-card px-2.5 text-[13px] text-foreground"
      >
        <SlidersHorizontal size={14} className="text-muted-foreground" />
        <span className="text-muted-foreground">Profile</span>
        <span className="font-medium">{active?.label}</span>
        {active?.version && <span className="cs-code">{active.version}</span>}
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 z-50 min-w-[280px] rounded-(--radius) border border-border bg-popover p-1 shadow-(--shadow-popover)"
        >
          {profiles.map((p) => {
            const disabled = p.disabled ?? p.id === "expert";
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={p.id === value}
                disabled={disabled}
                title={disabled ? EXPERT_DISABLED_TITLE : undefined}
                onClick={() => {
                  if (disabled) return;
                  onChange?.(p.id);
                  setOpen(false);
                }}
                className={`flex w-full flex-col items-start gap-0.5 rounded-(--radius-sm) border-0 px-2.5 py-2 text-left ${
                  p.id === value ? "bg-accent" : "bg-transparent"
                } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                  {p.label}
                  {p.version && <span className="cs-code">{p.version}</span>}
                </span>
                {p.note && (
                  <span className="text-xs text-muted-foreground">{p.note}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
