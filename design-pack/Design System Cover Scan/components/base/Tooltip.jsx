import React from "react";

export function Tooltip({ content, side = "top", children, style }) {
  const [open, setOpen] = React.useState(false);
  const pos = side === "top"
    ? { bottom: "calc(100% + 6px)", left: 0 }
    : side === "bottom" ? { top: "calc(100% + 6px)", left: 0 }
    : side === "left" ? { right: "calc(100% + 6px)", top: 0 }
    : { left: "calc(100% + 6px)", top: 0 };
  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} tabIndex={0}>
      {children}
      {open && content && (
        <span role="tooltip" style={{
          position: "absolute", zIndex: 40, ...pos, maxWidth: 320, width: "max-content",
          background: "var(--popover)", color: "var(--popover-foreground)",
          border: "1px solid var(--border)", borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-popover)", padding: "8px 10px",
          fontSize: 12, lineHeight: 1.45, textAlign: "left", whiteSpace: "normal", pointerEvents: "none"
        }}>{content}</span>
      )}
    </span>
  );
}
