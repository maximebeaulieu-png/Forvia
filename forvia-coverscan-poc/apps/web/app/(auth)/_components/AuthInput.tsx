"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Password variant with the Eye / EyeOff visibility toggle. */
  password?: boolean;
}

/** Login-screen text input — 10px radius, hairline border, focus ring, optional eye toggle. */
export function AuthInput({ label, password = false, id, style, type, onFocus, onBlur, ...props }: AuthInputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const [focused, setFocused] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  return (
    <div>
      {label != null && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          {...props}
          id={inputId}
          type={password ? (visible ? "text" : "password") : (type ?? "text")}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            width: "100%",
            height: 40,
            padding: password ? "0 42px 0 12px" : "0 12px",
            borderRadius: 10,
            border: `1px solid ${focused ? "var(--ring)" : "var(--input)"}`,
            background: "var(--card)",
            color: "var(--foreground)",
            font: "inherit",
            fontSize: 15,
            outline: "none",
            boxShadow: focused ? "var(--focus-ring)" : "none",
            transition: "border-color 120ms var(--ease-standard)",
            ...style,
          }}
        />
        {password && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              border: "none",
              background: "transparent",
              color: "var(--foreground)",
              cursor: "pointer",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
