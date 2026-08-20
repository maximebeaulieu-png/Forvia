# 06 — Demo Script & User Journeys

Audience for the defence (Q45 open; assume Purchasing + Group Insurance + IT). Length: 20 minutes demo + Q&A. Language: English. Demo clock: 2025-04-15. Mode: `cached` with one `live` upload if network is reliable.

---

## A. The 20-minute demo, minute by minute

| Min | Screen | What we do | What they should think |
|---|---|---|---|
| 0–1 | Portfolio | Open on the portfolio. *"150 certificates, 10 of them the real ones you sent us. 6 % compliant. Recall is the #1 gap."* | "This is our problem, quantified." |
| 1–3 | Portfolio | Click **Coverage gap by guarantee**: product liability median €5M vs €20M; recall median €4M vs €15M. Click Germany bar → table filtered. | "It reads the certificates *against our GPTC*." |
| 3–5 | Certificates | Scan the table: status chips, critical mini-grid, accuracy dots. Sort by risk. Point at the **Not admissible** split: *formal (stamp) vs structural (broker, quote)*. | "It separates paperwork from real risk." |
| 5–10 | Certificate 04 (Marron / MTS) | Open. Verification seal shows **issuer = broker (ORIAS 07 002 497), no insurer stamp, no insurer signature**. Click the €305k recall row → page 2 highlights the line. Show the USA/Canada "Exclu" rows. Read the 3-sentence summary. Click **Request changes** → generated email. | "A buyer would have accepted this. The tool caught it in 18 seconds and wrote the email." |
| 10–12 | Certificate 01 (Chubb) | *"Your best one."* USD 5M → €4.67M under the €20M line; "Covered" with no amount; DIC missing. Score 12/100. Hover the FX line (rate + date). | "Even the good ones are far from the GPTC — that's the exposure we carry." |
| 12–14 | Certificate 08 (Allianz recall) + profile switch | Stamp missing → not admissible (formal). Switch profile to **Expert** → recall €5M turns compliant. *"Thresholds are a business decision; the tool applies yours, consistently, 8,000 times a year."* | "We need to calibrate — and we can." |
| 14–16 | Live upload (06 Zurich ES or a new PDF) | Drag & drop. Stepper: OCR path triggered (garbled text layer), extraction, verification, score — under 30 s. Result: PL €20M compliant, recall €4M, signature ambiguous → Needs review. Edit a field inline → instant re-score. | "It really works on a document it has never seen, and a human stays in control." |
| 16–18 | Supplier 360 (Metraton) + Integrations | Year-over-year: recall dropped 15M → 10M (mock) → warning. Show Ariba payload preview and Excel export. | "It fits our process and our systems." |
| 18–20 | Portfolio | Back to portfolio: *"Processed 150 in 45 minutes. 11 % to human review. Field accuracy 93 % on the annotated set."* Close on the V1 plan. | "Credible, measurable, ready for the 100–200 POC." |

**Fallbacks.** If live upload fails → `cached` replay of 06 with identical visuals. If questions on LLM sovereignty → show the provider adapter setting and state the V1 target (open-weights model hosted in France) as an open decision with FORVIA (see 09).

## B. User journeys

### B1. Buyer — "Can I onboard this supplier?"
1. Receives Ariba notification (mock) → opens Certificates filtered on *My suppliers*.
2. Sees supplier row: **Request changes**, PL ✓ Recall ✗ PFL ✗, accuracy ●.
3. Opens certificate, reads summary, checks the two red rows, clicks **Request changes**, copies the email into Ariba messaging (POC: copy/download).
4. Later: new certificate arrives → status **Compliant** → **Approve** → **Send to Ariba** (mock).
Success: < 2 minutes, no insurance knowledge needed, message is precise and authoritative.

### B2. Group Insurance analyst — "Clear the review queue"
1. Opens *Needs review* (11 % of volume).
2. For each: verification seal shows the ? item (ambiguous signature); viewer zooms on the region; analyst decides ✓/✗ → gate resolved → engine re-runs → decision final; or edits a misread amount.
3. Overrides are justified and logged; the set of overrides feeds the next prompt/rule iteration (continuous improvement loop, V1).
Success: < 1 minute per item; nothing is decided by the machine alone when it was unsure.

### B3. Group Insurance Director — "Where is my exposure?"
1. Portfolio: by country, by guarantee, expiring soon.
2. Switch profile to simulate a stricter USA threshold → sees impact.
3. Exports Excel for the Purchasing committee.
Success: one screen, defensible numbers, every number traceable to a document.

### B4. Admin (Arkan during POC) — "Calibrate"
1. Requirements profile: set stamp severity, thresholds per country, weights.
2. "Simulate on portfolio" → deltas.
3. Save as new version (profiles are versioned; each analysis records the profile version used).

## C. Micro-copy reference (English, sentence case)

- Decision chips: *Compliant* · *Request changes* · *Not admissible · resubmit* · *Not admissible* · *Needs review*
- Buttons: *Request changes* · *Approve* · *Reject* · *Send to SAP Ariba* · *Export Excel* · *Re-run with profile* · *Mark reviewed*
- Empty states: *"No certificate yet for this supplier. Upload one or request it via Ariba."* · *"Review queue is empty — nice."*
- Errors: *"We couldn't read this file. Upload a PDF or PNG of the certificate (Word files are not accepted)."*
- Evidence tooltip: *"Page 2 · 'Frais de retrait engagés par l'assuré 305.000 €'"*
- Provisional score label: *"Provisional — not admissible, shown for information"*

## D. Supplier request email — template (LLM fills the bracketed parts from findings only)

```
Subject: FORVIA — insurance certificate for [Supplier legal entity]: corrections required

Dear [Supplier contact],

As part of FORVIA's supplier qualification, we reviewed the insurance certificate you provided
(policy [policy no.], [insurer], valid until [date]). To be accepted under FORVIA's General Purchasing
Terms and Conditions, the following points must be addressed:

Formal requirements
- [The certificate must be issued, signed and stamped by the insurer (not by a broker or agent).]
- [Please ensure the certificate is issued in the name of [contracting entity].]

Coverage requirements (per FORVIA GPTC)
- Product liability: at least EUR 20,000,000 (found: [EUR x]).
- Product recall / withdrawal costs: at least EUR 15,000,000, worldwide including USA/Canada (found: [EUR x], [excluded for USA/Canada]).
- Pure financial loss: at least EUR 15,000,000 (found: [missing]).
- [Dismantling and refitting costs to be explicitly covered.]

Please send an updated certificate via SAP Ariba by [date]. Do not hesitate to forward this message to your insurer or broker.

Kind regards,
[Buyer name] — FORVIA Purchasing
```
