# 11 — Check catalogue: the big list of cases the POC must recognise

_122 checks · generated from `tools/build_check_catalogue.py` → `data/checks/check_catalogue.json` (v1.0.0). Edit the script, not this file._

This catalogue answers the question **"what exactly should the AI look for, and what does it mean when it finds it?"** It extends the 13 blocking gates and the 3 thresholds of `docs/04_scoring_rules.md` with every concrete situation we expect in FORVIA's 5,000–8,000 certificates a year. Each check carries: what to verify, multilingual cues (EN/FR/DE/ES/IT), how to read it, the outcome in the decision model, an example (real sample when available), the English explanation template and the fix to ask the supplier for.

## How it is used

- **Prompts** — `prompts/02_extract.md` injects the cue lists for categories D–F so the extractor labels guarantees, sub-limits and exclusions faithfully; `prompts/04_explain.md` uses `explain` / `fix` templates so every finding is worded consistently.
- **Rules engine** — each check has a `ruleRef` (gate id, guarantee code or helper); `packages/rules` emits findings with `checkId` so the UI can show the catalogue card.
- **Dashboard** — the Findings tab displays `title` + filled `explain`; the supplier email is built from `fix` lines of REQUEST_CHANGES / NO_GO findings.
- **Eval** — `tools/eval` reports which checks fired on the 10 samples vs `ground_truth.json` expectations.

## Outcome vocabulary

| Outcome | Meaning |
|---|---|
| `NO_GO_STRUCTURAL` | Blocking; the document itself is wrong (nature, issuer, entity, expiry). Supplier must send another document. |
| `NO_GO_FORMAL` | Blocking; same certificate can be re-issued with the missing formality (stamp, signature, policy number, entity added). UI: *Not admissible · resubmit*. |
| `REQUEST_CHANGES` | Critical guarantee missing / below threshold / unverifiable → endorsement needed. |
| `PENALTY` | Risk Score penalty (critical exclusions −10 each, cap −20; claims-made −5). |
| `SECONDARY` | Secondary criterion (5 pts each). |
| `REVIEW` | Ambiguous → human review queue. |
| `INFO` | Recorded and displayed, no effect. |
| `OK` | Positive signal. |

## Summary by category

| Category | Checks | Blocking | Major | Minor | Info |
|---|---|---|---|---|---|
| A. Document nature & admissibility | 12 | 9 | 2 | 1 | 0 |
| B. Authenticity & issuer | 16 | 9 | 0 | 6 | 1 |
| C. Insured entity | 10 | 3 | 0 | 6 | 1 |
| D. Guarantees — presence & mapping | 21 | 0 | 10 | 2 | 9 |
| E. Amounts, basis & sub-limits | 25 | 1 | 2 | 3 | 19 |
| F. Exclusions, trigger & territory | 18 | 0 | 8 | 3 | 7 |
| G. Period & timing | 9 | 1 | 0 | 4 | 4 |
| H. Consistency & data quality | 11 | 0 | 2 | 6 | 3 |

## Quick index

| id | Check | Severity | Outcome | Rule ref |
|---|---|---|---|---|
| A01 | Document is a quote / proposal, not a certificate | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A02 | Draft / specimen / 'for information only' | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A03 | Policy schedule / excerpt of general conditions instead of a certificate | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A04 | Cover letter / email only, certificate missing | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A05 | Renewal notice, invoice or premium statement | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A06 | Editable office file (DOCX/XLSX) instead of PDF/image | BLOCKING | `NO_GO_STRUCTURAL` | `FILE_FORMAT_OK` |
| A07 | Screenshot / photo of a screen, cropped or partial | MAJOR | `REVIEW` | `DOCUMENT_IS_CERTIFICATE` |
| A08 | Multi-document file (several certificates, several policies, attachments) | MINOR | `REVIEW` | `DOCUMENT_IS_CERTIFICATE` |
| A09 | Certificate references limits 'as per policy' without stating them | MAJOR | `REQUEST_CHANGES` | `PRODUCT_LIABILITY` |
| A10 | Blank template / unfilled fields | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A11 | Document not about liability insurance (property, motor fleet, D&O, transport) | BLOCKING | `NO_GO_STRUCTURAL` | `DOCUMENT_IS_CERTIFICATE` |
| A12 | Undated certificate | BLOCKING | `NO_GO_STRUCTURAL` | `DATES_PRESENT` |
| B01 | No insurer stamp / seal | BLOCKING | `NO_GO_FORMAL` | `STAMP_PRESENT` |
| B02 | No handwritten signature | BLOCKING | `NO_GO_FORMAL` | `SIGNATURE_PRESENT` |
| B03 | 'Electronically generated – no signature required' disclaimer | BLOCKING | `NO_GO_FORMAL` | `SIGNATURE_PRESENT` |
| B04 | Signature present but signer not named / no function | MINOR | `REVIEW` | `SIGNATURE_PRESENT` |
| B05 | Issued and signed by a broker (courtier / Makler / broker) | BLOCKING | `NO_GO_STRUCTURAL` | `ISSUER_IS_INSURER` |
| B06 | Broker letterhead but insurer stamp and signature present | MINOR | `REVIEW` | `ISSUER_IS_INSURER` |
| B07 | Insurer not found in the registry | BLOCKING | `NO_GO_STRUCTURAL` | `INSURER_IDENTIFIED` |
| B08 | Insurer rating below floor / in run-off / captive | BLOCKING | `NO_GO_STRUCTURAL` | `INSURER_RATING_FLOOR` |
| B09 | Policy number missing | BLOCKING | `NO_GO_FORMAL` | `POLICY_NUMBER_PRESENT` |
| B10 | Policy number is a placeholder or inconsistent across pages | MINOR | `REVIEW` | `POLICY_NUMBER_PRESENT` |
| B11 | Co-insurance: capacity share < 100 % from the signing insurer | BLOCKING | `NO_GO_STRUCTURAL` | `COINSURANCE_COMPLETE` |
| B12 | Co-insurers listed but only the leader signed | BLOCKING | `NO_GO_STRUCTURAL` | `COINSURANCE_COMPLETE` |
| B13 | Insurer contact is a generic webmail / no professional identifiers | MINOR | `REVIEW` | `ISSUER_IS_INSURER` |
| B14 | Standard disclaimer 'confers no rights on the certificate holder' | INFO | `INFO` | `—` |
| B15 | Stamp belongs to a different entity than the issuer | MINOR | `REVIEW` | `STAMP_PRESENT` |
| B16 | Pasted / low-resolution stamp image | MINOR | `REVIEW` | `STAMP_PRESENT` |
| C01 | Insured name ≠ supplier legal entity in Ariba | BLOCKING | `NO_GO_FORMAL` | `ENTITY_MATCH` |
| C02 | Only the parent / group is named; supplier is a subsidiary | BLOCKING | `NO_GO_FORMAL` | `ENTITY_MATCH` |
| C03 | Supplier appears only as 'additional insured' added for a customer | MINOR | `INFO` | `ENTITY_MATCH` |
| C04 | FORVIA entity named as additional insured | INFO | `OK` | `—` |
| C05 | Shared limit across many co-insured companies | MINOR | `INFO` | `AGGREGATE_BASIS` |
| C06 | Certificate addressed to another customer (another OEM) | MINOR | `REVIEW` | `ENTITY_MATCH` |
| C07 | Trading name / brand instead of legal name | MINOR | `REVIEW` | `ENTITY_MATCH` |
| C08 | Post-merger / renamed entity | MINOR | `REVIEW` | `ENTITY_MATCH` |
| C09 | Insured address / country differs from supplier | MINOR | `REVIEW` | `ENTITY_MATCH` |
| C10 | Entity named only in the cover letter, not on the certificate | BLOCKING | `NO_GO_FORMAL` | `ENTITY_MATCH` |
| D01 | Product liability missing (certificate covers recall only) | MAJOR | `REQUEST_CHANGES` | `PRODUCT_LIABILITY` |
| D02 | Product recall missing | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| D03 | 'Withdrawal costs' (frais de retrait) is not a full recall cover | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| D04 | Pure financial loss (DINC) missing | MAJOR | `REQUEST_CHANGES` | `PURE_FINANCIAL_LOSS` |
| D05 | DIC vs DINC confusion (FR) | MAJOR | `REQUEST_CHANGES` | `PURE_FINANCIAL_LOSS` |
| D06 | German 'Vermögensschäden': which kind? | MAJOR | `REQUEST_CHANGES` | `PURE_FINANCIAL_LOSS` |
| D07 | Extended product liability (erweiterte Produkthaftpflicht) bundle | MINOR | `SECONDARY` | `EXTENDED_PRODUCT_LIABILITY` |
| D08 | Dismantling & refitting / removal & reinstallation not stated | MINOR | `SECONDARY` | `DISMANTLING_REFITTING` |
| D09 | Assembly / disassembly wording | INFO | `SECONDARY` | `ASSEMBLY_DISASSEMBLY` |
| D10 | 'Covered' / 'included' without an amount | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| D11 | 'Available on request' / optional cover not taken | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| D12 | Combined single limit (GL + PL, sometimes + PFL) | INFO | `INFO` | `COMBINED_GL_PL` |
| D13 | Automotive recall (Kfz-Rückruf) vs generic recall | INFO | `OK` | `AUTOMOTIVE_RECALL` |
| D14 | Recall: own costs vs third-party costs | MAJOR | `REVIEW` | `PRODUCT_RECALL` |
| D15 | Inspection & sorting costs (Prüf- und Sortierkosten) | INFO | `SECONDARY` | `EXTENDED_PRODUCT_LIABILITY` |
| D16 | Professional indemnity / E&O confused with product liability | MAJOR | `REQUEST_CHANGES` | `PRODUCT_LIABILITY` |
| D17 | Employer's liability, motor, environmental lines listed — irrelevant to the request | INFO | `INFO` | `OTHER` |
| D18 | Goods in custody / tooling (biens confiés) | INFO | `INFO` | `GOODS_IN_CUSTODY` |
| D19 | Product guarantee / efficacy (performance) cover | INFO | `INFO` | `OTHER` |
| D20 | Serial loss clause | INFO | `INFO` | `PRODUCT_LIABILITY` |
| D21 | USA / Canada extension explicitly included | INFO | `SECONDARY` | `TERRITORY_USA_CANADA` |
| E01 | Headline limit high, recall/withdrawal sub-limit tiny | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| E02 | Recall sub-limit inside a combined single limit | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| E03 | Per occurrence vs annual aggregate — which figure to compare | INFO | `INFO` | `AGGREGATE_BASIS` |
| E04 | '5,000,000 / 10,000,000' = per claim / aggregate | INFO | `INFO` | `AGGREGATE_BASIS` |
| E05 | German 'x-fach maximiert' (maximisation multiplier) | INFO | `INFO` | `AGGREGATE_BASIS` |
| E06 | Limit 'inclusive of defence costs' / 'costs inclusive' | INFO | `INFO` | `PRODUCT_LIABILITY` |
| E07 | 'Included in the general limit' — inherit or not? | INFO | `INFO` | `PRODUCT_RECALL` |
| E08 | Very high deductible / self-insured retention | INFO | `INFO` | `DEDUCTIBLE` |
| E09 | Deductible expressed as a percentage ('scoperto') | INFO | `INFO` | `DEDUCTIBLE` |
| E10 | Foreign currency — convert at ECB rate of the reference date | INFO | `INFO` | `FX` |
| E11 | Indian lakh / crore notation | INFO | `INFO` | `FX` |
| E12 | European vs Anglo-Saxon thousand/decimal separators | INFO | `INFO` | `AMOUNT_PARSING` |
| E13 | Abbreviations: Mio., M€, k€, Mn, MM, bn, Md | INFO | `INFO` | `AMOUNT_PARSING` |
| E14 | Amount written in words differs from figures | MINOR | `REVIEW` | `AMOUNT_PARSING` |
| E15 | Per-guarantee sub-limit table with 'per claim / per year' columns | INFO | `INFO` | `AMOUNT_PARSING` |
| E16 | Capacity share applied to limits | BLOCKING | `NO_GO_STRUCTURAL` | `COINSURANCE_COMPLETE` |
| E17 | Limit shared across several guarantees and insureds (aggregate erosion) | INFO | `INFO` | `AGGREGATE_BASIS` |
| E18 | Sub-limit for USA/Canada lower than main limit | INFO | `SECONDARY` | `TERRITORY_USA_CANADA` |
| E19 | Primary + excess / umbrella layers | INFO | `REVIEW` | `PRODUCT_LIABILITY` |
| E20 | Amount threshold exactly at the limit after FX rounding | MINOR | `REVIEW` | `FX` |
| E21 | Unlimited / 'no limit' / 'illimité' statements | INFO | `OK` | `PRODUCT_LIABILITY` |
| E22 | Limit expressed per person / per property (BI/PD split) | INFO | `INFO` | `PRODUCT_LIABILITY` |
| E23 | Recall limit stated per 'campaign' or per 'recall event' | INFO | `INFO` | `PRODUCT_RECALL` |
| E24 | Small 'typical' sub-limits that are NOT critical | INFO | `INFO` | `OTHER` |
| E25 | Limit conditional on a clause ('subject to', 'provided that') | MINOR | `REVIEW` | `PRODUCT_LIABILITY` |
| F01 | USA / Canada excluded | MAJOR | `PENALTY` | `TERRITORY_USA_CANADA` |
| F02 | Territory limited to Europe / home country | MAJOR | `PENALTY` | `TERRITORY_USA_CANADA` |
| F03 | Claims-made trigger | MINOR | `PENALTY` | `TRIGGER` |
| F04 | Retroactive date / extended reporting period | MINOR | `REVIEW` | `TRIGGER` |
| F05 | Exclusion of automotive safety-critical components | MAJOR | `PENALTY` | `CRITICAL_EXCLUSION` |
| F06 | Exclusion of products for the automotive / aerospace industry | MAJOR | `REQUEST_CHANGES` | `PRODUCT_LIABILITY` |
| F07 | Pure financial loss explicitly excluded | MAJOR | `REQUEST_CHANGES` | `PURE_FINANCIAL_LOSS` |
| F08 | Recall excluded | MAJOR | `REQUEST_CHANGES` | `PRODUCT_RECALL` |
| F09 | Contractual liability exclusion | INFO | `INFO` | `EXCLUSION` |
| F10 | Product efficacy / failure-to-perform exclusion | INFO | `INFO` | `EXCLUSION` |
| F11 | Known circumstances / prior claims exclusion | INFO | `INFO` | `EXCLUSION` |
| F12 | Sanctions, war, terrorism, nuclear, asbestos exclusions | INFO | `INFO` | `EXCLUSION` |
| F13 | Cyber / data exclusion | INFO | `INFO` | `EXCLUSION` |
| F14 | Punitive / exemplary damages excluded | INFO | `INFO` | `EXCLUSION` |
| F15 | Exclusion of recall ordered by authority vs voluntary | MAJOR | `REVIEW` | `PRODUCT_RECALL` |
| F16 | Exclusion of pure financial loss from 'loss of use' | MINOR | `REVIEW` | `PURE_FINANCIAL_LOSS` |
| F17 | Exclusion of damage to the insured's own product / work | INFO | `INFO` | `EXCLUSION` |
| F18 | Jurisdiction clause (courts) vs territory | MAJOR | `PENALTY` | `TERRITORY_USA_CANADA` |
| G01 | Certificate expired at reference date | BLOCKING | `NO_GO_STRUCTURAL` | `NOT_EXPIRED` |
| G02 | Expires within the renewal window (e.g. < 60 days) | INFO | `INFO` | `NOT_EXPIRED` |
| G03 | Period starts in the future | MINOR | `REVIEW` | `DATES_PRESENT` |
| G04 | Period shorter than 12 months / short-term policy | INFO | `INFO` | `DATES_PRESENT` |
| G05 | Only 'valid until further notice' / tacit renewal, no end date | MINOR | `REVIEW` | `DATES_PRESENT` |
| G06 | Issue date much older than the period / stale certificate | INFO | `INFO` | `DATES_PRESENT` |
| G07 | Issue date after the start of the period (normal) vs before (check) | MINOR | `REVIEW` | `DATES_PRESENT` |
| G08 | Date format ambiguity (DD/MM vs MM/DD) | MINOR | `REVIEW` | `DATES_PRESENT` |
| G09 | Cancellation clause ('may be cancelled at any time') | INFO | `INFO` | `—` |
| H01 | Bilingual certificate: figures differ between languages | MINOR | `REVIEW` | `AMOUNT_PARSING` |
| H02 | Summary table vs narrative text disagree | MINOR | `REVIEW` | `AMOUNT_PARSING` |
| H03 | Text layer garbled / absent → OCR fallback | MINOR | `REVIEW` | `IAS` |
| H04 | Low-resolution or skewed scan | MINOR | `REVIEW` | `IAS` |
| H05 | Handwritten amendments on a printed certificate | MAJOR | `REVIEW` | `STAMP_PRESENT` |
| H06 | Page missing ('page 2 of 3' but 2 pages) | MAJOR | `REVIEW` | `DOCUMENT_IS_CERTIFICATE` |
| H07 | Insured name spelled differently across pages | MINOR | `REVIEW` | `ENTITY_MATCH` |
| H08 | Personal data present (names, emails, phone numbers) | INFO | `INFO` | `GDPR` |
| H09 | Multiple currencies on one certificate | INFO | `INFO` | `FX` |
| H10 | Language not in the supported set / mixed scripts | MINOR | `REVIEW` | `IAS` |
| H11 | Certificate for the right supplier but the wrong FORVIA request (duplicate / re-upload) | INFO | `INFO` | `—` |


