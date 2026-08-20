/** Normalized result of one OCR call against an AlphaEdge model. */
export interface OcrResult {
  modelSlug: string;
  text: string;
  inferenceSeconds: number;
  globalConfidence: number;
  words: { w: string; confidence: number }[];
  /** Full untouched provider response (also what the disk cache stores). */
  raw: unknown;
}

export interface OcrClientOptions {
  baseUrl?: string;
  apiKey: string;
  model?: string;
  cacheDir?: string;
  maxRetries?: number;
  minIntervalMs?: number;
}

export interface OcrFileOptions {
  enableBbox?: boolean;
  model?: string;
}
