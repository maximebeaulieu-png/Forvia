# Design brief — CoverScan for FORVIA
### AI review of supplier insurance certificates · POC · desktop web app · English

*Send this file with `design-system/tokens.md`, `docs/05_dashboard_spec.md` and `docs/06_demo_user_journey.md`. Sample certificate page images are in `data/samples/*/pages/` — use the real ones in the mockups (Marron & Associés p.2 and Chubb p.1 especially).*

---

## 1. What this is, in one paragraph

FORVIA (automotive Tier-1, ~8,000 supplier insurance certificates a year) must check that each supplier's liability insurance is real, issued by the insurer, still valid, and big enough under FORVIA's purchasing terms (product liability ≥ €20M; product recall and pure financial loss ≥ €15M). Today nobody reads them; the broker offers to do it by hand for €90k/year. CoverScan ingests a certificate in any language, reads it with a vision LLM, checks it with deterministic rules, and tells the buyer in plain English: **Compliant**, **Request changes**, or **Not admissible** — and writes the message to the supplier. The dashboard is the product; the jury judges the POC on it.

## 2. Who uses it (three personas, one role switch in the header)

- **Buyer** — not an insurance person; wants *can I onboard / what do I ask*. Reads the Summary tab, clicks Request changes. 2 minutes.
- **Group Insurance analyst** — expert; clears the *Needs review* queue, zooms on stamps/signatures, edits a misread number, overrides with justification. 1 minute per item.
- **Group Insurance Director / CPO** — wants exposure by country and guarantee, what expires, proof the machine works. One screen, exportable.

## 3. The six screens (priority order)

1. **Certificate analysis** — the core. Split view: original page images left, FORVIA standard grid right, every number linked to a highlight on the page. Top: decision chip + verification seal + accuracy %. Right tabs: Summary / Extracted data / Exclusions & territory / History / Audit. Sticky decision panel: Request changes (opens generated email), Approve, Reject, Send to SAP Ariba.
2. **Portfolio** — 4 KPIs (suppliers covered, not admissible, critical gaps, expiring ≤ 90 d), compliance by country, coverage gap by guarantee (gap bars), top 10 risks, expiring timeline, processing strip, profile switch.
3. **Certificates table** — status chip, supplier, insurer + rating, PL/Recall/PFL mini-grid, score, accuracy dot, expiry, currency, received, assignee. Saved views incl. *Needs review*. Upload drop zone → processing stepper.
4. **Supplier 360** — certificates by year, change detection banner ("recall dropped €15M → €10M"), policy numbers on file.
5. **Requirements profiles** — thresholds, gate severities, weights (sum 100), simulate on portfolio.
6. **Integrations** — SAP Ariba payload preview + mock sync, Excel export, registry/FX versions.

Full field-level spec: `docs/05_dashboard_spec.md`. Demo script: `docs/06_demo_user_journey.md`.

## 4. Visual direction (see `design-system/tokens.md` for exact tokens)

**An underwriter's desk, not a SaaS landing page.** Warm paper background, ink text, deep navy primary, hairline borders, dense but breathable tables. Colour is reserved for **status** (green / amber / red / violet-review) and always paired with an icon and a word. The distinctive move: **all money and identifiers in a tabular mono face**, so "€305,000" sits under "€15,000,000" and the gap reads before the words do. No hero, no gradients, no illustration. Motion only where it carries information (processing stepper, row recolour on profile switch, evidence pulse).

Three signature elements to design with care:
- **Gap bar** — one scale 0→required, ink fill for found, a black tick at the requirement, label "€305k · 2 %". Hatched when "covered" without amount. Used in grid rows and in the portfolio chart.
- **Verification seal** — the admissibility checklist (stamp, signature, insurer, policy no., dates, entity, co-insurance, document type) drawn as 8 ticks around a circle; red ticks are the story ("broker-issued", "no stamp").
- **Linked evidence** — click a value → the original page scrolls and the exact line lights up in soft yellow.

## 5. Content to use in mockups (real, from the FORVIA samples)

