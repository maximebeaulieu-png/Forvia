# 02 — Insurance Domain Knowledge (output of the *insurance-domain-expert* agent)

Purpose: give the team and the LLM a shared, precise vocabulary for **third-party liability certificates of insurance** as used in industrial supply chains, plus the traps observed on FORVIA's 10 real samples.

---

## 1. What a certificate of insurance is — and is not

- A **certificate / attestation / Versicherungsbestätigung / certificado / dichiarazione** is a one-to-four-page document **issued by the insurer** confirming that a policy exists, for whom, for what period, with what limits. It "does not amend, extend or alter" the policy and "confers no rights" on the holder — every serious insurer writes this disclaimer. That is normal, not a red flag.
- It is **not** the policy, **not** a quote, **not** a broker's cover note. Sample 05 (ICICI Lombard) is a **quote** ("CGL QUOTE", "quote subject to declaration", "computer generated, no signature") → not acceptable as proof of cover.
- Anglo-Saxon markets use a standardized form (US: **ACORD 25**; UK similar); continental Europe uses free formats (Q08). The pipeline must handle both.

## 2. Anatomy of a certificate — the fields to extract

| Field | Typical labels (EN / FR / DE / ES / IT) | Notes |
|---|---|---|
| Issuer / Insurer | Insurer, Carrier / Assureur / Versicherer / Asegurador / Assicuratore | Must be a licensed insurer. Watch for "Assureur Conseil", "Courtier", "Agent général", "Broker", "Makler", "Corredor" → intermediary. |
| Policyholder | Policyholder, Named Insured / Souscripteur, Assuré / Versicherungsnehmer / Tomador / Contraente | Legal entity that bought the policy. |
| Additional / co-insured | Additional insured, Co-insured / Assurés additionnels / Mitversicherte Unternehmen / Asegurado adicional / Assicurati | Group policies list subsidiaries (sample 07: 16 entities; sample 10: Metraton insured under Landi Renzo's master policy). The FORVIA-contracting entity must appear as policyholder **or** as named/additional insured. |
| Policy number | Policy No. / Numéro de police, Contrat n° / Versicherungsschein-Nr., Policen-Nr. / Número de póliza / Polizza n° | Always present on a genuine certificate (Richard). Useful in a claim. |
| Period | Period of insurance / Période de garantie / Versicherungsperiode, Versicherungsdauer / Período / Periodo | From–to. German/French policies often state **tacit renewal** ("verlängert sich stillschweigend… 3 Monate vor Ablauf") — helpful but the certificate's own validity date governs. |
| Issue date & place | Fait à… le / Ort, Datum / Lugar y fecha / Luogo e data | Distinct from period. |
| Cover type | General & products liability / RC Exploitation, RC Produits, RC après livraison / Betriebs- & Produkthaftpflicht / RC Explotación, RC Productos / RCT, RCO, RC Prodotti | Some certificates cover **only recall** (samples 02, 08) → incomplete on their own. |
| Limits | Limit of indemnity, Sum insured / Montant de garantie, Plafond / Deckungssumme, Versicherungssumme / Suma asegurada / Massimale | Amount + currency + **basis**. |
| Basis of limit | per occurrence, any one claim, per accident / par sinistre / je Schadenereignis, je Versicherungsfall / por siniestro / per sinistro — vs — annual aggregate, in the aggregate / par année d'assurance / je Versicherungsjahr, Jahresmaximierung / agregado anual / per anno | "e.e.l./a.a." (Italian) = each and every loss / annual aggregate. "Combined single limit" (CSL) = one amount for BI + PD (+ PFL). |
| Sub-limits | Sublimit, Sous-limite, Sublimit, Sublímite, Sottolimite | The trap. A €10M headline with a €305k recall sub-limit is a €305k recall cover. |
| Deductibles | Deductible, SIR, Excess / Franchise / Selbstbehalt / Franquicia / Franchigia | Per claim. SIR = self-insured retention (sample 01: "claims paid excess of SIR"). |
| Territory | Territorial scope / Étendue territoriale / Örtlicher Geltungsbereich / Ámbito territorial / Estensione territoriale | "Worldwide incl. USA/Canada" is the good answer for an automotive supplier. "Hors USA/Canada" or separate reduced USA/Canada section → check. |
| Trigger | Occurrence (loss occurrence) vs Claims-made (+ retroactive date) | Richard: rarely on certificates; claims-made is weaker for a buyer. Sample 05 is claims-made. |
| Exclusions | Exclusions / Exclu, Sans objet / Ausschluss / Excluido / Escluso | Critical ones for FORVIA: USA/Canada excluded, recall excluded, "automobile critical components" excluded (sample 05: no cover for steering, brakes, tyres, seatbelts, airbags), punitive damages excluded (common, low impact). |
| Signature | Signed on behalf of… / Pour l'assureur / Unterschrift des Versicherers / Firma | Handwritten (or scanned handwritten) signature of a named person of the **insurer**. |
| Stamp / seal | Tampon, cachet / Stempel / Sello / Timbro | Richard: essential. Without a stamp an insurer can later say "we did not validate that". |
| Co-insurance share | Capacity xx %, quota-part, Anteil | Sample 05: "ICICI Lombard capacity (20 %)" → only 20 % of the limit is carried by this insurer; all co-insurers must sign (Q14). |
| Captive / fronting | Captive, fronted by | Captive = risky unless fronted by a solid insurer (Q20). |

## 3. FORVIA's guarantee taxonomy (normalized categories)

The rules engine works on **normalized categories**. The extractor maps any label to one of these (multilingual synonym table in `packages/rules/src/taxonomy.ts`, seeded from this section).

| Code | English name | Why FORVIA cares | Synonyms seen / expected |
|---|---|---|---|
| `PRODUCT_LIABILITY` | Product liability (after delivery) | GPTC **≥ €20M**. The core guarantee for a parts supplier. | Products liability, Products/Completed operations, RC Produits, RC après livraison, Produkthaftpflicht, RC Productos, RC Prodotti |
| `GENERAL_LIABILITY` | General / public / premises liability | Covers their own site operations — "on s'en fout" for FORVIA except when combined with product liability | Public liability, Premises, RC Exploitation, Betriebshaftpflicht, RC Explotación, RCT |
| `COMBINED_GL_PL` | Combined general + product liability (single limit) | Frequent (samples 01, 03, 07, 09). Must be mapped to both; Q13 open on how to count CSL. | Public and Product Liability combined, Betriebs- und Produkt-Haftpflicht, combined single limit |
| `PRODUCT_RECALL` | Product recall / withdrawal costs | **The #1 risk** in automotive. GPTC **≥ €15M** (with PFL). | Recall, Product recall costs, Frais de retrait, Frais de rappel, Rückrufkosten, Produktrückruf, Retirada de productos, Richiamo prodotti |
| `AUTOMOTIVE_RECALL` | Automotive recall liability (KFZ-Rückruf) | German specialty: recall of **vehicles** by OEM/authority caused by the part (samples 02, 08). Counts toward recall. | KFZ-Rückrufkostenversicherung, Recall liability for automotive component suppliers |
| `PURE_FINANCIAL_LOSS` | Pure financial loss / non-consequential immaterial damage (**DINC**) | GPTC **≥ €15M** (with recall). Richard's example: a supplier's technician presses a lever, the line stops → loss with no covered material damage. | Pure financial loss, Dommages immatériels non consécutifs, DINC, reine Vermögensschäden, Daños patrimoniales puros, Danni patrimoniali puri, Loss of use (partly) |
| `CONSEQUENTIAL_FINANCIAL_LOSS` | Consequential immaterial damage (**DIC**) | Financial loss following a covered damage (fire → production stop). Richard wants both DIC and DINC, ≥ €500k–1M each. | Dommages immatériels consécutifs, DIC, Folgeschäden, Daños consecuenciales, Danni indiretti consequenziali |
| `DISMANTLING_REFITTING` | Dismantling & refitting / removal & reinstallation costs | Cost to remove the defective part from vehicles and refit. Critical keyword in GPTC. | Frais de dépose et repose, Aus- und Einbaukosten, Dismantling and assembly cost, Costes de desmontaje y montaje |
| `ASSEMBLY_DISASSEMBLY` | Assembly & disassembly | Critical keyword in GPTC (close to the above; treat as synonym group, report separately if labelled separately) | Montage et démontage, Montage/Demontage |
| `EXTENDED_PRODUCT_LIABILITY` | Extended product liability | German concept: union/mixing/processing damages, further-processing, testing & sorting costs. Critical keyword in GPTC. | Erweiterte Produkthaftpflicht, Verbindungs-/Vermischungs-/Verarbeitungsschäden, Prüf- und Sortierkosten, Mixing and blending |
| `GOODS_IN_CUSTODY` | Goods entrusted / in care, custody & control | Tooling owned by FORVIA at the supplier's site | Biens confiés, Obhutsschäden, Goods under custody, CCC |
| `POLLUTION_ACCIDENTAL` | Sudden & accidental pollution | Secondary; Richard: €500k "a bit low" | Pollution accidentelle, Atteintes à l'environnement accidentelles, Umwelthaftpflicht, Contaminación accidental |
| `EMPLOYERS_LIABILITY` | Employer's liability / inexcusable fault | Secondary | Faute inexcusable, Employers' liability |
| `PROFESSIONAL_INDEMNITY` | Professional indemnity / E&O | Relevant if supplier has design responsibility | Berufshaftpflicht, RC professionnelle (careful: FR "RC professionnelle" is often used loosely for general liability, as in sample 04) |
| `OTHER` | Anything else | Keep original label | Tenant liability, valet parking, terrorism… (sample 05 lists many) |

## 4. Thresholds — what "compliant" means

### 4.1 Contractual (GPTC, per the needs expression) — default Requirements Profile `FORVIA_GPTC_DEFAULT`
- `PRODUCT_LIABILITY` ≥ **€20,000,000**
- `PURE_FINANCIAL_LOSS` **and/or** `PRODUCT_RECALL` ≥ **€15,000,000** (the spec groups them; the profile lets you require each separately — default: each ≥ €15M, see Q06 "scores by critical guarantee: withdrawal costs, DIC, DINC")
- Critical keywords must be **present** (presence check, no amount threshold in the spec): `EXTENDED_PRODUCT_LIABILITY`, `ASSEMBLY_DISASSEMBLY`, `DISMANTLING_REFITTING`
- Basis: prefer **annual aggregate** (Q12); per-claim-only → warning.
- Validity: not expired; expiry ≥ 10 months from reference date (Q05) — severity configurable (default WARNING for <10 months, BLOCK if expired).

### 4.2 Expert judgement observed (Richard, Unibail habits) — second profile `EXPERT_MEKOUAR` for demo only
- General liability ≥ €5M; DIC ≥ €500k; DINC ≥ €500k–1M; recall/withdrawal 1–5M; pollution ≥ €500k.
- **Conflict to arbitrate with FORVIA** (Q08/Q44): Richard judged sample 08 (Allianz recall €5M) "all amounts fine", which is non-compliant under GPTC €15M. The POC shows both so FORVIA can calibrate.

### 4.3 Modulation (Q08) — profile dimensions
Country / subsidiary / purchasing market. USA: claims 10–100× costlier → higher thresholds. Format expectation: US/UK normed (ACORD), EU/China/Arab countries free-form.

## 5. Authenticity & admissibility — the blocking checks

| Check | Rule | Source |
|---|---|---|
| Document type | Must be a certificate/attestation (not quote, not policy excerpt, not cover letter alone, not email) | Sample 05; Q31 (DOCX = red flag) |
| Issuer type | Issuer signing = insurer (or explicitly authorised broker — to be confirmed; agent = no-go) | Richard 00:02–00:03, 00:17; Q39 |
| Insurer identity | Name resolvable in an insurer registry; not an intermediary (ORIAS = intermediaries register in France, 22,000 brokers; insurers: ACPR/Refassu, BaFin, EIOPA register) | Richard 00:17–00:18 |
| Insurer solidity | Rating available and ≥ configurable floor (default: investment grade, e.g. AM Best A- / S&P BBB+); unrated/exotic → alert | Q19 |
| Stamp | Present | Richard, Q05 |
| Signature | Present, handwritten-style, of a named person | Richard, Q05 |
| Policy number | Present | Richard 00:28 |
| Dates | Present; not expired at reference date | Q05 |
| Entity match | Certificate names the FORVIA-contracting legal entity (as policyholder or named/additional insured) | Q21/Q26 |
| Co-insurance completeness | All co-insurers signed/stamped; share ≥ 100 % covered | Q14 |
| Captive | If captive insurer and not fronted → alert | Q20 |

Any failed check → `NO_GO`, **no Risk Score** (Q05). Exception handling: low-confidence detection of stamp/signature → `NEEDS_REVIEW`, not `NO_GO`.

## 6. Currency conversion

- Rate source: **ECB reference rates** (daily), at the **reference date** (= reception date, Richard's position; legal validation pending on which date prevails in a claim — Q28). Persist rate + date + source with each analysis (Q29).
- Show original and converted amounts side by side. Round EUR to nearest thousand in UI, keep full precision in data.
- INR / CHF / USD / GBP present in samples. Indicative ECB rates around 15/03/2025 (use real fetched values in live mode; demo fixtures may use): USD 1.088, CHF 0.960, INR 94.6, GBP 0.840 per EUR.

## 7. Traps catalogue (from the 10 samples) — the demo "aha" moments

1. **Headline limit vs sub-limit**: €10M "tous dommages confondus" but €305k withdrawal costs (sample 04).
2. **"Covered" without an amount** for product liability (sample 01) → treated as `COVERED_NO_AMOUNT` = non-compliant.
3. **Broker-issued** certificate with broker's stamp and insurer's logo in the footer (sample 04).
4. **Quote, not certificate**; 20 % capacity; claims-made; no policy number; no dates (sample 05).
5. **Foreign currency** hides a shortfall: USD 5M ≈ €4.6M (sample 01); CHF 20M ≈ €20.8M (sample 03) borderline.
6. **Per-claim vs aggregate**: 2M per event ×2 annual aggregate (sample 02) — what do you compare?
7. **Recall-only certificates** (samples 02, 08): excellent on recall, zero on product liability → need a second certificate.
8. **USA/Canada carve-out**: recall and refitting costs **excluded** for USA/Canada (sample 04, bottom table).
9. **Parent vs subsidiary**: policyholder is Grupo Empresarial COPO, FORVIA's supplier is Componentes de Vehículos de Galicia listed as additional insured (sample 06) — acceptable only because explicitly named.
10. **Signature ambiguity**: scribble over the stamp (sample 06), typed names without handwriting (sample 05), signatures but no stamp (samples 02, 03, 08, 09, 10).
11. **Garbled text layer** (sample 06: custom font encoding) → text extraction useless, OCR/VLM required.
12. **Scanned document** with skew and stamp noise (sample 04) → OCR quality lower, confidence must drop.
13. **Expiry**: most certificates are annual; at reception many have < 10 months left → the 10-month rule needs a graded severity or it blocks everything (design decision, §4.1).
14. **Personal data** in the document (email, phone) → mask.
15. **Critical exclusion** hidden on page 4: "no cover for automobile critical components" (sample 05) — for an automotive supplier this is disqualifying.

## 8. Registries and external data (V1; POC = curated JSON)

- Insurers: EIOPA Register of insurance undertakings (EU), ACPR/Refassu (FR), BaFin (DE), DGSFP (ES), IVASS (IT), FINMA (CH), IRDAI (IN), NAIC (US).
- Intermediaries: ORIAS (FR), IVASS RUI (IT), BaFin Vermittlerregister (DE).
- Ratings: AM Best, S&P, Moody's, Fitch (licensed data). POC: `data/registry/insurers.json` with ~40 insurers (name variants, country, regulator id, indicative rating, type = insurer/mutual/captive/broker).
- FX: ECB SDMX API (free), historized.
