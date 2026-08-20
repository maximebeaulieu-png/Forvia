/**
 * Small label. Status tones mirror the colour tokens; always pass an icon when the badge carries a status.
 */
export interface BadgeProps {
  /** maps to --status-* tokens */
  tone?: "neutral" | "go" | "amber" | "red" | "review" | "ink";
  /** "outline" is reserved for NO_GO / FORMAL_DEFECT; default "solid" */
  variant?: "solid" | "outline";
  /** heights 20 / 24 / 28 px; default "sm" */
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  /** set for policy numbers, rule ids, ratings — tabular mono */
  mono?: boolean;
  title?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
