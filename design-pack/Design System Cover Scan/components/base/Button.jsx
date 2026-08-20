import React from "react";

const VARIANTS = {
  primary:   { background: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid var(--primary)" },
  secondary: { background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" },
  outline:   { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" },
  ghost:     { background: "transparent", color: "var(--foreground)", border: "1px solid transparent" },
  destructive:{ background: "var(--destructive)", color: "var(--destructive-foreground)", border: "1px solid var(--destructive)" }
};
const SIZES = {
  sm: { height: 28, padding: "0 10px", fontSize: 13, gap: 6 },
  md: { height: 32, padding: "0 12px", fontSize: 13, gap: 6 },
  lg: { height: 36, padding: "0 16px", fontSize: 14, gap: 8 }
};

export function Button({ variant = "outline", size = "md", disabled, iconLeft, iconRight, children, style, onClick, type = "button", title, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.outline;
  const s = SIZES[size] || SIZES.md;
  const hoverStyle = !disabled && hover
    ? (variant === "primary" || variant === "destructive"
        ? { filter: "brightness(1.12)" }
        : { background: "var(--accent)", color: "var(--accent-foreground)" })
    : null;
  return (
    <button type={type} disabled={disabled} onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-sans)", fontWeight: 500, borderRadius: "var(--radius-full)",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
        whiteSpace: "nowrap", transition: "background 120ms var(--ease-standard), filter 120ms var(--ease-standard)",
        ...v, ...s, ...hoverStyle, ...style
      }} {...rest}>
      {iconLeft}{children}{iconRight}
    </button>
  );
}
