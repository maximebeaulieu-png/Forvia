# 05 — Dashboard Specification (output of the *dashboard-orchestrator* agent)

This is where the POC wins or loses. The dashboard must let a **non-expert buyer** understand in under a minute what is wrong with a certificate and what to ask the supplier, and let **Group Insurance** trust and steer the machine. English only. Built with shadcn/ui (tokens in `design-system/tokens.md`).

Product working name: **CoverScan** · tagline in UI header: *Supplier insurance certificates, verified.*

---

## 0. Information architecture

```
Sidebar
├── Portfolio            (Screen 1)  — Group Insurance Director / CPO
├── Certificates         (Screen 2)  — queue/table, all roles
│     └── Certificate    (Screen 3)  — THE core screen
├── Review queue         (Screen 2 filtered: needsHumanReview)
├── Suppliers            (Screen 4)  — Supplier 360
├── Requirements         (Screen 5)  — profiles & thresholds (admin / Insurance)
└── Integrations         (Screen 6)  — SAP Ariba sync preview, exports
Header: FORVIA logo area · product name · global search (supplier, policy no.) · role switch (Buyer / Insurance analyst / Director / Admin) · demo clock (2025-04-15) · profile selector (GPTC default / Expert)
```

Global status vocabulary (exact UI labels):
| Enum | Label | Colour token | Icon |
|---|---|---|---|
| `GO` | **Compliant** | `status-go` green | ShieldCheck |
| `REQUEST_CHANGES` | **Request changes** | `status-amber` | ShieldAlert |
| `NO_GO` (FORMAL_DEFECT) | **Not admissible · resubmit** | `status-red` (outline) | ShieldX |
| `NO_GO` (STRUCTURAL) | **Not admissible** | `status-red` (solid) | ShieldX |
| `NEEDS_REVIEW` (flag) | **Needs review** (badge overlay) | `status-review` violet | Eye |
| `PROCESSING` | **Analysing…** | neutral | Loader |
| `PENDING` | **Awaiting certificate** | neutral dashed | FileQuestion |

---

## Screen 1 — Portfolio (exposure at a glance)

**Job:** answer the Director's question *"How exposed are we, and is it getting better?"* in one screen. Numbers come from the certificates table; in the POC the 10 samples are augmented with ~140 synthetic certificates (mirroring the 10 profiles across countries) to make charts meaningful — clearly labelled *"Demo dataset: 10 real + 140 synthetic"*.

Layout (desktop 1440): 4 KPI cards → exposure row (2 charts) → action row (2 lists) → throughput strip.

| Block | Content | Why |
|---|---|---|
| KPI **Suppliers covered** | `n compliant / N total` with ring; sub: *+x this month* | The headline |
| KPI **Not admissible** | count; split formal vs structural | Separates paperwork from fraud-ish |
| KPI **Critical gaps** | count of certificates with PL/Recall/PFL below minimum; sub: *"Recall is the #1 gap (78 %)"* | Points to the money risk |
| KPI **Expiring ≤ 90 days** | count; sub: *"12 already expired"* | The operational fire |
| Chart **Compliance by country** | stacked horizontal bars (GO / Request / Not admissible) per supplier country, sorted by volume; click → filters Screen 2 | Q08: thresholds per country; shows where to focus |
| Chart **Coverage gap by guarantee** | for each critical guarantee: % of suppliers compliant + median found vs required (two markers on a scale). Signature visual: **gap bars** (see §Signature) | Makes "€305k vs €15M" visible at portfolio level |
| List **Top 10 risks** | supplier · country · worst finding · spend tier (mock) · status chip · "Open" | Actionable |
| List **Expiring soon** | timeline strip (next 30/60/90 days) with supplier chips; Chubb (31/05/2025) and IMI (29/06/2025) appear with the demo clock | Expiry is a real Group Insurance pain (spec §3.2) |
| Strip **Processing** | *Analysed this month · avg 18 s per certificate · 11 % sent to human review · 94 % field accuracy on reviewed set* | Proves the spec KPIs (< 30 s, ≥ 90 %, ~10 %) |
| Toggle | **Profile: GPTC default ▾** — switching to "Expert (R. Mekouar)" recomputes all KPIs live (client-side from stored breakdowns) | The configurability "wow" for Ismaël's point |

