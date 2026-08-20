# AlphaEdge OCR probe — evaluation report

Generated 2026-08-20 by `pnpm ocr:probe` (`packages/llm/src/ocr/probe.ts`). Provider: AlphaEdge OCR REST endpoint (French-hosted). 24 sample pages × 2 models = 48 OCR calls, plus 1 `enable_bbox` call. Responses are disk-cached under `.cache/ocr` (gitignored); re-runs are free.

Similarity = SequenceMatcher-style ratio (2·LCS / total words) between the OCR text and the sibling ground-truth `.txt`, computed on lowercased punctuation-stripped word arrays.

## Per-page results

| Cert | Page | Model | Confidence | Seconds (API) | Similarity |
|------|------|-------|------------|---------------|------------|
| 01 | 1 | alpha-digit-max | 0.970 | 7.15 | 0.574 |
| 01 | 1 | alpha-digit-medium | 0.920 | 0.09 | 0.022 |
| 01 | 2 | alpha-digit-max | 0.940 | 3.73 | 0.466 |
| 01 | 2 | alpha-digit-medium | 0.870 | 0.09 | 0.101 |
| 02 | 1 | alpha-digit-max | 0.980 | 4.83 | 0.851 |
| 02 | 1 | alpha-digit-medium | 0.690 | 0.86 | 0.558 |
| 02 | 2 | alpha-digit-max | 0.950 | 3.63 | 0.455 |
| 02 | 2 | alpha-digit-medium | 0.800 | 0.07 | 0.061 |
| 03 | 1 | alpha-digit-max | 0.980 | 5.48 | 0.819 |
| 03 | 1 | alpha-digit-medium | 0.880 | 0.78 | 0.767 |
| 04 | 1 | alpha-digit-max | 0.960 | 6.77 | 0.666 |
| 04 | 1 | alpha-digit-medium | 0.870 | 0.87 | 0.504 |
| 04 | 2 | alpha-digit-max | 0.960 | 10.45 | 0.374 |
| 04 | 2 | alpha-digit-medium | 0.970 | 0.07 | 0.035 |
| 05 | 1 | alpha-digit-max | 0.980 | 5.35 | 0.581 |
| 05 | 1 | alpha-digit-medium | 0.750 | 0.52 | 0.776 |
| 05 | 2 | alpha-digit-max | 0.980 | 4.40 | 0.661 |
| 05 | 2 | alpha-digit-medium | 0.870 | 0.51 | 0.922 |
| 05 | 3 | alpha-digit-max | 0.980 | 4.92 | 0.612 |
| 05 | 3 | alpha-digit-medium | 0.760 | 0.91 | 0.783 |
| 05 | 4 | alpha-digit-max | 0.990 | 4.97 | 0.788 |
| 05 | 4 | alpha-digit-medium | 0.770 | 0.67 | 0.928 |
| 05 | 5 | alpha-digit-max | 0.950 | 1.90 | 0.200 |
| 05 | 5 | alpha-digit-medium | 0.760 | 0.11 | 0.667 |
| 06 | 1 | alpha-digit-max | 0.980 | 7.07 | 0.205 |
| 06 | 1 | alpha-digit-medium | 0.790 | 0.90 | 0.190 |
| 07 | 1 | alpha-digit-max | 0.980 | 3.48 | 0.937 |
| 07 | 1 | alpha-digit-medium | 0.590 | 1.02 | 0.424 |
| 07 | 2 | alpha-digit-max | 0.980 | 3.28 | 0.931 |
| 07 | 2 | alpha-digit-medium | 0.750 | 0.67 | 0.459 |
| 07 | 3 | alpha-digit-max | 0.970 | 3.19 | 0.953 |
| 07 | 3 | alpha-digit-medium | 0.560 | 1.02 | 0.680 |
| 07 | 4 | alpha-digit-max | 0.960 | 2.46 | 0.839 |
| 07 | 4 | alpha-digit-medium | 0.780 | 0.11 | 0.169 |
| 08 | 1 | alpha-digit-max | 0.980 | 4.43 | 0.662 |
| 08 | 1 | alpha-digit-medium | 0.770 | 0.07 | 0.027 |
| 08 | 2 | alpha-digit-max | 0.990 | 4.94 | 0.504 |
| 08 | 2 | alpha-digit-medium | 0.770 | 0.08 | 0.036 |
| 09 | 1 | alpha-digit-max | 0.970 | 4.09 | 0.382 |
| 09 | 1 | alpha-digit-medium | 0.800 | 0.08 | 0.035 |
| 09 | 2 | alpha-digit-max | 0.960 | 4.41 | 0.796 |
| 09 | 2 | alpha-digit-medium | 0.870 | 0.09 | 0.010 |
| 09 | 3 | alpha-digit-max | 0.950 | 5.12 | 0.560 |
| 09 | 3 | alpha-digit-medium | 0.680 | 0.14 | 0.105 |
| 09 | 4 | alpha-digit-max | 0.960 | 2.52 | 0.196 |
| 09 | 4 | alpha-digit-medium | 0.530 | 0.46 | 0.032 |
| 10 | 1 | alpha-digit-max | 0.960 | 5.80 | 0.386 |
| 10 | 1 | alpha-digit-medium | 0.770 | 1.03 | 0.383 |

