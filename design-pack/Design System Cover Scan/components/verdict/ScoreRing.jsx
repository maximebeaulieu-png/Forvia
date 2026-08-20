import React from "react";

/**
 * Risk score 0–100, drawn as a broad open arc (240°) with rounded caps — big, graphic, ink-first.
 * Provisional (not admissible): grey, dashed track, explicit label.
 */
export function ScoreRing({ value = 0, size = 104, provisional, label = "Risk score", onClick, style }) {
  const stroke = Math.max(7, Math.round(size / 11));
  const r = (size - stroke) / 2;
  const SWEEP = 240;
  const start = 90 + (360 - SWEEP) / 2; // gap opens at the bottom
  const polar = a => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [size / 2 + r * Math.cos(rad), size / 2 + r * Math.sin(rad)];
  };
  const arc = (a0, a1) => {
    const [x0, y0] = polar(a0), [x1, y1] = polar(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const ink = provisional ? "var(--muted-foreground)" : "var(--foreground)";
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      role="img" aria-label={`${label} ${value} of 100${provisional ? ", provisional" : ""}`}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", cursor: onClick ? "pointer" : "default", ...style }}>
      <svg width={size} height={size * 0.92} viewBox={`0 0 ${size} ${size * 0.92}`} style={{ overflow: "visible" }}>
        <path d={arc(start, start + SWEEP)} fill="none" stroke="var(--gap-track)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={provisional ? "0.5 7" : undefined} />
        {pct > 0 && (
          <path d={arc(start, start + SWEEP * pct)} fill="none" stroke={ink} strokeWidth={stroke}
            strokeLinecap="round" opacity={provisional ? 0.5 : 1}
            style={{ transition: "opacity 150ms var(--ease-standard)" }} />
        )}
        <text x={size / 2} y={size / 2 + size * 0.02} textAnchor="middle"
          fontFamily="var(--font-mono)" fontWeight="600" fontSize={size * 0.30}
          fill={ink} style={{ letterSpacing: "-0.03em" }}>{value}</text>
        <text x={size / 2} y={size / 2 + size * 0.17} textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize={size * 0.095} fill="var(--muted-foreground)">/ 100</text>
      </svg>
      <div style={{
        marginTop: 2, fontSize: 11, fontWeight: provisional ? 400 : 500,
        color: onClick && hover ? "var(--primary)" : "var(--muted-foreground)",
        textAlign: "center", maxWidth: size + 70, lineHeight: 1.35,
        transition: "color 120ms var(--ease-standard)"
      }}>
        {provisional ? "Provisional — shown for information" : label}{onClick && !provisional ? " ›" : ""}
      </div>
    </div>
  );
}
