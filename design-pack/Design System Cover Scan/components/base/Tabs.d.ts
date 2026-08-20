/**
 * Underlined tab bar with a scrollable panel below. Keyboard focusable.
 */
export interface TabItem { id: string; label: string; count?: number; icon?: string }
export interface TabsProps {
  tabs: (TabItem | string)[];
  value?: string;
  onChange?: (id: string) => void;
  /** controls pinned to the right of the tab bar */
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
