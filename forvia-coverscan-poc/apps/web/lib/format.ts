/**
 * Display formatters for amounts, dates and confidence.
 *
 * Amounts always enter as integer minor units (cents) + ISO currency;
 * these helpers are the only place they become display strings.
 */

const MINOR_PER_MAJOR = 100;
const MS_PER_DAY = 86_400_000;

const wholeNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** `formatEur(2000000000)` → `"€20,000,000"` (no decimals, en-US grouping). */
export function formatEur(minor: number): string {
  return `€${wholeNumber.format(minor / MINOR_PER_MAJOR)}`;
}

/** `formatAmount(500000000, "USD")` → `"USD 5,000,000"`. */
export function formatAmount(minor: number, ccy: string): string {
  return `${ccy} ${wholeNumber.format(minor / MINOR_PER_MAJOR)}`;
}

/** `formatCompactEur(2000000000)` → `"€20M"`; `formatCompactEur(30500000)` → `"€305k"`. */
export function formatCompactEur(minor: number): string {
  const major = minor / MINOR_PER_MAJOR;
  const abs = Math.abs(major);
  if (abs >= 1_000_000) return `€${trimDecimal(major / 1_000_000)}M`;
  if (abs >= 1_000) return `€${trimDecimal(major / 1_000)}k`;
  return `€${wholeNumber.format(major)}`;
}

/** Rounds to one decimal and drops a trailing `.0`. */
function trimDecimal(value: number): string {
  return String(Math.round(value * 10) / 10);
}

/**
 * Found coverage as an integer percentage of the requirement,
 * clamped to 0–100. `null` (no amount found) → 0.
 */
export function gapPercent(
  foundMinor: number | null,
  requiredMinor: number,
): number {
  if (foundMinor === null || requiredMinor <= 0) return 0;
  const percent = Math.round((foundMinor / requiredMinor) * 100);
  return Math.min(100, Math.max(0, percent));
}

/**
 * Calendar-day difference between an ISO date and the reference date.
 * Negative when the date is in the past.
 */
export function daysLeft(dateIso: string, referenceIso: string): number {
  return Math.round((toUtcMidnight(dateIso) - toUtcMidnight(referenceIso)) / MS_PER_DAY);
}

function toUtcMidnight(iso: string): number {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(year!, month! - 1, day!);
}

/** Confidence glyph: `●` ≥ 0.85, `◐` ≥ 0.6, `○` below. */
export function confidenceGlyph(c: number): "●" | "◐" | "○" {
  if (c >= 0.85) return "●";
  if (c >= 0.6) return "◐";
  return "○";
}
