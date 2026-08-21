"use client";

import * as React from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

/**
 * 6-box pin code input — auto-advance on digit entry, backspace steps back,
 * pasting a 6-digit code fills every box. Accessible: each box is labelled
 * "Chiffre N du code".
 */
export function PinInput({ value, onChange, length = 6 }: PinInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const focusBox = (index: number) => {
    refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 0) {
      // Cleared (backspace inside a filled box) — drop the char at this position.
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }
    if (digits.length > 1) {
      // Multi-digit entry into one box (paste) — distribute from this position.
      const next = (value.slice(0, index) + digits).slice(0, length);
      onChange(next);
      focusBox(next.length);
      return;
    }
    const position = Math.min(index, value.length);
    const next = (value.slice(0, position) + digits + value.slice(position + 1)).slice(0, length);
    onChange(next);
    focusBox(position + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && (value[index] ?? "") === "" && index > 0) {
      e.preventDefault();
      onChange(value.slice(0, index - 1) + value.slice(index));
      focusBox(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (digits.length === 0) return;
    e.preventDefault();
    const next = digits.slice(0, length);
    onChange(next);
    focusBox(next.length);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(-1)}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Chiffre ${i + 1} du code`}
          style={{
            flex: 1,
            minWidth: 0,
            height: 40,
            textAlign: "center",
            borderRadius: 8,
            border: `1px solid ${focusedIndex === i ? "var(--ring)" : "var(--input)"}`,
            background: "var(--card)",
            color: "var(--foreground)",
            font: "inherit",
            fontSize: 16,
            fontWeight: 600,
            outline: "none",
            boxShadow: focusedIndex === i ? "var(--focus-ring)" : "none",
          }}
        />
      ))}
    </div>
  );
}
