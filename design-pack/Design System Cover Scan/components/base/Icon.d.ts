/**
 * Inline lucide icon, loaded from `assets/icons/`. Inherits currentColor.
 */
export interface IconProps {
  /** lucide-static file name without extension, e.g. "shield-check" */
  name: string;
  /** px, default 16 */
  size?: number;
  /** default 1.75 */
  strokeWidth?: number;
  /** default "currentColor" */
  color?: string;
  /** override the icon directory; defaults to window.__CS_ICON_BASE__ or "../../assets/icons" */
  basePath?: string;
  /** accessible name; omit for decorative icons */
  title?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