Export button: Excel of the underlying table (spec §3.2). 

## Screen 2 — Certificates (queue / table)

**Job:** find and triage. TanStack Table, server-side-like filtering (client in POC), saved views: *All · Needs review · Not admissible · Expiring · My suppliers*.

Columns (default order): Status chip · Supplier (name, country flag) · Insurer (name + rating pill) · **Critical guarantees mini-grid** (three tiny cells PL / Recall / PFL coloured ✓ ✗ – ; hover shows found vs required) · Risk score (number or "—" for not admissible, with provisional in tooltip) · Accuracy (dot + %) · Expiry (date + "in 46 d" / "expired") · Currency (original) · Received · Assignee · Last action.
Filters: status, country, insurer, guarantee gap type, expiry window, accuracy < x, profile.
Row actions: Open · Assign · Export row · Send to Ariba.
Bulk: Export Excel · Re-run with profile X.
Empty state (no filter result): *"No certificates match. Clear filters or upload one."* Upload button in the header: drag & drop PDF/PNG → goes to Screen 3 in processing state.

## Screen 3 — Certificate analysis (the core)

**Job:** one certificate, full truth, one decision, one message. Split layout, resizable: **left = original document**, **right = FORVIA standard grid**. Everything on the right links to a highlight on the left (click a value → scroll+highlight page region; hover → outline).

### Top bar
Supplier name · country · Ariba id · insurer + rating pill · policy no. · period with "valid · 46 days left" · **Decision chip** (large) · Accuracy % · profile used · reference date · *Analysed in 18 s · model vX · run id* (small).

### Left pane — Document viewer
Page thumbnails; rendered page images (JPEG from ingestion); overlay rectangles for each extracted field (colour by finding severity); a small **Evidence** toggle to show/hide; page language badge (FR/EN/DE…); "Original file" download; **OCR quality** indicator when OCR path used (sample 04/06).

### Right pane — tabs
1. **Summary** (default)
   - 3-sentence plain-English verdict (LLM, grounded) — e.g. *"This certificate was issued by a broker (Marron & Associés), not by the insurer, so it has no legal value for FORVIA. Even if reissued by MMA, recall/withdrawal costs are limited to €305,000 against €15M required and are excluded for USA/Canada. Recommended action: request a certificate issued and stamped by MMA with recall ≥ €15M worldwide."*
   - **Admissibility checklist** (the gates) rendered as a **verification seal**: 8 items with ✓/✗/? and one-line evidence (*"Stamp: broker's stamp found p.1, no insurer stamp"*). This is the "tampon + signature + assureur" trio Richard insists on, made visible.
   - **Coverage grid** (the heart): one row per guarantee of the profile (critical first, then secondary, then "other guarantees found"):
     `Guarantee · Required (EUR) · Found (original ccy) · Found (EUR, rate·date) · Basis · Deductible · Territory · Status · Confidence`
     Rows with status ≠ COMPLIANT show the **gap bar**: a thin horizontal scale 0→required with the found amount as a filled bar and the gap labelled (*"€305k · 2 % of required"*). COVERED_NO_AMOUNT renders as a hatched bar with "no amount".
   - **Risk Score** ring (0–100) with breakdown popover (points per guarantee, penalties). Hidden behind "Provisional (not admissible)" when NO_GO.
   - **Findings** list: severity-sorted chips (BLOCK / CRITICAL / WARNING / INFO), each expandable to rule id, evidence quote, fix suggestion.
2. **Extracted data** — every raw field with original text, normalized value, page, confidence dot; inline edit for reviewers (re-scores instantly, logs the override). Shows FX rate line (*"USD→EUR 1.07 · ECB 2024-04-26"*).
3. **Exclusions & territory** — list with critical flags; map-less: a simple 3-cell indicator *Worldwide · USA/Canada · Other* with included/excluded/unclear.
4. **History** — previous certificates for this supplier (Supplier 360 excerpt), diff on critical guarantees (mock for Metraton), policy numbers kept for claims.
5. **Audit** — last 5 events (ingested, analysed, reviewed by, override, sent to Ariba), with run id and model/prompt version.

