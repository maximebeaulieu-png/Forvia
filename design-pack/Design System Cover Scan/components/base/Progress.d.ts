/**
 * Thin progress track. Ink by default — status colour only when the bar itself is the status.
 */
export interface ProgressProps {
  value: number;
  /** default 100 */
  max?: number;
  tone?: "ink" | "primary" | "go" | "amber" | "red";
  /** px, default 6 */
  height?: number;
  /** trailing mono label, e.g. "78 %" */
  label?: string;
  style?: React.CSSProperties;
}
export declare function Progress(props: ProgressProps): JSX.Element;
