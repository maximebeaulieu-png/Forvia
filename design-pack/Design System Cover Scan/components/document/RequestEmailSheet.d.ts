/**
 * The generated supplier email. Editable, copyable, downloadable as .eml — never sent from the POC.
 * `buildRequestEmail` renders the approved template; only findings feed the bracketed parts.
 */
export interface RequestEmailSheetProps {
  open?: boolean;
  onClose?: () => void;
  /** the full email text, including the Subject line */
  email?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCopy?: () => void;
  onDownload?: () => void;
  /** shown in the subtitle */
  supplier?: string;
  style?: React.CSSProperties;
}
export declare function RequestEmailSheet(props: RequestEmailSheetProps): JSX.Element;

export interface BuildRequestEmailInput {
  supplier: string;
  contact?: string;
  policyNumber?: string;
  insurer?: string;
  validUntil?: string;
  /** issuer, signature, stamp, contracting entity */
  formalPoints?: string[];
  /** one line per guarantee gap, with the required level and what was found */
  coveragePoints?: string[];
  dueDate?: string;
  buyer?: string;
}
export declare function buildRequestEmail(input: BuildRequestEmailInput): string;
/** Same function under a capitalized name — use this when reading from the window namespace. */
export declare const BuildRequestEmail: typeof buildRequestEmail;
