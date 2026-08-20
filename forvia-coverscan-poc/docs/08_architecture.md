# 08 — Architecture (POC, productizable)

Constraints from the team: everything as reusable **tools** (Vincent), configurable per client (Ismaël), dashboard carries the perceived value (Konstantin), front is cheap now — spend the care on data and rules. Verify latest versions of every dependency before installing; nothing below is pinned.

---

## 1. Monorepo layout

```
coverscan/
├── apps/
│   └── web/                      Next.js (App Router) · Tailwind · shadcn/ui · Recharts · TanStack Table
│       ├── app/(dashboard)/portfolio | certificates | certificates/[id] | suppliers/[id] | requirements | integrations
│       ├── app/api/               route handlers: upload, analyze, certificates, profiles, ariba/preview, export
│       ├── components/coverscan/  DecisionChip, VerificationSeal, CoverageGrid, GapBar, DocumentViewer, Stepper, FindingsList, ProfileSwitcher…
│       ├── messages/en.json       all UI strings
│       └── lib/                   data access, formatting (money, dates), role context, demo clock
├── packages/
│   ├── schemas/                  zod schemas + generated JSON Schema (ExtractionResult, NormalizedCertificate, Scoring, Profile, AribaPayload)
│   ├── rules/                    taxonomy, amount/basis parsing, fx, gates, scoring, decision, findings, explain-template  (pure TS, vitest ≥ 90 %)
│   ├── pipeline/                 tools: ingest, ocr, classify, extract, normalize, verify, visual, explain, persist; orchestrator (Mastra workflow or plain async)
│   ├── llm/                      ocr/ = AlphaEdge OCR client (multipart REST, retry/throttle/disk cache) + probe · reason/ = ReasonProvider interface (provider decided at pipeline sprint)
│   └── db/                       Drizzle schema + migrations (Postgres; SQLite for local)
├── data/
│   ├── samples/                  10 certificates (pages, text, expected.json) + ground_truth.json + synthetic/ (140 generated rows for charts)
│   └── registry/                 insurers.json, intermediaries.json, ecb-rates-cache.json
├── prompts/                      versioned markdown prompts
├── tools/                        build_ground_truth.py, eval/ (harness), gen_synthetic.ts
└── docs/, design-system/, .claude/
```

## 2. Runtime flow

```
Upload (UI or /api/upload) → storage → job row (PENDING)
→ orchestrator.run(jobId): ingest → classify → [extract ∥ visual] → normalize → verify → score → explain → persist (each stage emits an event with timing; UI subscribes via SSE for the stepper)
→ Certificate row COMPLETE → UI
Re-score (profile change / field edit): rules only, synchronous, < 50 ms, no LLM.
```
`DEMO_MODE=cached`: orchestrator replays `data/samples/<id>/expected.json` with recorded stage timings (scaled to ~18 s total) and identical output. `DEMO_MODE=live`: real calls. Both write to the same tables so screens don't care.

## 3. Tools contract (packages/pipeline)

Each tool: `{ id, version, inputSchema (zod), outputSchema (zod), run(input, ctx): Promise<output> }` with `ctx = { logger, llm, fx, registry, referenceDate, runId }`. Tools are registered in a map so the orchestrator, the eval harness and future products (e.g. an "authenticity-only" tier) compose them freely. No tool imports another tool's internals; only schemas.

## 4. Data model (Drizzle, simplified)

```
suppliers(id, aribaId, legalName, country, contractingForviaEntity, category, spendTier)
certificates(id, supplierId, fileName, fileType, storageKey, receivedAt, referenceDate, status, decision, noGoSubtype, needsReview, riskScore, riskScoreProvisional, accuracyScore, profileVersionId, insurerId, policyNumber, periodFrom, periodTo, currencyOriginal, createdAt)
certificate_pages(certificateId, pageNo, imageKey, textLayer, ocrText, textQuality, language, discarded)
extractions(certificateId, runId, model, promptVersion, rawJson, ias)
normalized(certificateId, json)             -- NormalizedCertificate
guarantees(certificateId, code, labelOriginal, page, amountOriginal, currency, fxRate, fxDate, amountEur, basis, basisOriginal, deductible, sublimitOf, excludedTerritories[], status, confidence)
findings(certificateId, ruleId, severity, code, messageEn, evidenceJson, requiredValue, foundValue, fixSuggestion)
gates(certificateId, gateId, result, note, confidence)
explanations(certificateId, summaryEn, requestEmailEn, model, promptVersion)
profiles(id, name, version, scopeJson, rulesJson, createdBy, createdAt)
insurers(id, canonicalName, aliases[], type, country, regulatorId, rating, ratingAgency, source)
events(id, certificateId, type, actorRole, payloadJson, at)        -- audit
ariba_syncs(certificateId, payloadJson, status, syncedAt)
fx_rates(ccy, date, rate, source)
```

## 5. API (route handlers; REST-ish, JSON)

