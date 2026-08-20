import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { OcrClientOptions, OcrFileOptions, OcrResult } from "./types.js";

const DEFAULT_BASE_URL = "https://api-endpoints.alphaedge-ai.com";
const DEFAULT_MODEL = "alpha-digit-max";
const DEFAULT_CACHE_DIR = ".cache/ocr";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_MIN_INTERVAL_MS = 1100; // 60 rpm ceiling with margin
const BACKOFF_BASE_MS = 500;

/** Non-retryable provider error (4xx other than 429). */
class FatalOcrError extends Error {}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return typeof value === "object" && value !== null
    ? (value as JsonRecord)
    : {};
}

function pickString(record: JsonRecord, keys: string[], fallback: string): string {
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "string") return v;
  }
  return fallback;
}

function pickNumber(record: JsonRecord, keys: string[], fallback: number): number {
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return fallback;
}

function toWords(value: unknown): { w: string; confidence: number }[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const record = asRecord(entry);
    return {
      w: pickString(record, ["w", "word", "text"], ""),
      confidence: pickNumber(record, ["confidence", "conf"], 0),
    };
  });
}

export class AlphaEdgeOcrClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly cacheDir: string;
  private readonly maxRetries: number;
  private readonly minIntervalMs: number;
  private lastRequestAt = 0;

  constructor(opts: OcrClientOptions) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_MODEL;
    this.cacheDir = opts.cacheDir ?? DEFAULT_CACHE_DIR;
    this.maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.minIntervalMs = opts.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  }

  async ocrFile(filePath: string, opts?: OcrFileOptions): Promise<OcrResult> {
    const model = opts?.model ?? this.model;
    const enableBbox = opts?.enableBbox ?? false;
    const bytes = await readFile(filePath);

    const cacheKey = createHash("sha256")
      .update(bytes)
      .update(model)
      .update(enableBbox ? "bbox:1" : "bbox:0")
      .digest("hex");
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    const cached = await this.readCache(cachePath);
    if (cached !== undefined) return this.toResult(cached, model);

    const raw = await this.requestWithRetry(
      model,
      bytes,
      path.basename(filePath),
      enableBbox,
    );
    await this.writeCache(cachePath, raw);
    return this.toResult(raw, model);
  }

  private async readCache(cachePath: string): Promise<unknown> {
    try {
      const content = await readFile(cachePath, "utf8");
      return JSON.parse(content) as unknown;
    } catch {
      return undefined; // miss or unreadable entry -> refetch
    }
  }

  private async writeCache(cachePath: string, raw: unknown): Promise<void> {
    await mkdir(path.dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(raw, null, 2), "utf8");
  }

  private async requestWithRetry(
    model: string,
    bytes: Buffer,
    filename: string,
    enableBbox: boolean,
  ): Promise<unknown> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.requestOnce(model, bytes, filename, enableBbox);
      } catch (error) {
        const retryable = !(error instanceof FatalOcrError);
        if (!retryable || attempt >= this.maxRetries) throw error;
        await sleep(BACKOFF_BASE_MS * 2 ** attempt);
      }
    }
  }

  private async requestOnce(
    model: string,
    bytes: Buffer,
    filename: string,
    enableBbox: boolean,
  ): Promise<unknown> {
    await this.throttle();

    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(bytes)]), filename);
    if (enableBbox) form.append("enable_bbox", "true");

    const response = await fetch(`${this.baseUrl}/models/${model}/ocr`, {
      method: "POST",
      headers: { "X-API-Key": this.apiKey },
      body: form,
    });

    if (response.ok) return (await response.json()) as unknown;

    const body = await response.text();
    const message = `AlphaEdge OCR request failed (${response.status}): ${body}`;
    if (response.status === 429 || response.status >= 500) {
      throw new Error(message); // retryable
    }
    throw new FatalOcrError(message);
  }

  /** Enforce a minimum interval between successive outgoing requests. */
  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minIntervalMs - Date.now();
    await sleep(wait);
    this.lastRequestAt = Date.now();
  }

  private toResult(raw: unknown, requestedModel: string): OcrResult {
    const record = asRecord(raw);
    return {
      modelSlug: pickString(record, ["model", "model_slug"], requestedModel),
      text: pickString(record, ["text", "full_text"], ""),
      inferenceSeconds: pickNumber(
        record,
        ["inference_time", "inference_seconds", "duration"],
        0,
      ),
      globalConfidence: pickNumber(
        record,
        ["confidence", "global_confidence"],
        0,
      ),
      words: toWords(record["words"]),
      raw,
    };
  }
}
