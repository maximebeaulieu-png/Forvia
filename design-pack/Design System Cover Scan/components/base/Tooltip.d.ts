/**
 * Hover/focus tooltip. Carries provenance — FX rate and date, source page and quote, score breakdown.
 */
export interface TooltipProps {
  content?: React.ReactNode;
  /** default "top" */
  side?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
