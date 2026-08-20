/**
 * Reasoning-LLM provider contract (Sprint 1+).
 * AlphaEdge only serves OCR; the reasoning provider is still open
 * (see docs/09_open_questions_and_assumptions.md).
 */
export interface ReasonProvider {
  complete(prompt: string): Promise<string>;
}
