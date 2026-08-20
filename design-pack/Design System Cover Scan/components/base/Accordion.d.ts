/**
 * Expandable list. Backs FindingsList and the extracted-field groups.
 */
export interface AccordionItem {
  id?: string;
  title: React.ReactNode;
  /** severity chip or icon before the title */
  leading?: React.ReactNode;
  /** rule id, page reference, confidence dot */
  trailing?: React.ReactNode;
  content?: React.ReactNode;
}
export interface AccordionProps {
  items: AccordionItem[];
  /** ids expanded on mount — open BLOCK findings by default */
  defaultOpen?: string[];
  style?: React.CSSProperties;
}
export declare function Accordion(props: AccordionProps): JSX.Element;