## Aggregates per model

| Model | Pages OK | Errors | Mean confidence | Mean seconds (API) | Mean seconds (wall, network calls) | Mean similarity |
|-------|----------|--------|-----------------|--------------------|------------------------------------|-----------------|
| alpha-digit-max | 24 | 0 | 0.969 | 4.77 | — | 0.600 |
| alpha-digit-medium | 24 | 0 | 0.774 | 0.47 | — | 0.361 |

This regeneration was served entirely from the disk cache (0 network calls). The original 48-network-call run measured 146 s wall (~19.7 calls/min across both models) with the client throttle at 1.1 s between requests (~55 requests/min ceiling).

Reading the numbers — three caveats verified against the raw responses:

- **Sample 06's reference `.txt` is itself garbled** (broken PDF text layer — the known sample 06 case): the OCR text `ZURICH INSURANCE EUROPE AG, Spanish Branch…` is clean while the reference reads `ZU\u0003ICH INSU\u0003ANCE…`. Low similarity there indicts the reference, not the OCR.
- **`alpha-digit-max` emits light markup** (`<logo>…</logo>`, `<img>…</img>`) inside `text`; those extra tokens depress its similarity slightly. The extraction stage should strip them.
- **Sparse pages penalize the better model**: on 05 p5 the reference `.txt` holds 56 chars while max extracted 633 chars of real content — the ratio punishes extracting *more* than the reference. Medium's low scores (0.01–0.10 on several pages with < 0.15 s inference) are genuine truncations, though: it returned near-empty text on those pages.

## `enable_bbox` findings

Tested on cert 01 page 1 with `enable_bbox=true` on `alpha-digit-max` (1 call).

Top-level response shape:

```
model_slug: string = "alpha-digit-max-v2"
text: string = string(2965 chars)
inference_seconds: number = 6.4688
global_confidence: number = 0.96
words:
  array[374], first item:
    w: string = "CHUBB"
    confidence: number = 1
enable_bbox: boolean = true
regions:
  array[7], first item:
    label: string = "header"
    cls_id: number = 12
    score: number = 0.7490872144699097
    order: object = null
    page: number = 1
    shape: string = "poly"
    obb_angle: number = 0
    bbox:
      array[4], first item:
        number = 59
    bbox_xyxy:
      array[4], first item:
        number = 59
    polygon:
      array[4], first item:
        array[2], first item:
          number = 59
    obb:
      array[4], first item:
        array[2], first item:
          number = 59
    bbox_obb:
      array[4], first item:
        array[2], first item:
          number = 59
    classification:
      {…}
    text: string = "CHUBB®"
    confidence: number = 1
    writing_type: string = "printed"
    text_source: string = "ocr_crop"
    ocr_inference_seconds: number = 0.2037
image_filename: string = "1.jpeg"
```

First `words[]` entry with bbox enabled:

```json
{
  "w": "CHUBB",
  "confidence": 1
}
```

## Recommendation

**Default OCR model: `alpha-digit-max`.** alpha-digit-max mean similarity 0.600 vs alpha-digit-medium 0.361 (Δ +0.238); mean API latency 4.77 s vs 0.47 s. Accuracy wins for certificate review (amounts, policy numbers): the latency difference is irrelevant at 8,000 certificates/year. Keep `alpha-digit-medium` as a fast fallback.

## Closing U1–U4 (docs/09 §D)

| # | Question | Answer from this probe |
|---|----------|------------------------|
| U1 | Vision support? | **N/A — OCR-only provider.** AlphaEdge exposes dedicated OCR models over REST, not a chat/vision LLM. No stamp/signature reasoning from the endpoint: the pipeline runs **text-first** (OCR text + deterministic heuristics), as planned in docs/07. |
| U2 | JSON mode / tool calling? | **N/A as asked — the API is REST multipart** (`POST /models/{model}/ocr`, field `image`, header `X-API-Key`) returning a fixed JSON document: `model_slug`, `text`, `inference_seconds`, `global_confidence`, `words[] {w, confidence}`, `image_filename` (observed on all 48 responses). No prompting, so no JSON-repair layer needed at the OCR stage. |
| U3 | Context window? | **Per-page processing** — one image per request, no token context at all. Multi-page certificates are OCR'd page by page and merged downstream (cross-page merge stays in the extraction stage). |
| U4 | Concurrency / rate limits? | **Measured**: mean API inference 4.77 s/page (max) and 0.47 s/page (medium); no 429 observed at 1 request in flight. Sustained single-worker rate with the default model: ~13 pages/min (client throttle floor 1.1 s/request). A 6-page certificate OCRs in ~29 s with max — inside the < 30 s target; `alpha-digit-medium` (~0.47 s/page) or parallel workers give headroom. Disk cache makes demo replays instant. |

## Cost note

The probe campaign made 49 real API calls in total (24 pages × 2 models + 1 bbox; 0 of them during this run, the rest replayed from cache). At AlphaEdge's per-page OCR pricing this is **< €0.05 total**; a full 10-certificate re-analysis is of the same order. Negligible against the ~€90k/year manual review the POC replaces; re-runs cost €0 thanks to the disk cache.
