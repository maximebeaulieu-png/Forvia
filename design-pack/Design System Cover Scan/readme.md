# CoverScan — design system

**CoverScan** is an AI review tool for supplier insurance certificates, built for **FORVIA** (automotive Tier-1, ~8,000 supplier certificates a year). A certificate arrives in any language; a vision model reads it, a deterministic rules engine checks it against FORVIA's General Purchasing Terms and Conditions, and the interface tells a non-expert buyer in plain English whether the supplier can be onboarded — **Compliant**, **Request changes** or **Not admissible** — and writes the message to send back. Product tagline in the UI header: *Supplier insurance certificates, verified.*

The dashboard is the product. This design system exists so anyone can build new CoverScan surfaces without re-deriving the vocabulary, the numerals treatment, or the three signature elements the demo is judged on.

## Sources

Everything here is derived from a design pack in a private repository. Nothing was invented; where the pack was silent, this file says so.

- **GitHub — `https://github.com/maximebeaulieu-png/Forvia`** (branch `main`). Read in this order, as the pack itself instructs:
  - `design-pack/START_HERE.md` — reading order and non-negotiables
  - `design-pack/00_CLAUDE_DESIGN_BRIEF.md` — product, personas, the six screens, visual direction, validation checklist
  - `design-pack/01_design_tokens.md` — the shadcn/ui theme: colours, typography, spacing, the CoverScan component list
  - `design-pack/02_dashboard_spec.md` — field-level spec of every screen
  - `design-pack/03_demo_user_journey.md` — the 20-minute demo script and the supplier email template
  - `design-pack/04_real_content_10_certificates.md` — the 10 real FORVIA certificates with verdicts, amounts and gaps
  - `design-pack/sample-pages/*.jpeg` — four real certificate pages (copied into `assets/pages/`)
  - `design-pack/reference/check_catalogue_wording_reference.md` — 122 finding types with English explanations and "fix to request" sentences
  - Wider context, not required for design work: `forvia-coverscan-poc/docs/` (business context, insurance domain knowledge, scoring rules, AI pipeline, architecture), `forvia-coverscan-poc/schemas/`, `forvia-coverscan-poc/prompts/`
