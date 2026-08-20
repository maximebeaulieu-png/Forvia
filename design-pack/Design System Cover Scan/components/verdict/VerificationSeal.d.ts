/**
 * The admissibility checklist drawn as a seal: 8 gates as ticks around a circle, count in the middle.
 * Red ticks are the story — "broker-issued", "no stamp". 96 px in the certificate header, 40 px in tables.
 */
export interface SealGateState {
  state: "pass" | "fail" | "review" | "na";
  /** one-line evidence, e.g. "broker's stamp found p.1, no insurer stamp" */
  note?: string;
}
export interface VerificationSealProps {
  /** keyed by gate id: stamp, signature, insurer, policyNumber, dates, entity, coinsurance, documentType */
  gates: Record<string, SealGateState>;
  /** 96 (header) or 40 (table); default 96 */
  size?: number;
  /** overrides the derived verdict; by default any failing gate means not admissible */
  admissible?: boolean;
  /** click a tick to scroll the document to that evidence */
  onGateClick?: (gateId: string) => void;
  style?: React.CSSProperties;
}
export declare function VerificationSeal(props: VerificationSealProps): JSX.Element;

export interface VerificationSealListProps {
  gates: Record<string, SealGateState>;
  onGateClick?: (gateId: string) => void;
  style?: React.CSSProperties;
}
export declare function VerificationSealList(props: VerificationSealListProps): JSX.Element;

export declare const SEAL_GATES: { id: string; label: string }[];