- `POST /api/upload` (multipart) → `{certificateId, jobId}` · `GET /api/jobs/:id/events` (SSE)
- `GET /api/certificates?status&country&insurer&gap&expiring&q` · `GET /api/certificates/:id` (full object)
- `POST /api/certificates/:id/rescore {profileId}` · `PATCH /api/certificates/:id/fields {fieldPath, value, justification}` (logs + rescore)
- `POST /api/certificates/:id/decision {action: APPROVE|REJECT|REQUEST_CHANGES, note}`
- `GET /api/suppliers/:id` · `GET /api/portfolio/summary?profileId`
- `GET/POST/PUT /api/profiles` · `POST /api/profiles/:id/simulate`
- `GET /api/certificates/:id/ariba-payload` · `POST /api/certificates/:id/ariba-sync` (mock)
- `GET /api/export.xlsx?view=`

## 6. SAP Ariba integration (POC = mock + payload preview; V1 per Q33–Q38)

Facts gathered: attachments live on **questionnaires** (SLP / modular questionnaires); retrieval needs two APIs (data API for metadata + document id, external API for download); OAuth app + API keys and test/prod realms to be created by FORVIA IT; no native webhook → **cron with catch-up**; custom questionnaire fields must be created by FORVIA for re-injection; peak Jan–Feb; quotas TBD.

Payload written back (one object per certificate → mapped to custom fields; see `schemas/ariba_payload.schema.json`):
```
{ supplierAribaId, certificateId, analysisDate, referenceDate, profileVersion,
  decision: GO|REQUEST_CHANGES|NO_GO, noGoSubtype, needsHumanReview,
  riskScore (null if NO_GO), accuracyScore,
  insurerName, insurerRating, policyNumber, validFrom, validTo, daysToExpiry,
  productLiabilityEur, productRecallEur, pureFinancialLossEur,   // retained amounts
  productLiabilityStatus, productRecallStatus, pureFinancialLossStatus,
  topFinding (string ≤ 200 chars), findingsCount, dashboardUrl }
```
Design for V1: connector service with queue, pagination, 429 backoff, idempotent upserts keyed on (supplierAribaId, documentId). Estimation already carries 10 d (export connector) + 8 d (re-injection) — mostly on FORVIA's side for field creation (Q35).

## 7. Security & compliance (POC level)

- Storage local to the POC host; encryption at rest via disk/volume; TLS in transit; no sample data leaves the repo.
- Personal data masking layer (emails/phones) on render and export; reveal is logged (event).
- Auth: none beyond a role switch (POC); V1: SSO Entra ID (Q40), roles Buyer / Insurance / Admin.
- Audit: every state change is an `events` row; each analysis records model/prompt/profile/registry/FX versions → full traceability (spec §4.1).
- DPIA (Q41) and retention (Q43) are V1 topics; note them in the report.

## 8. Synthetic data for charts

`tools/gen_synthetic.ts` creates ~140 certificates by varying the 10 real profiles across countries (FR, DE, ES, IT, PL, CZ, US, MX, CN, IN, TR), insurers (from registry), amounts (±30 %), expiry dates around the demo clock, and decisions consistent with the rules engine (run the real engine on generated normalized data — never hand-write a decision). Clearly flagged `synthetic: true` and excluded from the eval harness.

## 9. Local dev

`pnpm i` · `pnpm db:push` · `pnpm seed` (loads registry, 10 samples with cached outputs, synthetic set) · `pnpm dev` · `pnpm eval` · `pnpm test`. Env (`.env.local`): `ALPHAEDGE_BASE_URL`, `ALPHAEDGE_API_KEY`, `ALPHAEDGE_OCR_MODEL=alpha-digit-max`; later sprints add `ANTHROPIC_API_KEY` (reasoning candidate), `DEMO_MODE`, `DEMO_CLOCK=2025-04-15`, `DATABASE_URL`, `FX_SOURCE=ecb|cache`. Scripts: `pnpm ocr:probe`, `pnpm catalogue:build` (runs `tools/build_check_catalogue.py`).

## 10. Non-goals (POC)
Real Ariba calls; email sending; SSO; multi-tenant; fine-tuning; PDF forensic authenticity; mobile layout (desktop-first, readable on tablet).


## 11. Decision log — 20/08/2026 (Sprint 0 build)

- **Front-end**: the exported design system (`design-pack/Design System Cover Scan/`) is the visual source of truth (tokens, `.d.ts` contracts, locked labels, ui_kit as composition blueprint); components are **re-implemented in shadcn/Tailwind v4**, the DS token CSS files are copied verbatim as the single style source and the Tailwind theme references only `var(--…)`. No raw hex/px in components.
- **Data**: no DB in Sprint 0 — `CertificateRepository` serves `apps/web/data/certificates.json` (10 real certs, zod-validated at build by `apps/web/scripts/build-cached-data.mjs`); Drizzle/Postgres lands behind the same interface in the next sprint.
- **Dev server**: port **3100**.
- **AlphaEdge = OCR-only** (see docs/07 §13); spec for this build: `docs/superpowers/specs/2026-08-20-sprint0-core-screen-design.md`.