- **`https://www.forvia.com/fr`** — the parent brand's public site: the palette (`#0A23CA` / `#8390E4` / `#01003D`), the modern épuré direction, and corporate tone. The official logo files were supplied by the user from the brand site.
- **Icons** — [lucide](https://github.com/lucide-icons/lucide), the set named in the tokens file. Copied into `assets/icons/` as static SVGs.

Read those repositories directly if you have access — they carry the scoring rules and the domain knowledge that explain *why* the interface is shaped this way.

### Not supplied

- **Font binaries.** The pack names Inter and JetBrains Mono; both are loaded from Google Fonts in `tokens/fonts.css`. These are the specified faces, not substitutes, but swap in licensed binaries if FORVIA hosts its own.
- **No photography or illustration.** By instruction: "no decorative imagery".

### Supplied later by the user

- **The official FORVIA logo** (wordmark, lockup with tagline, and the F mark as SVG) — in `assets/` as `logo-lockup.png`, `logo-wordmark.png`, `logo-mark.svg/png`, each with a `-white` variant for use on FORVIA blue.
- **The brand palette from forvia.com**: `#0A23CA` (FORVIA blue), `#8390E4` (light blue), `#01003D` (dark navy). These replace the design pack's provisional deep-navy/warm-paper scheme; the status palette and evidence yellow are unchanged.

---

## CONTENT FUNDAMENTALS

**Language.** English only, in every surface, including screens used by French and German teams. Evidence quotes are the exception: they stay verbatim in the source language and are never translated (`« Frais de retrait engagés par l'assuré 305.000 € »`).

**Case.** Sentence case everywhere — headings, buttons, table headers, chips. Never title case, never all-caps except severity chips (`BLOCK`, `CRITICAL`, `WARNING`, `INFO`) and rule ids (`ISSUER_IS_BROKER`), which are machine tokens shown in mono.

**Voice.** Third person about the document, second person about the action. The tool describes what it found and what to ask; it does not perform enthusiasm. No "we", no "let's", no exclamation marks, no emoji anywhere.

> *"This certificate was issued by a broker (Marron & Associés), not by the insurer, so it has no legal value for FORVIA. Even if reissued by MMA, recall/withdrawal costs are limited to €305,000 against €15M required and are excluded for USA/Canada. Recommended action: request a certificate issued and stamped by MMA with recall ≥ €15M worldwide."*

Three sentences: what is wrong, what it costs, what to do. That is the shape of every verdict.

**Buttons are verbs.** *Request changes · Approve · Reject · Send to SAP Ariba · Export Excel · Re-run with profile · Mark reviewed.* Never a noun, never "Submit".

**Decision labels are fixed and exact.** `Compliant` · `Request changes` · `Not admissible · resubmit` · `Not admissible` · `Needs review`. **Never "Rejected" for a machine result** — rejection is a human action and lives only on the Reject button. `Needs review` is a flag beside the decision, not a decision.

**Numbers.** `€20,000,000` in grids and tables; `€20M` in chips and charts; `€305k · 2 %` on gap bars. Dates read `31 May 2025`. Every amount shows its original currency and value, the EUR conversion, and the rate with its date on hover. No naked numbers, anywhere.

**Jargon gets a gloss.** "Pure financial loss", "per occurrence", "additional insured" are all insurance terms a buyer will not know; the interface always pairs them with a plain consequence ("cover for damage with no physical loss — required at €15,000,000").

**Personal data is masked by default** with a reveal that is logged: `n.•••@polyvlies.de`.

**Empty and error states are short and human.** *"No certificates match. Clear filters or upload one."* · *"Review queue is empty — nice."* · *"We couldn't read this file. Upload a PDF or PNG of the certificate (Word files are not accepted)."*

---

## VISUAL FOUNDATIONS

**The idea: a reading instrument in FORVIA's visual world — modern, épuré, blue on white.** White surfaces, navy ink, hairline rules, dense but breathable tables. The interface sits next to a document — the certificate on the left, FORVIA's standard on the right.

**Colour.** A cool near-white canvas (`#F7F8FC`) with white panels (`#FFFFFF`); navy ink (`#01003D`) for text; **FORVIA blue (`#0A23CA`)** as the only brand colour — primary buttons, active nav, links, focus ring — with `#8390E4` as its light companion and `#EAEDFB` as the hover/selected tint. Everything else chromatic is **status**: green `#1E7F4F`, amber `#B26B00`, red `#B3261E`, violet `#5B3FA6` for review, blue-grey `#575E86` for pending. Status colour never appears alone — always with an icon and a word. Two accent colours maximum per screen besides status. A dark theme exists for the Group Insurance screens at night (`#05061C` canvas, `#0D0F2B` panels, `#8390E4` primary).

**Type.** Inter for the interface, JetBrains Mono with `tabular-nums` for every figure, code and identifier. That mono is the aesthetic signature: `€305,000` sits directly under `€15,000,000` and the gap reads before the words do. Headings are Inter 600 at 22 / 18 / 15 px with −0.01em tracking; body 14 px at 1.45; tables drop to 13 px; captions 12 px; run ids 11 px. Big numbers — KPIs and scores — are mono 600 at 32–40 px. No display serif: this is a tool.

**Spacing and density.** A 4-px grid throughout. Table rows are 36 px (32 in dense mode) and stay legible past 20 rows with sticky headers. Card padding 16. Sidebar 232 px, collapsing to 56. The split view between document and grid has an 8-px gutter with a draggable handle. No max content width — this is a desktop tool with a 1280 px floor and no horizontal scroll on the first three screens.

**Backgrounds.** Flat colour only. No gradients, no imagery, no illustration, no texture, no pattern. The only image in the entire product is the scanned certificate itself.

**Borders and elevation.** Hairline 1-px borders (`#E4E7F4`) carry structure, with one soft ambient shadow on cards (`0 1px 2px rgba(1,0,61,.06)`) so panels lift gently off the canvas. Floating layers go further: popovers and tooltips (`0 8px 24px`), the side sheet (`-12px 0 32px`), the sticky decision panel (an upward `0 -8px 20px` plus a top hairline). Cards are white, 1-px bordered, 12-px radius. Clickable KPI cards raise to the popover shadow on hover.

**Corner radii.** `0.5rem` (8 px) is the default; cards sit at 12 px; **buttons, chips, badges and search fields are full pills** — the rounded, épuré voice of forvia.com. Nothing else.

**Icon tiles.** KPI cards and the upload zone lead with a 36-px rounded tile — tinted background (`--secondary` or a status `-bg`), coloured glyph. The tile carries the tone; the number below stays ink. This is the one decorative gesture in the system; don't spread it to table cells or the coverage grid.

**Hierarchy of information.** Each screen has one primary action (the only filled-blue button on screen) and one headline number per card. Everything intermediate — run ids, model versions, dataset notes, throughput stats — drops to 11–12 px muted text, a footnote line, or a tooltip. If a detail doesn't change what the user does next, it shrinks.

**Hover, focus, press.** Hover fills with `--accent` (`#EAEDFB`) for outline, ghost and table rows; filled buttons brighten 12 % instead. Focus is a visible 2-px ring in FORVIA blue — never removed. There is no press-shrink and no transform on click: the state change is the feedback.

**Motion.** Three animations exist and nothing else: the processing stepper advancing (200 ms, ease-out), table rows recolouring when the requirements profile changes (150 ms), and the evidence highlight pulsing once when a value is clicked (300 ms). All three are disabled under `prefers-reduced-motion`, and their states still change.

**Transparency and blur.** No blur anywhere. Transparency appears exactly twice: the evidence highlight (`#F5C451` at 35 %) and the scrim behind a sheet or dialog (`rgba(1,0,61,.32)`).

**Imagery colour.** The certificate scans are what they are — grey office scans, sometimes skewed, sometimes low contrast. They are never filtered, tinted or cropped for aesthetics. The OCR badge tells the truth about quality instead.

**The three signature elements.** *Gap bar* — one 0→required scale, 6 px tall, ink fill for what was found, a hard black tick at the requirement, hatched when covered without an amount. *Verification seal* — the eight admissibility gates as ticks around a circle, red ticks carrying the story. *Linked evidence* — click a value, the page scrolls and the exact line lights up in soft yellow.

---

## ICONOGRAPHY

**lucide**, named explicitly in the tokens file, copied into `assets/icons/` as static SVGs (45 glyphs) and inlined by the `Icon` component so `currentColor` and stroke width follow CSS. Default size 16 px, stroke 1.75, round caps and joins. Nothing is hand-drawn, and no icon font is used.

The semantic set is fixed by the tokens file: `shield-check` Compliant · `shield-alert` Request changes · `shield-x` Not admissible · `eye` Needs review · `file-question-mark` Awaiting certificate · `loader` Analysing · `stamp` insurer stamp · `pen-line` signature · `building-2` insurer · `hash` policy number · `calendar-clock` expiry · `globe` territory · `coins` amounts · `arrow-up-right` open. Navigation and utility glyphs (`layout-dashboard`, `table`, `users`, `sliders-horizontal`, `plug`, `search`, `upload`, `download`, `funnel`, `refresh-cw`, `copy`, `mail`, `external-link`, `zoom-in`, `zoom-out`, `panel-left`, `chevron-*`, `x`, `check`, `minus`, `ban`, `triangle-alert`, `info`, `circle-check`, `clock`, `eye-off`, `pencil`, `file-text`, `arrow-right`) come from the same set.

**No emoji, ever.** No unicode characters used as icons either, with three deliberate exceptions inside data-dense cells where a glyph would be too heavy: the seal's `✓ ✗ ? –` marks, the mini-grid's `✓ ✗ – ≈ ? •`, and the confidence dot's filled / half / empty circle, which is drawn as SVG.

Insurer logos, ORIAS numbers and broker marks appear only inside the scanned document. They are never re-rendered in the interface.

---

## Components

`components/base/` — shadcn/ui primitives, retuned to the CoverScan tokens. **Intentional additions**: the tokens file lists CoverScan components as "built from" shadcn primitives without shipping those primitives, so the base layer is authored here. `Icon` is the one genuine addition — a wrapper so the lucide set is reachable without hand-written SVG.

- **Icon** · **Button** · **Badge** · **Card** · **Input** · **Select** · **Tabs** · **DataTable** · **Accordion** · **Progress** · **Sheet** · **Tooltip**

`components/verdict/` — is this certificate acceptable, and how sure are we?

- **DecisionChip** — the verdict, seven states, three sizes
- **VerificationSeal** and **VerificationSealList** (plus the `SEAL_GATES` order) — the 8-point admissibility check
- **ScoreRing** — 0–100, greyed and labelled "Provisional" on a not-admissible certificate
- **StatusMiniGrid** — PL / Recall / PFL in three 16-px cells for table rows
- **ConfidenceDot** — extraction confidence with page and verbatim quote

`components/coverage/` — how much cover was found against what FORVIA requires.

- **GapBar** — the required-vs-found scale, five states
- **CoverageGrid** — FORVIA's standard grid, grouped critical / secondary / other
- **FindingsList** — severity-sorted findings with rule id, evidence and the fix to request
- **KpiCard** — portfolio headline figures

`components/document/` — the certificate itself and the machine that read it.

- **DocumentViewer** — pages, thumbnails, zoom, the evidence highlight layer
- **ProcessingStepper** — the 8-step pipeline with timings (plus `PIPELINE_STEPS`)
- **ProfileSwitcher** — the requirements profile, live in the header
- **RequestEmailSheet** and **buildRequestEmail** — the generated supplier message
- **MaskedText** — personal data, masked by default, reveal logged

Every component directory carries a `<Name>.prompt.md` with a one-line "what & when" and a usage example, and one `@dsCard`-tagged HTML showing its states.

## UI kit

`ui_kits/coverscan/` — the full desktop application, 1440 × 900, click-through.

| File | What it is |
|---|---|
| `index.html` | The interactive app: sidebar, header with role and profile switches, all six screens |
| `data.js` | The demo dataset — the 10 real certificates, portfolio aggregates, profiles, audit trail |
| `AppShell.jsx` | Sidebar, header, page headings |
| `PortfolioScreen.jsx` | Screen 2 — KPIs, compliance by country, coverage gap by guarantee, top risks, expiry timeline, throughput strip |
| `CertificatesScreen.jsx` | Screen 3 — saved views, filters, upload drop zone, the queue table |
| `CertificateScreen.jsx` | Screen 1 — the core: document ↔ grid split, five tabs, decision panel, email sheet, Ariba payload, processing state |
| `MidFiScreens.jsx` | Screens 4–6 — Supplier 360, Requirements profiles, Integrations |

Try: open the portfolio, click **Not admissible**, open the Marron & Associés row, then click the €305,000 recall figure and watch page 2 highlight. **Upload** in the header replays the processing stepper. Switching the profile to *Expert* recolours the CeramTec row.

## Foundation cards

`guidelines/*.card.html` — 16 specimen cards feeding the Design System tab, grouped Colors, Type, Spacing, Brand.

## Repository index

```
styles.css                 the single entry point consumers link
tokens/                    colors · typography · spacing · elevation · motion · fonts · base
guidelines/                16 foundation specimen cards
components/base/           12 shadcn primitives
components/verdict/        5 verdict components
components/coverage/       4 coverage components
components/document/       5 document and pipeline components
ui_kits/coverscan/         the full application, 6 screens
assets/icons/               45 lucide SVGs
assets/pages/              4 real certificate page scans
assets/logo-*              official FORVIA marks (+ white variants)
thumbnail.html             the homepage tile
SKILL.md                   Agent Skills entry point
github.md                  source repository association
```

## Validation checklist

Taken from the brief; hold every new screen against it.

- A non-expert can tell in under 10 seconds why a certificate is not admissible and what to ask.
- Every number shows original value + currency, EUR value, rate and date on hover, and a confidence dot.
- Status is never colour-only, and status text passes WCAG AA.
- Gap bars use one scale per row; the requirement tick is always visible; the label reads at 13 px.
- A provisional score is visibly secondary — greyed and labelled — never hidden.
- The profile switch is discoverable in the header and its effect is visible in the table.
- The processing stepper shows 8 steps with timings and a total under 30 s.
- Tables keep 36-px rows and stay legible with 20+ rows, with sticky headers.
- Masked personal data has a reveal affordance.
- No decorative imagery, no gradient, mono numerals everywhere money appears.
- Works at 1280 wide without horizontal scroll on the first three screens.
