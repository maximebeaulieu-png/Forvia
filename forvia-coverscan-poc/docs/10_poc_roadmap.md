# 10 — POC Roadmap (aligned with the 60.1 person-day estimation)

Estimation recap (Estimation_Forvia_POC.xlsx): delivery 46 PD (dev 32 · design 3 · PO 11), contingency ×1.14 → 53.2, steering 15 % → **60.1 PD**. Essential-only subset 37.4 PD. Framing workshops ≈ 17–20 PD already in the global estimate (Sophie).

| Estimation line | PD (w/ cont.) | Level | Maps to |
|---|---|---|---|
| Framing & success criteria, scoring rules with Richard | 3.3 | ESSENTIAL | Sprint 0 |
| Ground truth & evaluation set (100–200) | 4.4 | ESSENTIAL | Sprint 0–1 (annotation continues in parallel) |
| Document ingestion & multilingual OCR | 4.4 | ESSENTIAL | Sprint 1 |
| AI extraction engine (VLM/LLM, versioned prompts, per-field confidence) | 9.6 | ESSENTIAL | Sprint 1–2 |
| Rules engine & scoring (GPTC, keywords, two scores) | 7.2 | ESSENTIAL | Sprint 1–2 |
| Evaluation harness & benchmark | 4.4 | LIGHT | Sprint 2–3 |
| Results UI (light review screen + Excel export) | 5.5 | ESSENTIAL | Sprint 2–3 — **upgraded scope: dashboard is the value perception** (Konstantin); keep within budget by using cached data and shadcn |
| SAP Ariba integration spike | 7.8 | LIGHT | Sprint 3 (mock + payload; real spike only if realm access arrives) |
| POC environment & security (FR-hosted LLM endpoint, isolation, encryption, traceability) | 3.6 | LIGHT | Sprint 1 (adapter) + Sprint 3 |
| Performance report, recommendations, V1 proposal | 3.0 | ESSENTIAL | Sprint 4 |

## Sprints (2-week cadence suggested; adapt to team availability)

### Sprint 0 — Framing (before build)
- Scoring workshop with Richard/Damien: close conflicts C1–C3, Q13/Q15/Q16/Q18; sign off `requirements_profile.forvia.json` v1.
- Richard's training session on reading certificates → annotation guide (docs/03 conventions) → start annotating the first 50.
- Design: Claude Design mockups of Screens 1, 2, 3 validated against `00_CLAUDE_DESIGN_BRIEF.md`.
**Exit:** profile v1 signed; 3 screens validated; repo scaffolded (`CLAUDE.md` applied).

### Sprint 1 — Pipeline core on the 10 seeds
- Ingest + OCR fallback; classify; extract prompt v1; normalize (taxonomy, amounts, FX); registry tool with 40 insurers; gates; scoring engine reproducing `ground_truth.json`.
- `pnpm eval` green on decisions for 10/10 (provisional scores ±2).
- Web: Screen 2 table + Screen 3 read-only with cached data.
**Exit:** demo-able on cached data; live run < 30 s on ≥ 7/10.

### Sprint 2 — Dashboard value
- Screen 3 complete: linked evidence, gap bars, verification seal, findings, decision panel, generated email, inline edit + rescore.
- Screen 1 portfolio with synthetic dataset; profile switch.
- Visual checks (stamp/signature) prompt v1; IAS routing; review queue.
- Eval on first 50 annotated certificates; prompt v2.
**Exit:** 20-minute demo script runs end-to-end in cached mode.

### Sprint 3 — Breadth & integration
- Screens 4, 5, 6; Excel export; Ariba payload + mock sync; SSE stepper in live mode.
- Security pass (masking, events, env isolation); FR-hosted endpoint test through the adapter if available.
- Eval on 100–200; failure analysis; prompt v3; registry enrichment.
**Exit:** accuracy ≥ 90 % on critical fields or a documented gap plan; review rate measured.

### Sprint 4 — Report & defence
- Performance report generated from the harness; recommendations; V1 deployment proposal (connector, SSO, hosting, DPIA, annotation loop).
- Dry-run of the demo twice; fallback plan; jury-specific depth.

## Success criteria (contractual + internal)
- Field accuracy ≥ 90 % on annotated set; decision agreement with expert ≥ 90 % after profile calibration.
- < 30 s per certificate live; 100 % in cached mode.
- Human review rate reported (target ≈ 10 %); zero "silent" decisions (every alert visible).
- Jury can explain, unaided, why sample 04 is not admissible.
- Every tool independently runnable → product foundation.

## Risks
| Risk | Mitigation |
|---|---|
| Ariba access late (Q36: strongest dependency) | Mock + payload now; spike only when realm exists; not on the demo's critical path |
| Annotation bottleneck (Q02) | Start with 50; harness works at any size; report states the sample size honestly |
| Stamp/signature detection false negatives | Route low confidence to review rather than No-Go; measure |
| Over-promising on "authenticity" | Vocabulary: *presence & attribution*, not forgery detection (07 §7) |
| Demo fragility | Cached mode, recorded timings, two dry-runs |
| Threshold conflict surfaces in front of the jury | Own it: profile switch is the feature |
