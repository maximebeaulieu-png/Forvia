"use client";

import * as React from "react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "grey";
}

/** Full-width pill button of the login screens — primary blue, or grey "Cancel". */
export function AuthButton({ variant = "primary", style, disabled, ...props }: AuthButtonProps) {
  const [hover, setHover] = React.useState(false);
  const primary = variant === "primary";
  return (
    <button
      type={props.type ?? "button"}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 40,
        padding: "0 20px",
        border: "none",
        borderRadius: "var(--radius-full)",
        background: primary ? "var(--primary)" : "var(--muted)",
        color: primary ? "var(--primary-foreground)" : "var(--foreground)",
        font: "inherit",
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        filter: hover && !disabled ? "brightness(0.96)" : "none",
        transition: "filter 120ms var(--ease-standard), opacity 120ms var(--ease-standard)",
        ...style,
      }}
      {...props}
    />
  );
}