## A. Document nature & admissibility

### A01 — Document is a quote / proposal, not a certificate

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** Is the document a binding confirmation of cover in force, or an offer/quotation?
- **How to read it:** A quote proves nothing: the supplier may never have bound the policy. Quotes carry words like quote, proposal, premium, validity of offer, 'subject to'. A genuine certificate states that a policy IS in force with a policy number and period.
- **Cues:** **EN** quote, quotation, proposal, premium quoted, this quote is valid until, subject to acceptance, offer · **FR** devis, proposition, projet de contrat, offre valable jusqu'au · **DE** Angebot, Prämienangebot, unverbindlich, Offerte · **ES** cotización, propuesta, oferta, prima estimada · **IT** preventivo, quotazione, proposta, offerta
- **Example (sample 05 (ICICI Lombard / Naxnova)):** Title 'Commercial General Liability Quote'; premium shown; 'ICICI Lombard capacity (20%)'.
- **Explain (EN):** The document is a quotation, not a certificate of insurance in force.
- **Fix to request:** Please provide a certificate of insurance issued by the insurer confirming the policy in force (policy number, period, limits).

### A02 — Draft / specimen / 'for information only'

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** Watermarks or notes indicating the document is not the final signed version.
- **How to read it:** Drafts and specimens are not evidence. Also catch 'projet', 'Entwurf', 'Muster', 'sample', 'void'.
- **Cues:** **EN** draft, specimen, sample, for information only, void, not valid · **FR** projet, spécimen, pour information, non contractuel · **DE** Entwurf, Muster, unverbindlich, zur Information · **ES** borrador, muestra, solo informativo · **IT** bozza, fac-simile, a titolo informativo
- **Example (synthetic):** Diagonal watermark 'DRAFT – NOT VALID' on every page.
- **Explain (EN):** The document is marked as a draft or specimen and cannot be relied upon.
- **Fix to request:** Please provide the final, signed and stamped certificate.

### A03 — Policy schedule / excerpt of general conditions instead of a certificate

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** The supplier sent pages of the policy wording (conditions, schedule) rather than a certificate addressed to a third party.
- **How to read it:** A policy excerpt can contain the right numbers but is not a certification by the insurer that the cover is in force today. Treat as structural; data may still be extracted for information.
- **Cues:** **EN** general conditions, policy wording, schedule, section, article, definitions · **FR** conditions générales, conditions particulières, article, dispositions · **DE** Allgemeine Versicherungsbedingungen, AHB, Besondere Bedingungen, Versicherungsschein · **ES** condiciones generales, condiciones particulares · **IT** condizioni generali, condizioni particolari, polizza
- **Example (synthetic):** 12-page PDF starting with 'Allgemeine Versicherungsbedingungen für die Haftpflichtversicherung (AHB)'.
- **Explain (EN):** The document is an excerpt of the policy, not a certificate confirming the cover in force.
- **Fix to request:** Please ask your insurer to issue a certificate of insurance (attestation) summarising the cover in force.

### A04 — Cover letter / email only, certificate missing

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** A broker or insurer letter says 'please find attached the certificate' but the attachment is absent.
- **How to read it:** Classify as EMAIL/COVER_LETTER. If the same file also contains the certificate (sample 09), keep only the certificate pages and record the letter as context.
- **Cues:** **EN** please find attached, enclosed, herewith · **FR** veuillez trouver ci-joint, ci-après · **DE** anbei, in der Anlage, beigefügt · **ES** adjunto · **IT** in allegato
- **Example (sample 09 (Allianz / Beyer Polyvlies)):** Page 1 is a personal cover letter from the insurer's contact ('anbei erhalten Sie…'); the certificate follows on page 2.
- **Explain (EN):** Only a cover letter was received; the certificate itself is missing.
- **Fix to request:** Please send the certificate referred to in your letter.

### A05 — Renewal notice, invoice or premium statement

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** Financial documents mention the policy but do not certify the cover.
- **How to read it:** Premium invoices prove a payment, not the scope of cover, and often pre-date the period. Reject.
- **Cues:** **EN** invoice, premium due, renewal notice, amount payable · **FR** avis d'échéance, appel de prime, facture · **DE** Beitragsrechnung, Prämienrechnung, fällig · **ES** recibo de prima, factura · **IT** quietanza, avviso di scadenza
- **Example (synthetic):** 'Avis d'échéance – prime annuelle TTC 12 340 €' with bank details.
- **Explain (EN):** The document is a premium invoice / renewal notice, not a certificate.
- **Fix to request:** Please provide the certificate of insurance, not the premium invoice.

### A06 — Editable office file (DOCX/XLSX) instead of PDF/image

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `FILE_FORMAT_OK`

- **Check:** File format received via Ariba.
- **How to read it:** An editable file can be altered after issuance (Q31: DOCX = red flag). Block at ingestion without analysis.
- **Example (synthetic):** attestation_RC_2025.docx uploaded in Ariba.
- **Explain (EN):** Editable file formats are not accepted for certificates.
- **Fix to request:** Please upload the certificate as a PDF (or scanned image) exactly as issued by the insurer.

### A07 — Screenshot / photo of a screen, cropped or partial

**Severity** MAJOR · **Outcome** `REVIEW` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** Image shows a browser window, phone UI, or only part of the page.
- **How to read it:** Partial captures hide sub-limits and signatures. Route to review if most fields extract; block if key zones are missing.
- **Example (synthetic):** PNG 1080×1920 showing a phone screen with the top half of a certificate.
- **Explain (EN):** The file is a partial screenshot; parts of the certificate (signature zone, sub-limits) may be missing.
- **Fix to request:** Please upload the full certificate as a PDF.

### A08 — Multi-document file (several certificates, several policies, attachments)

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** One PDF contains more than one distinct document.
- **How to read it:** Split by document; analyse each; link them. Do not sum limits across different policies unless one document explicitly states it is an excess layer of the other (E20).
- **Example (sample 09):** Cover letter + certificate in one PDF.
- **Explain (EN):** The file contains several documents; each has been analysed separately.

