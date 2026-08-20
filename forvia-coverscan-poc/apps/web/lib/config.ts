/**
 * Demo-wide configuration. The demo clock is frozen: every date computation
 * uses REFERENCE_DATE, never `new Date()`.
 */
export const REFERENCE_DATE = "2025-04-15";

/**
 * FORVIA GPTC default profile requirements, in EUR minor units (cents):
 * Product Liability >= EUR 20M, Product Recall >= EUR 15M,
 * Pure Financial Loss >= EUR 15M.
 */
export const GPTC_REQUIRED = {
  pl: 2000000000,
  recall: 1500000000,
  pfl: 1500000000,
} as const;

export const PROFILE_LABEL = "FORVIA GPTC default";
