/**
 * Action button. Verbs only, sentence case ("Request changes", not "REQUEST CHANGES").
 */
export interface ButtonProps {
  /** default "outline" */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  /** heights 28 / 32 / 36 px; default "md" */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
