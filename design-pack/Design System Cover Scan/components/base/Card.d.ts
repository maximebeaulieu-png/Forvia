/**
 * Panel with a hairline border and an optional header row. No shadow — elevation is carried by borders.
 */
export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** right-aligned header controls */
  actions?: React.ReactNode;
  /** false when the body is a full-bleed table or chart; default true (16 px) */
  padded?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
