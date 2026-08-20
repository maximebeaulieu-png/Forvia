/**
 * Three 16-px cells — product liability / product recall / pure financial loss — for table rows.
 * Hover shows found vs required.
 */
export type GuaranteeStatus =
  | "COMPLIANT" | "BELOW_MINIMUM" | "MISSING" | "COVERED_NO_AMOUNT" | "EXCLUDED" | "UNCLEAR" | "PRESENT";

export interface StatusMiniGridProps {
  pl: GuaranteeStatus;
  recall: GuaranteeStatus;
  pfl: GuaranteeStatus;
  /** per-cell tooltip: { pl, recall, pfl } — put found vs required here */
  tooltips?: { pl?: React.ReactNode; recall?: React.ReactNode; pfl?: React.ReactNode };
  style?: React.CSSProperties;
}
export declare function StatusMiniGrid(props: StatusMiniGridProps): JSX.Element;
