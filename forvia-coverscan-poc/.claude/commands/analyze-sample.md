Run the full pipeline on one sample and print the structured result.

Usage: /analyze-sample <sample-id>  (e.g. 04_marron-mma_mts_FR). Default DEMO_MODE=cached; pass "live" as second argument to call the LLM.

Steps:
1. Locate data/samples/<id>/ (pages/*.jpeg, pages/*.txt). If expected.json exists and mode is cached, load it; otherwise run the pipeline tool chain (ingest → classify → extract ∥ visual → normalize → verify → score → explain).
2. Print: document type, issuer/insurer (type, registry hit, rating), policy number, period + months remaining at receivedAt, gates table, coverage grid (code · original · EUR · basis · status · confidence), findings, decision/subtype/needsReview, risk score (or provisional), summary_en, first lines of the request email, timings per stage.
3. Diff against ground_truth.json for this id and flag mismatches.
