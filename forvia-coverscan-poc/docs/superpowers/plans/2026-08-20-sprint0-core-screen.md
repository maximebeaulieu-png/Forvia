# Sprint 0 + Certificate Analysis Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Scaffold the CoverScan monorepo and deliver the Certificate analysis screen fed by cached data, with the AlphaEdge OCR client probed, viewable at `http://localhost:3100` with zero external dependencies.

**Architecture:** pnpm + Turborepo monorepo inside `forvia-coverscan-poc/`. `apps/web` is a Next.js App Router app whose entire visual language comes from the design-system token CSS files (copied verbatim); shadcn primitives + 14 re-implemented CoverScan components render a JSON-backed `CertificateRepository` (no DB this phase). `packages/llm` holds the AlphaEdge OCR client + probe.

**Tech Stack:** Next.js (latest stable, App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, lucide-react, zod, vitest + @testing-library/react, tsx for scripts.

## Global Constraints

- Dev server port: **3100** (`next dev -p 3100`) — user's port 3000 is taken.
- All styling through `var(--…)` tokens from the DS copies — **no raw hex/px colour values** in `components/`.
- Locked labels (DecisionChip): `Compliant`, `Request changes`, `Not admissible · resubmit`, `Not admissible`, `Needs review`, `Processing`, `Pending` — never "Rejected".
- ConfidenceDot thresholds: `●` ≥ 0.85, `◐` 0.6–0.85, `○` < 0.6.
- Demo reference date: **2025-04-15**, injected via config — never `new Date()`.
- Amounts stored in **minor units** + ISO currency; display via formatters only.
- English-only UI; desktop 1440 (floor 1280); status never colour-only (icon + word).
- Secrets live in `forvia-coverscan-poc/.env.local` (exists, gitignored) — never committed, never read at build time by the web app (only the probe script reads it).
- DS reference root: `../design-pack/Design System Cover Scan/` (relative to `forvia-coverscan-poc/`). Referred to below as `$DS`.
- Every component task MUST read its `$DS/components/**/<Name>.d.ts` + `<Name>.prompt.md` + the matching `*.card.html` before implementing.
- Commit after each task with a conventional message; never commit `.env.local` or `node_modules`.

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json` (root), `pnpm-workspace.yaml`, `turbo.json`
- Create: `packages/{schemas,llm,rules,pipeline,db}/package.json` (+ `src/index.ts` stubs; rules/pipeline/db get a README saying "Sprint 1+")
- Modify: `.gitignore` (add `.turbo`, `.next`)

**Interfaces:**
- Produces: workspace names `@coverscan/schemas`, `@coverscan/llm`, `@coverscan/rules`, `@coverscan/pipeline`, `@coverscan/db`; root scripts `dev`, `build`, `test`, `ocr:probe`.

Root `package.json`:
```json
{
  "name": "coverscan",
  "private": true,
  "engines": { "node": ">=22" },
  "packageManager": "pnpm@10.33.3",
  "scripts": {
    "dev": "turbo run dev --filter=web",
    "build": "turbo run build",
    "test": "turbo run test",
    "ocr:probe": "pnpm --filter @coverscan/llm probe"
  },
  "devDependencies": { "turbo": "^2" }
}
```
`pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]`.
`turbo.json`: tasks `build` (dependsOn `^build`, outputs `.next/**`, `dist/**`), `dev` (cache false, persistent true), `test` (dependsOn `^build`).
Package stubs: `{ "name": "@coverscan/<name>", "version": "0.0.1", "type": "module", "main": "src/index.ts", "types": "src/index.ts" }`; schemas + llm add `"scripts": {"test": "vitest run"}` and devDeps `vitest`, `typescript`; llm adds `tsx` + script `"probe": "tsx src/ocr/probe.ts"`.

- [x] Step 1: write all files above
- [x] Step 2: `pnpm install` → lockfile created, no errors
- [x] Step 3: `git status` → verify `.env.local` and `node_modules` absent from untracked list
- [x] Step 4: commit `chore: scaffold pnpm+turbo monorepo`

### Task 2: Next.js app on port 3100

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/next-env.d.ts`

**Interfaces:**
- Produces: workspace `web`; `pnpm dev` serves http://localhost:3100.

`apps/web/package.json` deps: `next` (latest stable), `react`, `react-dom`, `lucide-react`, `zod`, `@coverscan/schemas: workspace:*`; devDeps: `typescript`, `@types/react`, `@types/node`, `tailwindcss@^4`, `@tailwindcss/postcss`, `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`. Scripts: `"dev": "next dev -p 3100"`, `"build": "next build"`, `"start": "next start -p 3100"`, `"test": "vitest run"`.
`app/page.tsx`: `redirect('/certificates/04')` (server component, `next/navigation`).
`app/layout.tsx`: minimal html/body shell for now (fonts arrive Task 3).

- [x] Step 1: write files, `pnpm install`
- [x] Step 2: `pnpm --filter web build` → passes
- [x] Step 3: start dev, `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100` → 307/404 acceptable (redirect target not built yet), server responds; stop server
- [x] Step 4: commit `feat(web): next.js app skeleton on port 3100`

### Task 3: Design tokens + fonts + Tailwind v4

**Files:**
- Create: `apps/web/styles/tokens/{colors,typography,spacing,elevation,motion,base,fonts}.css` — copied from `$DS/tokens/`, then `fonts.css` edited: remove any remote `@import`/`url(` to Google Fonts; font-family vars must consume `var(--font-inter)` / `var(--font-jetbrains-mono)` provided by next/font.
- Create: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx` (next/font), `apps/web/postcss.config.mjs`

**Interfaces:**
- Produces: every DS token available globally; Tailwind utilities `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-primary-foreground`, `ring-ring`, plus `--status-*`, `--gap-*`, `--evidence*` vars usable via arbitrary values `bg-(--status-go-bg)`.

`globals.css`:
```css
@import "tailwindcss";
@import "../styles/tokens/fonts.css";
@import "../styles/tokens/colors.css";
@import "../styles/tokens/typography.css";
@import "../styles/tokens/spacing.css";
@import "../styles/tokens/elevation.css";
@import "../styles/tokens/motion.css";
@import "../styles/tokens/base.css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-ring: var(--ring);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
}
```
`layout.tsx`: `Inter({ subsets:['latin'], variable:'--font-inter' })`, `JetBrains_Mono({ subsets:['latin'], variable:'--font-jetbrains-mono' })` from `next/font/google` (self-hosted at build by Next); classes on `<html>`; `<body className="bg-background text-foreground font-sans">`.

- [x] Step 1: copy the 7 token files (`styles.css` itself is replaced by globals.css imports), edit fonts.css as above
- [x] Step 2: temporary marker in `page.tsx`… skip — instead `pnpm --filter web build` passes
- [x] Step 3: grep check: `grep -rn "fonts.googleapis\|url(http" apps/web/styles/` → no hits
- [x] Step 4: commit `feat(web): DS tokens as single style source + self-hosted fonts`

### Task 4: shadcn primitives

**Files:**
- Create: `apps/web/components.json`, `apps/web/lib/utils.ts` (cn), `apps/web/components/ui/*` via CLI

- [x] Step 1: `pnpm dlx shadcn@latest init` (style: new-york, base color: neutral, CSS variables: yes → point to `app/globals.css`); accept it wiring to existing vars — do NOT let it overwrite token values: re-diff `globals.css`/`colors.css` after init and revert any palette it injected (our DS values win)
- [x] Step 2: `pnpm dlx shadcn@latest add button badge card table tabs sheet tooltip input select progress accordion separator`
- [x] Step 3: `pnpm --filter web build` passes; `git diff apps/web/styles/` empty (tokens untouched)
- [x] Step 4: commit `feat(web): shadcn primitives wired to DS tokens`

### Task 5: `@coverscan/schemas` — enums + cached-certificate contract

**Files:**
- Create: `packages/schemas/src/enums.ts`, `packages/schemas/src/certificate.ts`, `packages/schemas/src/index.ts`
- Test: `packages/schemas/test/certificate.test.ts`, `packages/schemas/vitest.config.ts`

**Interfaces:**
- Produces (exact exports):
  - `Decision = z.enum(["GO","REQUEST_CHANGES","NO_GO"])`
  - `NoGoSubtype = z.enum(["FORMAL_DEFECT","STRUCTURAL"])`
  - `DisplayStatus = z.enum(["GO","REQUEST_CHANGES","FORMAL_DEFECT","STRUCTURAL","NEEDS_REVIEW","PROCESSING","PENDING"])`
  - `GuaranteeStatus = z.enum(["COMPLIANT","BELOW_MINIMUM","MISSING","COVERED_NO_AMOUNT","EXCLUDED","UNCLEAR"])`
  - `Severity = z.enum(["BLOCK","CRITICAL","WARNING","INFO"])`
  - `GateState = z.enum(["pass","fail","review","na"])`
  - `CachedCertificate` (zod) + inferred TS type `CachedCertificateT` — the merged shape (see Task 6): identity/table fields from `data.js` (id, supplier, country, insurer, rating, policyNumber, decision→DisplayStatus, score, provisional, accuracy, currency, expiry, expiryDays, received, aribaId, entity, seconds, model, runId, needsReview, mini, pages[], summary, gates{}) plus optional deep fields from `expected.json` (guarantees[], exclusions[], deductibles[], fx, territory, trigger, basisSummary, computed{riskScore, breakdown, decision, noGoSubtype, failedGates, needsHumanReview}, accuracyScore{global, fields}).
  - Pure helper `toDisplayStatus(decision: "GO"|"REQUEST_CHANGES"|"NO_GO", noGoSubtype: "FORMAL_DEFECT"|"STRUCTURAL"|null, needsReview: boolean): DisplayStatusT` — NO_GO maps to its subtype; needsReview only overrides when decision is not NO_GO.

Test (write first, red → green):
```ts
import { describe, it, expect } from "vitest";
import { CachedCertificate, toDisplayStatus } from "../src/index.js";
import raw from "../../../data/samples/04_marron-mma_mts_FR/expected.json";

it("parses real expected.json deep fields", () => {
  const r = CachedCertificate.pick({ computed: true }).safeParse({ computed: raw.computed });
  expect(r.success).toBe(true);
});
it("maps NO_GO + FORMAL_DEFECT", () => {
  expect(toDisplayStatus("NO_GO", "FORMAL_DEFECT", true)).toBe("FORMAL_DEFECT");
});
it("review wins over REQUEST_CHANGES", () => {
  expect(toDisplayStatus("REQUEST_CHANGES", null, true)).toBe("NEEDS_REVIEW");
});
```
(vitest config: `resolve.alias` not needed; enable `json` imports via `assert` type or `import raw from ... with { type: "json" }` per Node 22.)

- [x] Step 1: failing tests → Step 2: implement → Step 3: `pnpm --filter @coverscan/schemas test` green → Step 4: commit `feat(schemas): enums + cached certificate contract`

### Task 6: cached data build + repository

**Files:**
- Create: `apps/web/scripts/build-cached-data.mjs`
- Create (generated, committed): `apps/web/data/certificates.json`
- Create: `apps/web/lib/repository.ts`, `apps/web/lib/config.ts`
- Create: `apps/web/public/pages/` (copies of the sample page JPEGs used by `data.js`, named `<certId>_p<n>.jpeg`)
- Test: `apps/web/test/repository.test.ts`, `apps/web/vitest.config.ts`

**Interfaces:**
- Consumes: `$DS/ui_kits/coverscan/data.js` (browser IIFE `window.CS`), `data/samples/*/expected.json`
- Produces: `getCertificates(): CachedCertificateT[]`, `getCertificate(id: string): CachedCertificateT | undefined` (ids `"01"…"10"`); `REFERENCE_DATE = "2025-04-15"` in `lib/config.ts`.

`build-cached-data.mjs` (run manually, output committed for zero-config dev):
```js
// 1. globalThis.window = {}; await import(DS data.js path) — it assigns window.CS
// 2. read the 10 expected.json by matching sample dir prefix (01→01_chubb…, etc.)
// 3. merge: base = CS.certificates[i]; deep = expected fields listed in Task 5; pages[].imageUrl rewritten to /pages/<id>_p<n>.jpeg
// 4. validate each with CachedCertificate.parse (import from packages/schemas via relative path)
// 5. write apps/web/data/certificates.json (stable key order, 2-space indent)
```
Also copies each referenced JPEG from `data/samples/*/pages/*.jpeg` into `apps/web/public/pages/`.

Repository test:
```ts
it("loads all 10 certificates", () => expect(getCertificates()).toHaveLength(10));
it("cert 04 is the broker NO_GO case", () => {
  const c = getCertificate("04")!;
  expect(c.supplier).toMatch(/MTS/);
  expect(["FORMAL_DEFECT","STRUCTURAL"]).toContain(c.decision);
});
it("unknown id returns undefined", () => expect(getCertificate("99")).toBeUndefined());
```

- [x] Steps: failing test → script → run script (validates via zod) → test green → `git add` generated JSON + images → commit `feat(web): cached data build + certificate repository`

### Task 7: formatters

**Files:**
- Create: `apps/web/lib/format.ts` · Test: `apps/web/test/format.test.ts`

**Interfaces (produces, exact):**
- `formatEur(minor: number): string` → `formatEur(2000000000) === "€20,000,000"` (no decimals; en-US grouping)
- `formatAmount(minor: number, ccy: string): string` → `"USD 5,000,000"`
- `formatCompactEur(minor: number): string` → `"€20M"`, `"€305k"`
- `gapPercent(foundMinor: number|null, requiredMinor: number): number` → clamped 0–100 integer; null→0
- `daysLeft(dateIso: string, referenceIso: string): number` → calendar-day diff, negative when past
- `confidenceGlyph(c: number): "●"|"◐"|"○"` per Global Constraints thresholds (boundary: `≥0.85`→●, `≥0.6`→◐)

Tests: one assertion per example above, plus `daysLeft("2025-05-31","2025-04-15") === 46` (the "Chubb 46 days" fact) and `confidenceGlyph(0.85) === "●"`.

- [x] Steps: red → implement → green → commit `feat(web): amount/date/confidence formatters`

### Task 8: verdict components

**Files:**
- Create: `apps/web/components/coverscan/{DecisionChip,ConfidenceDot,ScoreRing,StatusMiniGrid,VerificationSeal}.tsx` + `index.ts` barrel
- Test: `apps/web/test/verdict.test.tsx`
- Create: `apps/web/app/specimens/page.tsx` (starts here, grows in Tasks 9–10)

**Interfaces:**
- Props copied verbatim from `$DS/components/verdict/*.d.ts` (DecisionChipProps shown in the spec; read the four others the same way). Consumes `DisplayStatus`, `confidenceGlyph`.

Behaviour rules (from `.d.ts` + cards — implementer MUST also read `$DS/components/verdict/verdict.card.html`):
- DecisionChip: icon+word always; FORMAL_DEFECT outlined / STRUCTURAL solid; sizes sm/md/lg = 20/24/28px; label map: GO→`Compliant`, REQUEST_CHANGES→`Request changes`, FORMAL_DEFECT→`Not admissible · resubmit`, STRUCTURAL→`Not admissible`, NEEDS_REVIEW→`Needs review`, PROCESSING→`Processing`, PENDING→`Pending`.
- ScoreRing: SVG ring 0–100, `provisional` renders greyed with "Provisional" caption.
- VerificationSeal: 8 gates ✓/✗/?/— from `gates{}` keys (stamp, signature, insurer, policyNumber, dates, entity, coinsurance, documentType).

Tests (RTL):
```tsx
it("never says Rejected", () => {
  for (const d of ["GO","REQUEST_CHANGES","FORMAL_DEFECT","STRUCTURAL","NEEDS_REVIEW","PROCESSING","PENDING"] as const) {
    const { container, unmount } = render(<DecisionChip decision={d} />);
    expect(container.textContent).not.toMatch(/rejected/i); unmount();
  }
});
it("locked label for formal defect", () => {
  render(<DecisionChip decision="FORMAL_DEFECT" />);
  expect(screen.getByText("Not admissible · resubmit")).toBeInTheDocument();
});
```

- [x] Steps: red → implement 5 components → green → add all 5 to `/specimens` with the states shown in `verdict.card.html` → visual check vs card → commit `feat(web): verdict components`

### Task 9: coverage components

**Files:**
- Create: `apps/web/components/coverscan/{GapBar,CoverageGrid,FindingsList,KpiCard}.tsx` (extend barrel)
- Test: `apps/web/test/coverage.test.tsx`

**Interfaces:** props from `$DS/components/coverage/*.d.ts` (GapBarProps shown in full in the spec). CoverageGrid rows consume `guarantees[]` from `CachedCertificateT` + profile requirements `{pl: 2000000000, recall: 1500000000, pfl: 1500000000}` minor units (constant in `lib/config.ts`: `GPTC_REQUIRED`).

Rules: GapBar always ink fill (`--gap-fill`), tick at requirement (`--required-marker`), label carries status colour; `COVERED_NO_AMOUNT` hatched; `MISSING` empty track. FindingsList sorts BLOCK > CRITICAL > WARNING > INFO, expandable rows with checkId, evidence quote, fix suggestion.

Tests:
```tsx
it("fill width = found/required", () => {
  render(<GapBar found={30500000} required={1500000000} status="BELOW_MINIMUM" />);
  // inner fill element carries width 2% (via style) — assert style.width === "2%"
});
it("missing renders empty track and no fill", () => { /* found null, status MISSING → fill width 0 */ });
it("findings sorted by severity", () => { /* pass shuffled severities, assert DOM order BLOCK first */ });
```

- [x] Steps: red → implement → green → extend `/specimens` (coverage.card.html states) → commit `feat(web): coverage components`

### Task 10: document components

**Files:**
- Create: `apps/web/components/coverscan/{DocumentViewer,ProcessingStepper,ProfileSwitcher,RequestEmailSheet,MaskedText}.tsx` (extend barrel)
- Test: `apps/web/test/document.test.tsx`

**Interfaces:** props from `$DS/components/document/*.d.ts`. DocumentViewer consumes `pages[] {n, imageUrl, lang}` + optional evidence overlays `{page, bbox?: [x,y,w,h] (0–1), severity}` and exposes `scrollToEvidence(page: number)` via ref or accepts `activeEvidence` prop (follow the `.d.ts` — whichever it declares). ProcessingStepper uses `PIPELINE_STEPS` order from the `.d.ts`. ProfileSwitcher: renders GPTC + Expert options; Expert option `disabled` with `title="Recalcul au Sprint 1"`. RequestEmailSheet: builds email body from findings (uses shadcn Sheet). MaskedText: masks by default, `onReveal` callback fires on click (screen wires it to `console.info` audit stub).

Tests: MaskedText hides content until clicked then shows + fires onReveal; ProcessingStepper renders 8 steps with current state; ProfileSwitcher Expert disabled.

- [x] Steps: red → implement → green → extend `/specimens` → commit `feat(web): document components`

### Task 11: API routes + Certificate analysis screen

**Files:**
- Create: `apps/web/app/api/certificates/route.ts` (GET list), `apps/web/app/api/certificates/[id]/route.ts` (GET one)
- Create: `apps/web/app/certificates/[id]/page.tsx` (server) + `certificate-view.tsx` (client)
- Create: `apps/web/components/coverscan/CertificateHeader.tsx`
- Test: `apps/web/test/screen.test.tsx`

**Layout (from docs/05 + `$DS/ui_kits/coverscan/CertificateScreen.jsx` — read both):** top bar (supplier · country · Ariba id · insurer+rating pill · policy no · period + `valid · N days left` via `daysLeft` vs `REFERENCE_DATE` · DecisionChip lg · accuracy % · profile · reference date · `Analysed in Ns · model vX · run id`); left pane DocumentViewer; right pane shadcn Tabs with the 5 locked tabs (**Summary** default: 3-sentence `summary`, VerificationSeal, CoverageGrid, ScoreRing w/ breakdown popover — provisional when NO_GO —, FindingsList; **Extracted data**: raw fields + ConfidenceDot + FX line; **Exclusions & territory**: 3-cell Worldwide·USA/Canada·Other; **History**: static excerpt (prior certs listed in cached data if present, else "No previous certificates"); **Audit**: static 2 events "ingested/analysed" from runId/model); sticky decision panel (Request changes → RequestEmailSheet; Approve disabled unless GO; Reject w/ select; Send to Ariba disabled tooltip "Sprint 2"; Assign/Mark reviewed local state); prev/next cert navigation (`01`→`10`).

Tests: renders cert 04 with `Not admissible` chip family; tab switching shows Extracted data; screen for id 99 → `notFound()`.

- [x] Steps: red → implement → green → `pnpm --filter web build` → manual dev check of `/certificates/04` and 2–3 others → commit `feat(web): certificate analysis screen + api`

### Task 12: AlphaEdge OCR client (`@coverscan/llm`)

**Files:**
- Create: `packages/llm/src/ocr/client.ts`, `packages/llm/src/ocr/types.ts`, `packages/llm/src/reason/index.ts` (interface stub only: `export interface ReasonProvider { complete(prompt: string): Promise<string> }`), `packages/llm/src/index.ts`
- Test: `packages/llm/test/client.test.ts`

**Interfaces (produces, exact):**
```ts
export interface OcrResult { modelSlug: string; text: string; inferenceSeconds: number; globalConfidence: number; words: {w: string; confidence: number}[]; raw: unknown }
export interface OcrClientOptions { baseUrl?: string; apiKey: string; model?: string; cacheDir?: string; maxRetries?: number; minIntervalMs?: number }
export class AlphaEdgeOcrClient {
  constructor(opts: OcrClientOptions)             // defaults: baseUrl https://api-endpoints.alphaedge-ai.com, model alpha-digit-max, cacheDir .cache/ocr, maxRetries 3, minIntervalMs 1100 (60 rpm)
  async ocrFile(filePath: string, opts?: {enableBbox?: boolean; model?: string}): Promise<OcrResult>
}
```
Behaviour: POST `${baseUrl}/models/${model}/ocr`, multipart field **`image`** (never `file`), header `X-API-Key`; retry on 5xx/429/network with exponential backoff (500ms base); throttle successive calls to `minIntervalMs`; disk cache keyed `sha256(file bytes + model + bbox flag)` → skip network on hit; 4xx (except 429) throws immediately with response body in the message.

Tests use `vi.stubGlobal("fetch", …)`: (1) sends field `image` + header; (2) retries once on 500 then succeeds; (3) second identical call hits cache (fetch called once); (4) 422 throws without retry.

- [x] Steps: red → implement → green → commit `feat(llm): alphaedge ocr client with retry/throttle/cache`

### Task 13: OCR probe (real API run)

**Files:**
- Create: `packages/llm/src/ocr/probe.ts`
- Create (generated, committed): `docs/eval/llm_probe.md`

Probe: loads `../../.env.local` (dotenv or manual parse), iterates all `data/samples/*/pages/*.jpeg` (~26), runs `alpha-digit-max` on each + `alpha-digit-medium` on each, computes per-page word-similarity vs sibling `.txt` (SequenceMatcher-style ratio — implement `similarity(a,b)` over word arrays with a small LCS or use `difflib`-equivalent simple ratio), tests `enable_bbox` on ONE page and records the response shape, then writes `docs/eval/llm_probe.md`: table per page (cert, page, model, confidence, seconds, similarity), aggregates per model, bbox findings, recommendation line, and closes U1–U4 (vision: N/A — OCR-only provider; JSON: multipart REST; context: per-page; throughput: measured). Respect throttle; total cost note (<€0.05).

- [x] Steps: implement → `pnpm ocr:probe` (real run, ~3–5 min) → review report numbers are plausible → commit `docs(eval): alphaedge ocr probe report` (report + cache excluded: add `.cache/` to `.gitignore`)

### Task 14: conformance test, docs updates, final gate

**Files:**
- Test: `apps/web/test/ground-truth.test.ts`
- Modify: `docs/07_ai_pipeline.md`, `docs/08_architecture.md`, `docs/09_open_questions_and_assumptions.md`, `CLAUDE.md`, `.env.example`, `README.md`

Ground-truth test: for each of the 10 cached certs, assert `toDisplayStatus(computed.decision, computed.noGoSubtype, computed.needsHumanReview)` matches what the screen's chip renders (render `CertificateHeader` per cert) and matches `data/samples/ground_truth.json` decisions.

Docs edits (surgical, per spec §9): 07 → AlphaEdge = OCR REST + probe numbers + text-first primary; 08 → front decision + JSON repository note + §9 env vars replaced by real ones (`ALPHAEDGE_BASE_URL/API_KEY/OCR_MODEL`); 09 → C7 closed as OCR-only, reason-LLM open w/ Anthropic candidate + §4.4 caveat; CLAUDE.md → clock 2025-04-15 + OCR reality + port 3100; `.env.example` → rewrite (OCR vars; `DATABASE_URL`/`DEMO_MODE` commented "Sprint 1+"); README → quickstart `pnpm install && pnpm dev` → http://localhost:3100.

- [x] Steps: conformance test green → docs edits → `pnpm build && pnpm test` all green → commit `docs: align pipeline/env docs with OCR reality + quickstart` → final: leave `pnpm dev` running for the user
