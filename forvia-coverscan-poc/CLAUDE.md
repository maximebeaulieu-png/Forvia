# CLAUDE.md — FORVIA CoverScan POC

AI-powered review of supplier liability insurance certificates for FORVIA (automotive Tier-1).
Buyers request certificates from ~8,000 suppliers/year via SAP Ariba. The POC ingests a certificate
(PDF/PNG, any language), extracts the data, verifies authenticity, checks coverage against FORVIA's
General Purchasing Terms & Conditions (GPTC), produces two scores and a Go / Request changes / No-Go
decision, and surfaces everything in an English dashboard.

**Language of the product: English.** UI copy, data labels, exports, emails to suppliers — all English.
Internal team is French; code comments and commit messages in English.

## Read in this order before writing code

1. `docs/01_business_context.md` — who uses this and why (the €90k/year manual review it replaces)
2. `docs/02_insurance_domain_knowledge.md` — guarantees taxonomy, multilingual synonyms, what "good" looks like
3. `docs/04_scoring_rules.md` — blocking gates, thresholds, the two scores. **Source of truth for the rules engine**
3b. `docs/11_check_catalogue.md` + `data/checks/check_catalogue.json` — the **122 concrete cases** (formal defects, issuer traps, wording, sub-limits, exclusions, dates) with multilingual cues, outcomes, explanation and fix templates. Findings emitted by the rules engine must reference a `checkId`; extraction prompt cues and supplier emails are generated from it.
4. `docs/05_dashboard_spec.md` + `docs/06_demo_user_journey.md` — what to build and the demo script
5. `docs/07_ai_pipeline.md` — extraction pipeline, prompts, confidence
6. `docs/08_architecture.md` — stack, data model, API, Ariba payload
7. `docs/03_ground_truth_samples.md` + `data/samples/ground_truth.json` — the 10 annotated certificates. **Every pipeline change must be re-validated against them.**

## Non-negotiable principles

- **The LLM never decides.** It classifies, extracts (with per-field confidence and source location) and explains. Dates, currency conversion, threshold comparison, insurer registry lookup, entity matching and the final decision are deterministic, unit-tested code in `packages/rules`.
- **Gate before score.** If any blocking check fails → status `NO_GO`, no Risk Score is computed (Richard's rule, Q05). Show the reasons.
- **Every number shown has provenance.** Original value, original currency, page, text quote/bbox, FX rate + date, confidence. No naked numbers in the UI.
- **Thresholds live in a Requirements Profile** (`schemas/requirements_profile.forvia.json`), never in code. Default profile = GPTC (Product Liability ≥ €20M, Pure Financial Loss / Product Recall ≥ €15M). A second profile "Expert (R. Mekouar)" exists to demonstrate configurability.
- **Everything is a tool.** Each pipeline stage (`ingest`, `ocr`, `classify`, `extract`, `normalize`, `fx`, `verify-insurer`, `match-entity`, `score`, `explain`) is an independently callable, typed function with its own tests. This is a product foundation, not a one-off.
- **Demo must never fail live.** Every sample has cached pipeline output in `data/samples/<id>/expected.json` plus a `DEMO_MODE=cached|live` switch. Live mode calls the LLM; cached mode replays.
- **GDPR.** Certificates contain personal data (names, emails). Mask emails/phones in exports and logs. No sample data leaves the repo.

## Stack (see docs/08_architecture.md — verify latest versions before installing)

- Monorepo (pnpm workspaces + Turborepo). TypeScript everywhere.
- `apps/web`: Next.js (App Router), Tailwind, **shadcn/ui**, Recharts, TanStack Table, react-pdf / page images viewer.
- `packages/pipeline`: Mastra (agents + tools) or plain TS orchestrator if Mastra adds friction — tools are pure functions either way.
- `packages/rules`: rules engine (zod schemas, pure functions, 100% unit-tested against ground truth).
- `packages/schemas`: zod + JSON Schema shared types.
- LLM: **French-hosted endpoint provided by AlphaEdge** (decided 20/08/2026; API credentials will be given in Claude Code — never commit them). Implement it as `LLM_PROVIDER=alphaedge` on the OpenAI-compatible adapter (`ALPHAEDGE_BASE_URL`, `ALPHAEDGE_API_KEY`, `ALPHAEDGE_MODEL`, optional `ALPHAEDGE_VISION_MODEL`). Keep `anthropic` only as a local dev fallback behind the same interface. Day-1 task: run `pnpm llm:probe` (see docs/07 §12) to confirm vision support, JSON mode, context length and throughput — the pipeline must degrade to **text-first mode** (OCR + text extraction, deterministic stamp/signature heuristics) if the hosted model has no vision.
- DB: Postgres via Drizzle (SQLite acceptable for local dev). Object storage: local `/storage` in POC.
- OCR fallback: Tesseract (`tesseract.js`) when text layer is absent or garbled (see sample 06).
- Python allowed only in `tools/eval` for the benchmark harness if convenient.

## Conventions

- Status enum (global): `PENDING | PROCESSING | NEEDS_REVIEW | NO_GO | REQUEST_CHANGES | GO`.
- Guarantee compliance enum: `COMPLIANT | BELOW_MINIMUM | MISSING | COVERED_NO_AMOUNT | EXCLUDED | UNCLEAR`.
- Money: store integer minor units + ISO currency; convert once at analysis time with ECB rate of the **reference date**; persist rate and date.
- Dates: ISO 8601, UTC. Analysis has a `referenceDate` (default = reception date; demo default `2025-03-15`).
- All user-facing strings in `apps/web/messages/en.json` (i18n-ready even if English-only now).
- Components: shadcn primitives only; custom components in `apps/web/components/coverscan/`. Design tokens in `design-system/tokens.md`.
- Tests: `vitest`. Rules engine coverage ≥ 90%. Pipeline eval: `pnpm eval` runs all 10 samples and prints field accuracy + decision match vs ground truth.
- Commits: conventional commits. One feature per PR-sized commit.

## Sub-agents available (`.claude/agents/`)

`business-analyst`, `insurance-domain-expert`, `dashboard-orchestrator`, `ai-extraction-engineer`, `frontend-builder`, `qa-ground-truth`. Delegate domain questions to them instead of guessing. When a rule is ambiguous, check `docs/09_open_questions_and_assumptions.md` — if still ambiguous, implement the conservative option (flag for human review) and log the assumption there.

## Commands

- `/check-ground-truth` — runs the eval harness and reports deltas against `ground_truth.json`.
- `/analyze-sample <id>` — runs the full pipeline on one sample and prints the structured result.
- `pnpm catalogue:build` — regenerates `data/checks/check_catalogue.json` + `docs/11` from `tools/build_check_catalogue.py` (edit the script, never the outputs).

## Out of scope for the POC (do not build)

SSO, role management beyond a `role` switch in the header, real Ariba connector (mock + payload preview only), fine-tuning, multi-tenant, email sending (generate drafts only), full audit log UI (store events, show last 5).
