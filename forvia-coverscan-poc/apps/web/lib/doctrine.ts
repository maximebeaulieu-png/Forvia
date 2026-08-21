/**
 * Scoring doctrine — single source of truth for the UI.
 *
 * Transcribed from the client technical dossier
 * (docs/Dossier technique client/Dossier technique Forvia.docx, §1.3):
 *
 *   scoring.compliance: binary_minimum   "sous le minimum = non conforme, sans gradation"
 *   scoring.bonus_bands                  evaluative ONLY at or above the minimum
 *   currency.rate_date_policy: reception_date   ECB rate on the day the certificate was received
 *   accuracy guard                       "en dessous d'un seuil d'exactitude paramétrable,
 *                                         la solution ne publie aucun score de risque"
 *
 * The prototype must tell the same story as the dossier: there is no such thing
 * as "minor underinsurance". €18M against a €20M requirement is non-compliant,
 * full stop; the gap is shown as information, never as partial credit.
 */

/** Below this extraction accuracy no risk score is published — human review instead. */
export const ACCURACY_THRESHOLD = 0.75;

/** At or above this ratio of the requirement, the cover is flagged as strong (bonus band). */
export const STRONG_RATIO = 1.5;

export type BinaryStatus =
  | "COMPLIANT_STRONG"
  | "COMPLIANT"
  | "NON_COMPLIANT"
  | "NOT_ASSESSABLE";

export const BINARY_LABEL: Record<BinaryStatus, string> = {
  COMPLIANT_STRONG: "Compliant",
  COMPLIANT: "Compliant",
  NON_COMPLIANT: "Non-compliant",
  NOT_ASSESSABLE: "Not assessable",
};

/**
 * Binary verdict for one guarantee. Any amount under the requirement is
 * NON_COMPLIANT — no gradation. Missing / excluded / unreadable amounts are
 * non-compliant too (they cannot demonstrate the required cover).
 */
export function binaryStatus(
  foundEur: number | null | undefined,
  requiredEur: number | null | undefined,
): BinaryStatus {
  if (requiredEur == null || requiredEur <= 0) return "NOT_ASSESSABLE";
  if (foundEur == null || foundEur <= 0) return "NON_COMPLIANT";
  if (foundEur >= requiredEur * STRONG_RATIO) return "COMPLIANT_STRONG";
  if (foundEur >= requiredEur) return "COMPLIANT";
  return "NON_COMPLIANT";
}

/** True when the guarantee status string coming from the dataset means "covered at the required level". */
export function isCompliantStatus(status: string | undefined): boolean {
  return status === "COMPLIANT" || status === "COMPLIANT_STRONG";
}

/**
 * Points under the binary rule: nothing below the minimum, the full weight at or
 * above it. Replaces the proportional `min(found/required, 1) * weight` credit,
 * which handed 7.5/30 to a certificate covering a quarter of the requirement.
 */
export function binaryPoints(
  foundEur: number | null | undefined,
  requiredEur: number | null | undefined,
  max: number,
  fallbackStatus?: string,
): number {
  if (requiredEur == null || typeof requiredEur !== "number" || requiredEur <= 0) {
    // Presence-type criteria ("PRESENT"): keep the dataset's own verdict.
    return isCompliantStatus(fallbackStatus) || fallbackStatus === "PRESENT" ? max : 0;
  }
  return binaryStatus(foundEur, requiredEur) === "NON_COMPLIANT" ? 0 : max;
}

/** No risk score is published below the accuracy threshold. */
export function publishesRiskScore(accuracy: number | null | undefined): boolean {
  return accuracy == null || accuracy >= ACCURACY_THRESHOLD;
}

/** Wording used whenever the score is withheld, so the verdict is never unexplained. */
export const NO_SCORE_REASON =
  "No risk score published — extraction accuracy below the configured threshold. Routed to human review.";

/** FX provenance line: ECB rate at the reception date (dossier default policy). */
export function fxLine(
  currency: string | undefined,
  rate: number | undefined,
  receivedAt: string | undefined,
): string {
  if (!currency || currency === "EUR" || !rate || rate === 1) {
    return "Amounts in EUR — no conversion applied.";
  }
  return `${currency}→EUR ${rate} · ECB rate at reception${receivedAt ? ` (${receivedAt})` : ""}`;
}
