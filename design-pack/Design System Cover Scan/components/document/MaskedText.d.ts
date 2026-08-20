/**
 * Personal data, masked by default with a reveal affordance. Revealing is logged.
 */
export interface MaskedTextProps {
  value: string;
  /** shapes the mask: n.•••@polyvlies.de · +49 •• •• •• •• · Firstname ••••••; default "email" */
  kind?: "email" | "phone" | "name";
  /** default true */
  mono?: boolean;
  /** called on reveal so the host can write the audit event */
  onReveal?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function MaskedText(props: MaskedTextProps): JSX.Element;
