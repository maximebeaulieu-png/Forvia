# 07 — AI Pipeline: how the LLM reads a certificate (output of the *ai-extraction-engineer* agent)

Design stance (Vincent, transcript 00:38–00:42): **don't use AI where a deterministic tool does the job.** OCR, stamp detection, registry lookup, FX, date math and thresholds are tools. The LLM is used for what only it does well: understanding heterogeneous, multilingual, free-form documents and explaining results in plain English. Every stage is an independent, typed **tool** (Mastra tool or plain TS function) with tests and a recorded fixture.

---

## 1. Stages

```
[1] ingest        file → pages[{image, text, hasTextLayer, textQuality}]        (pdf.js/pdftoppm + pdftotext; tesseract.js if needed)
[2] classify      pages → {documentType, languages[], isMultiDocument, pagesToDiscard[]}   (LLM, text+thumbnails, cheap)
[3] extract       pages → ExtractionResult (JSON schema) with confidence + source per field (VLM on page images + text)
[4] normalize     ExtractionResult → NormalizedCertificate (taxonomy mapping, amount parsing, basis, FX)   (deterministic + LLM fallback for unmapped labels)
[5] verify        → gates inputs: insurerRegistry(name) · intermediaryRegistry(name) · entityMatch(supplierMaster) · dateMath(referenceDate) · coinsurance   (deterministic)
[6] visual        pages → {stamp, signature, logo} detections with bbox + confidence   (VLM call focused on visuals; optional CV heuristics)
[7] score         NormalizedCertificate + gates + profile → Scoring (packages/rules, deterministic)
[8] explain       findings[] → {summary_en, requestEmail_en}   (LLM, grounded, no new facts)
[9] persist       everything + run metadata (model, prompt version, timings, profile version, FX source)
```
Target: < 30 s end-to-end per certificate (spec §4.2). Budget: ingest 2 s, classify 2 s, extract 10–15 s, visual 3–5 s, normalize/verify/score < 1 s, explain 3–5 s. Run [3] and [6] in parallel.

## 2. Ingestion details

- PDF: rasterize pages at 150 dpi (JPEG, max 1600 px long edge) **and** extract the text layer per page. Compute `textQuality` = share of tokens that are dictionary words/numbers in detected language; if < 0.6 (sample 06: custom font encoding produces garbage) → run OCR and prefer OCR text; if no text layer (sample 04: scan) → OCR. Keep both texts; the extractor receives the best one plus the image.
- PNG/JPG: single page, OCR.
- DOCX/other: reject at upload with the UI error (gate `FILE_FORMAT_OK`).
- Multi-document PDFs (sample 09: cover letter + certificate): classifier marks `pagesToDiscard` (cover letter) but keeps them viewable.
- Personal data: regex pass for emails/phones → store mask map; UI masks by default.

## 3. Classification prompt (stage 2) — see `prompts/01_classify.md`
Output: `{documentType: CERTIFICATE|CERTIFICATE_WITH_COVER_LETTER|QUOTE|POLICY_EXCERPT|EMAIL|OTHER, confidence, languages:[iso], pagesToDiscard:[n], isScanned, notes}`. Heuristics fed in: presence of words quote/devis/Angebot/presupuesto/preventivo, "does not require signature", "subject to declaration", premium amounts (quotes show premiums; certificates rarely do).

## 4. Extraction (stage 3) — the main LLM call — see `prompts/02_extract.md` and `schemas/extraction.schema.json`

Input per call: all page images (≤ 6 pages; beyond, chunk by 4 with overlap) + best text per page + supplier master (name, country, contracting FORVIA entity) + reference date. Output: strict JSON validated with zod; on validation error → one repair call with the error message; on second failure → `NEEDS_REVIEW` with partial data.

