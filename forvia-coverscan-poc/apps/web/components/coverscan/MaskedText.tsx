"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

export interface MaskedTextProps {
  value: string;
  /** shapes the mask: n.•••@polyvlies.de · +49 •• •• •• •• · Firstname ••••••; default "email" */
  kind?: "email" | "phone" | "name";
  /** default true */
  mono?: boolean;
  /** called on reveal so the host can write the audit event */
  onReveal?: (value: string) => void;
  style?: React.CSSProperties;
}

function mask(value: string, kind: "email" | "phone" | "name"): string {
  if (!value) return "";
  if (kind === "email") {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}.•••@${domain || ""}`;
  }
  if (kind === "phone") {
    return value.slice(0, 4) + " •• •• •• ••".slice(0, Math.max(0, value.length - 4));
  }
  const parts = value.trim().split(/\s+/);
  return parts
    .map((p, i) => (i === parts.length - 1 ? "•".repeat(Math.min(p.length, 6)) : p))
    .join(" ");
}

/** Personal data, masked by default with a reveal affordance. Revealing is logged. */
export function MaskedText({
  value,
  kind = "email",
  mono = true,
  onReveal,
  style,
}: MaskedTextProps) {
  const [revealed, setRevealed] = React.useState(false);
  const toggle = () => {
    if (!revealed) onReveal?.(value);
    setRevealed((r) => !r);
  };
  return (
    <span className="inline-flex items-center gap-1.5" style={style}>
      <span
        className={mono ? "font-mono text-[13px]" : "font-sans text-[13px]"}
        style={{ letterSpacing: revealed ? 0 : ".02em" }}
      >
        {revealed ? value : mask(value, kind)}
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={revealed ? "Hide personal data" : "Reveal personal data"}
        title={revealed ? "Hide" : "Reveal (logged)"}
        className="flex cursor-pointer border-0 bg-transparent p-0 text-muted-foreground"
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </span>
  );
}
