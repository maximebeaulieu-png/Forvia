/**
 * Risk score 0–100 as a broad open arc with rounded caps — big and graphic. On a not-admissible
 * certificate the arc is greyed on a dashed track and labelled "Provisional" — visibly secondary, never hidden.
 */
export interface ScoreRingProps {
  value: number;
  /** px, default 104 (summary hero); use ~64 in side panels */
  size?: number;
  /** true when the decision is NO_GO — greys the ring and swaps in the provisional caption */
  provisional?: boolean;
  /** caption under the ring; default "Risk score" */
  label?: string;
  /** opens the breakdown popover (points per guarantee, penalties) */
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function ScoreRing(props: ScoreRingProps): JSX.Element;
