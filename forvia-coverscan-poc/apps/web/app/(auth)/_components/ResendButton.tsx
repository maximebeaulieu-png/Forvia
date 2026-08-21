"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";

interface ResendButtonProps {
  /** Countdown length in seconds (mockups: 40s). */
  initialSeconds?: number;
  onResend?: () => void;
}

/**
 * "Renvoyer le code" grey pill — disabled while the countdown line
 * "Renvoyer un mail dans  Xs" runs from 40s to 0, then active again.
 */
export function ResendButton({ initialSeconds = 40, onResend }: ResendButtonProps) {
  const [seconds, setSeconds] = React.useState(initialSeconds);
  const running = seconds > 0;

  React.useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [running]);

  return (
    <div>
      <button
        type="button"
        disabled={running}
        onClick={() => {
          onResend?.();
          setSeconds(initialSeconds);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          height: 40,
          padding: "0 20px",
          border: "none",
          borderRadius: "var(--radius-full)",
          background: "var(--muted)",
          color: running ? "var(--muted-foreground)" : "var(--foreground)",
          font: "inherit",
          fontSize: 14,
          fontWeight: 600,
          cursor: running ? "default" : "pointer",
        }}
      >
        <RefreshCcw size={15} />
        Renvoyer le code
      </button>
      {running && (
        <p
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            margin: "16px 0 0 8px",
            fontSize: 14,
            color: "var(--foreground)",
          }}
        >
          <span>Renvoyer un mail dans</span>
          <strong style={{ fontWeight: 700 }}>{seconds}s</strong>
        </p>
      )}
    </div>
  );
}
