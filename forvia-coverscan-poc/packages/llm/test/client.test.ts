import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AlphaEdgeOcrClient } from "../src/index.js";

const SAMPLE_RESPONSE = {
  model: "alpha-digit-max",
  text: "hello world",
  inference_time: 0.42,
  confidence: 0.97,
  words: [
    { w: "hello", confidence: 0.98 },
    { w: "world", confidence: 0.96 },
  ],
};

function okResponse(): Response {
  return new Response(JSON.stringify(SAMPLE_RESPONSE), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("AlphaEdgeOcrClient", () => {
  let workDir: string;
  let imagePath: string;

  beforeEach(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), "alphaedge-ocr-"));
    imagePath = path.join(workDir, "page.jpeg");
    await writeFile(imagePath, Buffer.from("fake-jpeg-bytes"));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await rm(workDir, { recursive: true, force: true });
  });

  function makeClient(fetchMock: typeof fetch): AlphaEdgeOcrClient {
    vi.stubGlobal("fetch", fetchMock);
    return new AlphaEdgeOcrClient({
      apiKey: "test-key",
      cacheDir: path.join(workDir, "cache"),
      minIntervalMs: 0,
    });
  }

  it("POSTs multipart field 'image' with X-API-Key header to the model ocr endpoint", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const result = await client.ocrFile(imagePath);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      { method: string; headers: Record<string, string>; body: FormData },
    ];
    expect(url).toBe(
      "https://api-endpoints.alphaedge-ai.com/models/alpha-digit-max/ocr",
    );
    expect(init.method).toBe("POST");
    expect(init.headers["X-API-Key"]).toBe("test-key");
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.body.get("image")).toBeInstanceOf(Blob);
    expect(init.body.has("file")).toBe(false);

    expect(result.modelSlug).toBe("alpha-digit-max");
    expect(result.text).toBe("hello world");
    expect(result.inferenceSeconds).toBe(0.42);
    expect(result.globalConfidence).toBe(0.97);
    expect(result.words).toEqual(SAMPLE_RESPONSE.words);
  });

  it("retries after a 500 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("internal error", { status: 500 }),
      )
      .mockResolvedValueOnce(okResponse());
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const result = await client.ocrFile(imagePath);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.text).toBe("hello world");
  });

  it("serves an identical second call from the disk cache (fetch called once)", async () => {
    const fetchMock = vi.fn(async () => okResponse());
    const client = makeClient(fetchMock as unknown as typeof fetch);

    const first = await client.ocrFile(imagePath);
    const second = await client.ocrFile(imagePath);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("throws immediately on 422 without retrying, with the body in the message", async () => {
    const fetchMock = vi.fn(async () =>
      new Response('{"detail":"unsupported image"}', { status: 422 }),
    );
    const client = makeClient(fetchMock as unknown as typeof fetch);

    await expect(client.ocrFile(imagePath)).rejects.toThrow(
      /422.*unsupported image/s,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
