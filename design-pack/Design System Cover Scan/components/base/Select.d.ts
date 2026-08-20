/**
 * Dropdown. Used for role switch, saved views, gate severities, reject reasons.
 */
export interface SelectOption { value: string; label: string }
export interface SelectProps {
  value?: string;
  options: (SelectOption | string)[];
  onChange?: (value: string) => void;
  /** inline caption to the left of the control */
  label?: string;
  /** heights 28 / 32 px; default "md" */
  size?: "sm" | "md";
  width?: number | string;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
