# CoverScan — FORVIA supplier insurance certificate review (POC)

AI-assisted review of supplier liability insurance certificates: OCR + extraction +
deterministic rules engine + English dashboard. See `CLAUDE.md` and `docs/` for the full context.

## Quickstart

```bash
pnpm install
pnpm dev        # → http://localhost:3100  (3000 is intentionally not used)
```

No database or API key is needed to browse: the app runs on cached data for the
10 real annotated certificates (`apps/web/data/certificates.json`).

- `/` redirects to the demo case — certificate **04 Marron / M.T.S.** (broker-issued, not admissible)
- `/certificates/01 … /10` — the ten real certificates
- `/specimens` — component gallery vs the design-system reference cards

## Commands

- `pnpm test` — all workspace tests (incl. ground-truth conformance: displayed decisions = `data/samples/ground_truth.json`)
- `pnpm build` — production build
- `pnpm ocr:probe` — AlphaEdge OCR probe (needs `ALPHAEDGE_API_KEY` in `.env.local`); report: `docs/eval/llm_probe.md`

## Repo layout

- `apps/web` — Next.js dashboard (App Router, Tailwind v4 themed by the design-system tokens)
- `packages/schemas` — zod contracts & enums · `packages/llm` — AlphaEdge OCR client + probe
- `packages/{rules,pipeline,db}` — Sprint 1+ placeholders
- `docs/` — specs 01–11 + build specs/plans under `docs/superpowers/`
- `data/` — check catalogue, insurer registry, 10 annotated samples (ground truth)
