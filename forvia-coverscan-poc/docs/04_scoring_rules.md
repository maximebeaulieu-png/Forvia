# 04 — Scoring Rules Specification (rules engine, `packages/rules`)

Deterministic, profile-driven, fully explainable. Reference implementation of the formula: `tools/build_ground_truth.py` (Python, for the seed set). The TypeScript engine must reproduce its outputs bit-for-bit on `data/samples/ground_truth.json`.

---

## 0. Vocabulary

- **Requirements Profile**: the configurable set of gates, thresholds, weights and severities. Default `FORVIA_GPTC_DEFAULT`. Selected per certificate by (country of supplier, FORVIA subsidiary, purchasing market) with fallback to default. Second shipped profile: `EXPERT_MEKOUAR` (demo of configurability only).
- **Gate**: a pass/fail/review admissibility check. Any `FAIL` → decision `NO_GO`, no Risk Score.
- **Critical guarantee**: a guarantee with an amount threshold whose non-compliance forces `REQUEST_CHANGES`.
- **Secondary guarantee/criterion**: contributes to the Risk Score and to the request list but does not change the decision alone.
- **Information Accuracy Score (IAS)**: extraction confidence, 0–1, per field and global.
- **Risk Score (RS)**: coverage adequacy, 0–100, only for admissible certificates.

## 1. Pipeline position

```
extraction (LLM, per-field confidence) → normalization (taxonomy, FX) → verification tools (registry, entity, dates)
→ GATES → [NO_GO] or → CRITICAL CHECKS + SECONDARY → RISK SCORE → DECISION → explanation (LLM, grounded)
```

## 2. Gates (admissibility) — evaluated in this order, all evaluated (report every failure, not just the first)

