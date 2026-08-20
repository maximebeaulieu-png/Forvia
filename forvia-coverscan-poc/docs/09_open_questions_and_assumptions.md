# 09 — Open Questions, Conflicts & Assumptions

Source status from the "Questions Forvia" workbook (21/08/2026 offer deadline): 45 questions, 34 answered, 11 open. This file lists only what affects the POC build, plus conflicts found between sources. Update it as answers arrive; every assumption below is implemented as a **profile setting** or a **flagged default**, never silently.

---

## A. Conflicts between sources (to arbitrate in the scoring workshop — Q44)

| # | Conflict | Source A | Source B | POC handling |
|---|---|---|---|---|
| C1 | **Thresholds** | Needs expression / GPTC: PL ≥ €20M; PFL/recall ≥ €15M | Richard live: "5M minimum", DIC/DINC 500k–1M, recall 1–5M; judged Allianz recall €5M "all fine" (sample 08) | Two profiles shipped (`FORVIA_GPTC_DEFAULT`, `EXPERT_MEKOUAR`); default GPTC; demo shows the flip |
| C2 | **Stamp missing** | Q05 written answer: blocking, no score | Sample 08 live: "ask the buyer to get it stamped" (= request changes) | Gate BLOCK by default, subtype FORMAL_DEFECT, UI action = resubmit; profile switch `stampMissingSeverity` |
| C3 | **Expiry < 10 months** | Q05: blocking | Practicality: most annual certificates received mid-year have < 10 months → everything blocks | WARNING by default, severity configurable; measure impact on the 100–200 set |
| C4 | **Score granularity** | Spec: one risk score | Q06/Q10/Q11: global + per-guarantee + colour + explicit reasons | All of the above (breakdown object) |
| C5 | **Accuracy score meaning** | Spec ambiguous (extraction vs document reliability) | Q23: extraction confidence | Extraction confidence; document reliability is handled by gates |
| C6 | **Ariba development** | Early hypothesis: none on Ariba side | Q35: custom questionnaire fields must be created by FORVIA IT | Documented in 08 §6; mock in POC |
| C7 | **LLM hosting** | Spec: open-source LLM hosted in France | Vincent: is it "open source" or "data stays in France"? | **Closed 20/08/2026 — and corrected the same day: AlphaEdge is an OCR API, not an LLM** (catalogue = OCR + audio only). OCR leg is FR-hosted (`alpha-digit-max`, probe in `docs/eval/llm_probe.md`); the **reasoning LLM is a re-opened decision** for the pipeline sprint (candidate: Claude/Anthropic, with the §4.4 caveat that this leg would not be FR-hosted — documents themselves only transit through the FR OCR). U1–U4 closed via the probe (docs/07 §13). |
| C8 | **Sample quality** | Damien sent "validated" certificates | Richard: none passes as is | Demo narrative: "your best one scores 12" — handle with care (see README §5) |

## B. Open questions that change the build (P1 first)

| Q | Question | Default assumption in POC | Impact if answer differs |
|---|---|---|---|
| Q13 | CSL counts fully for each named guarantee or pro-rata? | FULL for guarantees named in the CSL; not for others | `cslAllocation: PRORATA` option exists; samples 03/07/09 change status |
| Q15 | Deductibles/SIR: at what level do they degrade the score? | Reported, no points | Add a secondary criterion with threshold (e.g. > 1 % of required) |
| Q16 | USA/Canada exclusion: disqualifying or degrading? | Degrading (−10 penalty + request line) | Could become a gate for US-exposed suppliers |
| Q18 | List of red-flag exclusions | Seed list: USA/Canada carve-outs, recall excluded, automotive critical components, failure to supply | Extend `criticalExclusionPatterns` in profile |
| Q02 | Who annotates the 100–200 certificates? | Arkan annotates with Richard's training session; 0.5 d per 20 certificates | Budget line; without it no accuracy KPI |
| Q22 | Sub-limits per country/entity frequency | Supported in data model, not in UI | UI table grouping by territory |
| Q39 | Broker's role in the API flow; authorised brokers acceptable? | Broker never arbitrates; broker-issued = no-go; `allowAuthorisedBroker=false` | Whitelist of authorised brokers per country |
| Q40 | SSO / roles | Role switch only | Entra ID integration in V1 |
| Q41 | DPIA | Masking + note in report | Adds a milestone before prod |
| Q42 | Sovereign cloud contracts in place? | POC on Arkan infra; data = FORVIA samples only | Hosting choice for V1; lead time |
| Q43 | Retention & reversibility | Not implemented | Storage policy + export format |
| Q45 | Jury composition | Purchasing + Insurance + IT | Adjust demo depth (more Ariba/security if IT-heavy) |
| Q28 | FX date in a claim (legal) | Reception date | Re-run conversions; immaterial for the demo |

