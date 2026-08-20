/**
 * The certificate verdict. Icon + word always — status is never colour-only.
 * Labels are fixed: Compliant · Request changes · Not admissible · resubmit · Not admissible · Needs review.
 */
export interface DecisionChipProps {
  /** FORMAL_DEFECT renders outlined (paperwork); STRUCTURAL renders solid (real risk) */
  decision: "GO" | "REQUEST_CHANGES" | "FORMAL_DEFECT" | "STRUCTURAL" | "NEEDS_REVIEW" | "PROCESSING" | "PENDING";
  /** 20 / 24 / 28 px — "lg" in the screen-3 header, "sm" in tables */
  size?: "sm" | "md" | "lg";
  /** override the label only when the spec explicitly requires it */
  label?: string;
  style?: React.CSSProperties;
}
export declare function DecisionChip(props: DecisionChipProps): JSX.Element;