### Decision panel (sticky bottom-right)
- Primary: **Request changes** → opens side sheet with the **generated supplier email** (English; lists each gap with required level; mentions resubmission formalities; editable; "Copy" / "Download .eml" — no sending in POC).
- **Approve** (enabled only when GO, or with mandatory justification for override) · **Reject** (with reason select + note).
- **Send to SAP Ariba** → shows the payload preview (Screen 6 component) and marks as synced (mock).
- **Assign** to a reviewer; **Mark reviewed** (clears Needs review).

### Processing state (upload demo)
Stepper with live timings: *Ingest → Text layer / OCR → Classify → Extract (vision) → Normalize & convert → Verify insurer & entity → Score → Explain* — each step turning green with ms; total under 30 s. Skeletons on the right fill in progressively (gates first, then grid). In `DEMO_MODE=cached` the stepper replays recorded timings.

## Screen 4 — Supplier 360

Header: supplier, country, Ariba id, category (mock), spend tier (mock), contracting FORVIA entity. Cards: current status · current insurer & rating · policy numbers on file · next expiry. Table: all certificates by year with decision and critical guarantees; **change detection** banner when a critical limit dropped or insurer changed (Q32). Notes & contacts (masked personal data).

## Screen 5 — Requirements profiles

Left: list of profiles (GPTC default · Expert · + New) with scope rules (country / subsidiary / market). Right: editable form — gates with severity selects (stamp: Block / Request), rating floor, expiry window + severity, critical thresholds (EUR), secondary thresholds, weights (must sum 100 — live validation), penalties, CSL allocation, FX source, reference date rule. "Simulate on portfolio" button shows how many decisions change (powered by stored breakdowns). This screen answers Ismaël ("configurable par client") and Richard ("beaucoup de paramétrages en amont").

## Screen 6 — Integrations & exports

- **SAP Ariba** card: mock connection status, last sync, cron schedule, list of custom questionnaire fields mapped (see `schemas/ariba_payload.schema.json`), payload preview JSON for the selected certificate, "Sync now" (mock, writes an event).
- **Excel export** card: choose view → download `.xlsx` (real file generated with SheetJS): one row per certificate, all grid columns, findings as text.
- **Registry** card: insurer registry version (JSON), last ECB rates fetch.

---

## Signature visual elements (the "wow", in order of importance)

1. **Linked evidence** — click any number in the grid → the original page scrolls and the exact cell/line lights up. Nothing sells trust like that.
2. **Gap bars** — required vs found on one scale, everywhere (grid rows, portfolio chart). It turns "€305,000" into "2 % of what you asked".
3. **Verification seal** — the 8-point admissibility checklist drawn as a compact seal/badge (circular ticks) next to the decision; red ticks for broker-issued/no stamp. Ties directly to Richard's "tampon + signature + assureur".
4. **Live profile switch** — flip GPTC ↔ Expert and watch statuses recolour across the table.
5. **Processing stepper** under 30 s on a real upload.

## Data every screen needs (contract with the backend)

`Certificate {id, supplierId, fileMeta, pages[{n, imageUrl, lang, ocrUsed}], extraction{fields…, confidence…}, normalized{guarantees[], territory, trigger, issuer, policyholder, insureds[], policyNumber, period}, verification{gates{}, insurerRegistryHit, entityMatch, fx[]}, scoring{profileId, riskScore, provisional, breakdown, decision, subtype, needsReview, findings[]}, explanation{summary_en, requestEmail_en}, audit[], aribaSync{status, payload}}` — see `docs/08_architecture.md` §4 and `schemas/`.

## Accessibility & quality floor
Keyboard navigable table and tabs; visible focus; colour never the only carrier (icons + text on status); WCAG AA contrast on all status colours; reduced-motion respected on stepper; masks on personal data by default with "reveal" (logged).
