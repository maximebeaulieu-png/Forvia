import { z } from "zod";
import {
  Decision,
  DisplayStatus,
  GateState,
  GuaranteeStatus,
  NoGoSubtype,
} from "./enums.js";
import type { DecisionT, DisplayStatusT, NoGoSubtypeT } from "./enums.js";

/**
 * Guarantee line status as emitted by extraction: the compliance enum plus
 * "PRESENT" (line found and covered, but not measured against a requirement).
 */
const ExtractedGuaranteeStatus = z.union([GuaranteeStatus, z.literal("PRESENT")]);

/** One guarantee line extracted from the certificate (expected.json `guarantees[]`). */
const Guarantee = z
  .object({
    code: z.string(),
    labelOriginal: z.string().nullable().optional(),
    page: z.number().nullable().optional(),
    amountOriginal: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    fxRate: z.number().nullable().optional(),
    amountEur: z.number().nullable().optional(),
    basis: z.string().nullable().optional(),
    deductible: z.union([z.number(), z.string()]).nullable().optional(),
    status: ExtractedGuaranteeStatus,
    confidence: z.number().nullable().optional(),
    note: z.string().nullable().optional(),
    excludedTerritories: z.array(z.string()).optional(),
  })
  .passthrough();

const Exclusion = z
  .object({
    text: z.string(),
    critical: z.boolean().optional(),
  })
  .passthrough();

const Territory = z
  .object({
    statement: z.string().nullable().optional(),
    usaCanada: z.string().nullable().optional(),
  })
  .passthrough();

/**
 * One line of the risk-score breakdown. `required` is a minor-unit amount for
 * amount checks or a keyword (e.g. "PRESENT") for presence checks; `status`
 * also carries non-compliance keywords such as "BOTH" or "PARTIAL_EXCLUDED".
 */
const BreakdownEntry = z
  .object({
    required: z.union([z.number(), z.string()]).optional(),
    found: z.number().nullable().optional(),
    status: z.string(),
    points: z.number(),
    max: z.number(),
  })
  .passthrough();

/** Deterministic rules-engine output (expected.json `computed`). */
const Computed = z
  .object({
    profile: z.string().optional(),
    riskScore: z.number().nullable(),
    riskScoreProvisional: z.number().nullable().optional(),
    // Values are BreakdownEntry, except aggregate adjustments like `_penalties` (number).
    breakdown: z.record(z.union([BreakdownEntry, z.number()])),
    decision: Decision,
    noGoSubtype: NoGoSubtype.nullable(),
    failedGates: z.array(z.string()),
    reviewGates: z.array(z.string()).optional(),
    needsHumanReview: z.boolean(),
    matchesExpert: z.boolean().optional(),
  })
  .passthrough();

/** Global extraction accuracy: a bare number in samples, or {global, fields}. */
const AccuracyScore = z.union([
  z.number(),
  z
    .object({
      global: z.number(),
      fields: z.record(z.number()).optional(),
    })
    .passthrough(),
]);

/** One verification gate of the seal (table-level `gates{}` values). */
const Gate = z
  .object({
    state: GateState,
    note: z.string().optional(),
  })
  .passthrough();

/** One rendered certificate page (table-level `pages[]`). */
const Page = z
  .object({
    n: z.number(),
    imageUrl: z.string(),
    lang: z.string().optional(),
    ocrUsed: z.boolean().optional(),
  })
  .passthrough();

/** Compact per-guarantee statuses for list rows (table-level `mini`). */
const MiniStatuses = z
  .object({
    pl: GuaranteeStatus,
    recall: GuaranteeStatus,
    pfl: GuaranteeStatus,
  })
  .passthrough();

/**
 * The cached certificate served by the JSON repository: identity/table fields
 * from the design-system `data.js` `certificates[]`, merged with the deep
 * extraction fields from `data/samples/<id>/expected.json`. Fields absent from
 * compact table rows or from table-only merges are optional; objects are
 * passthrough so unmodelled demo fields survive parsing.
 */
export const CachedCertificate = z
  .object({
    // Identity / table fields (design-system data.js).
    id: z.string(),
    supplier: z.string(),
    country: z.string(),
    insurer: z.string(),
    rating: z.string(),
    policyNumber: z.string(),
    decision: DisplayStatus,
    score: z.number().nullable(),
    provisional: z.boolean(),
    accuracy: z.number(),
    currency: z.string(),
    expiry: z.string(),
    expiryDays: z.number().nullable(),
    received: z.string(),
    aribaId: z.string().optional(),
    entity: z.string().optional(),
    seconds: z.number().optional(),
    model: z.string().optional(),
    runId: z.string().optional(),
    needsReview: z.boolean(),
    mini: MiniStatuses,
    pages: z.array(Page).optional(),
    summary: z.string().optional(),
    gates: z.record(Gate).optional(),
    // Deep extraction fields (expected.json) — optional at table level.
    guarantees: z.array(Guarantee).optional(),
    exclusions: z.array(Exclusion).optional(),
    deductibles: z.union([z.string(), z.array(z.unknown())]).nullable().optional(),
    fx: z.record(z.number()).optional(),
    territory: Territory.optional(),
    trigger: z.string().optional(),
    basisSummary: z.string().optional(),
    computed: Computed.optional(),
    accuracyScore: AccuracyScore.optional(),
  })
  .passthrough();

export type CachedCertificateT = z.infer<typeof CachedCertificate>;

/**
 * Map the rules-engine decision to what the UI displays.
 * NO_GO maps to its subtype; needsReview only overrides when the decision is
 * not NO_GO. A NO_GO without subtype falls back to STRUCTURAL (conservative:
 * solid "Not admissible", never "Rejected").
 */
export function toDisplayStatus(
  decision: DecisionT,
  noGoSubtype: NoGoSubtypeT | null,
  needsReview: boolean,
): DisplayStatusT {
  if (decision === "NO_GO") return noGoSubtype ?? "STRUCTURAL";
  if (needsReview) return "NEEDS_REVIEW";
  return decision;
}
