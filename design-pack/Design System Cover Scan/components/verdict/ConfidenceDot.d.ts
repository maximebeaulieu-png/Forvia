/**
 * Extraction confidence: ● ≥ 0.85 · ◐ 0.6–0.85 · ○ < 0.6. Tooltip carries the source page and quote.
 */
export interface ConfidenceDotProps {
  /** 0–1 */
  value: number;
  /** px, default 10 */
  size?: number;
  /** append the percentage next to the dot — used in the accuracy column */
  showValue?: boolean;
  /** source page number */
  page?: number;
  /** verbatim quote, in the source language, never translated */
  quote?: string;
  style?: React.CSSProperties;
}
export declare function ConfidenceDot(props: ConfidenceDotProps): JSX.Element;