Key instructions encoded in the prompt:
- **Extract, don't judge.** No compliance opinion in this step.
- **Keep original labels verbatim** (`labelOriginal`) and original numbers/currency as written; parse into `amount` + `currency` separately; never convert.
- **Basis is mandatory** per amount: `PER_CLAIM | PER_OCCURRENCE | ANNUAL_AGGREGATE | PER_CLAIM_AND_ANNUAL | COMBINED_SINGLE_LIMIT | UNSTATED`, plus free-text `basisOriginal` (e.g. "e.e.l./a.a.", "je Schadenereignis, begrenzt auf das Zweifache").
- **Sub-limits**: attach `sublimitOf` (parent label) when the document nests amounts (Marron table, Mobiliar "Sublimit: CHF 5M Recall Costs").
- **Exclusions**: list every exclusion line verbatim with page; mark `territory` exclusions explicitly.
- **"Covered" without amount** → `amount: null, coveredStatement: true`.
- **Entities**: issuer (who issues/signs), insurer (who carries the risk — may differ, as in sample 04), policyholder, namedInsureds[], additionalInsureds[], brokerMentions[] with role words found.
- **Each field**: `{value, confidence 0–1, source:{page, quote}}`. Quote must be a verbatim substring of the page text (or of the OCR text) — the post-processor checks it.
- **Multilingual**: answer in English for normalized fields, but quotes stay in the source language.

Model: **AlphaEdge French-hosted endpoint** (`LLM_PROVIDER=alphaedge`, OpenAI-compatible adapter); temperature 0; max output tokens sized for ~60 fields + hints. Adapter interface: `extract(pagesImages[], texts[], context) → json`. `anthropic` remains available behind the same interface for local development only. The extraction prompt receives the catalogue cue lists (`{{CATALOGUE_CUES}}`, built from `data/checks/check_catalogue.json`) and returns `hints[] = {checkId, quote, page, confidence}` in addition to the fields — hints are pointers for the rules engine, never decisions.

**Two execution modes**, selected by the probe at startup (`pnpm llm:probe`):
- `vision` — page images + text sent together (preferred; needed for layout-heavy tables and for the visual stage).
- `text-first` — if the hosted model has no image input: OCR every page (tesseract + layout), send text + page-structure hints; the visual stage (stamp/signature) falls back to deterministic image heuristics (saturated/blue-red ink blobs in the signature zone, circular/rectangular stamp shapes, ink density) with lower confidence → more `NEEDS_REVIEW`. Document in the eval report which mode produced the numbers.

## 5. Normalization (stage 4)

- Taxonomy mapping: deterministic dictionary (`packages/rules/src/taxonomy.ts`, seeded from `docs/02` §3) with normalized matching (lowercase, strip accents/punctuation, language-specific stems). Unmapped label → small LLM call *"map this label to one of [codes] or OTHER"* with the code list and definitions; result cached by label hash.
- Amount parsing: handle `5.000.000`, `5,000,000`, `20'000'000`, `1,000,000,000`, `€. 50.000.000,00`, `INR 1,000,000,000`, `305.000 €`, "Mio", "M", "k". Currency from symbol/code/context (INR from "ICICI Lombard" + "INR"). Unit test each sample's numbers.
- Basis normalization and aggregate derivation (×N rules).
- FX: `fx.convert(amount, ccy, referenceDate)` → ECB; cached; persisted on the analysis.
- Territory: normalize statements to `{worldwide: bool, usaCanada: INCLUDED|EXCLUDED|PARTIAL_EXCLUDED|UNCLEAR, notes}`.
- Trigger: `OCCURRENCE | CLAIMS_MADE | UNSTATED`.

## 6. Verification tools (stage 5)

- `insurerRegistry.lookup(name)` → `{match, canonicalName, type: INSURER|MUTUAL|CAPTIVE|BROKER|AGENT|UNKNOWN, country, regulatorId, rating?, confidence}`. POC data: `data/registry/insurers.json` (~40 entries incl. all insurers of the samples + Marron & Associés as AGENT_BROKER + a few decoys). V1: EIOPA/ACPR/BaFin/ORIAS/IVASS/FINMA/IRDAI + rating feed.
- `intermediaryKeywords.detect(text)` → FR/DE/ES/IT/EN keyword hits with page (assureur conseil, courtier, agent général, broker, Makler, Versicherungsmakler, corredor, mediatore, intermediario, ORIAS, "on behalf of the insurer" vs "on behalf of").
- `entityMatch(supplierMaster.name, [policyholder, insureds…])` → normalized fuzzy (token set ratio; strip legal forms SAS/GmbH/SpA/SA/Ltd/& Co. KG) → `{matchedAs: POLICYHOLDER|NAMED_INSURED|ADDITIONAL_INSURED|NONE, score}`.
- `dates.evaluate(period, referenceDate, windowMonths)` → `{expired, monthsRemaining, expiringSoon}`.
- `coinsurance.evaluate(shares[], signatures[])`.

