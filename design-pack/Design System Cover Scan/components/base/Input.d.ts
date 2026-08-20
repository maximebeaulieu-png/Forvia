/**
 * Text field. Set `multiline` for the generated supplier email; set `mono` for amounts and policy numbers.
 */
export interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  /** renders a textarea */
  multiline?: boolean;
  /** textarea rows; default 6 */
  rows?: number;
  /** tabular mono — use for every editable figure */
  mono?: boolean;
  /** leading icon, e.g. <Icon name="search" size={14} /> */
  iconLeft?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  /** heights 28 / 32 px; default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
