import { z } from "zod";

/** Rules-engine outcome. NO_GO is refined by NoGoSubtype. */
export const Decision = z.enum(["GO", "REQUEST_CHANGES", "NO_GO"]);
export type DecisionT = z.infer<typeof Decision>;

/** Why a certificate is not admissible: fixable formality vs structural refusal. */
export const NoGoSubtype = z.enum(["FORMAL_DEFECT", "STRUCTURAL"]);
export type NoGoSubtypeT = z.infer<typeof NoGoSubtype>;

/** What the UI renders — decision merged with subtype, review and pipeline states. */
export const DisplayStatus = z.enum([
  "GO",
  "REQUEST_CHANGES",
  "FORMAL_DEFECT",
  "STRUCTURAL",
  "NEEDS_REVIEW",
  "PROCESSING",
  "PENDING",
]);
export type DisplayStatusT = z.infer<typeof DisplayStatus>;

/** Compliance of a single guarantee line against the requirements profile. */
export const GuaranteeStatus = z.enum([
  "COMPLIANT",
  "BELOW_MINIMUM",
  "MISSING",
  "COVERED_NO_AMOUNT",
  "EXCLUDED",
  "UNCLEAR",
]);
export type GuaranteeStatusT = z.infer<typeof GuaranteeStatus>;

/** Finding severity, ordered BLOCK > CRITICAL > WARNING > INFO. */
export const Severity = z.enum(["BLOCK", "CRITICAL", "WARNING", "INFO"]);
export type SeverityT = z.infer<typeof Severity>;

/** State of one verification gate as shown in the VerificationSeal. */
export const GateState = z.enum(["pass", "fail", "review", "na"]);
export type GateStateT = z.infer<typeof GateState>;
