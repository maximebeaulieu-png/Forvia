/**
 * Right-hand side panel over a scrim. Hosts the generated supplier email, the Ariba payload preview and reject reasons.
 * Positioned absolutely — give the containing screen `position: relative`.
 */
export interface SheetProps {
  open?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  /** action row pinned to the bottom */
  footer?: React.ReactNode;
  /** px, default 520 */
  width?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Sheet(props: SheetProps): JSX.Element;
