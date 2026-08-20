# 01 — Business Context (output of the *business-analyst* agent)

Sources: FORVIA needs expression (cahier des charges), transcript of the 17/08/2026 working session with Richard Mekouar (insurance expert, ex-Unibail), "Questions Forvia" workbook (45 questions, 34 answered), POC estimation (60.1 person-days).

---

## 1. Who is FORVIA and why this matters to them

- FORVIA (Faurecia + HELLA) is an automotive Tier-1. Its customers are OEMs (Renault, Stellantis, Ferrari…) who impose very strong liability guarantees on FORVIA (Richard: "FORVIA gives guarantees of €50–100M to OEMs").
- FORVIA tries to **push that liability down** to its own suppliers through the GPTC. Suppliers are smaller: FORVIA asks them for €5–20M, not €50M.
- **The chain breaks when a sub-supplier is under-insured.** Real case quoted by Richard: Ferrari suffered a loss caused by a component from a FORVIA sub-supplier. Ferrari turned to FORVIA ("I only know you"), FORVIA paid **€5M** and could not recover from the sub-supplier, who was not insured.
- Main risk category in automotive: **product recall / withdrawal** ("rappel produit, retrait"). Recalls cost tens to hundreds of millions (vehicles must be brought back and repaired).

## 2. The process today and the "€90k per year"

| Step | Today | Pain |
|---|---|---|
| Buyers request a certificate of insurance from each supplier (GPTC obligation) | Not systematic | Many suppliers never provide one |
| Supplier uploads certificate as an attachment to a questionnaire in **SAP Ariba** (SLP / modular questionnaires) | PDF (sometimes PNG screenshot; a DOCX is itself a red flag) | Heterogeneous formats, languages, currencies |
| Someone must read it and judge it | Group Insurance Department (small team) | **≈ 8,000 certificates/year incl. renewals** (peak Jan–Feb). Impossible manually. Buyers lack the competence. |
| Broker's offer | FORVIA's broker proposes a **manual review service for €90,000 / year** ("we put people on it") | Expensive, slow, not integrated, brokers are cautious because it is risky for them |

Konstantin's back-of-envelope: 2 min/certificate × 8,000 = ≈ 35 person-days; 5 min → 80–100 person-days. Richard reads a certificate in ~2 minutes — but *explaining* what is wrong takes longer, and that explanation is exactly what buyers need to push back on suppliers.

### What the reviewer actually does (the job to be done — minute by minute)