## 7. Visual checks (stage 6) — see `prompts/03_visual.md`

One VLM call per page (or on the last 2 pages first, where stamps/signatures live): *"Locate any stamp/seal, handwritten signature, printed signature block, company logo. For each: type, bbox (0–1 normalized), whose entity it belongs to (read the text inside the stamp), confidence."* Post-rules: stamp entity ≠ issuer → gate `STAMP_PRESENT` = FAIL with note (sample 04); signature overlapping stamp with no name → REVIEW (sample 06); typed names without strokes → absent (sample 05). Optional CV pre-check (circular contour detection / ink colour) to boost confidence — not required for POC.

Honesty note for the report: stamps and signatures are **easy to forge** (Konstantin 00:23). The POC verifies *presence and attribution*, not authenticity; V1 may add PDF forensic checks (producer metadata, edit history, image tampering heuristics) and insurer-side verification.

## 8. Explanation (stage 8) — see `prompts/04_explain.md`

Input: findings[] (structured), decision, supplier + insurer names, profile name. Output: `summary_en` (≤ 3 sentences, buyer-readable, no jargon without a gloss), `requestEmail_en` (template in `docs/06` §D). Guardrails: the model may only reference `findings[]`; a post-check verifies every number in the output exists in findings (regex on amounts) — otherwise regenerate once, else fall back to a deterministic template.

## 9. Confidence → routing

`IAS_global` as in `docs/04` §7. Routing: any gate REVIEW, IAS_global < 0.75, any critical field < 0.60, any `UNCLEAR` → `needsHumanReview`. Target ~10 % (Q03). The eval harness reports the actual rate.

## 10. Evaluation harness (`tools/eval`, `pnpm eval`)

For each sample in `ground_truth.json`: run pipeline (live or cached) → compare:
- field-level exact/fuzzy match (issuer, policy no., dates, policyholder, each critical amount + currency + basis, territory, trigger, stamp/signature presence) → precision/recall per field type;
- gates match; decision + subtype match; provisional score within ±2;
- latency per stage; token cost.
Output: markdown report in `reports/eval-<date>.md` + JSON. This becomes the "performance report" deliverable when run on the 100–200 set.

## 11. Prompt & model versioning
`prompts/*.md` are the source; loaded at build into `packages/pipeline/src/prompts.ts` with a `version` (semver). Each analysis stores `{model, promptVersions, profileVersion, registryVersion, fxSource}`. Changing a prompt = bump version + re-run eval + commit the report.

## 12. Hosting — decided: AlphaEdge, France
The LLM is served from a **French-hosted endpoint operated by AlphaEdge** (decision 20/08/2026; credentials provided in Claude Code, stored in `.env.local`, never committed). This answers the spec's sovereignty requirement (§4.4) by data residency; whether the model is open-weights is AlphaEdge's choice and should be stated in the offer.

Day-1 probe (`pnpm llm:probe`) must record in `docs/eval/llm_probe.md`:
1. API flavour (OpenAI-compatible chat completions? response_format json? tool calling?).
2. **Vision**: does the endpoint accept image inputs? max images per request, max resolution. → selects `vision` vs `text-first` mode (§4).
3. Context window and max output tokens (extraction needs ~20k in / 6k out for a 6-page certificate).
4. Latency and concurrency (target: < 30 s per certificate end-to-end, 3 parallel certificates without throttling).
5. Determinism at temperature 0 (run sample 04 three times; diff outputs).
6. Languages: quick check on DE/IT/ES pages of the samples.
Known unknowns are logged in `docs/09` (U1–U4). Cost: ~6 pages × vision + ~6k text tokens in, ~3k out per certificate; 8,000/year is negligible on any hosted model.