- **Marron & Associés / M.T.S. (FR)** — Not admissible (structural): issuer is a broker (ORIAS 07 002 497), broker's stamp, no insurer signature. Headline €10M but recall/withdrawal costs €305,000 (required €15M), and USA/Canada *excluded* for recall and refitting. Summary: *"This certificate was issued by a broker (Marron & Associés), not by the insurer, so it has no legal value for FORVIA. Even if reissued by MMA, recall/withdrawal costs are limited to €305,000 against €15M required and are excluded for USA/Canada. Recommended action: request a certificate issued and stamped by MMA with recall ≥ €15M worldwide."*
- **Chubb / Air Products (FR, USD)** — Request changes, score 12/100: combined GL+PL USD 5,000,000 = €4,672,897 (ECB 1.07, 26 Apr 2024) vs €20M; pure financial loss USD 200,000; consequential loss missing; recall missing; signature ambiguous → Needs review; valid until 31 May 2025 (46 days at demo clock 15 Apr 2025).
- **Zurich ES / Componentes de Vehículos de Galicia** — Request changes, score 56: product liability €20M ✓, recall €4M, pure financial loss €3M, dismantling €4M; supplier is the *additional insured* of parent Grupo COPO; stamp ✓, signature unclear.
- **Allianz AGCS / CeramTec** — Not admissible (formal: no stamp); recall €5M; switch profile to "Expert" → recall turns compliant.
- **Generali Italia / Metraton** — highest score 60: PL €50M, recall €10M; master policy of Landi Renzo.
- Portfolio numbers for the demo dataset (10 real + 140 synthetic): 150 certificates · 9 compliant (6 %) · 61 request changes · 64 not admissible (41 formal / 23 structural) · 16 needs review (11 %) · 12 expired · 23 expiring ≤ 90 d · avg 18 s · field accuracy 93 %.

## 6. Copy rules
English, sentence case, verbs on buttons. Decision labels exactly: *Compliant · Request changes · Not admissible · resubmit · Not admissible · Needs review*. Never "Rejected" for a machine result. Amounts `€20,000,000` in grids, `€20M` in chips/charts. Evidence quotes stay in the source language. Personal data masked by default (`n.•••@polyvlies.de`).

## 7. What we need back from Claude Design

1. High-fidelity mockups, desktop 1440 × 900, light theme, for screens **1, 2, 3** (in that order); screens 4–6 mid-fidelity.
2. States for screen 1: *Not admissible (structural)*, *Request changes*, *Compliant*, *Needs review*, *Processing* (stepper), plus the *Request changes* sheet with the email.
3. A component sheet: DecisionChip (3 sizes), VerificationSeal (96/40 px), GapBar (5 states), ConfidenceDot, StatusMiniGrid, KpiCard, ScoreRing (normal/provisional), ProcessingStepper.
4. The shadcn theme as CSS variables + Tailwind config matching `tokens.md` (or propose deltas with reasons).
5. Dark theme for screens 1 and 3 only.

## 8. Validation checklist (we accept the mockups when)

- [ ] A non-expert can tell, in under 10 seconds on screen 1, *why* the Marron certificate is not admissible and *what to ask*.
- [ ] Every number on the grid shows original value + currency, EUR value, rate/date on hover, and a confidence dot.
- [ ] Status is never colour-only; WCAG AA contrast on all status text.
- [ ] Gap bars use one scale per row; required tick is always visible; label readable at 13 px.
- [ ] Provisional score on Not admissible is visibly secondary (greyed, labelled), not hidden.
- [ ] The profile switch is discoverable in the header and its effect is visible in the table.
- [ ] The processing stepper shows 8 steps with timings and a total < 30 s.
- [ ] Tables keep 36 px rows and stay legible with 20+ rows; sticky headers.
- [ ] Masked personal data has a reveal affordance.
- [ ] No decorative imagery; no gradient; mono numerals everywhere money appears.
- [ ] Works at 1280 wide without horizontal scroll on screens 1–3.

## 9. Out of scope for the mockups
Mobile layouts, login/SSO screens, marketing pages, email client rendering, real Ariba UI.