Observed live on 10 real certificates. Richard checks **three things**, in this order (Konstantin's synthesis, confirmed by Richard: "C'est ça. Et ça suffit."):

1. **Authenticity ("véracité")**
   - Insurer logo and, above all, the **insurer's stamp** and a **handwritten signature**. "I want both."
   - The issuer must be the **insurer** — not a broker, not an agent. A certificate signed by a small broker (ex. *Marron & Associés*, a general agent in Oyonnax) "has no legal value — total refusal".
   - A **policy number** is always present on a real certificate.
   - The **insurer must exist and be solid**: known insurers (Allianz, AXA, Chubb, Generali, Zurich…) vs unknown names. ~200 insurers on the corporate market. Check public registers (France: ORIAS for intermediaries, ACPR/Refassu for insurers; EU: EIOPA register) and ratings (AM Best, S&P). "The AI will never know that unless it has a data source."
   - The **certificate must be issued in the name of the contracting entity**, not the parent company (otherwise inoperative in a dispute — Q21/Q26).
2. **Amounts vs thresholds and sub-limits**
   - Convert to EUR (USD 5M ≈ €4.6M → "alert, they don't have the minimum").
   - A headline "all damages combined" limit means nothing if the **sub-limit** on the guarantee that matters (recall, withdrawal costs) is tiny (ex. €305,000 withdrawal costs under a €10M headline).
   - Prefer **annual aggregate** over per-claim (per-claim limits "get exhausted quickly") — and flag the distinction (Q12).
   - Deductibles/franchises noted, rarely blocking (Q15 open).
3. **Completeness — is anything missing?**
   - Product liability, **product recall / withdrawal costs**, **pure financial loss (DINC)**, **consequential financial loss (DIC)**, dismantling & refitting costs, extended product liability.
   - "Covered" written without an amount is **unacceptable**.
   - Territorial exclusions, especially **USA / Canada excluded** on recall or refitting costs = "huge red flag".
   - Validity dates: expired, or expiring within < 10 months → alert (Q05).

Then he **decides**: "flag bidon" (No-Go), "demandes d'amélioration" (Request changes, with a precise list to send back via the buyer), or "ça va, on l'accepte, on score" (Go + score).

He also wants, over time: **keep policy numbers** (needed when a claim happens), **compare year over year** (a supplier who silently drops its recall limit from €10M to €5M is suspicious), and **reuse knowledge across clients** ("this company, we know it, its certificates are flimsy").

## 3. What FORVIA actually asked for (needs expression) — condensed

- Multilingual AI engine, standardized **English** restitution, hosted on French servers, open-source LLM (to be challenged — see open questions).
- Flow: Ariba export → AI analysis → structured results re-injected into Ariba → **buyer dashboard**.
- Two scores: **Information Accuracy Score** (extraction reliability) and **Risk Score** (coverage adequacy vs GPTC).
- Fields: supplier name, validity date, limits (product liability, general liability, product recall, pure financial loss), coverage type, currency + EUR conversion.
- Critical keywords: product recall, pure financial loss, extended product liability, assembly & disassembly, dismantling & refitting costs.
- GPTC thresholds: **Product liability €20M**; **Pure financial loss / product recall €15M**.
- Dashboard: expired certificates, under-insured suppliers, limits per supplier. Excel export.
- Performance: < 30 s per certificate, ≥ 90 % field recognition, ≥ 99 % availability. GDPR, encryption, restricted access, full traceability.
- Volume 5,000–8,000/year. POC on 100–200 certificates with a performance report, recommendations, deployment proposal.

## 4. The real need behind the spec (what the demo must prove)

| Stated need | Underlying need | Proof in the POC |
|---|---|---|
| "Score the certificates" | **Protect FORVIA's right of recourse** — never again a €5M Ferrari-type loss | Gate + per-guarantee compliance grid with explicit gaps |
| "Dashboard for buyers" | Buyers are not insurance experts; they need to be **told what to ask the supplier**, in plain English, with authority | One-click "Request changes" email listing exact gaps and required levels |
| "Multilingual" | Certificates arrive in FR/DE/ES/IT/EN/…; **nobody reads them** | Side-by-side original ↔ FORVIA standard grid, every line traced to the source page |
| "Currency conversion" | Limits in USD/CHF/INR hide non-compliance | Converted EUR column with rate + date, historized |
| "Two scores" | Group Insurance needs to know **when to trust the machine** | Accuracy score per field; low confidence → human review queue (~10 % expected) |
| "Re-inject into Ariba" | Insurance wants the result **where buyers already work** | Payload preview + mock sync |
| "Paramétrable" (Ismaël) | Thresholds differ per country/entity/market (USA 10–100× costlier, Q08) | Requirements Profile screen |
| "Explicabilité" (Q10) | A decision must be **defensible** in a claim dispute | Every alert has a rule ID, a reason, a source quote |

## 5. Users and roles (POC: role switch, no real SSO)

| Role | Goal | Primary screens |
|---|---|---|
| **Buyer** (Purchasing) | Know whether supplier X can be onboarded / kept; get the exact message to send | Queue, Certificate detail, Supplier 360 |
| **Group Insurance analyst** (Richard-like) | Clear the human-review queue fast; override with justification; calibrate rules | Review queue, Certificate detail, Requirements Profile |
| **Group Insurance Director / CPO** | Portfolio exposure, trends, proof of value | Portfolio overview, exports |
| **Admin (Arkan in POC)** | Configure profiles, FX source, insurer registry | Settings |

Arbitration in case of doubt: joint Purchasing + Insurance committee or Insurance Department; **the broker does not arbitrate** (Q04).

## 6. Power dynamics that shape the UX

- Buyers are in a **strong position** vs suppliers ("ils font le pouvoir") — they can demand €1M instead of €200k. The UI should make demanding easy and standard (templates), not apologetic.
- FORVIA is in a **weak position** vs OEMs — hence the obsession with recourse.
- Suppliers "cheat, fudge, send anything": the UI must make **how** they fudge visible (broker-issued, quote instead of certificate, parent entity, "covered" without amount, USA excluded in the fine print).

## 7. Success criteria for the POC (from spec + estimation + transcript)

- Extraction field accuracy ≥ 90 % on the annotated sample; decision match with expert verdict on the 10 seed certificates.
- < 30 s per certificate end-to-end (live mode).
- ~10 % routed to human review; **every alert routes to review**.
- A demo where a non-expert (buyer persona) understands in 60 seconds why the Marron & Associés certificate is a No-Go and what to ask MTS.
- Deliverables: performance report, recommendations, V1 deployment proposal (estimation line "Rapport de performance").

## 8. Productization signals (keep the architecture open)

Konstantin / Vincent / Ismaël: build everything as reusable **tools** (validation tool, scoring tool, registry tool…), because (a) the same need exists in the top 300–400 French companies, (b) cross-client supplier knowledge becomes a **supplier insurance rating directory** — the long-term business. Possible tiers: authenticity check only (cheap, OCR + registry) vs full scoring (AI + rules). Do not over-engineer the POC for this, but do not close the door: no FORVIA-specific logic in the rules engine, everything through the Requirements Profile.
