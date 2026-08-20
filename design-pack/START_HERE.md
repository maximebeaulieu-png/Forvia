# CoverScan — Design pack for Claude Design

Read in this order. Everything Claude Design needs is here; the rest of the repository (AI pipeline, rules engine, architecture, prompts, schemas) is deliberately left out — it would dilute the brief without improving the mockups.

| # | File | Why |
|---|---|---|
| 0 | `00_CLAUDE_DESIGN_BRIEF.md` | **The brief.** Product in one paragraph, personas, the 6 screens in priority order, visual direction, signature elements, validation checklist, deliverables expected. |
| 1 | `01_design_tokens.md` | shadcn/ui theme: colours (status palette with hex, light/dark), typography (Inter + JetBrains Mono tabular numerals), spacing, the 13 CoverScan components to design. |
| 2 | `02_dashboard_spec.md` | Field-level spec of every screen: information architecture, exact labels, table columns, KPIs, the Certificate Analysis split view (document ↔ grid), the 5 tabs, the decision panel. |
| 3 | `03_demo_user_journey.md` | The 20-minute demo script, minute by minute, with the English micro-copy and the supplier email template. Design for this script. |
| 4 | `04_real_content_10_certificates.md` | Real data for the mockups: the 10 FORVIA certificates with their verdicts, amounts and gaps. Use these names and numbers, not lorem ipsum. |
| — | `sample-pages/*.jpeg` | Four real certificate pages for the document viewer (Marron & Associés p.1–2 = the central demo case; Chubb p.1; Zurich/COPO p.1 scanned). |
| ref | `reference/check_catalogue_wording_reference.md` | Optional. The 122 finding types with their English explanation and "fix to request" sentences — use it only to pick realistic finding texts for the Findings tab and the email preview. Do not try to design all 122. |

## Suggested opening prompt for Claude Design

> Read START_HERE.md then 00_CLAUDE_DESIGN_BRIEF.md. Build the CoverScan design system on shadcn/ui using 01_design_tokens.md, then mock up the six screens in priority order from 02_dashboard_spec.md, starting with Screen 3 "Certificate Analysis" using the Marron & Associés / MTS case from 04_real_content_10_certificates.md and the page images in sample-pages/. Desktop 1440 wide, English only, light theme first. Check every screen against section 8 of the brief before showing it.

## Non-negotiables (from the brief)
- Screen 3 (Certificate Analysis) first, then Screen 1 (Portfolio). The demo is won or lost on Screen 3.
- Every number shown has its provenance (original value + currency, page, confidence). No naked numbers.
- Status labels exactly: **Compliant · Request changes · Not admissible · resubmit · Needs review**.
- Gap bars (found vs required), the verification seal (8 ticks) and linked evidence (click a value → highlighted on the page) are the three signature elements.
- English only, sentence case, no jargon without a gloss.
