"use client";

/**
 * Base primitives for the mid-fi screens (Supplier 360, Requirements,
 * Integrations) — faithful TypeScript ports of the CoverScan design-system
 * base components (design-pack components/base/*.jsx). Styles are the ui_kit
 * inline-token pattern: every colour/space comes from a var(--…) token.
 */

import * as React from "react";
import { ChevronDown } from "lucide-react";

/* ---------------------------------------------------------------- Card --- */

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  padded?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

export function Card({ title, subtitle, actions, padded = true, children, style, bodyStyle }: CardProps) {
  return (
    <section
      style={{
        background: "var(--card)",
        color: "var(--card-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      {(title || actions) && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px var(--card-pad)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <h3 style={{ fontSize: "var(--text-h3)", fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h3>
            )}
            {subtitle && (
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{subtitle}</div>
            )}
          </div>
          {actions && <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>{actions}</div>}
        </header>
      )}
      <div style={{ padding: padded ? "var(--card-pad)" : 0, flex: 1, minWidth: 0, ...bodyStyle }}>{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------- Button --- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid var(--primary)" },
  secondary: { background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" },
  outline: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" },
  ghost: { background: "transparent", color: "var(--foreground)", border: "1px solid transparent" },
  destructive: { background: "var(--destructive)", color: "var(--destructive-foreground)", border: "1px solid var(--destructive)" },
};

const BUTTON_SIZES: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 28, padding: "0 10px", fontSize: 13, gap: 6 },
  md: { height: 32, padding: "0 12px", fontSize: 13, gap: 6 },
  lg: { height: 36, padding: "0 16px", fontSize: 14, gap: 8 },
};

export interface DsButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  title?: string;
}

export function DsButton({
  variant = "outline",
  size = "md",
  disabled,
  iconLeft,
  iconRight,
  children,
  style,
  onClick,
  type = "button",
  title,
}: DsButtonProps) {
  const [hover, setHover] = React.useState(false);
  const v = BUTTON_VARIANTS[variant];
  const s = BUTTON_SIZES[size];
  const hoverStyle: React.CSSProperties | null =
    !disabled && hover
      ? variant === "primary" || variant === "destructive"
        ? { filter: "brightness(1.12)" }
        : { background: "var(--accent)", color: "var(--accent-foreground)" }
      : null;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        borderRadius: "var(--radius-full)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        whiteSpace: "nowrap",
        transition: "background 120ms var(--ease-standard), filter 120ms var(--ease-standard)",
        ...v,
        ...s,
        ...hoverStyle,
        ...style,
      }}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

/* --------------------------------------------------------------- Badge --- */

type BadgeTone = "neutral" | "go" | "amber" | "red" | "review" | "ink";

const BADGE_TONES: Record<BadgeTone, { fg: string; bg: string }> = {
  neutral: { fg: "var(--status-neutral)", bg: "var(--status-neutral-bg)" },
  go: { fg: "var(--status-go)", bg: "var(--status-go-bg)" },
  amber: { fg: "var(--status-amber)", bg: "var(--status-amber-bg)" },
  red: { fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  review: { fg: "var(--status-review)", bg: "var(--status-review-bg)" },
  ink: { fg: "var(--foreground)", bg: "var(--muted)" },
};

export interface DsBadgeProps {
  tone?: BadgeTone;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  mono?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  title?: string;
}

export function DsBadge({
  tone = "neutral",
  variant = "solid",
  size = "sm",
  icon,
  mono,
  children,
  style,
  title,
}: DsBadgeProps) {
  const t = BADGE_TONES[tone];
  const h = size === "lg" ? 28 : size === "md" ? 24 : 20;
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: h,
        padding: size === "lg" ? "0 12px" : "0 8px",
        borderRadius: "var(--radius-full)",
        fontSize: size === "lg" ? 13 : 12,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontVariantNumeric: mono ? "tabular-nums" : undefined,
        color: t.fg,
        background: variant === "solid" ? t.bg : "transparent",
        border: `1px solid ${variant === "outline" ? t.fg : "transparent"}`,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- Input --- */

export interface DsInputProps {
  ariaLabel?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  mono?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  title?: string;
}

export function DsInput({ value, onChange, placeholder, mono, disabled, readOnly, size = "md", style, title, ariaLabel }: DsInputProps) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      title={title}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        background: "var(--card)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontVariantNumeric: mono ? "tabular-nums" : undefined,
        fontSize: size === "sm" ? 13 : 14,
        outline: "none",
        boxShadow: focus ? "var(--focus-ring)" : "none",
        padding: size === "sm" ? "0 8px" : "0 10px",
        height: size === "sm" ? 28 : 32,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    />
  );
}