## C. Assumptions made while reading the samples (verify in 10 minutes with Richard)

1. Sample 02 (Scherdel): Richard said "no signature" — two scanned signatures are present on p.2; we recorded *signature present, stamp absent*. Verdict unchanged (No-Go).
2. Sample 09 (Beyer): the "Allianz, everything in English, not bad" quote is attributed to this file (probable).
3. Sample 10 (Metraton): "ils ont fait un truc assez bien" attributed to this file (probable; he may have meant a different Generali file).
4. Sample 07 (IMI): not reviewed individually; verdict inferred.
5. Contracting entities for samples 06/07/09/10 (additional insured / co-insured) were chosen to demonstrate entity matching; FORVIA's real supplier master will decide.
6. Insurer ratings in `data/registry/insurers.json` are **indicative** from public knowledge and must be replaced by licensed data (or at least re-checked) before any report. Swiss Mobiliar is in fact a large, highly-rated mutual despite the live comment "petite compagnie".
7. Reception dates = issue date + 7 days (simulated); demo clock 2025-04-15.
8. The user note "seuils sous seuil à 300 000 pour les inondations" was interpreted as the €305,000 withdrawal-cost sub-limit of sample 04 (no flood cover exists in liability certificates).

## D. Questions to ask FORVIA before the defence (short list for Konstantin)

1. Confirm the pair GPTC thresholds (20/15) vs Richard's practical levels — which profile should the demo open on?
2. Stamp missing: block or request? Expiry < 10 months: block or warn?
3. ~~Is "open-source LLM hosted in France" a hard constraint or a data-residency requirement?~~ Resolved: AlphaEdge FR-hosted endpoint. Remaining: confirm with FORVIA that data residency in France satisfies §4.4 even if the model is not open-weights.
4. Who provides and annotates the 100–200 certificates, and by when?
5. Jury composition for the defence.


## Unknowns about the AlphaEdge endpoint (to close on day 1 with `pnpm llm:probe`)

| id | Unknown | Why it matters | Default until known |
|---|---|---|---|
| U1 | Does the endpoint accept **images** (vision)? | Stamp/signature detection, table layouts, scans (samples 04, 06) | Build both `vision` and `text-first` modes; eval reports the mode |
| U2 | JSON mode / tool calling supported? | Strict `extraction.schema.json` output | JSON repair + retry layer in the adapter |
| U3 | Context window & output cap | 6-page certificates ≈ 20k tokens in | Page chunking with cross-page merge if < 32k |
| U4 | Concurrency / rate limits | < 30 s per certificate, batch uploads in demo | Queue with 3 workers, cached demo mode |

Points 1 (GPTC 20/15 M€ vs expert ~5 M€) and 2 (missing stamp = block vs resubmit) remain **open with FORVIA** — the POC ships both behaviours behind the Requirements Profile switch (`FORVIA_GPTC_DEFAULT` / `EXPERT_MEKOUAR`, `stampMissingSeverity`) so the demo can show either.
