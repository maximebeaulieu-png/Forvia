import React from "react";
import { Icon } from "../base/Icon.jsx";

function mask(value, kind) {
  if (!value) return "";
  if (kind === "email") {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}.•••@${domain || ""}`;
  }
  if (kind === "phone") return value.slice(0, 4) + " •• •• •• ••".slice(0, Math.max(0, value.length - 4));
  const parts = value.trim().split(/\s+/);
  return parts.map((p, i) => i === parts.length - 1 ? "•".repeat(Math.min(p.length, 6)) : p).join(" ");
}

export function MaskedText({ value, kind = "email", mono = true, onReveal, style }) {
  const [revealed, setRevealed] = React.useState(false);
  const toggle = () => { if (!revealed) onReveal && onReveal(value); setRevealed(r => !r); };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...style }}>
      <span style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: 13, letterSpacing: revealed ? 0 : ".02em"
      }}>{revealed ? value : mask(value, kind)}</span>
      <button onClick={toggle} aria-label={revealed ? "Hide personal data" : "Reveal personal data"}
        title={revealed ? "Hide" : "Reveal (logged)"}
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 0, display: "flex" }}>
        <Icon name={revealed ? "eye-off" : "eye"} size={13} />
      </button>
    </span>
  );
}
