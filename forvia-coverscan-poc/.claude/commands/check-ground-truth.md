Run the ground-truth consistency check and report.

Steps:
1. `python3 tools/build_ground_truth.py` and show the summary table.
2. If packages/rules exists: `pnpm --filter rules test` and summarize failures.
3. If tools/eval exists: `pnpm eval` (cached mode) and summarize per-field accuracy and decision matches.
4. Compare with docs/03_ground_truth_samples.md; list any delta with probable cause and the agent to involve (insurance-domain-expert, ai-extraction-engineer, qa-ground-truth).
Do not modify ground truth; propose changes only.
