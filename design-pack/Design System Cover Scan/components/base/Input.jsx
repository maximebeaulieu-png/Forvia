import React from "react";

export function Input({ value, onChange, placeholder, multiline, rows = 6, mono, iconLeft, disabled, readOnly, size = "md", style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const base = {
    width: "100%", background: "var(--card)", color: "var(--foreground)",
    border: "1px solid var(--border)", borderRadius: "var(--radius)",
    fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
    fontVariantNumeric: mono ? "tabular-nums" : undefined,
    fontSize: size === "sm" ? 13 : 14, outline: "none",
    boxShadow: focus ? "var(--focus-ring)" : "none",
    padding: multiline ? "8px 10px" : size === "sm" ? "0 8px" : "0 10px",
    height: multiline ? undefined : size === "sm" ? 28 : 32,
    lineHeight: multiline ? 1.5 : undefined,
    resize: multiline ? "vertical" : undefined,
    opacity: disabled ? 0.5 : 1
  };
  const shared = { value, onChange, placeholder, disabled, readOnly, onFocus: () => setFocus(true), onBlur: () => setFocus(false) };
  if (multiline) return <textarea rows={rows} {...shared} style={{ ...base, ...style }} {...rest} />;
  if (!iconLeft) return <input {...shared} style={{ ...base, ...style }} {...rest} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, ...base, padding: "0 10px", boxShadow: focus ? "var(--focus-ring)" : "none", ...style }}>
      <span style={{ color: "var(--muted-foreground)", display: "flex" }}>{iconLeft}</span>
      <input {...shared} style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "inherit", font: "inherit", height: "100%" }} {...rest} />
    </div>
  );
}