/* -------------------------------------------------------------- Select --- */

export interface DsSelectProps {
  value?: string;
  options?: Array<string | { value: string; label: string }>;
  onChange?: (value: string) => void;
  label?: string;
  size?: "sm" | "md";
  width?: number | string;
  style?: React.CSSProperties;
  title?: string;
}

export function DsSelect({ value, options = [], onChange, label, size = "md", width, style, title }: DsSelectProps) {
  const h = size === "sm" ? 28 : 32;
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      {label && <span style={{ fontSize: 12, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{label}</span>}
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", width }}>
        <select
          value={value}
          title={title}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            appearance: "none",
            height: h,
            width: width || undefined,
            padding: "0 28px 0 10px",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            color: "var(--foreground)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
          }}
        >
          {options.map((o) => {
            const val = typeof o === "string" ? o : o.value;
            const lab = typeof o === "string" ? o : o.label;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}
        </select>
        <span
          style={{ position: "absolute", right: 8, pointerEvents: "none", color: "var(--muted-foreground)", display: "flex" }}
        >
          <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </span>
    </label>
  );
}

/* ----------------------------------------------------------- DataTable --- */

export interface TableColumn<Row> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "center" | "right";
  mono?: boolean;
  muted?: boolean;
  wrap?: boolean;
  width?: number | string;
  render?: (row: Row) => React.ReactNode;
}

export interface DataTableProps<Row> {
  columns: Array<TableColumn<Row>>;
  rows: Row[];
  dense?: boolean;
  onRowClick?: (row: Row) => void;
  selectedId?: string;
  stickyHeader?: boolean;
  emptyMessage?: string;
  style?: React.CSSProperties;
}

export function DataTable<Row extends { id: string }>({
  columns,
  rows,
  dense,
  onRowClick,
  selectedId,
  stickyHeader = true,
  emptyMessage = "No certificates match. Clear filters or upload one.",
  style,
}: DataTableProps<Row>) {
  const h = dense ? "var(--row-h-dense)" : "var(--row-h)";
  return (
    <div style={{ overflow: "auto", ...style }}>
      <table style={{ width: "100%", fontSize: "var(--text-dense)", tableLayout: "auto" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  position: stickyHeader ? "sticky" : undefined,
                  top: 0,
                  zIndex: 2,
                  textAlign: c.align || "left",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  background: "var(--card)",
                  padding: "0 10px",
                  height: 32,
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid var(--border)",
                  width: c.width,
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)" }}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const selected = selectedId != null && selectedId === r.id;
            return (
              <tr
                key={r.id}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                style={{
                  height: h,
                  cursor: onRowClick ? "pointer" : "default",
                  background: selected ? "var(--accent)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = "transparent";
                }}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "0 10px",
                      borderBottom: "1px solid var(--border)",
                      textAlign: c.align || "left",
                      whiteSpace: c.wrap ? "normal" : "nowrap",
                      fontFamily: c.mono ? "var(--font-mono)" : undefined,
                      fontVariantNumeric: c.mono ? "tabular-nums" : undefined,
                      color: c.muted ? "var(--muted-foreground)" : undefined,
                    }}
                  >
                    {c.render ? c.render(r) : ((r as Record<string, unknown>)[c.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ Progress --- */

export interface DsProgressProps {
  ariaLabel?: string;
  value?: number;
  max?: number;
  tone?: "ink" | "go" | "amber" | "red" | "primary";
  height?: number;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}

export function DsProgress({ value = 0, max = 100, tone = "ink", height = 6, label, ariaLabel, style }: DsProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "ink"
      ? "var(--gap-fill)"
      : tone === "go"
        ? "var(--status-go)"
        : tone === "amber"
          ? "var(--status-amber)"
          : tone === "red"
            ? "var(--status-red)"
            : "var(--primary)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, ...style }}>
      <div
        role="progressbar"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : "progress")}
        aria-valuenow={value}
        aria-valuemax={max}
        style={{ flex: 1, height, background: "var(--gap-track)", borderRadius: height / 2, overflow: "hidden" }}
      >
        <div
          style={{ width: `${pct}%`, height: "100%", background: fill, transition: "width var(--dur-step) var(--ease-out)" }}
        />
      </div>
      {label && (
        <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