| Gate id | Passes when | Fails when | Review when | Subtype if fail |
|---|---|---|---|---|
| `FILE_FORMAT_OK` | PDF or PNG/JPG | DOCX/XLSX/editable office file (Q31) | — | STRUCTURAL |
| `DOCUMENT_IS_CERTIFICATE` | classifier = `CERTIFICATE` or `CERTIFICATE_WITH_COVER_LETTER` | `QUOTE`, `POLICY_EXCERPT`, `EMAIL`, `OTHER` | classifier confidence < 0.7 | STRUCTURAL |
| `ISSUER_IS_INSURER` | signing/issuing entity resolved as `INSURER` (or `AUTHORISED_BROKER` if profile allows — default **not allowed**) | `AGENT_BROKER`, `UNKNOWN` with intermediary keywords (assureur conseil, courtier, agent général, broker, Makler, corredor) | resolution confidence < 0.7 | STRUCTURAL |
| `INSURER_IDENTIFIED` | insurer name matches registry entry | no match and no regulator id on document | fuzzy match 0.6–0.85 | STRUCTURAL |
| `INSURER_RATING_FLOOR` | rating ≥ profile floor (default: S&P/Fitch BBB+, AM Best A-, Moody's Baa1; mutual/cooperative w/o rating → review) | rating below floor; captive | unrated | STRUCTURAL |
| `STAMP_PRESENT` | visual detector finds an insurer stamp/seal | none found (conf ≥ 0.85) | conf < 0.85, or stamp belongs to a different entity than issuer | FORMAL |
| `SIGNATURE_PRESENT` | handwritten-style signature of a named person of the issuer | none / "does not require signature" | conf < 0.7, unnamed scribble | FORMAL |
| `POLICY_NUMBER_PRESENT` | a policy/contract number extracted | none | conf < 0.7 | FORMAL |
| `DATES_PRESENT` | from & to dates extracted (or from + duration) | none / relative only ("12 months from inception") | conf < 0.7 | STRUCTURAL |
| `NOT_EXPIRED` | `period.to ≥ referenceDate` | expired | dates ambiguous | STRUCTURAL |
| `ENTITY_MATCH` | FORVIA-contracting entity = policyholder OR ∈ named/additional/co-insured (normalized fuzzy ≥ 0.85) | only parent/other entity named (Q26) | 0.6–0.85 | FORMAL |
| `COINSURANCE_COMPLETE` | single insurer, or all co-insurers named+signed and shares sum to 100 % (Q14) | share < 100 % or missing co-insurer signatures | shares unclear | STRUCTURAL |
| `CAPTIVE_FRONTED` | not a captive, or captive fronted by a rated insurer (Q20) | captive not fronted | unsure | STRUCTURAL |

Profile switches: `stampMissingSeverity`, `signatureMissingSeverity` ∈ {BLOCK, REQUEST_CHANGES} (default BLOCK); `allowAuthorisedBroker` (default false); `ratingFloor`.

**Expiry window** (not a gate): `monthsRemaining < expiryWindowMonths (10)` → alert `EXPIRING_SOON` with severity `expiryWindowSeverity` (default WARNING; Richard's answer in Q05 was BLOCK — calibrate).

## 3. Critical guarantees (amount thresholds, EUR, profile-driven)

| Code | Default threshold | Amount retained | Compliance |
|---|---|---|---|
| `PRODUCT_LIABILITY` | ≥ 20,000,000 | own line if present; else inherited from `COMBINED_GL_PL` (CSL rule below) | `COMPLIANT` if amountEur ≥ threshold |
| `PRODUCT_RECALL` | ≥ 15,000,000 | own line; `AUTOMOTIVE_RECALL` counts toward it (max of both) | idem |
| `PURE_FINANCIAL_LOSS` | ≥ 15,000,000 | own line (DINC); a CSL that explicitly includes "pure financial loss / Vermögensschäden" may be inherited (flag `INHERITED`) | idem |

Statuses: `COMPLIANT`, `BELOW_MINIMUM` (amount found < threshold), `MISSING` (no line), `COVERED_NO_AMOUNT` ("covered" with no figure → treated as non-compliant, Richard: "covered, c'est inacceptable"), `EXCLUDED`, `UNCLEAR` (LLM could not resolve → also routes to review).

### Amount basis rule (Q12)
When both per-claim and aggregate figures exist, **retain the annual aggregate** for comparison; show both. If only per-claim exists → retain it and raise `PER_CLAIM_ONLY` warning. "x per event, limited to N× for all claims in a year" → aggregate = x × N.

### Combined single limit rule (Q13 — open; default conservative)
A CSL counts **in full** for each guarantee it explicitly names (BI+PD → GL and PL; "+ pure financial loss" → also PFL). It does **not** count for guarantees it does not name (recall). Flag `CSL_SHARED` so the reviewer knows one pot serves several needs. Profile switch `cslAllocation: FULL | PRORATA` (default FULL).

### Currency rule (Q28/Q29)
`amountEur = amountOriginal / ecbRate(currency, referenceDate)`; persist `{rate, date, source:"ECB"}`. Reference date = reception date (to be legally confirmed).

### Territorial rule
If the guarantee line has `excludedTerritories` containing USA or Canada, status stays as computed **and** a `CRITICAL_EXCLUSION` penalty applies; the request list says "extend to USA/Canada".

## 4. Secondary criteria (score + request list)

| Criterion | Default | Points |
|---|---|---|
| `CONSEQUENTIAL_FINANCIAL_LOSS` (DIC) | ≥ 1,000,000 (to confirm; Richard: 500k–1M) | 5 × min(found/req, 1) |
| `DISMANTLING_REFITTING` present | presence | 5 |
| `EXTENDED_PRODUCT_LIABILITY` present | presence | 5 |
| `TERRITORY_USA_CANADA` | statement includes USA & Canada | 5 |
| `AGGREGATE_BASIS` | at least one aggregate figure | 5 |
| Deductibles (Q15 open) | reported, no points in POC | 0 |
| Trigger | `CLAIMS_MADE` → −5 | penalty |
| Critical exclusions | −10 each, cap −20 | penalty |

## 5. Risk Score formula

```
RS = clamp(0..100,
   30·r(PL) + 30·r(RECALL) + 15·r(PFL)            # critical, r = min(found/threshold, 1), 0 if MISSING/COVERED_NO_AMOUNT/EXCLUDED/UNCLEAR
 +  5·r(DIC) + 5·[DISMANTLING] + 5·[EXT_PL] + 5·[USA_CANADA] + 5·[AGGREGATE]
 + penalties )
```
- Shown only when no gate fails. For `NO_GO` a **provisional** score is computed and stored (greyed in UI, labelled "for information") so the supplier request is complete in one round-trip.
- Richard (Q07): "binary on the minimum, evaluative above, bonus above minimum". POC: no bonus above 100 %; UI shows "exceeds by ×2.5" text. V1 may add a capped bonus.
- Per-guarantee scores are exposed (Q06): `breakdown[code] = {required, found, status, points, max}`.

## 6. Decision

```
if any gate FAIL                         → NO_GO  (subtype FORMAL_DEFECT if all failed gates ∈ {STAMP, SIGNATURE, POLICY_NUMBER, ENTITY_MATCH}, else STRUCTURAL)
elif all critical COMPLIANT              → GO     (secondary gaps listed as recommendations)
else                                     → REQUEST_CHANGES
```
Plus an orthogonal flag `needsHumanReview = true` when: any gate = REVIEW, or IAS_global < 0.75, or any critical field IAS < 0.60, or any status `UNCLEAR`. Q03: every alert goes to a human; expected ~10 % of volume in steady state — the POC will measure the actual rate on the sample.

Colour mapping (Q11): GO = green, REQUEST_CHANGES = amber, NO_GO = red, NEEDS_REVIEW = violet badge overlay, PENDING/PROCESSING = grey.

## 7. Information Accuracy Score (Q23/Q24)

- Per field: the extractor returns `confidence ∈ [0,1]` + `source {page, quote|bbox}`. Deterministic post-checks adjust it: quote not found in page text → ×0.7; amount parsed from OCR with low OCR confidence → ×OCR_conf; field cross-validated by two methods (text + vision agree) → min(1, +0.1).
- Global IAS = weighted mean with weights: critical amounts 3, dates/policy no./issuer/policyholder 2, everything else 1.
- Display: per-field dot (●≥0.85 / ◐ 0.6–0.85 / ○ <0.6) and global %. Fields < 0.6 are editable inline by the reviewer; edits are logged and re-run the rules engine instantly (no LLM call).

## 8. Explainability (Q10)

Every alert/finding is an object: `{ruleId, severity (BLOCK|CRITICAL|WARNING|INFO), code, message_en, evidence:[{page, quote}], requiredValue, foundValue, fixSuggestion}`. The LLM "explain" step is fed **only** these objects and writes (a) a 3-sentence plain-English summary for buyers, (b) the supplier request email. It may not introduce facts absent from the findings.

Example finding (sample 04): `{ruleId:"CRIT_RECALL_BELOW", severity:"CRITICAL", code:"PRODUCT_RECALL", message_en:"Product recall / withdrawal costs limited to €305,000 per claim; FORVIA requires €15,000,000.", evidence:[{page:2, quote:"Frais de retrait engagés par l'assuré 305.000 €"}], requiredValue:15000000, foundValue:305000, fixSuggestion:"Obtain an endorsement raising recall/withdrawal costs to at least €15M, including USA/Canada."}`

## 9. Year-over-year comparison (Q32) — POC: data model only, one mocked example

Store each analysis; when a new certificate arrives for a supplier, diff `guarantees[].amountEur` and `insurer` against the previous accepted one. Drop > 20 % on a critical guarantee or insurer change → `WARNING: COVERAGE_DOWNGRADE`. Demo: Metraton 2024 (mocked, recall €15M) → 2025 (recall €10M).

## 10. Test matrix the engine must pass (`packages/rules/test`)

- All 10 ground-truth samples → identical decision, subtype, provisional score, breakdown.
- Unit cases: CSL inheritance; automotive recall → recall; per-event ×2 aggregate; "covered" no amount; USD/CHF/INR conversion with fixed rates; expired vs window warning; entity match via additional insured; broker keyword detection in FR/DE/ES/IT/EN; 20 % capacity; claims-made penalty; exclusion cap; profile switch GPTC→Expert on sample 08 flips to REQUEST_CHANGES→ (with stamp severity REQUEST) GO/REQUEST.
- Property: RS monotonic in each amount; RS ∈ [0,100]; NO_GO ⇒ riskScore null.


## Link to the check catalogue (`docs/11`, `data/checks/check_catalogue.json`)

Every finding emitted by the rules engine carries a `checkId` from the catalogue (e.g. `E01` headline-vs-sub-limit, `B05` broker issuer, `D05` DIC/DINC). The gate and threshold logic above stays the source of truth for *decisions*; the catalogue is the source of truth for *wording* (`explain`, `fix`) and for the *cue lists* injected in the extraction prompt. Mapping rule: a gate failure → the catalogue check whose `ruleRef` is that gate and whose situation matches (e.g. `SIGNATURE_PRESENT` fails with an "electronically generated" statement → `B03`, otherwise `B02`). A guarantee below threshold → `E01`/`E02` if a sub-limit was involved, `D10` if covered-without-amount, `D11` if optional-not-taken, else the generic `D01`/`D02`/`D04`. Unmatched situations → generic finding with `checkId: null` and a TODO to extend the catalogue.