### A09 — Certificate references limits 'as per policy' without stating them

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Amounts are replaced by a reference to the policy or to general conditions.
- **How to read it:** Unverifiable. Critical guarantees → REQUEST_CHANGES (need figures).
- **Cues:** **EN** as per policy, per the policy terms, in accordance with the policy · **FR** selon conditions particulières, conformément au contrat · **DE** gemäß Versicherungsschein, laut Vertrag · **ES** según póliza · **IT** come da polizza
- **Example (synthetic):** 'Limits of indemnity: as per policy schedule.'
- **Explain (EN):** The certificate refers to the policy limits without stating amounts, which cannot be verified.
- **Fix to request:** Please ask your insurer to state the limit of indemnity for each guarantee (amount, currency, basis).

### A10 — Blank template / unfilled fields

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** Placeholder fields left empty or with brackets.
- **How to read it:** A template with empty insured name, dates or amounts is not a certificate.
- **Cues:** **EN** [insert, ______, xxx, TBD, N/A · **FR** à compléter · **DE** [bitte eintragen]
- **Example (synthetic):** 'Policyholder: ______________ Policy No.: XXXXXXX'.
- **Explain (EN):** The certificate contains unfilled template fields.
- **Fix to request:** Please provide the completed certificate issued by your insurer.

### A11 — Document not about liability insurance (property, motor fleet, D&O, transport)

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** The certificate covers another line of business.
- **How to read it:** Correctly identify the line. A motor or property certificate is structurally wrong for this request.
- **Cues:** **EN** property all risks, motor fleet, directors and officers, marine cargo, workers compensation · **FR** multirisque, flotte automobile, RC mandataires sociaux, marchandises transportées · **DE** Sachversicherung, Kfz-Flotte, D&O, Transportversicherung · **ES** daños materiales, flota, transporte · **IT** all risks, flotta, trasporti
- **Example (synthetic):** 'Certificate of Insurance – Property Damage and Business Interruption'.
- **Explain (EN):** The certificate relates to a different line of insurance (e.g. property / motor) and does not evidence liability cover.
- **Fix to request:** Please provide the general & product liability certificate.

### A12 — Undated certificate

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `DATES_PRESENT`

- **Check:** No issue date and no period dates.
- **How to read it:** Without a date the certificate cannot be placed in time. DATES_PRESENT fails.
- **Example (synthetic):** No 'Fait à… le', no period, only 'valid for the current insurance year'.
- **Explain (EN):** The certificate is undated and states no period of insurance.
- **Fix to request:** Please provide a dated certificate stating the period of insurance (from / to).


## B. Authenticity & issuer

### B01 — No insurer stamp / seal

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `STAMP_PRESENT`

- **Check:** Presence of a stamp (ink or printed seal) attributable to the issuing insurer.
- **How to read it:** Richard: without a stamp the insurer can later deny having validated the document. Formal defect: the same certificate can be re-issued stamped. Detection = presence & attribution, not forgery detection.
- **Cues:** **EN** stamp, seal, company seal · **FR** cachet, tampon · **DE** Stempel, Firmenstempel · **ES** sello · **IT** timbro
- **Example (samples 02, 03, 07, 08, 09, 10):** Printed letterhead and signature, no stamp.
- **Explain (EN):** No insurer stamp was found on the certificate.
- **Fix to request:** Please provide the certificate stamped by the insurer.

### B02 — No handwritten signature

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `SIGNATURE_PRESENT`

- **Check:** A handwritten-style signature of a person acting for the issuer.
- **How to read it:** Typed name only, or nothing. Formal defect.
- **Example (sample 05):** Quote ends with 'Authorised Signatory' and no signature.
- **Explain (EN):** The certificate is not signed.
- **Fix to request:** Please provide the certificate signed by an authorised representative of the insurer.

### B03 — 'Electronically generated – no signature required' disclaimer

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `SIGNATURE_PRESENT`

- **Check:** A printed note replacing the signature.
- **How to read it:** Common in DE/UK. Under the strict profile it fails SIGNATURE_PRESENT (formal). Profile switch `acceptElectronicSignatureNote` may allow it if a qualified e-signature (eIDAS) is embedded — check PDF signature field.
- **Cues:** **EN** electronically generated, valid without signature, no signature required · **FR** document généré électroniquement, valable sans signature · **DE** maschinell erstellt, auch ohne Unterschrift gültig, ohne Unterschrift gültig · **ES** generado electrónicamente, válido sin firma · **IT** generato elettronicamente, valido senza firma
- **Example (synthetic):** 'Dieses Schreiben wurde maschinell erstellt und ist auch ohne Unterschrift gültig.'
- **Explain (EN):** The certificate carries no handwritten signature; it states that it was generated electronically.
- **Fix to request:** Please provide a signed certificate, or a PDF carrying a qualified electronic signature.

### B04 — Signature present but signer not named / no function

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `SIGNATURE_PRESENT`

- **Check:** A scribble without printed name or title.
- **How to read it:** Lower attribution confidence; route to review rather than block.
- **Example (sample 06 (Zurich ES / COPO)):** Stamp plus an illegible initial; no printed name.
- **Explain (EN):** A signature is present but the signatory is not identified.
- **Fix to request:** Please ask your insurer to add the name and function of the signatory.

### B05 — Issued and signed by a broker (courtier / Makler / broker)

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `ISSUER_IS_INSURER`

- **Check:** Who signs: an insurer, or an intermediary?
- **How to read it:** A broker certifies what it believes; only the insurer binds itself. Richard: Marron & Associés → 'refus total'. Detect ORIAS numbers, 'courtier', 'assureur conseil', 'agent général', 'Makler', 'corredor', 'broker'. Profile option `allowAuthorisedBroker` (default false).
- **Cues:** **EN** broker, insurance broker, intermediary, on behalf of our client · **FR** courtier, assureur conseil, agent général, ORIAS, cabinet, intermédiaire en assurance · **DE** Versicherungsmakler, Makler, Vermittler, Agentur · **ES** corredor, correduría, mediador · **IT** broker, intermediario, agenzia
- **Example (sample 04 (Marron & Associés / MTS)):** 'Agent Général MMA… immatriculé à l'ORIAS'; signed by the agency.
- **Explain (EN):** The certificate is issued by an intermediary (broker/agent), not by the insurer.
- **Fix to request:** Please provide a certificate issued and signed by the insurer itself (the broker may forward it).

### B06 — Broker letterhead but insurer stamp and signature present

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ISSUER_IS_INSURER`

- **Check:** Mixed case: broker template, insurer authenticates.
- **How to read it:** Acceptable if the stamp and signature belong to the insurer and the insurer is named as issuer. Attribute the stamp; if stamp entity ≠ issuer → review.
- **Example (synthetic):** Broker logo top-left, 'Pour l'assureur: AXA France IARD' with AXA stamp and signature bottom-right.
- **Explain (EN):** The certificate is on broker letterhead; the insurer's stamp and signature were verified.

### B07 — Insurer not found in the registry

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `INSURER_IDENTIFIED`

- **Check:** Issuer name resolved against the insurer registry (ACPR/EIOPA/BaFin/NAIC… curated JSON in POC).
- **How to read it:** Unknown carrier = cannot assess solidity. Block when no match and no regulator id on the document; review when fuzzy.
- **Example (synthetic):** 'Global Trust Underwriters Ltd' – no match in EIOPA, no regulator number.
- **Explain (EN):** The issuing insurer could not be identified in the insurer registry.
- **Fix to request:** Please confirm the full legal name and regulator registration of the insurer.

### B08 — Insurer rating below floor / in run-off / captive

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `INSURER_RATING_FLOOR`

- **Check:** Financial strength rating vs profile floor (default A- AM Best / BBB+ S&P).
- **How to read it:** Weak or unrated carriers (Q19). Captive not fronted by a rated insurer → block (Q20). Mutual without rating → review.
- **Cues:** **EN** captive, fronted by, run-off · **FR** captive · **DE** Captive, Abwicklung
- **Example (synthetic):** Issuer 'XYZ Captive Re Ltd (Guernsey)' without fronting insurer.
- **Explain (EN):** The insurer's financial strength rating is below the required floor.
- **Fix to request:** Please provide cover from an insurer rated at least A- (AM Best) or equivalent.

### B09 — Policy number missing

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `POLICY_NUMBER_PRESENT`

- **Check:** Presence of a policy / contract number.
- **How to read it:** Every genuine certificate carries one (Richard). Needed in a claim. Formal defect.
- **Cues:** **EN** policy no, policy number, contract no · **FR** police n°, contrat n°, n° de contrat · **DE** Versicherungsschein-Nr, Policen-Nr, Vertrags-Nr · **ES** número de póliza, póliza nº · **IT** polizza n, n. polizza
- **Example (synthetic):** Certificate with all limits but no contract reference anywhere.
- **Explain (EN):** No policy number is stated.
- **Fix to request:** Please provide a certificate stating the policy number.

### B10 — Policy number is a placeholder or inconsistent across pages

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `POLICY_NUMBER_PRESENT`

- **Check:** Format check and cross-page consistency.
- **How to read it:** 'XXXXXX', '0000000', or header number ≠ stamp number → review (possible tampering or mixed documents).
- **Example (synthetic):** Header: 'Policy 7854-221-A'; page 3 footer: 'Policy 7854-219-A'.
- **Explain (EN):** The policy number looks like a placeholder or differs between pages.
- **Fix to request:** Please confirm the correct policy number.

### B11 — Co-insurance: capacity share < 100 % from the signing insurer

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `COINSURANCE_COMPLETE`

- **Check:** 'Capacity x %', 'quota-part', 'Anteil', 'share', 'leader'.
- **How to read it:** The signing insurer only carries its share. Forvia needs the whole tower evidenced: all co-insurers named and signed/stamped (Q14), shares summing to 100 %.
- **Cues:** **EN** capacity, share, quota share, leader, following insurers · **FR** quote-part, apériteur, coassurance · **DE** Anteil, führender Versicherer, Mitversicherer, Beteiligung · **ES** cuota, coaseguro, abridora · **IT** quota, delegataria, coassicurazione
- **Example (sample 05):** 'ICICI Lombard capacity (20%)'.
- **Explain (EN):** The certificate is issued by one co-insurer carrying only part of the limit; the other co-insurers are not evidenced.
- **Fix to request:** Please provide a certificate listing all co-insurers and their shares (100 %), signed by each, or issued by the leader on behalf of all.

### B12 — Co-insurers listed but only the leader signed

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `COINSURANCE_COMPLETE`

- **Check:** Signature/stamp of each co-insurer, or a clause 'the leader signs on behalf of all'.
- **How to read it:** Block unless the leader's mandate is stated on the document.
- **Example (synthetic):** 'Allianz 60 % – HDI 25 % – Helvetia 15 %' with one Allianz signature only.
- **Explain (EN):** Co-insurers are listed but have not signed or stamped the certificate.
- **Fix to request:** Please have each co-insurer sign/stamp, or state the leader's authority to sign for all.

### B13 — Insurer contact is a generic webmail / no professional identifiers

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ISSUER_IS_INSURER`

- **Check:** Email domain, phone, company registration numbers.
- **How to read it:** A certificate signed from gmail.com is suspicious. Review. Mask personal data in exports (GDPR).
- **Example (synthetic):** 'For Allianz: j.muster@gmail.com'.
- **Explain (EN):** The issuer's contact details are not professional identifiers of the insurer.
- **Fix to request:** Please provide a certificate issued from the insurer's official channels.

### B14 — Standard disclaimer 'confers no rights on the certificate holder'

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `—`

- **Check:** Legal boilerplate.
- **How to read it:** Normal on certificates worldwide (ACORD, DE, FR). Do not penalise. Record as INFO.
- **Cues:** **EN** confers no rights, does not amend, extend or alter, information only · **FR** ne saurait engager, ne peut engager l'assureur au-delà · **DE** begründet keine Rechte, dient nur zur Information
- **Example (sample 01 (Chubb / Air Products)):** 'This certificate is issued as a matter of information only…'
- **Explain (EN):** Standard disclaimer noted; no impact.

### B15 — Stamp belongs to a different entity than the issuer

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `STAMP_PRESENT`

- **Check:** Stamp text vs issuer name.
- **How to read it:** Broker stamp on an insurer letter, or group stamp on a local entity. Review.
- **Example (synthetic):** Letter from 'Zurich Insurance plc, Niederlassung Deutschland', stamp 'Müller Versicherungsmakler GmbH'.
- **Explain (EN):** The stamp does not match the issuing entity.
- **Fix to request:** Please confirm which entity issued the certificate.

### B16 — Pasted / low-resolution stamp image

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `STAMP_PRESENT`

- **Check:** Visual: stamp with uniform background rectangle, JPEG artefacts, identical pixel stamp on every page.
- **How to read it:** Not a forgery verdict (out of scope) — lower STAMP confidence → review.
- **Example (synthetic):** Pixel-identical stamp at the same coordinates on pages 1–4, with a white rectangle behind it.
- **Explain (EN):** The stamp appears as a pasted image; authenticity could not be confirmed visually.
- **Fix to request:** Please provide the original certificate (scan of the stamped original or the insurer's signed PDF).


## C. Insured entity

### C01 — Insured name ≠ supplier legal entity in Ariba

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `ENTITY_MATCH`

- **Check:** Normalised fuzzy match between Ariba supplier (legal name, country) and policyholder / named / additional / co-insured.
- **How to read it:** Q26: certificate must name the contracting entity; otherwise blocking (formal: the insurer can add the entity). Ignore legal-form noise (GmbH vs GmbH & Co. KG) only within the review band.
- **Example (synthetic):** Ariba: 'Beyer Polyvlies Franz Beyer GmbH & Co. KG'; certificate: 'Beyer Holding GmbH'.
- **Explain (EN):** The certificate does not name the contracting supplier entity.
- **Fix to request:** Please provide a certificate naming {supplierLegalName} as policyholder or insured.

### C02 — Only the parent / group is named; supplier is a subsidiary

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `ENTITY_MATCH`

- **Check:** Group master policy.
- **How to read it:** Acceptable only if the supplier is listed as co-insured/insured subsidiary (sample 10: Metraton under Landi Renzo master policy). Otherwise formal block.
- **Cues:** **EN** subsidiaries, group companies, affiliated companies, master policy · **FR** filiales, sociétés du groupe · **DE** Tochtergesellschaften, Konzernunternehmen, mitversicherte Unternehmen · **ES** filiales, empresas del grupo · **IT** società controllate, società del gruppo, polizza master
- **Example (sample 10 (Generali IT / Metraton)):** Policyholder Landi Renzo S.p.A.; Metraton listed as insured company.
- **Explain (EN):** Only the parent company is insured; the supplier entity is not listed.
- **Fix to request:** Please provide a certificate confirming that {supplierLegalName} is an insured under the group policy.

### C03 — Supplier appears only as 'additional insured' added for a customer

**Severity** MINOR · **Outcome** `INFO` · **Rule ref** `ENTITY_MATCH`

- **Check:** Role of the supplier on the certificate.
- **How to read it:** Additional insured status is acceptable (profile acceptAs). But if the supplier is added only for one project/contract, check scope wording.
- **Example (synthetic):** 'Additional insured: XYZ S.r.l. in respect of contract no. 4711 only.'
- **Explain (EN):** The supplier is covered as additional insured.

### C04 — FORVIA entity named as additional insured

**Severity** INFO · **Outcome** `OK` · **Rule ref** `—`

- **Check:** A FORVIA company appears on the certificate.
- **How to read it:** Positive, not required. Record as OK; useful for buyers.
- **Example (sample 06):** A FORVIA subsidiary listed as additional insured.
- **Explain (EN):** A FORVIA entity is named as additional insured on this policy.

### C05 — Shared limit across many co-insured companies

**Severity** MINOR · **Outcome** `INFO` · **Rule ref** `AGGREGATE_BASIS`

- **Check:** Group certificate with N insured entities and one aggregate.
- **How to read it:** Limit is shared group-wide (sample 07: 16 entities). Not a breach, but reduces effective capacity. Display as INFO with the count.
- **Example (sample 07 (Zurich DE / IMI)):** 16 co-insured companies share €5M combined.
- **Explain (EN):** The annual aggregate is shared between {n} insured companies.

### C06 — Certificate addressed to another customer (another OEM)

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ENTITY_MATCH`

- **Check:** 'To: Stellantis Purchasing' style addressee.
- **How to read it:** Still evidence of cover if not restricted to that customer's contract. Review wording; INFO otherwise.
- **Example (synthetic):** 'Certificate holder: Volkswagen AG, Konzerneinkauf'.
- **Explain (EN):** The certificate was issued for another customer; the cover described is not customer-specific.
- **Fix to request:** Please provide a certificate addressed to FORVIA or 'to whom it may concern'.

### C07 — Trading name / brand instead of legal name

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ENTITY_MATCH`

- **Check:** 'XYZ Automotive' vs 'XYZ Automotive Components S.A.S.'.
- **How to read it:** Review band; ask for legal name if ambiguous.
- **Example (synthetic):** Insured: 'AutoSeal' (brand); Ariba: 'Dichtungstechnik Müller GmbH'.
- **Explain (EN):** The insured is identified by a trading name; legal identity could not be confirmed.
- **Fix to request:** Please confirm the legal name of the insured entity.

### C08 — Post-merger / renamed entity

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ENTITY_MATCH`

- **Check:** Insured name is the former name of the supplier.
- **How to read it:** Legal continuity usually preserves cover, but the certificate should be updated. Review.
- **Example (synthetic):** Certificate: 'Faurecia Interior Systems'; Ariba: 'FORVIA Interior Systems'.
- **Explain (EN):** The certificate names a former legal name of the supplier.
- **Fix to request:** Please provide an updated certificate with the current legal name.

### C09 — Insured address / country differs from supplier

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ENTITY_MATCH`

- **Check:** Same name, different country (homonyms).
- **How to read it:** Review: could be a sister company.
- **Example (synthetic):** 'Copo Ibérica S.A.' (Spain) vs supplier 'Copo Brasil Ltda.'.
- **Explain (EN):** The insured entity is registered in a different country than the supplier.
- **Fix to request:** Please confirm that the certificate covers {supplierLegalName}, {supplierCountry}.

### C10 — Entity named only in the cover letter, not on the certificate

**Severity** BLOCKING · **Outcome** `NO_GO_FORMAL` · **Rule ref** `ENTITY_MATCH`

- **Check:** Letter says 'for our client X'; certificate names Y.
- **How to read it:** Only the certificate counts.
- **Example (synthetic):** Letter: 'Bestätigung für Beyer Polyvlies GmbH & Co. KG'; certificate: 'Beyer Holding'.
- **Explain (EN):** The supplier is mentioned only in the cover letter; the certificate names a different entity.
- **Fix to request:** Please provide a certificate naming {supplierLegalName}.


## D. Guarantees — presence & mapping

### D01 — Product liability missing (certificate covers recall only)

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Is PRODUCT_LIABILITY (after delivery) stated?
- **How to read it:** German recall-only certificates (Kfz-Rückruf) are common: they evidence recall, not product liability. The main GPTC guarantee (≥ €20M) is absent → REQUEST_CHANGES (ask for the general/product liability certificate too).
- **Cues:** **EN** products liability, products/completed operations, product liability · **FR** RC produits, RC après livraison, responsabilité civile produits · **DE** Produkthaftpflicht, Produkthaftpflichtversicherung · **ES** RC productos, responsabilidad civil de productos · **IT** RC prodotti, responsabilità civile prodotti, RCP
- **Example (samples 02, 08):** Titles 'Rückrufkostenversicherung' / 'Kfz-Rückruf' only.
- **Explain (EN):** Product liability cover is not evidenced; the certificate only covers recall.
- **Fix to request:** Please provide the general & product liability certificate (≥ €20M per occurrence and in the aggregate).

### D02 — Product recall missing

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Is PRODUCT_RECALL or AUTOMOTIVE_RECALL stated?
- **How to read it:** Recall is the #1 automotive risk (Ferrari case: €5M paid by FORVIA). Missing → REQUEST_CHANGES.
- **Cues:** **EN** product recall, recall expenses, recall costs, withdrawal · **FR** frais de rappel, frais de retrait, rappel de produits · **DE** Rückrufkosten, Produktrückruf, Kfz-Rückruf, Rückrufkostenversicherung · **ES** retirada de productos, gastos de retirada, recall · **IT** richiamo prodotti, ritiro prodotti, spese di ritiro
- **Example (sample 07):** GL/PL combined €5M, no recall line.
- **Explain (EN):** Product recall cover is not evidenced.
- **Fix to request:** Please provide evidence of product recall cover (≥ €15M).

### D03 — 'Withdrawal costs' (frais de retrait) is not a full recall cover

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** FR wording: 'frais de retrait' vs 'frais de rappel'.
- **How to read it:** Withdrawal = removing the product from the market/stock; recall = locating, removing from vehicles, replacing. Map 'frais de retrait' to PRODUCT_RECALL with flag `scope=WITHDRAWAL_ONLY`; compare amount to recall threshold; explain the nuance.
- **Cues:** **FR** frais de retrait, retrait de produits · **EN** withdrawal costs, market withdrawal · **DE** Rücknahmekosten · **IT** ritiro dal mercato
- **Example (sample 04):** 'Frais de retrait : 305 000 €' under a €10M general limit.
- **Explain (EN):** Only withdrawal costs are covered; full recall costs (including removal from vehicles) are not evidenced.
- **Fix to request:** Please confirm product recall cover including costs of locating, removing and replacing defective parts.

### D04 — Pure financial loss (DINC) missing

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PURE_FINANCIAL_LOSS`

- **Check:** PURE_FINANCIAL_LOSS explicitly stated?
- **How to read it:** Loss with no prior material damage (line stop). GPTC ≥ €15M. Often absent or tiny in DE (Vermögensschäden 100k). Missing → REQUEST_CHANGES.
- **Cues:** **EN** pure financial loss, pure economic loss, financial loss not consequent upon · **FR** dommages immatériels non consécutifs, DINC, préjudice financier pur · **DE** reine Vermögensschäden, echte Vermögensschäden, Vermögensschäden · **ES** daños patrimoniales puros, perjuicios patrimoniales puros · **IT** danni patrimoniali puri, perdite pecuniarie pure
- **Example (sample 07):** No financial-loss line.
- **Explain (EN):** Pure financial loss cover is not evidenced.
- **Fix to request:** Please provide evidence of pure financial loss cover (≥ €15M).

### D05 — DIC vs DINC confusion (FR)

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PURE_FINANCIAL_LOSS`

- **Check:** 'Dommages immatériels consécutifs' (DIC) ≠ 'non consécutifs' (DINC).
- **How to read it:** DIC follows a covered material damage; DINC is standalone. Many FR certificates show DIC only. Do NOT map DIC to PURE_FINANCIAL_LOSS. 'Dommages immatériels' without qualifier → UNCLEAR, review.
- **Cues:** **FR** dommages immatériels consécutifs, DIC, dommages immatériels non consécutifs, DINC, dommages immatériels
- **Example (sample 01):** 'Dommages immatériels non consécutifs : 200 000 USD'; DIC not stated.
- **Explain (EN):** Only consequential immaterial damage (DIC) is covered; non-consequential (DINC) is not evidenced.
- **Fix to request:** Please confirm cover for non-consequential immaterial damage (dommages immatériels non consécutifs).

### D06 — German 'Vermögensschäden': which kind?

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PURE_FINANCIAL_LOSS`

- **Check:** 'Vermögensschäden' may mean pure financial loss or be a small sub-cover in Betriebshaftpflicht.
- **How to read it:** Map to PURE_FINANCIAL_LOSS; amounts are usually 100k–1M, far below €15M → BELOW_MINIMUM. Check 'echte/reine' qualifier; 'unechte Vermögensschäden' = consequential (DIC).
- **Cues:** **DE** Vermögensschäden, reine Vermögensschäden, echte Vermögensschäden, unechte Vermögensschäden
- **Example (synthetic):** 'Vermögensschäden: 250.000 EUR' in a Betriebshaftpflicht certificate.
- **Explain (EN):** Financial loss cover is limited to {amount}, below the €15M requirement.
- **Fix to request:** Please increase pure financial loss cover to ≥ €15M or provide the extended product liability schedule showing the applicable limit.

### D07 — Extended product liability (erweiterte Produkthaftpflicht) bundle

**Severity** MINOR · **Outcome** `SECONDARY` · **Rule ref** `EXTENDED_PRODUCT_LIABILITY`

- **Check:** German schedule listing: Verbindungs-/Vermischungs-/Verarbeitungsschäden, Weiterverarbeitung, Aus- und Einbaukosten, Prüf- und Sortierkosten, Maschinenklausel.
- **How to read it:** This bundle IS the automotive supplier cover. Map the bundle to EXTENDED_PRODUCT_LIABILITY and each listed item to its own code (DISMANTLING_REFITTING, etc.). Bundle limit may be a sub-limit of the main PL limit.
- **Cues:** **DE** erweiterte Produkthaftpflicht, Produkthaftpflicht-Modell, Verbindungs-, Vermischungs- und Verarbeitungsschäden, Weiterverarbeitungsschäden, Aus- und Einbaukosten, Prüf- und Sortierkosten, Maschinenklausel · **EN** extended product liability, mixing and blending, further processing, inspection and sorting costs
- **Example (sample 09 (Allianz / Beyer)):** Extended product liability €20M as part of the schedule.
- **Explain (EN):** Extended product liability is covered ({amount}).

### D08 — Dismantling & refitting / removal & reinstallation not stated

**Severity** MINOR · **Outcome** `SECONDARY` · **Rule ref** `DISMANTLING_REFITTING`

- **Check:** DISMANTLING_REFITTING present?
- **How to read it:** GPTC critical keyword. Cost of removing the defective part from vehicles. Secondary criterion (5 pts) — but if recall is present and dismantling absent, explain.
- **Cues:** **EN** dismantling, removal and reinstallation, removal and replacement, refitting · **FR** frais de dépose et repose, dépose-repose, démontage et remontage · **DE** Aus- und Einbaukosten, Ein- und Ausbaukosten · **ES** desmontaje y montaje, costes de retirada e instalación · **IT** smontaggio e rimontaggio, costi di rimozione e reinstallazione
- **Explain (EN):** Dismantling and refitting costs are not evidenced.
- **Fix to request:** Please confirm whether dismantling/refitting (removal and reinstallation) costs are covered.

### D09 — Assembly / disassembly wording

**Severity** INFO · **Outcome** `SECONDARY` · **Rule ref** `ASSEMBLY_DISASSEMBLY`

- **Check:** GPTC keyword close to D08.
- **How to read it:** Treat as synonym group of DISMANTLING_REFITTING; report separately if labelled separately.
- **Cues:** **EN** assembly and disassembly, assembly/disassembly · **FR** montage et démontage · **DE** Montage und Demontage
- **Explain (EN):** Assembly/disassembly costs are covered.

### D10 — 'Covered' / 'included' without an amount

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** A guarantee marked as covered but no limit stated.
- **How to read it:** Cannot compare to threshold → COVERED_NO_AMOUNT. For critical guarantees → REQUEST_CHANGES (state the limit). Frequently the cover is 'included in the general limit' — if explicit, inherit (E07).
- **Cues:** **EN** covered, included, insured, yes · **FR** couvert, inclus, acquis, oui · **DE** mitversichert, eingeschlossen, ja · **ES** cubierto, incluido, sí · **IT** compreso, incluso, sì
- **Example (sample 01):** 'Product recall: Covered' without amount.
- **Explain (EN):** {guarantee} is marked as covered but no limit is stated.
- **Fix to request:** Please state the limit of indemnity applicable to {guarantee}.

### D11 — 'Available on request' / optional cover not taken

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Menu-style certificates listing optional extensions.
- **How to read it:** 'On request', 'optional', 'can be added', 'not selected' = NOT covered.
- **Cues:** **EN** on request, optional, not insured, not selected, available · **FR** sur demande, option non souscrite, en option · **DE** optional, nicht versichert, auf Anfrage, nicht vereinbart · **ES** opcional, no contratado · **IT** opzionale, non operante, non prestata
- **Example (synthetic):** 'Garantie rappel de produits : non souscrite'.
- **Explain (EN):** {guarantee} is listed as optional and has not been taken out.
- **Fix to request:** Please subscribe the {guarantee} extension and provide an updated certificate.

### D12 — Combined single limit (GL + PL, sometimes + PFL)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `COMBINED_GL_PL`

- **Check:** One limit for several guarantees.
- **How to read it:** Map to COMBINED_GL_PL; allocate to PRODUCT_LIABILITY per profile `cslAllocation` (default FULL; Q13 open). Display 'inherited from CSL' badge.
- **Cues:** **EN** combined single limit, public and products liability, any one occurrence · **FR** tous dommages confondus, RC exploitation et produits · **DE** Betriebs- und Produkthaftpflicht, pauschal, Personen-, Sach- und Vermögensschäden pauschal · **ES** límite único combinado, RC explotación y productos · **IT** massimale unico, RCT/RCO
- **Example (samples 01, 03, 07, 09):** Single figure for general + product liability.
- **Explain (EN):** Product liability is inherited from a combined general & product liability limit of {amount}.

### D13 — Automotive recall (Kfz-Rückruf) vs generic recall

**Severity** INFO · **Outcome** `OK` · **Rule ref** `AUTOMOTIVE_RECALL`

- **Check:** German specialty cover for recall of vehicles by OEM/authority.
- **How to read it:** AUTOMOTIVE_RECALL counts toward PRODUCT_RECALL (max of both). Usually better suited than generic recall. Check whether it covers 'Eigenrückruf' (own) and 'Fremdrückruf' (third-party recall costs).
- **Cues:** **DE** Kfz-Rückrufkosten, Kfz-Rückruf, Rückruf von Kraftfahrzeugen, Eigenrückruf, Fremdrückruf, Drittrückruf · **EN** automotive recall, vehicle recall, recall liability for automotive component suppliers
- **Example (sample 08 (Allianz AGCS / CeramTec)):** 'Kfz-Rückruf 5 Mio. EUR'.
- **Explain (EN):** Automotive recall liability of {amount} counts toward the recall requirement.

### D14 — Recall: own costs vs third-party costs

**Severity** MAJOR · **Outcome** `REVIEW` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Does the recall cover pay the insured's own recall (first party) and/or recall costs claimed by customers (third party)?
- **How to read it:** For FORVIA (the customer) the third-party/liability side matters. Many 'recall expenses' products are first-party only. Flag `recallScope`.
- **Cues:** **EN** first party recall, own recall costs, third party recall, recall liability · **DE** Eigenrückruf, Fremdrückruf, Rückrufkosten-Haftpflicht · **FR** frais de rappel engagés par les tiers, rappel propre
- **Example (synthetic):** 'Product Recall Expense – first party only'.
- **Explain (EN):** The recall cover appears to be first-party only; recall costs claimed by customers may not be covered.
- **Fix to request:** Please confirm that recall costs incurred by your customers (third-party recall liability) are covered.

### D15 — Inspection & sorting costs (Prüf- und Sortierkosten)

**Severity** INFO · **Outcome** `SECONDARY` · **Rule ref** `EXTENDED_PRODUCT_LIABILITY`

- **Check:** Costs of checking/sorting suspected batches.
- **How to read it:** Part of extended product liability; frequent claim in automotive. INFO/secondary.
- **Cues:** **DE** Prüf- und Sortierkosten · **EN** inspection and sorting costs, testing costs · **FR** frais de tri et de contrôle · **IT** costi di selezione e controllo
- **Explain (EN):** Inspection and sorting costs are covered ({amount}).

### D16 — Professional indemnity / E&O confused with product liability

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** 'RC professionnelle' in FR is often used loosely for general liability; E&O ≠ PL.
- **How to read it:** Map by content, not label. If the certificate only evidences PI/E&O → product liability missing.
- **Cues:** **EN** professional indemnity, errors and omissions, E&O · **FR** RC professionnelle, responsabilité civile professionnelle · **DE** Berufshaftpflicht, Vermögensschadenhaftpflicht · **ES** RC profesional · **IT** RC professionale
- **Example (sample 04):** Titled 'Attestation RC professionnelle' but content is general liability + products.
- **Explain (EN):** The certificate evidences professional indemnity, not product liability.
- **Fix to request:** Please provide the product liability certificate.

### D17 — Employer's liability, motor, environmental lines listed — irrelevant to the request

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `OTHER`

- **Check:** Extra lines on a multi-line certificate.
- **How to read it:** Keep as OTHER/INFO. Do not let them inflate scores. Pollution is secondary (not scored in POC).
- **Example (sample 05):** Long list: tenants liability, valet parking, terrorism…
- **Explain (EN):** Additional lines of cover noted (no impact).

### D18 — Goods in custody / tooling (biens confiés)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `GOODS_IN_CUSTODY`

- **Check:** FORVIA-owned tooling at the supplier's site.
- **How to read it:** Nice to have. INFO.
- **Cues:** **EN** care custody and control, goods in custody, property in the insured's care · **FR** biens confiés · **DE** Obhutsschäden, Bearbeitungsschäden · **ES** bienes confiados · **IT** cose in consegna e custodia
- **Explain (EN):** Goods in care, custody and control are covered ({amount}).

### D19 — Product guarantee / efficacy (performance) cover

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `OTHER`

- **Check:** Product does not perform (no damage).
- **How to read it:** Rare; not required. INFO. Do not confuse with PFL.
- **Cues:** **EN** product guarantee, efficacy, failure to perform · **DE** Produktgarantie, Erfüllungsschaden
- **Explain (EN):** Product efficacy cover noted.

### D20 — Serial loss clause

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Several claims from the same cause treated as one occurrence.
- **How to read it:** Matters for recall/PL: a serial defect counts as one claim (one limit, one deductible). INFO; show to expert.
- **Cues:** **EN** serial loss, series of losses, batch clause · **FR** sinistre sériel, dommages sériels · **DE** Serienschaden, Serienschadenklausel · **IT** sinistro in serie
- **Explain (EN):** Serial loss clause present: related claims are aggregated as one occurrence.

### D21 — USA / Canada extension explicitly included

**Severity** INFO · **Outcome** `SECONDARY` · **Rule ref** `TERRITORY_USA_CANADA`

- **Check:** Territorial extension for North America with its own limit.
- **How to read it:** Positive (secondary criterion TERRITORY_USA_CANADA). If the USA/Canada limit is lower than the main limit, display both (E19).
- **Cues:** **EN** including USA/Canada, worldwide including USA and Canada, North America · **FR** y compris USA/Canada, monde entier y compris · **DE** einschließlich USA/Kanada, weltweit inklusive USA/Kanada, USA-Deckung · **ES** incluido EE.UU. y Canadá · **IT** inclusi USA e Canada
- **Example (sample 09):** USA/Canada included in the German schedule.
- **Explain (EN):** Cover extends to USA/Canada ({amount}).


## E. Amounts, basis & sub-limits

### E01 — Headline limit high, recall/withdrawal sub-limit tiny

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Compare each sub-limit to its own threshold, never to the headline.
- **How to read it:** THE trap (Richard). €10M general, €305k withdrawal → recall compliance = BELOW_MINIMUM at €305k. Gap bar must show 305k vs 15M.
- **Cues:** **EN** sublimit, sub-limit, limited to, up to · **FR** sous-limite, dans la limite de, à concurrence de · **DE** Sublimit, begrenzt auf, maximal · **ES** sublímite, hasta · **IT** sottolimite, fino a, con il limite di
- **Example (sample 04):** 'Tous dommages confondus 10 000 000 € … dont frais de retrait 305 000 €'.
- **Explain (EN):** Recall/withdrawal is sub-limited to {amount}, far below the €15M requirement, despite a {headline} general limit.
- **Fix to request:** Please increase the recall sub-limit to ≥ €15M.

### E02 — Recall sub-limit inside a combined single limit

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** CSL with internal sub-limit.
- **How to read it:** Sample 03: CHF 20M CSL, recall sub-limited to CHF 5M. Recall = 5M, not 20M.
- **Example (sample 03 (Swiss Mobiliar / Ekko-Meister)):** CHF 20M CSL; 'Rückrufkosten CHF 5'000'000'.
- **Explain (EN):** Recall is sub-limited to {amount} within the {headline} combined limit.
- **Fix to request:** Please increase the recall sub-limit to ≥ €15M.

### E03 — Per occurrence vs annual aggregate — which figure to compare

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AGGREGATE_BASIS`

- **Check:** Basis of each amount.
- **How to read it:** Profile `amountBasis` (default: prefer annual aggregate when both exist, Q12). If only per-occurrence is stated → use it and flag `basis=PER_OCCURRENCE_ONLY` (secondary AGGREGATE_BASIS not earned).
- **Cues:** **EN** per occurrence, any one occurrence, any one claim, each and every loss, in the aggregate, annual aggregate, per policy year · **FR** par sinistre, par année d'assurance, par an · **DE** je Versicherungsfall, je Schadenereignis, je Versicherungsjahr, Jahreshöchstentschädigung, Jahresmaximierung, -fach maximiert · **ES** por siniestro, por anualidad, agregado anual · **IT** per sinistro, per anno, e.e.l., a.a., in aggregato annuo
- **Explain (EN):** Limits are stated per occurrence only; no annual aggregate is evidenced.
- **Fix to request:** Please state the annual aggregate limit.

### E04 — '5,000,000 / 10,000,000' = per claim / aggregate

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AGGREGATE_BASIS`

- **Check:** Two figures separated by a slash or 'and'.
- **How to read it:** First = per claim, second = annual aggregate (DE/FR convention). Do not read as a range.
- **Example (sample 09):** '5.000.000 / 10.000.000 EUR'.
- **Explain (EN):** Limit {perClaim} per claim / {aggregate} per year.

### E05 — German 'x-fach maximiert' (maximisation multiplier)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AGGREGATE_BASIS`

- **Check:** '2-fach maximiert' = annual aggregate is twice the per-claim limit.
- **How to read it:** Compute aggregate = multiplier × per-claim. Record the multiplier.
- **Cues:** **DE** 2-fach maximiert, zweifach maximiert, Maximierung, Jahreshöchstleistung
- **Example (synthetic):** 'Deckungssumme 10 Mio. EUR je Versicherungsfall, 2-fach maximiert'.
- **Explain (EN):** Annual aggregate = {multiplier} × per-claim limit.

### E06 — Limit 'inclusive of defence costs' / 'costs inclusive'

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Whether defence costs erode the limit.
- **How to read it:** Common in US/UK/IN forms. Weaker than 'in addition'. INFO; expert may care.
- **Cues:** **EN** costs inclusive, inclusive of defence costs, defense costs within limits · **FR** frais de défense inclus · **DE** einschließlich Kosten · **IT** spese di resistenza comprese
- **Explain (EN):** Defence costs are included within the limit.

### E07 — 'Included in the general limit' — inherit or not?

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Guarantee explicitly stated as included within the main limit, no own figure.
- **How to read it:** If the wording explicitly says 'within the above limit', inherit the main limit with flag INHERITED. If it just says 'covered', do not inherit (D10).
- **Cues:** **EN** within the above limit, included in the limit of indemnity, part of · **FR** inclus dans le plafond, compris dans la garantie · **DE** im Rahmen der Deckungssumme, innerhalb der Deckungssumme · **ES** dentro del límite · **IT** nell'ambito del massimale
- **Explain (EN):** {guarantee} is included within the {headline} limit (inherited).

### E08 — Very high deductible / self-insured retention

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `DEDUCTIBLE`

- **Check:** Deductible vs limit.
- **How to read it:** Q15 open: no points in POC. Report; flag if deductible ≥ 5 % of limit or ≥ €500k. SIR means the insured pays first.
- **Cues:** **EN** deductible, excess, self-insured retention, SIR, retention · **FR** franchise · **DE** Selbstbehalt, Selbstbeteiligung, SB · **ES** franquicia · **IT** franchigia, scoperto
- **Example (sample 01):** 'claims paid in excess of the SIR'.
- **Explain (EN):** Deductible of {amount} per claim ({pct} of the limit).

### E09 — Deductible expressed as a percentage ('scoperto')

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `DEDUCTIBLE`

- **Check:** Italian 'scoperto 10 % con il minimo di…'.
- **How to read it:** Record pct + minimum + maximum. INFO.
- **Cues:** **IT** scoperto, con il minimo di, con il massimo di · **ES** franquicia del, % del siniestro
- **Explain (EN):** Deductible: {pct} of each loss, minimum {min}.

### E10 — Foreign currency — convert at ECB rate of the reference date

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `FX`

- **Check:** USD, CHF, GBP, INR, PLN, CZK, HUF, RON, TRY, BRL, MXN, CNY, JPY, KRW…
- **How to read it:** Convert once, persist rate + date (Q28-29). Show original and EUR. Near-threshold results within ±3 % → REVIEW (FX drift).
- **Example (sample 01):** USD 5,000,000 → ≈ €4.6M (April 2025).
- **Explain (EN):** {amountOriginal} converted to {amountEur} at ECB rate {rate} on {date}.

### E11 — Indian lakh / crore notation

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `FX`

- **Check:** 'Rs. 100 Cr', '1,00,00,00,000', 'INR 10 Lakhs'.
- **How to read it:** 1 lakh = 100,000; 1 crore = 10,000,000. Indian digit grouping (2-2-3). Parse before converting.
- **Cues:** **EN** crore, Cr, lakh, lac, Rs., INR
- **Example (sample 05):** 'INR 1,00,00,00,000' = INR 1 billion.
- **Explain (EN):** Amount stated in crore/lakh notation ({amountOriginal}).

### E12 — European vs Anglo-Saxon thousand/decimal separators

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AMOUNT_PARSING`

- **Check:** '1.000.000,00' vs '1,000,000.00'; Swiss '1'000'000'; French '1 000 000'.
- **How to read it:** Parse per locale of the document, never by global regex. Sanity check: PL limits < 10,000 are almost certainly mis-parsed.
- **Example (samples 03, 09):** CHF 20'000'000 ; 5.000.000 EUR.

### E13 — Abbreviations: Mio., M€, k€, Mn, MM, bn, Md

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AMOUNT_PARSING`

- **Check:** Scale words and symbols.
- **How to read it:** Mio./M/Mn/MM = 10^6; k/T (DE 'TEUR') = 10^3; bn/Md/Mrd = 10^9. Currency may precede or follow.
- **Cues:** **DE** Mio., TEUR, Mrd. · **FR** M€, k€, Md€ · **EN** Mn, MM, bn · **IT** Mln, Mld · **ES** MM, millones
- **Example (sample 08):** '5 Mio. EUR'.

### E14 — Amount written in words differs from figures

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `AMOUNT_PARSING`

- **Check:** 'Five million' vs '5.000.000' vs '500.000'.
- **How to read it:** Words prevail legally; flag mismatch → review.
- **Example (synthetic):** 'EUR 5.000.000 (cinq cent mille euros)'.
- **Explain (EN):** The amount in words ({words}) differs from the figure ({figure}).
- **Fix to request:** Please confirm the correct limit.

### E15 — Per-guarantee sub-limit table with 'per claim / per year' columns

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AMOUNT_PARSING`

- **Check:** Tabular certificates (IT, ES).
- **How to read it:** Extract row × column faithfully; keep basis per cell.
- **Example (sample 10):** Italian table 'per sinistro / per anno'.

### E16 — Capacity share applied to limits

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `COINSURANCE_COMPLETE`

- **Check:** Co-insurer's % share.
- **How to read it:** Effective limit carried by the signing insurer = share × limit; but FORVIA needs 100 % evidenced (B11). Do not silently scale the limit: show both.
- **Example (sample 05):** 20 % of INR 1bn.
- **Explain (EN):** Only {share} of the {limit} limit is carried by the signing insurer.
- **Fix to request:** Please provide evidence for the full limit from all co-insurers.

### E17 — Limit shared across several guarantees and insureds (aggregate erosion)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `AGGREGATE_BASIS`

- **Check:** One aggregate for GL + PL + recall + 16 companies.
- **How to read it:** Compliant on paper, weaker in practice. INFO with explicit statement.
- **Example:** sample 07
- **Explain (EN):** A single annual aggregate is shared across guarantees and insured companies.

### E18 — Sub-limit for USA/Canada lower than main limit

**Severity** INFO · **Outcome** `SECONDARY` · **Rule ref** `TERRITORY_USA_CANADA`

- **Check:** Separate reduced limit for North America.
- **How to read it:** Record both; USA/Canada secondary criterion earned only if ≥ profile `usaCanadaMin` (default: presence).
- **Cues:** **EN** USA/Canada sublimit, North America limit · **DE** USA/Kanada Sublimit · **FR** sous-limite USA/Canada
- **Example (synthetic):** 'Worldwide €20M; USA/Canada €5M'.
- **Explain (EN):** USA/Canada cover is limited to {amount} (main limit {headline}).

### E19 — Primary + excess / umbrella layers

**Severity** INFO · **Outcome** `REVIEW` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Two documents or two lines: primary €5M + excess €15M.
- **How to read it:** Sum only if the excess certificate names the same insured, the same underlying policy and period. Otherwise treat separately.
- **Cues:** **EN** excess of, umbrella, excess layer, in excess of primary · **FR** en excédent de, ligne excédentaire · **DE** Exzedent, Excedenten, Umbrella · **ES** en exceso de · **IT** in eccesso a, secondo rischio
- **Example (synthetic):** 'Excess Liability €15,000,000 xs €5,000,000 primary (Policy 123)'.
- **Explain (EN):** Primary {primary} plus excess layer {excess} = {total} (tower evidenced).
- **Fix to request:** Please provide the excess/umbrella certificate referencing the primary policy.

### E20 — Amount threshold exactly at the limit after FX rounding

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `FX`

- **Check:** €19.97M after conversion vs €20M threshold.
- **How to read it:** Binary rule says BELOW_MINIMUM; route to REVIEW when within ±3 % of threshold and the original currency ≠ EUR.
- **Example (synthetic):** USD 22,000,000 → €19,850,000.
- **Explain (EN):** The converted amount ({amountEur}) is within 3 % of the threshold due to exchange rate.

### E21 — Unlimited / 'no limit' / 'illimité' statements

**Severity** INFO · **Outcome** `OK` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Some jurisdictions (e.g. motor) state unlimited; rare in PL.
- **How to read it:** Treat as COMPLIANT with flag UNLIMITED; verify not a parsing error.
- **Cues:** **EN** unlimited, no limit · **FR** illimité, sans limitation de somme · **DE** unbegrenzt · **ES** ilimitado · **IT** illimitato
- **Explain (EN):** Limit stated as unlimited.

### E22 — Limit expressed per person / per property (BI/PD split)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Separate limits for bodily injury and property damage.
- **How to read it:** Product liability for FORVIA is mainly PD + financial. Use the PD figure (or combined if stated); record the split.
- **Cues:** **EN** bodily injury, property damage, BI/PD · **FR** dommages corporels, dommages matériels · **DE** Personenschäden, Sachschäden · **ES** daños personales, daños materiales · **IT** danni a persone, danni a cose
- **Example (sample 04):** Separate lines for corporels / matériels / immatériels.
- **Explain (EN):** Limits are split: bodily injury {bi}, property damage {pd}.

### E23 — Recall limit stated per 'campaign' or per 'recall event'

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Non-standard basis.
- **How to read it:** Map as per occurrence; note basis.
- **Cues:** **EN** per recall, per campaign · **DE** je Rückrufaktion · **FR** par campagne de rappel
- **Explain (EN):** Recall limit is per recall campaign.

### E24 — Small 'typical' sub-limits that are NOT critical

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `OTHER`

- **Check:** Pollution €500k–1M, goods in custody, keys, tenants' liability.
- **How to read it:** Do not let many small sub-limits trigger alarms. Only the three critical guarantees are thresholded.
- **Example (sample 04):** 'Atteintes à l'environnement 500 000 €' (Richard: 'a bit low' but secondary).

### E25 — Limit conditional on a clause ('subject to', 'provided that')

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Conditions attached to the figure.
- **How to read it:** Extract the condition verbatim; route to review.
- **Cues:** **EN** subject to, provided that, conditional upon · **FR** sous réserve, à condition que · **DE** vorbehaltlich, unter der Voraussetzung · **IT** a condizione che
- **Explain (EN):** The limit is conditional: "{condition}".
- **Fix to request:** Please clarify the condition attached to the limit.


## F. Exclusions, trigger & territory

### F01 — USA / Canada excluded

**Severity** MAJOR · **Outcome** `PENALTY` · **Rule ref** `TERRITORY_USA_CANADA`

- **Check:** Territorial scope excludes North America.
- **How to read it:** Red flag for an automotive supplier (exports, OEM plants in US/MX). Critical exclusion → −10 points; expert may escalate. Not blocking under GPTC default (Q16 open).
- **Cues:** **EN** excluding USA/Canada, excluding North America, worldwide excluding, except USA · **FR** hors USA/Canada, à l'exclusion des USA, monde entier sauf · **DE** ohne USA/Kanada, ausgenommen USA/Kanada, weltweit ohne · **ES** excepto EE.UU. y Canadá · **IT** esclusi USA e Canada, mondo intero esclusi
- **Example (sample 04):** 'Monde entier hors USA/Canada'.
- **Explain (EN):** Cover excludes claims in USA/Canada.
- **Fix to request:** Please confirm whether USA/Canada cover can be added (extension and limit).

### F02 — Territory limited to Europe / home country

**Severity** MAJOR · **Outcome** `PENALTY` · **Rule ref** `TERRITORY_USA_CANADA`

- **Check:** 'Europe only', 'territoire national', 'Deutschland'.
- **How to read it:** Same family as F01, more severe in practice. Penalty; show scope.
- **Cues:** **EN** Europe only, EU/EEA, territory of · **FR** France métropolitaine, Union européenne, territoire national · **DE** Europa, Deutschland, örtlicher Geltungsbereich: Europa · **ES** territorio español, Unión Europea · **IT** Italia, Unione Europea
- **Explain (EN):** Territorial scope is limited to {territory}.
- **Fix to request:** Please confirm worldwide cover (FORVIA plants and customers worldwide).

### F03 — Claims-made trigger

**Severity** MINOR · **Outcome** `PENALTY` · **Rule ref** `TRIGGER`

- **Check:** Occurrence vs claims-made.
- **How to read it:** Claims-made is weaker for a buyer (cover ends when the policy ends, unless run-off). −5 points; show retroactive date (F04).
- **Cues:** **EN** claims made, claims-made, claims first made, reported during the policy period · **FR** base réclamation, réclamation · **DE** Claims-made, Anspruchserhebung · **ES** claims made, base reclamación · **IT** claims made, in base alla richiesta di risarcimento
- **Example (sample 05):** 'Claims made basis'.
- **Explain (EN):** Policy is written on a claims-made basis.
- **Fix to request:** Please confirm the retroactive date and any extended reporting period.

### F04 — Retroactive date / extended reporting period

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `TRIGGER`

- **Check:** Dates attached to claims-made.
- **How to read it:** Retroactive date after the start of supply = gap. Review when retroactive date > FORVIA relationship start.
- **Cues:** **EN** retroactive date, extended reporting period, ERP, tail · **FR** date de reprise du passé, garantie subséquente · **DE** Rückwärtsversicherung, Nachhaftung, Nachmeldefrist · **IT** retroattività, postuma · **ES** retroactividad, periodo adicional de notificación
- **Explain (EN):** Retroactive date {date}; extended reporting period {erp}.

### F05 — Exclusion of automotive safety-critical components

**Severity** MAJOR · **Outcome** `PENALTY` · **Rule ref** `CRITICAL_EXCLUSION`

- **Check:** Brakes, steering, airbags, seatbelts, tyres, fuel systems excluded.
- **How to read it:** Fatal for a Tier-2 automotive supplier: the parts FORVIA buys may be exactly those. Critical exclusion → −10; expert: block. Flag `criticalExclusion=AUTOMOTIVE_PARTS`.
- **Cues:** **EN** brakes, steering, airbags, seat belts, tyres, safety critical, critical automobile parts, automotive parts exclusion · **FR** pièces de sécurité, freinage, direction · **DE** sicherheitsrelevante Teile, Bremsen, Lenkung, Airbags
- **Example (sample 05):** 'Excluding: automobile critical parts – steering, brakes, tyres, seat belts, airbags…'
- **Explain (EN):** The policy excludes safety-critical automotive components ({list}).
- **Fix to request:** Please confirm that the parts supplied to FORVIA are not within the excluded categories, or obtain removal of the exclusion.

### F06 — Exclusion of products for the automotive / aerospace industry

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_LIABILITY`

- **Check:** Industry-wide exclusion.
- **How to read it:** If automotive is excluded, the certificate is useless for FORVIA — treat as product liability MISSING. Aerospace exclusion is INFO.
- **Cues:** **EN** automotive industry excluded, aviation, aerospace, aircraft products · **FR** industrie automobile exclue, aéronautique · **DE** Kfz-Industrie ausgeschlossen, Luftfahrt · **IT** settore automotive escluso, aeronautico
- **Explain (EN):** Products supplied to the automotive industry are excluded.
- **Fix to request:** Please provide cover that includes products supplied to the automotive industry.

### F07 — Pure financial loss explicitly excluded

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PURE_FINANCIAL_LOSS`

- **Check:** Exclusion clause for financial loss.
- **How to read it:** Contradicts any PFL line → PFL = EXCLUDED (worse than missing).
- **Cues:** **EN** excluding pure financial loss, financial loss excluded · **FR** dommages immatériels non consécutifs exclus, exclusion des pertes financières · **DE** Vermögensschäden ausgeschlossen, ohne Vermögensschäden · **IT** esclusi i danni patrimoniali puri
- **Explain (EN):** Pure financial loss is expressly excluded.
- **Fix to request:** Please obtain an endorsement covering pure financial loss (≥ €15M).

### F08 — Recall excluded

**Severity** MAJOR · **Outcome** `REQUEST_CHANGES` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Exclusion clause for recall/withdrawal.
- **How to read it:** PRODUCT_RECALL = EXCLUDED.
- **Cues:** **EN** recall excluded, excluding recall expenses · **FR** frais de rappel exclus · **DE** Rückrufkosten ausgeschlossen, ohne Rückruf · **IT** esclusi i costi di ritiro · **ES** excluidos gastos de retirada
- **Explain (EN):** Recall costs are expressly excluded.
- **Fix to request:** Please obtain recall cover (≥ €15M).

### F09 — Contractual liability exclusion

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** 'Liability assumed under contract' excluded.
- **How to read it:** Standard in most wordings (liability beyond law). Not critical per se, but FORVIA GPTC are contractual obligations. INFO; expert review if broad.
- **Cues:** **EN** contractual liability, liability assumed under contract · **FR** responsabilité contractuelle au-delà, engagements contractuels · **DE** vertragliche Haftung über die gesetzliche hinaus · **IT** responsabilità contrattuale
- **Explain (EN):** Standard contractual liability exclusion noted.

### F10 — Product efficacy / failure-to-perform exclusion

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** Product does not do what it should, without damage.
- **How to read it:** Standard; the gap is covered by PFL in part. INFO.
- **Cues:** **EN** efficacy, failure to perform, fitness for purpose · **DE** Erfüllungsansprüche, Nachbesserung · **FR** défaut de performance, inexécution
- **Explain (EN):** Efficacy exclusion noted (standard).

### F11 — Known circumstances / prior claims exclusion

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** Standard clause.
- **How to read it:** INFO.
- **Cues:** **EN** known circumstances, prior claims · **FR** sinistres connus · **DE** bekannte Umstände
- **Explain (EN):** Known circumstances exclusion noted (standard).

### F12 — Sanctions, war, terrorism, nuclear, asbestos exclusions

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** Market-standard exclusions.
- **How to read it:** Never penalise. INFO only. Do not list them in the supplier email.
- **Cues:** **EN** sanctions, war, terrorism, nuclear, asbestos, radioactive · **FR** sanctions, guerre, terrorisme, nucléaire, amiante · **DE** Sanktionsklausel, Krieg, Terror, Kernenergie, Asbest · **ES** sanciones, guerra, terrorismo, nuclear, amianto · **IT** sanzioni, guerra, terrorismo, nucleare, amianto
- **Explain (EN):** Market-standard exclusions noted.

### F13 — Cyber / data exclusion

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** Cyber exclusion on liability policies (LMA5400 style).
- **How to read it:** INFO for parts; relevant if the supplier delivers software/ECUs — flag `softwareSupplier` in Ariba data if available.
- **Cues:** **EN** cyber, data, electronic data, software · **DE** Cyber, Daten · **FR** cyber, données
- **Explain (EN):** Cyber exclusion noted.

### F14 — Punitive / exemplary damages excluded

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** US-style damages.
- **How to read it:** Common, low impact. INFO.
- **Cues:** **EN** punitive, exemplary damages · **FR** dommages punitifs · **DE** Strafschadenersatz, punitive damages
- **Explain (EN):** Punitive damages exclusion noted.

### F15 — Exclusion of recall ordered by authority vs voluntary

**Severity** MAJOR · **Outcome** `REVIEW` · **Rule ref** `PRODUCT_RECALL`

- **Check:** Scope of recall trigger.
- **How to read it:** If only authority-ordered recalls are covered, OEM-initiated recalls (the common case) are not. Review.
- **Cues:** **EN** ordered by a government authority, mandatory recall only, voluntary recall · **DE** behördlich angeordnet, freiwilliger Rückruf · **FR** rappel ordonné par une autorité, rappel volontaire
- **Explain (EN):** Recall cover applies only to recalls ordered by an authority.
- **Fix to request:** Please confirm that customer-initiated (voluntary) recalls are covered.

### F16 — Exclusion of pure financial loss from 'loss of use'

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `PURE_FINANCIAL_LOSS`

- **Check:** US forms: 'loss of use of tangible property not physically injured' sub-clause.
- **How to read it:** Partial PFL via 'loss of use' exception; never count it as €15M PFL. UNCLEAR → review.
- **Cues:** **EN** loss of use, impaired property
- **Explain (EN):** Only limited 'loss of use' cover is evidenced; it does not equate to pure financial loss cover.
- **Fix to request:** Please confirm explicit pure financial loss cover.

### F17 — Exclusion of damage to the insured's own product / work

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `EXCLUSION`

- **Check:** 'Damage to your product', 'Eigenschaden'.
- **How to read it:** Standard; recall/dismantling covers the gap partly. INFO.
- **Cues:** **EN** damage to your product, your work · **DE** Eigenschäden, Schäden am eigenen Produkt · **FR** dommages au produit livré lui-même
- **Explain (EN):** Own-product damage exclusion noted (standard).

### F18 — Jurisdiction clause (courts) vs territory

**Severity** MAJOR · **Outcome** `PENALTY` · **Rule ref** `TERRITORY_USA_CANADA`

- **Check:** Where claims may be brought vs where damage occurs.
- **How to read it:** Distinguish 'territorial scope' (damage location) from 'jurisdiction' (court). A 'worldwide except US courts' clause is a USA exclusion in disguise.
- **Cues:** **EN** jurisdiction, courts of, judgments rendered in · **FR** juridiction, tribunaux · **DE** Gerichtsstand, Ansprüche vor Gerichten · **IT** giurisdizione
- **Explain (EN):** Claims brought before USA/Canada courts are excluded (jurisdiction clause).
- **Fix to request:** Please confirm whether USA/Canada jurisdiction can be included.


## G. Period & timing

### G01 — Certificate expired at reference date

**Severity** BLOCKING · **Outcome** `NO_GO_STRUCTURAL` · **Rule ref** `NOT_EXPIRED`

- **Check:** period.to < referenceDate.
- **How to read it:** Structural block. Demo clock = 2025-04-15 (samples are 2024-25 certificates).
- **Example (synthetic):** Period 01/01/2024 – 31/12/2024, received 15/04/2025.
- **Explain (EN):** The certificate expired on {dateTo}.
- **Fix to request:** Please provide the current certificate.

### G02 — Expires within the renewal window (e.g. < 60 days)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `NOT_EXPIRED`

- **Check:** period.to − referenceDate < profile `renewalWindowDays`.
- **How to read it:** Not a defect, but schedule a reminder / request renewal now. INFO + task.
- **Example (sample 03):** Swiss certificate with end-of-year expiry.
- **Explain (EN):** The certificate expires in {days} days.
- **Fix to request:** Please send the renewed certificate as soon as available.

### G03 — Period starts in the future

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `DATES_PRESENT`

- **Check:** period.from > referenceDate.
- **How to read it:** Cover not yet in force today (renewal certificate sent early). Accept if gap ≤ 30 days and a current certificate exists; else review.
- **Example (synthetic):** Received 20 Nov 2025, period 01/01/2026 – 31/12/2026.
- **Explain (EN):** The cover starts on {dateFrom}, after the reference date.
- **Fix to request:** Please also provide the certificate for the current period.

### G04 — Period shorter than 12 months / short-term policy

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `DATES_PRESENT`

- **Check:** Duration.
- **How to read it:** Unusual; may indicate a project policy. INFO.
- **Explain (EN):** Policy period is {months} months.

### G05 — Only 'valid until further notice' / tacit renewal, no end date

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `DATES_PRESENT`

- **Check:** Open-ended statements.
- **How to read it:** DE/FR: 'verlängert sich stillschweigend'. Need a validity date for the certificate itself. If the certificate states its own validity (e.g. 'valid until 31/12/2025') use it; otherwise DATES_PRESENT → review.
- **Cues:** **EN** until further notice, tacitly renewed, automatically renewed · **FR** tacite reconduction, jusqu'à dénonciation · **DE** verlängert sich stillschweigend, bis auf Weiteres · **ES** prórroga tácita · **IT** tacito rinnovo
- **Example (sample 02):** German tacit-renewal wording alongside the period.
- **Explain (EN):** No end date is stated; the certificate refers to tacit renewal.
- **Fix to request:** Please state the current insurance period (from / to).

### G06 — Issue date much older than the period / stale certificate

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `DATES_PRESENT`

- **Check:** issueDate < referenceDate − 12 months.
- **How to read it:** Even if the period is still open, an old certificate may not reflect mid-term changes. INFO; expert option to require ≤ 12-month-old certificates.
- **Explain (EN):** Certificate issued {months} months ago.

### G07 — Issue date after the start of the period (normal) vs before (check)

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `DATES_PRESENT`

- **Check:** Consistency of issue date.
- **How to read it:** Issuing after inception is normal. Issued before the policy even existed → review.
- **Explain (EN):** The issue date precedes the policy inception by {days} days.

### G08 — Date format ambiguity (DD/MM vs MM/DD)

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `DATES_PRESENT`

- **Check:** '04/08/2025'.
- **How to read it:** Resolve by document locale/language; if both readings are plausible and change the expiry verdict → review.
- **Example (sample 05):** Indian document with US-style dates.
- **Explain (EN):** The date format is ambiguous.

### G09 — Cancellation clause ('may be cancelled at any time')

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `—`

- **Check:** Standard notice clause.
- **How to read it:** Normal. INFO. Some certificates promise notice to the certificate holder — positive.
- **Cues:** **EN** cancelled, notice of cancellation, 30 days notice · **FR** résiliation, préavis · **DE** Kündigung, Kündigungsfrist
- **Explain (EN):** Cancellation notice clause noted.


## H. Consistency & data quality

### H01 — Bilingual certificate: figures differ between languages

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `AMOUNT_PARSING`

- **Check:** FR/EN or DE/EN columns.
- **How to read it:** Extract both; if they differ → review; the original-language version usually prevails (check 'prevailing language' clause).
- **Example (samples 01, 07):** Bilingual layouts.
- **Explain (EN):** The two language versions state different figures.
- **Fix to request:** Please confirm the correct limits.

### H02 — Summary table vs narrative text disagree

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `AMOUNT_PARSING`

- **Check:** Same guarantee, two amounts.
- **How to read it:** Review; prefer the more specific statement; show both.
- **Explain (EN):** The summary table and the text state different amounts for {guarantee}.
- **Fix to request:** Please confirm the applicable limit.

### H03 — Text layer garbled / absent → OCR fallback

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `IAS`

- **Check:** Text extraction yields noise or nothing.
- **How to read it:** Run OCR (tesseract) and vision extraction; lower IAS; route to review if critical fields < 0.6.
- **Example (sample 06 (Zurich ES / COPO)):** Corrupted text layer.
- **Explain (EN):** The PDF text layer was unusable; values were read by OCR and may need confirmation.

### H04 — Low-resolution or skewed scan

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `IAS`

- **Check:** Image quality.
- **How to read it:** Deskew, upscale; lower confidence. If signature/stamp zones unreadable → formal gates to review.
- **Example (sample 04):** Scanned certificate.
- **Explain (EN):** Scan quality is low; some values have reduced confidence.
- **Fix to request:** Please upload a higher-quality scan.

### H05 — Handwritten amendments on a printed certificate

**Severity** MAJOR · **Outcome** `REVIEW` · **Rule ref** `STAMP_PRESENT`

- **Check:** Ink corrections.
- **How to read it:** Suspicious unless initialled and stamped. Review.
- **Explain (EN):** The certificate contains handwritten amendments.
- **Fix to request:** Please provide a clean re-issued certificate.

### H06 — Page missing ('page 2 of 3' but 2 pages)

**Severity** MAJOR · **Outcome** `REVIEW` · **Rule ref** `DOCUMENT_IS_CERTIFICATE`

- **Check:** Page numbering.
- **How to read it:** Incomplete document → review (sub-limits often on the last page).
- **Explain (EN):** The document appears incomplete ({have} of {total} pages).
- **Fix to request:** Please upload the complete certificate.

### H07 — Insured name spelled differently across pages

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `ENTITY_MATCH`

- **Check:** Cross-page consistency.
- **How to read it:** Minor typos → ignore; different entities → review.
- **Explain (EN):** The insured name varies across pages.
- **Fix to request:** Please confirm the legal name of the insured.

### H08 — Personal data present (names, emails, phone numbers)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `GDPR`

- **Check:** GDPR hygiene.
- **How to read it:** Mask in exports, logs and emails; keep in the stored document. Not a defect.
- **Example (sample 09):** Insurer employee's direct email on the cover letter.
- **Explain (EN):** Personal data detected and masked in exports.

### H09 — Multiple currencies on one certificate

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `FX`

- **Check:** E.g. limits in EUR, deductible in CHF.
- **How to read it:** Convert each with its own currency; never assume one currency per document.
- **Explain (EN):** The certificate uses several currencies.

### H10 — Language not in the supported set / mixed scripts

**Severity** MINOR · **Outcome** `REVIEW` · **Rule ref** `IAS`

- **Check:** E.g. Turkish, Polish, Chinese certificates.
- **How to read it:** Extraction still attempted (LLM multilingual); IAS lowered; route to review if < 0.75.
- **Explain (EN):** Document language ({lang}) has limited validation coverage; values should be confirmed.

### H11 — Certificate for the right supplier but the wrong FORVIA request (duplicate / re-upload)

**Severity** INFO · **Outcome** `INFO` · **Rule ref** `—`

- **Check:** Same file hash already analysed.
- **How to read it:** Deduplicate by hash; link to the previous analysis; do not re-bill the LLM.
- **Explain (EN):** This document was already analysed on {date}.


## Coverage of the 10 seed samples

| Sample | Checks that fire (expected) |
|---|---|
| 01 Chubb / Air Products | B14 (disclaimer), D05 (DINC only 200k), D10 (recall 'Covered' no amount), D12 (CSL), E08 (SIR), E10 (USD→EUR), H01 (bilingual) |
| 02 Generali DE / Scherdel | B01 (no stamp), D01 (recall-only), D13 (Kfz-Rückruf), G05 (tacit renewal wording) |
| 03 Swiss Mobiliar / Ekko-Meister | B01 (no stamp), D12 (CSL CHF 20M), E02 (recall sub-limit 5M), E10 (CHF), E12 (Swiss separators), G02 (expiry window) |
| 04 Marron & Associés / MTS | B05 (broker/agent issuer), D03 (withdrawal ≠ recall), D16 ('RC professionnelle' label), E01 (305k under 10M), E22 (BI/PD split), E24 (pollution 500k secondary), F01 (USA/Canada excluded), H04 (scan) |
| 05 ICICI Lombard / Naxnova | A01 (quote), B02 (unsigned), B11/E16 (capacity 20%), D17 (irrelevant lines), E11 (INR crore), F03 (claims-made), F05 (critical auto parts excluded), G08 (date format) |
| 06 Zurich ES / COPO | B04 (unnamed signature), C04 (FORVIA additional insured), D02 partially (recall 4M < 15M), D04 (PFL missing), H03 (garbled text layer) |
| 07 Zurich DE / IMI | B01 (no stamp), C05/E17 (16 co-insured, shared 5M), D02 (recall missing), D04 (PFL missing), D12 (CSL), H01 (bilingual) |
| 08 Allianz AGCS / CeramTec | B01 (no stamp), D01 (recall-only), D13 (Kfz-Rückruf 5M), E13 ('Mio.') |
| 09 Allianz / Beyer Polyvlies | A04/A08 (cover letter + certificate), B01 (no stamp), D07 (extended PL 20M), D12 (CSL 5M/10M), D21 (USA/Canada included), E04 (5M / 10M), H08 (personal email) |
| 10 Generali IT / Metraton | B01 (no stamp), C02 (master policy Landi Renzo), E15 (per sinistro / per anno table), D02 partially (recall 10M < 15M) |

_Expected firing lists are indicative; `ground_truth.json` remains the source of truth for decisions and scores._
