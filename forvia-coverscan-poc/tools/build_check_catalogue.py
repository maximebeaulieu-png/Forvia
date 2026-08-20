#!/usr/bin/env python3
"""
Builds the CoverScan check catalogue:
  data/checks/check_catalogue.json   (machine-readable, loaded by the pipeline + prompts)
  docs/11_check_catalogue.md         (human-readable, grouped by category)

The catalogue is the "big list of cases" the LLM and the rules engine must know about:
formal defects, issuer traps, entity mismatches, guarantee wording, amounts & sub-limits,
exclusions, period problems, consistency issues. Every entry says what to look for
(multilingual cues), how to read it, the outcome in the decision model, an example
(real sample when available, otherwise a realistic synthetic excerpt), the English
explanation template and the fix to request from the supplier.

Edit THIS file, then run it. Never hand-edit the generated files.
"""
import json, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]

# Outcome vocabulary (maps onto docs/04_scoring_rules.md)
#   NO_GO_STRUCTURAL  blocking gate, document must be replaced (wrong nature/issuer/entity/expired)
#   NO_GO_FORMAL      blocking gate, same document can be re-issued with the missing formality
#   REQUEST_CHANGES   critical guarantee missing / below threshold → ask supplier for endorsement
#   PENALTY           risk-score penalty (exclusions, claims-made)
#   SECONDARY         secondary criterion (points, not blocking)
#   REVIEW            route to human review (ambiguity)
#   INFO              record & display, no effect on decision
#   OK                positive signal, no action

C = []  # catalogue entries

def add(id, category, title, check, reading, severity, outcome, ruleRef, explain, fix, cues=None, example=None, tags=None):
    C.append(dict(id=id, category=category, title=title, check=check, cues=cues or {}, reading=reading,
                  severity=severity, outcome=outcome, ruleRef=ruleRef, example=example or {},
                  explain=explain, fix=fix, tags=tags or []))

S = lambda sid, text: {"source": sid, "text": text}
SYN = lambda text: {"source": "synthetic", "text": text}

# ─────────────────────────────────────────────────────────────────────────────
# A — DOCUMENT NATURE & ADMISSIBILITY
# ─────────────────────────────────────────────────────────────────────────────
CAT_A = "A. Document nature & admissibility"

add("A01", CAT_A, "Document is a quote / proposal, not a certificate",
    "Is the document a binding confirmation of cover in force, or an offer/quotation?",
    "A quote proves nothing: the supplier may never have bound the policy. Quotes carry words like quote, proposal, premium, validity of offer, 'subject to'. A genuine certificate states that a policy IS in force with a policy number and period.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "The document is a quotation, not a certificate of insurance in force.",
    "Please provide a certificate of insurance issued by the insurer confirming the policy in force (policy number, period, limits).",
    cues={"en": ["quote", "quotation", "proposal", "premium quoted", "this quote is valid until", "subject to acceptance", "offer"],
          "fr": ["devis", "proposition", "projet de contrat", "offre valable jusqu'au"],
          "de": ["Angebot", "Prämienangebot", "unverbindlich", "Offerte"],
          "es": ["cotización", "propuesta", "oferta", "prima estimada"],
          "it": ["preventivo", "quotazione", "proposta", "offerta"]},
    example=S("sample 05 (ICICI Lombard / Naxnova)", "Title 'Commercial General Liability Quote'; premium shown; 'ICICI Lombard capacity (20%)'."),
    tags=["classifier"])

add("A02", CAT_A, "Draft / specimen / 'for information only'",
    "Watermarks or notes indicating the document is not the final signed version.",
    "Drafts and specimens are not evidence. Also catch 'projet', 'Entwurf', 'Muster', 'sample', 'void'.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "The document is marked as a draft or specimen and cannot be relied upon.",
    "Please provide the final, signed and stamped certificate.",
    cues={"en": ["draft", "specimen", "sample", "for information only", "void", "not valid"],
          "fr": ["projet", "spécimen", "pour information", "non contractuel"],
          "de": ["Entwurf", "Muster", "unverbindlich", "zur Information"],
          "es": ["borrador", "muestra", "solo informativo"], "it": ["bozza", "fac-simile", "a titolo informativo"]},
    example=SYN("Diagonal watermark 'DRAFT – NOT VALID' on every page."))

add("A03", CAT_A, "Policy schedule / excerpt of general conditions instead of a certificate",
    "The supplier sent pages of the policy wording (conditions, schedule) rather than a certificate addressed to a third party.",
    "A policy excerpt can contain the right numbers but is not a certification by the insurer that the cover is in force today. Treat as structural; data may still be extracted for information.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "The document is an excerpt of the policy, not a certificate confirming the cover in force.",
    "Please ask your insurer to issue a certificate of insurance (attestation) summarising the cover in force.",
    cues={"en": ["general conditions", "policy wording", "schedule", "section", "article", "definitions"],
          "fr": ["conditions générales", "conditions particulières", "article", "dispositions"],
          "de": ["Allgemeine Versicherungsbedingungen", "AHB", "Besondere Bedingungen", "Versicherungsschein"],
          "es": ["condiciones generales", "condiciones particulares"], "it": ["condizioni generali", "condizioni particolari", "polizza"]},
    example=SYN("12-page PDF starting with 'Allgemeine Versicherungsbedingungen für die Haftpflichtversicherung (AHB)'."))

add("A04", CAT_A, "Cover letter / email only, certificate missing",
    "A broker or insurer letter says 'please find attached the certificate' but the attachment is absent.",
    "Classify as EMAIL/COVER_LETTER. If the same file also contains the certificate (sample 09), keep only the certificate pages and record the letter as context.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "Only a cover letter was received; the certificate itself is missing.",
    "Please send the certificate referred to in your letter.",
    cues={"en": ["please find attached", "enclosed", "herewith"], "fr": ["veuillez trouver ci-joint", "ci-après"],
          "de": ["anbei", "in der Anlage", "beigefügt"], "es": ["adjunto"], "it": ["in allegato"]},
    example=S("sample 09 (Allianz / Beyer Polyvlies)", "Page 1 is a personal cover letter from the insurer's contact ('anbei erhalten Sie…'); the certificate follows on page 2."))

add("A05", CAT_A, "Renewal notice, invoice or premium statement",
    "Financial documents mention the policy but do not certify the cover.",
    "Premium invoices prove a payment, not the scope of cover, and often pre-date the period. Reject.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "The document is a premium invoice / renewal notice, not a certificate.",
    "Please provide the certificate of insurance, not the premium invoice.",
    cues={"en": ["invoice", "premium due", "renewal notice", "amount payable"], "fr": ["avis d'échéance", "appel de prime", "facture"],
          "de": ["Beitragsrechnung", "Prämienrechnung", "fällig"], "es": ["recibo de prima", "factura"], "it": ["quietanza", "avviso di scadenza"]},
    example=SYN("'Avis d'échéance – prime annuelle TTC 12 340 €' with bank details."))

add("A06", CAT_A, "Editable office file (DOCX/XLSX) instead of PDF/image",
    "File format received via Ariba.",
    "An editable file can be altered after issuance (Q31: DOCX = red flag). Block at ingestion without analysis.",
    "BLOCKING", "NO_GO_STRUCTURAL", "FILE_FORMAT_OK",
    "Editable file formats are not accepted for certificates.",
    "Please upload the certificate as a PDF (or scanned image) exactly as issued by the insurer.",
    example=SYN("attestation_RC_2025.docx uploaded in Ariba."))

add("A07", CAT_A, "Screenshot / photo of a screen, cropped or partial",
    "Image shows a browser window, phone UI, or only part of the page.",
    "Partial captures hide sub-limits and signatures. Route to review if most fields extract; block if key zones are missing.",
    "MAJOR", "REVIEW", "DOCUMENT_IS_CERTIFICATE",
    "The file is a partial screenshot; parts of the certificate (signature zone, sub-limits) may be missing.",
    "Please upload the full certificate as a PDF.",
    example=SYN("PNG 1080×1920 showing a phone screen with the top half of a certificate."))

add("A08", CAT_A, "Multi-document file (several certificates, several policies, attachments)",
    "One PDF contains more than one distinct document.",
    "Split by document; analyse each; link them. Do not sum limits across different policies unless one document explicitly states it is an excess layer of the other (E20).",
    "MINOR", "REVIEW", "DOCUMENT_IS_CERTIFICATE",
    "The file contains several documents; each has been analysed separately.",
    "—",
    example=S("sample 09", "Cover letter + certificate in one PDF."))

add("A09", CAT_A, "Certificate references limits 'as per policy' without stating them",
    "Amounts are replaced by a reference to the policy or to general conditions.",
    "Unverifiable. Critical guarantees → REQUEST_CHANGES (need figures).",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_LIABILITY",
    "The certificate refers to the policy limits without stating amounts, which cannot be verified.",
    "Please ask your insurer to state the limit of indemnity for each guarantee (amount, currency, basis).",
    cues={"en": ["as per policy", "per the policy terms", "in accordance with the policy"], "fr": ["selon conditions particulières", "conformément au contrat"],
          "de": ["gemäß Versicherungsschein", "laut Vertrag"], "es": ["según póliza"], "it": ["come da polizza"]},
    example=SYN("'Limits of indemnity: as per policy schedule.'"))

add("A10", CAT_A, "Blank template / unfilled fields",
    "Placeholder fields left empty or with brackets.",
    "A template with empty insured name, dates or amounts is not a certificate.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "The certificate contains unfilled template fields.",
    "Please provide the completed certificate issued by your insurer.",
    cues={"en": ["[insert", "______", "xxx", "TBD", "N/A"], "fr": ["à compléter"], "de": ["[bitte eintragen]"]},
    example=SYN("'Policyholder: ______________ Policy No.: XXXXXXX'."))

add("A11", CAT_A, "Document not about liability insurance (property, motor fleet, D&O, transport)",
    "The certificate covers another line of business.",
    "Correctly identify the line. A motor or property certificate is structurally wrong for this request.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DOCUMENT_IS_CERTIFICATE",
    "The certificate relates to a different line of insurance (e.g. property / motor) and does not evidence liability cover.",
    "Please provide the general & product liability certificate.",
    cues={"en": ["property all risks", "motor fleet", "directors and officers", "marine cargo", "workers compensation"],
          "fr": ["multirisque", "flotte automobile", "RC mandataires sociaux", "marchandises transportées"],
          "de": ["Sachversicherung", "Kfz-Flotte", "D&O", "Transportversicherung"], "es": ["daños materiales", "flota", "transporte"],
          "it": ["all risks", "flotta", "trasporti"]},
    example=SYN("'Certificate of Insurance – Property Damage and Business Interruption'."))

add("A12", CAT_A, "Undated certificate",
    "No issue date and no period dates.",
    "Without a date the certificate cannot be placed in time. DATES_PRESENT fails.",
    "BLOCKING", "NO_GO_STRUCTURAL", "DATES_PRESENT",
    "The certificate is undated and states no period of insurance.",
    "Please provide a dated certificate stating the period of insurance (from / to).",
    example=SYN("No 'Fait à… le', no period, only 'valid for the current insurance year'."))

# ─────────────────────────────────────────────────────────────────────────────
# B — AUTHENTICITY & ISSUER
# ─────────────────────────────────────────────────────────────────────────────
CAT_B = "B. Authenticity & issuer"

add("B01", CAT_B, "No insurer stamp / seal",
    "Presence of a stamp (ink or printed seal) attributable to the issuing insurer.",
    "Richard: without a stamp the insurer can later deny having validated the document. Formal defect: the same certificate can be re-issued stamped. Detection = presence & attribution, not forgery detection.",
    "BLOCKING", "NO_GO_FORMAL", "STAMP_PRESENT",
    "No insurer stamp was found on the certificate.",
    "Please provide the certificate stamped by the insurer.",
    cues={"en": ["stamp", "seal", "company seal"], "fr": ["cachet", "tampon"], "de": ["Stempel", "Firmenstempel"], "es": ["sello"], "it": ["timbro"]},
    example=S("samples 02, 03, 07, 08, 09, 10", "Printed letterhead and signature, no stamp."))

add("B02", CAT_B, "No handwritten signature",
    "A handwritten-style signature of a person acting for the issuer.",
    "Typed name only, or nothing. Formal defect.",
    "BLOCKING", "NO_GO_FORMAL", "SIGNATURE_PRESENT",
    "The certificate is not signed.",
    "Please provide the certificate signed by an authorised representative of the insurer.",
    example=S("sample 05", "Quote ends with 'Authorised Signatory' and no signature."))

add("B03", CAT_B, "'Electronically generated – no signature required' disclaimer",
    "A printed note replacing the signature.",
    "Common in DE/UK. Under the strict profile it fails SIGNATURE_PRESENT (formal). Profile switch `acceptElectronicSignatureNote` may allow it if a qualified e-signature (eIDAS) is embedded — check PDF signature field.",
    "BLOCKING", "NO_GO_FORMAL", "SIGNATURE_PRESENT",
    "The certificate carries no handwritten signature; it states that it was generated electronically.",
    "Please provide a signed certificate, or a PDF carrying a qualified electronic signature.",
    cues={"en": ["electronically generated", "valid without signature", "no signature required"],
          "fr": ["document généré électroniquement", "valable sans signature"],
          "de": ["maschinell erstellt", "auch ohne Unterschrift gültig", "ohne Unterschrift gültig"],
          "es": ["generado electrónicamente", "válido sin firma"], "it": ["generato elettronicamente", "valido senza firma"]},
    example=SYN("'Dieses Schreiben wurde maschinell erstellt und ist auch ohne Unterschrift gültig.'"))

add("B04", CAT_B, "Signature present but signer not named / no function",
    "A scribble without printed name or title.",
    "Lower attribution confidence; route to review rather than block.",
    "MINOR", "REVIEW", "SIGNATURE_PRESENT",
    "A signature is present but the signatory is not identified.",
    "Please ask your insurer to add the name and function of the signatory.",
    example=S("sample 06 (Zurich ES / COPO)", "Stamp plus an illegible initial; no printed name."))

add("B05", CAT_B, "Issued and signed by a broker (courtier / Makler / broker)",
    "Who signs: an insurer, or an intermediary?",
    "A broker certifies what it believes; only the insurer binds itself. Richard: Marron & Associés → 'refus total'. Detect ORIAS numbers, 'courtier', 'assureur conseil', 'agent général', 'Makler', 'corredor', 'broker'. Profile option `allowAuthorisedBroker` (default false).",
    "BLOCKING", "NO_GO_STRUCTURAL", "ISSUER_IS_INSURER",
    "The certificate is issued by an intermediary (broker/agent), not by the insurer.",
    "Please provide a certificate issued and signed by the insurer itself (the broker may forward it).",
    cues={"en": ["broker", "insurance broker", "intermediary", "on behalf of our client"],
          "fr": ["courtier", "assureur conseil", "agent général", "ORIAS", "cabinet", "intermédiaire en assurance"],
          "de": ["Versicherungsmakler", "Makler", "Vermittler", "Agentur"], "es": ["corredor", "correduría", "mediador"],
          "it": ["broker", "intermediario", "agenzia"]},
    example=S("sample 04 (Marron & Associés / MTS)", "'Agent Général MMA… immatriculé à l'ORIAS'; signed by the agency."))

add("B06", CAT_B, "Broker letterhead but insurer stamp and signature present",
    "Mixed case: broker template, insurer authenticates.",
    "Acceptable if the stamp and signature belong to the insurer and the insurer is named as issuer. Attribute the stamp; if stamp entity ≠ issuer → review.",
    "MINOR", "REVIEW", "ISSUER_IS_INSURER",
    "The certificate is on broker letterhead; the insurer's stamp and signature were verified.",
    "—",
    example=SYN("Broker logo top-left, 'Pour l'assureur: AXA France IARD' with AXA stamp and signature bottom-right."))

add("B07", CAT_B, "Insurer not found in the registry",
    "Issuer name resolved against the insurer registry (ACPR/EIOPA/BaFin/NAIC… curated JSON in POC).",
    "Unknown carrier = cannot assess solidity. Block when no match and no regulator id on the document; review when fuzzy.",
    "BLOCKING", "NO_GO_STRUCTURAL", "INSURER_IDENTIFIED",
    "The issuing insurer could not be identified in the insurer registry.",
    "Please confirm the full legal name and regulator registration of the insurer.",
    example=SYN("'Global Trust Underwriters Ltd' – no match in EIOPA, no regulator number."))

add("B08", CAT_B, "Insurer rating below floor / in run-off / captive",
    "Financial strength rating vs profile floor (default A- AM Best / BBB+ S&P).",
    "Weak or unrated carriers (Q19). Captive not fronted by a rated insurer → block (Q20). Mutual without rating → review.",
    "BLOCKING", "NO_GO_STRUCTURAL", "INSURER_RATING_FLOOR",
    "The insurer's financial strength rating is below the required floor.",
    "Please provide cover from an insurer rated at least A- (AM Best) or equivalent.",
    cues={"en": ["captive", "fronted by", "run-off"], "fr": ["captive"], "de": ["Captive", "Abwicklung"]},
    example=SYN("Issuer 'XYZ Captive Re Ltd (Guernsey)' without fronting insurer."))

add("B09", CAT_B, "Policy number missing",
    "Presence of a policy / contract number.",
    "Every genuine certificate carries one (Richard). Needed in a claim. Formal defect.",
    "BLOCKING", "NO_GO_FORMAL", "POLICY_NUMBER_PRESENT",
    "No policy number is stated.",
    "Please provide a certificate stating the policy number.",
    cues={"en": ["policy no", "policy number", "contract no"], "fr": ["police n°", "contrat n°", "n° de contrat"],
          "de": ["Versicherungsschein-Nr", "Policen-Nr", "Vertrags-Nr"], "es": ["número de póliza", "póliza nº"], "it": ["polizza n", "n. polizza"]},
    example=SYN("Certificate with all limits but no contract reference anywhere."))

add("B10", CAT_B, "Policy number is a placeholder or inconsistent across pages",
    "Format check and cross-page consistency.",
    "'XXXXXX', '0000000', or header number ≠ stamp number → review (possible tampering or mixed documents).",
    "MINOR", "REVIEW", "POLICY_NUMBER_PRESENT",
    "The policy number looks like a placeholder or differs between pages.",
    "Please confirm the correct policy number.",
    example=SYN("Header: 'Policy 7854-221-A'; page 3 footer: 'Policy 7854-219-A'."))

add("B11", CAT_B, "Co-insurance: capacity share < 100 % from the signing insurer",
    "'Capacity x %', 'quota-part', 'Anteil', 'share', 'leader'.",
    "The signing insurer only carries its share. Forvia needs the whole tower evidenced: all co-insurers named and signed/stamped (Q14), shares summing to 100 %.",
    "BLOCKING", "NO_GO_STRUCTURAL", "COINSURANCE_COMPLETE",
    "The certificate is issued by one co-insurer carrying only part of the limit; the other co-insurers are not evidenced.",
    "Please provide a certificate listing all co-insurers and their shares (100 %), signed by each, or issued by the leader on behalf of all.",
    cues={"en": ["capacity", "share", "quota share", "leader", "following insurers"], "fr": ["quote-part", "apériteur", "coassurance"],
          "de": ["Anteil", "führender Versicherer", "Mitversicherer", "Beteiligung"], "es": ["cuota", "coaseguro", "abridora"], "it": ["quota", "delegataria", "coassicurazione"]},
    example=S("sample 05", "'ICICI Lombard capacity (20%)'."))

add("B12", CAT_B, "Co-insurers listed but only the leader signed",
    "Signature/stamp of each co-insurer, or a clause 'the leader signs on behalf of all'.",
    "Block unless the leader's mandate is stated on the document.",
    "BLOCKING", "NO_GO_STRUCTURAL", "COINSURANCE_COMPLETE",
    "Co-insurers are listed but have not signed or stamped the certificate.",
    "Please have each co-insurer sign/stamp, or state the leader's authority to sign for all.",
    example=SYN("'Allianz 60 % – HDI 25 % – Helvetia 15 %' with one Allianz signature only."))

add("B13", CAT_B, "Insurer contact is a generic webmail / no professional identifiers",
    "Email domain, phone, company registration numbers.",
    "A certificate signed from gmail.com is suspicious. Review. Mask personal data in exports (GDPR).",
    "MINOR", "REVIEW", "ISSUER_IS_INSURER",
    "The issuer's contact details are not professional identifiers of the insurer.",
    "Please provide a certificate issued from the insurer's official channels.",
    example=SYN("'For Allianz: j.muster@gmail.com'."))

add("B14", CAT_B, "Standard disclaimer 'confers no rights on the certificate holder'",
    "Legal boilerplate.",
    "Normal on certificates worldwide (ACORD, DE, FR). Do not penalise. Record as INFO.",
    "INFO", "INFO", "—",
    "Standard disclaimer noted; no impact.",
    "—",
    cues={"en": ["confers no rights", "does not amend, extend or alter", "information only"],
          "fr": ["ne saurait engager", "ne peut engager l'assureur au-delà"], "de": ["begründet keine Rechte", "dient nur zur Information"]},
    example=S("sample 01 (Chubb / Air Products)", "'This certificate is issued as a matter of information only…'"))

add("B15", CAT_B, "Stamp belongs to a different entity than the issuer",
    "Stamp text vs issuer name.",
    "Broker stamp on an insurer letter, or group stamp on a local entity. Review.",
    "MINOR", "REVIEW", "STAMP_PRESENT",
    "The stamp does not match the issuing entity.",
    "Please confirm which entity issued the certificate.",
    example=SYN("Letter from 'Zurich Insurance plc, Niederlassung Deutschland', stamp 'Müller Versicherungsmakler GmbH'."))

add("B16", CAT_B, "Pasted / low-resolution stamp image",
    "Visual: stamp with uniform background rectangle, JPEG artefacts, identical pixel stamp on every page.",
    "Not a forgery verdict (out of scope) — lower STAMP confidence → review.",
    "MINOR", "REVIEW", "STAMP_PRESENT",
    "The stamp appears as a pasted image; authenticity could not be confirmed visually.",
    "Please provide the original certificate (scan of the stamped original or the insurer's signed PDF).",
    example=SYN("Pixel-identical stamp at the same coordinates on pages 1–4, with a white rectangle behind it."))

# ─────────────────────────────────────────────────────────────────────────────
# C — INSURED ENTITY
# ─────────────────────────────────────────────────────────────────────────────
CAT_C = "C. Insured entity"

add("C01", CAT_C, "Insured name ≠ supplier legal entity in Ariba",
    "Normalised fuzzy match between Ariba supplier (legal name, country) and policyholder / named / additional / co-insured.",
    "Q26: certificate must name the contracting entity; otherwise blocking (formal: the insurer can add the entity). Ignore legal-form noise (GmbH vs GmbH & Co. KG) only within the review band.",
    "BLOCKING", "NO_GO_FORMAL", "ENTITY_MATCH",
    "The certificate does not name the contracting supplier entity.",
    "Please provide a certificate naming {supplierLegalName} as policyholder or insured.",
    example=SYN("Ariba: 'Beyer Polyvlies Franz Beyer GmbH & Co. KG'; certificate: 'Beyer Holding GmbH'."))

add("C02", CAT_C, "Only the parent / group is named; supplier is a subsidiary",
    "Group master policy.",
    "Acceptable only if the supplier is listed as co-insured/insured subsidiary (sample 10: Metraton under Landi Renzo master policy). Otherwise formal block.",
    "BLOCKING", "NO_GO_FORMAL", "ENTITY_MATCH",
    "Only the parent company is insured; the supplier entity is not listed.",
    "Please provide a certificate confirming that {supplierLegalName} is an insured under the group policy.",
    cues={"en": ["subsidiaries", "group companies", "affiliated companies", "master policy"], "fr": ["filiales", "sociétés du groupe"],
          "de": ["Tochtergesellschaften", "Konzernunternehmen", "mitversicherte Unternehmen"], "es": ["filiales", "empresas del grupo"], "it": ["società controllate", "società del gruppo", "polizza master"]},
    example=S("sample 10 (Generali IT / Metraton)", "Policyholder Landi Renzo S.p.A.; Metraton listed as insured company."))

add("C03", CAT_C, "Supplier appears only as 'additional insured' added for a customer",
    "Role of the supplier on the certificate.",
    "Additional insured status is acceptable (profile acceptAs). But if the supplier is added only for one project/contract, check scope wording.",
    "MINOR", "INFO", "ENTITY_MATCH",
    "The supplier is covered as additional insured.",
    "—",
    example=SYN("'Additional insured: XYZ S.r.l. in respect of contract no. 4711 only.'"))

add("C04", CAT_C, "FORVIA entity named as additional insured",
    "A FORVIA company appears on the certificate.",
    "Positive, not required. Record as OK; useful for buyers.",
    "INFO", "OK", "—",
    "A FORVIA entity is named as additional insured on this policy.",
    "—",
    example=S("sample 06", "A FORVIA subsidiary listed as additional insured."))

add("C05", CAT_C, "Shared limit across many co-insured companies",
    "Group certificate with N insured entities and one aggregate.",
    "Limit is shared group-wide (sample 07: 16 entities). Not a breach, but reduces effective capacity. Display as INFO with the count.",
    "MINOR", "INFO", "AGGREGATE_BASIS",
    "The annual aggregate is shared between {n} insured companies.",
    "—",
    example=S("sample 07 (Zurich DE / IMI)", "16 co-insured companies share €5M combined."))

add("C06", CAT_C, "Certificate addressed to another customer (another OEM)",
    "'To: Stellantis Purchasing' style addressee.",
    "Still evidence of cover if not restricted to that customer's contract. Review wording; INFO otherwise.",
    "MINOR", "REVIEW", "ENTITY_MATCH",
    "The certificate was issued for another customer; the cover described is not customer-specific.",
    "Please provide a certificate addressed to FORVIA or 'to whom it may concern'.",
    example=SYN("'Certificate holder: Volkswagen AG, Konzerneinkauf'."))

add("C07", CAT_C, "Trading name / brand instead of legal name",
    "'XYZ Automotive' vs 'XYZ Automotive Components S.A.S.'.",
    "Review band; ask for legal name if ambiguous.",
    "MINOR", "REVIEW", "ENTITY_MATCH",
    "The insured is identified by a trading name; legal identity could not be confirmed.",
    "Please confirm the legal name of the insured entity.",
    example=SYN("Insured: 'AutoSeal' (brand); Ariba: 'Dichtungstechnik Müller GmbH'."))

add("C08", CAT_C, "Post-merger / renamed entity",
    "Insured name is the former name of the supplier.",
    "Legal continuity usually preserves cover, but the certificate should be updated. Review.",
    "MINOR", "REVIEW", "ENTITY_MATCH",
    "The certificate names a former legal name of the supplier.",
    "Please provide an updated certificate with the current legal name.",
    example=SYN("Certificate: 'Faurecia Interior Systems'; Ariba: 'FORVIA Interior Systems'."))

add("C09", CAT_C, "Insured address / country differs from supplier",
    "Same name, different country (homonyms).",
    "Review: could be a sister company.",
    "MINOR", "REVIEW", "ENTITY_MATCH",
    "The insured entity is registered in a different country than the supplier.",
    "Please confirm that the certificate covers {supplierLegalName}, {supplierCountry}.",
    example=SYN("'Copo Ibérica S.A.' (Spain) vs supplier 'Copo Brasil Ltda.'."))

add("C10", CAT_C, "Entity named only in the cover letter, not on the certificate",
    "Letter says 'for our client X'; certificate names Y.",
    "Only the certificate counts.",
    "BLOCKING", "NO_GO_FORMAL", "ENTITY_MATCH",
    "The supplier is mentioned only in the cover letter; the certificate names a different entity.",
    "Please provide a certificate naming {supplierLegalName}.",
    example=SYN("Letter: 'Bestätigung für Beyer Polyvlies GmbH & Co. KG'; certificate: 'Beyer Holding'."))

# ─────────────────────────────────────────────────────────────────────────────
# D — GUARANTEES: PRESENCE & MAPPING
# ─────────────────────────────────────────────────────────────────────────────
CAT_D = "D. Guarantees — presence & mapping"

add("D01", CAT_D, "Product liability missing (certificate covers recall only)",
    "Is PRODUCT_LIABILITY (after delivery) stated?",
    "German recall-only certificates (Kfz-Rückruf) are common: they evidence recall, not product liability. The main GPTC guarantee (≥ €20M) is absent → REQUEST_CHANGES (ask for the general/product liability certificate too).",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_LIABILITY",
    "Product liability cover is not evidenced; the certificate only covers recall.",
    "Please provide the general & product liability certificate (≥ €20M per occurrence and in the aggregate).",
    cues={"en": ["products liability", "products/completed operations", "product liability"],
          "fr": ["RC produits", "RC après livraison", "responsabilité civile produits"],
          "de": ["Produkthaftpflicht", "Produkthaftpflichtversicherung"], "es": ["RC productos", "responsabilidad civil de productos"],
          "it": ["RC prodotti", "responsabilità civile prodotti", "RCP"]},
    example=S("samples 02, 08", "Titles 'Rückrufkostenversicherung' / 'Kfz-Rückruf' only."))

add("D02", CAT_D, "Product recall missing",
    "Is PRODUCT_RECALL or AUTOMOTIVE_RECALL stated?",
    "Recall is the #1 automotive risk (Ferrari case: €5M paid by FORVIA). Missing → REQUEST_CHANGES.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "Product recall cover is not evidenced.",
    "Please provide evidence of product recall cover (≥ €15M).",
    cues={"en": ["product recall", "recall expenses", "recall costs", "withdrawal"],
          "fr": ["frais de rappel", "frais de retrait", "rappel de produits"],
          "de": ["Rückrufkosten", "Produktrückruf", "Kfz-Rückruf", "Rückrufkostenversicherung"],
          "es": ["retirada de productos", "gastos de retirada", "recall"], "it": ["richiamo prodotti", "ritiro prodotti", "spese di ritiro"]},
    example=S("sample 07", "GL/PL combined €5M, no recall line."))

add("D03", CAT_D, "'Withdrawal costs' (frais de retrait) is not a full recall cover",
    "FR wording: 'frais de retrait' vs 'frais de rappel'.",
    "Withdrawal = removing the product from the market/stock; recall = locating, removing from vehicles, replacing. Map 'frais de retrait' to PRODUCT_RECALL with flag `scope=WITHDRAWAL_ONLY`; compare amount to recall threshold; explain the nuance.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "Only withdrawal costs are covered; full recall costs (including removal from vehicles) are not evidenced.",
    "Please confirm product recall cover including costs of locating, removing and replacing defective parts.",
    cues={"fr": ["frais de retrait", "retrait de produits"], "en": ["withdrawal costs", "market withdrawal"], "de": ["Rücknahmekosten"], "it": ["ritiro dal mercato"]},
    example=S("sample 04", "'Frais de retrait : 305 000 €' under a €10M general limit."))

add("D04", CAT_D, "Pure financial loss (DINC) missing",
    "PURE_FINANCIAL_LOSS explicitly stated?",
    "Loss with no prior material damage (line stop). GPTC ≥ €15M. Often absent or tiny in DE (Vermögensschäden 100k). Missing → REQUEST_CHANGES.",
    "MAJOR", "REQUEST_CHANGES", "PURE_FINANCIAL_LOSS",
    "Pure financial loss cover is not evidenced.",
    "Please provide evidence of pure financial loss cover (≥ €15M).",
    cues={"en": ["pure financial loss", "pure economic loss", "financial loss not consequent upon"],
          "fr": ["dommages immatériels non consécutifs", "DINC", "préjudice financier pur"],
          "de": ["reine Vermögensschäden", "echte Vermögensschäden", "Vermögensschäden"],
          "es": ["daños patrimoniales puros", "perjuicios patrimoniales puros"], "it": ["danni patrimoniali puri", "perdite pecuniarie pure"]},
    example=S("sample 07", "No financial-loss line."))

add("D05", CAT_D, "DIC vs DINC confusion (FR)",
    "'Dommages immatériels consécutifs' (DIC) ≠ 'non consécutifs' (DINC).",
    "DIC follows a covered material damage; DINC is standalone. Many FR certificates show DIC only. Do NOT map DIC to PURE_FINANCIAL_LOSS. 'Dommages immatériels' without qualifier → UNCLEAR, review.",
    "MAJOR", "REQUEST_CHANGES", "PURE_FINANCIAL_LOSS",
    "Only consequential immaterial damage (DIC) is covered; non-consequential (DINC) is not evidenced.",
    "Please confirm cover for non-consequential immaterial damage (dommages immatériels non consécutifs).",
    cues={"fr": ["dommages immatériels consécutifs", "DIC", "dommages immatériels non consécutifs", "DINC", "dommages immatériels"]},
    example=S("sample 01", "'Dommages immatériels non consécutifs : 200 000 USD'; DIC not stated."))

add("D06", CAT_D, "German 'Vermögensschäden': which kind?",
    "'Vermögensschäden' may mean pure financial loss or be a small sub-cover in Betriebshaftpflicht.",
    "Map to PURE_FINANCIAL_LOSS; amounts are usually 100k–1M, far below €15M → BELOW_MINIMUM. Check 'echte/reine' qualifier; 'unechte Vermögensschäden' = consequential (DIC).",
    "MAJOR", "REQUEST_CHANGES", "PURE_FINANCIAL_LOSS",
    "Financial loss cover is limited to {amount}, below the €15M requirement.",
    "Please increase pure financial loss cover to ≥ €15M or provide the extended product liability schedule showing the applicable limit.",
    cues={"de": ["Vermögensschäden", "reine Vermögensschäden", "echte Vermögensschäden", "unechte Vermögensschäden"]},
    example=SYN("'Vermögensschäden: 250.000 EUR' in a Betriebshaftpflicht certificate."))

add("D07", CAT_D, "Extended product liability (erweiterte Produkthaftpflicht) bundle",
    "German schedule listing: Verbindungs-/Vermischungs-/Verarbeitungsschäden, Weiterverarbeitung, Aus- und Einbaukosten, Prüf- und Sortierkosten, Maschinenklausel.",
    "This bundle IS the automotive supplier cover. Map the bundle to EXTENDED_PRODUCT_LIABILITY and each listed item to its own code (DISMANTLING_REFITTING, etc.). Bundle limit may be a sub-limit of the main PL limit.",
    "MINOR", "SECONDARY", "EXTENDED_PRODUCT_LIABILITY",
    "Extended product liability is covered ({amount}).",
    "—",
    cues={"de": ["erweiterte Produkthaftpflicht", "Produkthaftpflicht-Modell", "Verbindungs-, Vermischungs- und Verarbeitungsschäden", "Weiterverarbeitungsschäden", "Aus- und Einbaukosten", "Prüf- und Sortierkosten", "Maschinenklausel"],
          "en": ["extended product liability", "mixing and blending", "further processing", "inspection and sorting costs"]},
    example=S("sample 09 (Allianz / Beyer)", "Extended product liability €20M as part of the schedule."))

add("D08", CAT_D, "Dismantling & refitting / removal & reinstallation not stated",
    "DISMANTLING_REFITTING present?",
    "GPTC critical keyword. Cost of removing the defective part from vehicles. Secondary criterion (5 pts) — but if recall is present and dismantling absent, explain.",
    "MINOR", "SECONDARY", "DISMANTLING_REFITTING",
    "Dismantling and refitting costs are not evidenced.",
    "Please confirm whether dismantling/refitting (removal and reinstallation) costs are covered.",
    cues={"en": ["dismantling", "removal and reinstallation", "removal and replacement", "refitting"],
          "fr": ["frais de dépose et repose", "dépose-repose", "démontage et remontage"],
          "de": ["Aus- und Einbaukosten", "Ein- und Ausbaukosten"], "es": ["desmontaje y montaje", "costes de retirada e instalación"], "it": ["smontaggio e rimontaggio", "costi di rimozione e reinstallazione"]})

add("D09", CAT_D, "Assembly / disassembly wording",
    "GPTC keyword close to D08.",
    "Treat as synonym group of DISMANTLING_REFITTING; report separately if labelled separately.",
    "INFO", "SECONDARY", "ASSEMBLY_DISASSEMBLY",
    "Assembly/disassembly costs are covered.",
    "—",
    cues={"en": ["assembly and disassembly", "assembly/disassembly"], "fr": ["montage et démontage"], "de": ["Montage und Demontage"]})

add("D10", CAT_D, "'Covered' / 'included' without an amount",
    "A guarantee marked as covered but no limit stated.",
    "Cannot compare to threshold → COVERED_NO_AMOUNT. For critical guarantees → REQUEST_CHANGES (state the limit). Frequently the cover is 'included in the general limit' — if explicit, inherit (E07).",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "{guarantee} is marked as covered but no limit is stated.",
    "Please state the limit of indemnity applicable to {guarantee}.",
    cues={"en": ["covered", "included", "insured", "yes"], "fr": ["couvert", "inclus", "acquis", "oui"], "de": ["mitversichert", "eingeschlossen", "ja"],
          "es": ["cubierto", "incluido", "sí"], "it": ["compreso", "incluso", "sì"]},
    example=S("sample 01", "'Product recall: Covered' without amount."))

add("D11", CAT_D, "'Available on request' / optional cover not taken",
    "Menu-style certificates listing optional extensions.",
    "'On request', 'optional', 'can be added', 'not selected' = NOT covered.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "{guarantee} is listed as optional and has not been taken out.",
    "Please subscribe the {guarantee} extension and provide an updated certificate.",
    cues={"en": ["on request", "optional", "not insured", "not selected", "available"], "fr": ["sur demande", "option non souscrite", "en option"],
          "de": ["optional", "nicht versichert", "auf Anfrage", "nicht vereinbart"], "es": ["opcional", "no contratado"], "it": ["opzionale", "non operante", "non prestata"]},
    example=SYN("'Garantie rappel de produits : non souscrite'."))

add("D12", CAT_D, "Combined single limit (GL + PL, sometimes + PFL)",
    "One limit for several guarantees.",
    "Map to COMBINED_GL_PL; allocate to PRODUCT_LIABILITY per profile `cslAllocation` (default FULL; Q13 open). Display 'inherited from CSL' badge.",
    "INFO", "INFO", "COMBINED_GL_PL",
    "Product liability is inherited from a combined general & product liability limit of {amount}.",
    "—",
    cues={"en": ["combined single limit", "public and products liability", "any one occurrence"], "fr": ["tous dommages confondus", "RC exploitation et produits"],
          "de": ["Betriebs- und Produkthaftpflicht", "pauschal", "Personen-, Sach- und Vermögensschäden pauschal"],
          "es": ["límite único combinado", "RC explotación y productos"], "it": ["massimale unico", "RCT/RCO"]},
    example=S("samples 01, 03, 07, 09", "Single figure for general + product liability."))

add("D13", CAT_D, "Automotive recall (Kfz-Rückruf) vs generic recall",
    "German specialty cover for recall of vehicles by OEM/authority.",
    "AUTOMOTIVE_RECALL counts toward PRODUCT_RECALL (max of both). Usually better suited than generic recall. Check whether it covers 'Eigenrückruf' (own) and 'Fremdrückruf' (third-party recall costs).",
    "INFO", "OK", "AUTOMOTIVE_RECALL",
    "Automotive recall liability of {amount} counts toward the recall requirement.",
    "—",
    cues={"de": ["Kfz-Rückrufkosten", "Kfz-Rückruf", "Rückruf von Kraftfahrzeugen", "Eigenrückruf", "Fremdrückruf", "Drittrückruf"],
          "en": ["automotive recall", "vehicle recall", "recall liability for automotive component suppliers"]},
    example=S("sample 08 (Allianz AGCS / CeramTec)", "'Kfz-Rückruf 5 Mio. EUR'."))

add("D14", CAT_D, "Recall: own costs vs third-party costs",
    "Does the recall cover pay the insured's own recall (first party) and/or recall costs claimed by customers (third party)?",
    "For FORVIA (the customer) the third-party/liability side matters. Many 'recall expenses' products are first-party only. Flag `recallScope`.",
    "MAJOR", "REVIEW", "PRODUCT_RECALL",
    "The recall cover appears to be first-party only; recall costs claimed by customers may not be covered.",
    "Please confirm that recall costs incurred by your customers (third-party recall liability) are covered.",
    cues={"en": ["first party recall", "own recall costs", "third party recall", "recall liability"], "de": ["Eigenrückruf", "Fremdrückruf", "Rückrufkosten-Haftpflicht"], "fr": ["frais de rappel engagés par les tiers", "rappel propre"]},
    example=SYN("'Product Recall Expense – first party only'."))

add("D15", CAT_D, "Inspection & sorting costs (Prüf- und Sortierkosten)",
    "Costs of checking/sorting suspected batches.",
    "Part of extended product liability; frequent claim in automotive. INFO/secondary.",
    "INFO", "SECONDARY", "EXTENDED_PRODUCT_LIABILITY",
    "Inspection and sorting costs are covered ({amount}).",
    "—",
    cues={"de": ["Prüf- und Sortierkosten"], "en": ["inspection and sorting costs", "testing costs"], "fr": ["frais de tri et de contrôle"], "it": ["costi di selezione e controllo"]})

add("D16", CAT_D, "Professional indemnity / E&O confused with product liability",
    "'RC professionnelle' in FR is often used loosely for general liability; E&O ≠ PL.",
    "Map by content, not label. If the certificate only evidences PI/E&O → product liability missing.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_LIABILITY",
    "The certificate evidences professional indemnity, not product liability.",
    "Please provide the product liability certificate.",
    cues={"en": ["professional indemnity", "errors and omissions", "E&O"], "fr": ["RC professionnelle", "responsabilité civile professionnelle"],
          "de": ["Berufshaftpflicht", "Vermögensschadenhaftpflicht"], "es": ["RC profesional"], "it": ["RC professionale"]},
    example=S("sample 04", "Titled 'Attestation RC professionnelle' but content is general liability + products."))

add("D17", CAT_D, "Employer's liability, motor, environmental lines listed — irrelevant to the request",
    "Extra lines on a multi-line certificate.",
    "Keep as OTHER/INFO. Do not let them inflate scores. Pollution is secondary (not scored in POC).",
    "INFO", "INFO", "OTHER",
    "Additional lines of cover noted (no impact).",
    "—",
    example=S("sample 05", "Long list: tenants liability, valet parking, terrorism…"))

add("D18", CAT_D, "Goods in custody / tooling (biens confiés)",
    "FORVIA-owned tooling at the supplier's site.",
    "Nice to have. INFO.",
    "INFO", "INFO", "GOODS_IN_CUSTODY",
    "Goods in care, custody and control are covered ({amount}).",
    "—",
    cues={"en": ["care custody and control", "goods in custody", "property in the insured's care"], "fr": ["biens confiés"], "de": ["Obhutsschäden", "Bearbeitungsschäden"], "es": ["bienes confiados"], "it": ["cose in consegna e custodia"]})

add("D19", CAT_D, "Product guarantee / efficacy (performance) cover",
    "Product does not perform (no damage).",
    "Rare; not required. INFO. Do not confuse with PFL.",
    "INFO", "INFO", "OTHER",
    "Product efficacy cover noted.",
    "—",
    cues={"en": ["product guarantee", "efficacy", "failure to perform"], "de": ["Produktgarantie", "Erfüllungsschaden"]})

add("D20", CAT_D, "Serial loss clause",
    "Several claims from the same cause treated as one occurrence.",
    "Matters for recall/PL: a serial defect counts as one claim (one limit, one deductible). INFO; show to expert.",
    "INFO", "INFO", "PRODUCT_LIABILITY",
    "Serial loss clause present: related claims are aggregated as one occurrence.",
    "—",
    cues={"en": ["serial loss", "series of losses", "batch clause"], "fr": ["sinistre sériel", "dommages sériels"], "de": ["Serienschaden", "Serienschadenklausel"], "it": ["sinistro in serie"]})

add("D21", CAT_D, "USA / Canada extension explicitly included",
    "Territorial extension for North America with its own limit.",
    "Positive (secondary criterion TERRITORY_USA_CANADA). If the USA/Canada limit is lower than the main limit, display both (E19).",
    "INFO", "SECONDARY", "TERRITORY_USA_CANADA",
    "Cover extends to USA/Canada ({amount}).",
    "—",
    cues={"en": ["including USA/Canada", "worldwide including USA and Canada", "North America"], "fr": ["y compris USA/Canada", "monde entier y compris"],
          "de": ["einschließlich USA/Kanada", "weltweit inklusive USA/Kanada", "USA-Deckung"], "es": ["incluido EE.UU. y Canadá"], "it": ["inclusi USA e Canada"]},
    example=S("sample 09", "USA/Canada included in the German schedule."))

# ─────────────────────────────────────────────────────────────────────────────
# E — AMOUNTS, BASIS & SUB-LIMITS
# ─────────────────────────────────────────────────────────────────────────────
CAT_E = "E. Amounts, basis & sub-limits"

add("E01", CAT_E, "Headline limit high, recall/withdrawal sub-limit tiny",
    "Compare each sub-limit to its own threshold, never to the headline.",
    "THE trap (Richard). €10M general, €305k withdrawal → recall compliance = BELOW_MINIMUM at €305k. Gap bar must show 305k vs 15M.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "Recall/withdrawal is sub-limited to {amount}, far below the €15M requirement, despite a {headline} general limit.",
    "Please increase the recall sub-limit to ≥ €15M.",
    cues={"en": ["sublimit", "sub-limit", "limited to", "up to"], "fr": ["sous-limite", "dans la limite de", "à concurrence de"],
          "de": ["Sublimit", "begrenzt auf", "maximal"], "es": ["sublímite", "hasta"], "it": ["sottolimite", "fino a", "con il limite di"]},
    example=S("sample 04", "'Tous dommages confondus 10 000 000 € … dont frais de retrait 305 000 €'."))

add("E02", CAT_E, "Recall sub-limit inside a combined single limit",
    "CSL with internal sub-limit.",
    "Sample 03: CHF 20M CSL, recall sub-limited to CHF 5M. Recall = 5M, not 20M.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "Recall is sub-limited to {amount} within the {headline} combined limit.",
    "Please increase the recall sub-limit to ≥ €15M.",
    example=S("sample 03 (Swiss Mobiliar / Ekko-Meister)", "CHF 20M CSL; 'Rückrufkosten CHF 5'000'000'."))

add("E03", CAT_E, "Per occurrence vs annual aggregate — which figure to compare",
    "Basis of each amount.",
    "Profile `amountBasis` (default: prefer annual aggregate when both exist, Q12). If only per-occurrence is stated → use it and flag `basis=PER_OCCURRENCE_ONLY` (secondary AGGREGATE_BASIS not earned).",
    "INFO", "INFO", "AGGREGATE_BASIS",
    "Limits are stated per occurrence only; no annual aggregate is evidenced.",
    "Please state the annual aggregate limit.",
    cues={"en": ["per occurrence", "any one occurrence", "any one claim", "each and every loss", "in the aggregate", "annual aggregate", "per policy year"],
          "fr": ["par sinistre", "par année d'assurance", "par an"], "de": ["je Versicherungsfall", "je Schadenereignis", "je Versicherungsjahr", "Jahreshöchstentschädigung", "Jahresmaximierung", "-fach maximiert"],
          "es": ["por siniestro", "por anualidad", "agregado anual"], "it": ["per sinistro", "per anno", "e.e.l.", "a.a.", "in aggregato annuo"]})

add("E04", CAT_E, "'5,000,000 / 10,000,000' = per claim / aggregate",
    "Two figures separated by a slash or 'and'.",
    "First = per claim, second = annual aggregate (DE/FR convention). Do not read as a range.",
    "INFO", "INFO", "AGGREGATE_BASIS",
    "Limit {perClaim} per claim / {aggregate} per year.",
    "—",
    example=S("sample 09", "'5.000.000 / 10.000.000 EUR'."))

add("E05", CAT_E, "German 'x-fach maximiert' (maximisation multiplier)",
    "'2-fach maximiert' = annual aggregate is twice the per-claim limit.",
    "Compute aggregate = multiplier × per-claim. Record the multiplier.",
    "INFO", "INFO", "AGGREGATE_BASIS",
    "Annual aggregate = {multiplier} × per-claim limit.",
    "—",
    cues={"de": ["2-fach maximiert", "zweifach maximiert", "Maximierung", "Jahreshöchstleistung"]},
    example=SYN("'Deckungssumme 10 Mio. EUR je Versicherungsfall, 2-fach maximiert'."))

add("E06", CAT_E, "Limit 'inclusive of defence costs' / 'costs inclusive'",
    "Whether defence costs erode the limit.",
    "Common in US/UK/IN forms. Weaker than 'in addition'. INFO; expert may care.",
    "INFO", "INFO", "PRODUCT_LIABILITY",
    "Defence costs are included within the limit.",
    "—",
    cues={"en": ["costs inclusive", "inclusive of defence costs", "defense costs within limits"], "fr": ["frais de défense inclus"], "de": ["einschließlich Kosten"], "it": ["spese di resistenza comprese"]})

add("E07", CAT_E, "'Included in the general limit' — inherit or not?",
    "Guarantee explicitly stated as included within the main limit, no own figure.",
    "If the wording explicitly says 'within the above limit', inherit the main limit with flag INHERITED. If it just says 'covered', do not inherit (D10).",
    "INFO", "INFO", "PRODUCT_RECALL",
    "{guarantee} is included within the {headline} limit (inherited).",
    "—",
    cues={"en": ["within the above limit", "included in the limit of indemnity", "part of"], "fr": ["inclus dans le plafond", "compris dans la garantie"],
          "de": ["im Rahmen der Deckungssumme", "innerhalb der Deckungssumme"], "es": ["dentro del límite"], "it": ["nell'ambito del massimale"]})

add("E08", CAT_E, "Very high deductible / self-insured retention",
    "Deductible vs limit.",
    "Q15 open: no points in POC. Report; flag if deductible ≥ 5 % of limit or ≥ €500k. SIR means the insured pays first.",
    "INFO", "INFO", "DEDUCTIBLE",
    "Deductible of {amount} per claim ({pct} of the limit).",
    "—",
    cues={"en": ["deductible", "excess", "self-insured retention", "SIR", "retention"], "fr": ["franchise"], "de": ["Selbstbehalt", "Selbstbeteiligung", "SB"], "es": ["franquicia"], "it": ["franchigia", "scoperto"]},
    example=S("sample 01", "'claims paid in excess of the SIR'."))

add("E09", CAT_E, "Deductible expressed as a percentage ('scoperto')",
    "Italian 'scoperto 10 % con il minimo di…'.",
    "Record pct + minimum + maximum. INFO.",
    "INFO", "INFO", "DEDUCTIBLE",
    "Deductible: {pct} of each loss, minimum {min}.",
    "—",
    cues={"it": ["scoperto", "con il minimo di", "con il massimo di"], "es": ["franquicia del", "% del siniestro"]})

add("E10", CAT_E, "Foreign currency — convert at ECB rate of the reference date",
    "USD, CHF, GBP, INR, PLN, CZK, HUF, RON, TRY, BRL, MXN, CNY, JPY, KRW…",
    "Convert once, persist rate + date (Q28-29). Show original and EUR. Near-threshold results within ±3 % → REVIEW (FX drift).",
    "INFO", "INFO", "FX",
    "{amountOriginal} converted to {amountEur} at ECB rate {rate} on {date}.",
    "—",
    example=S("sample 01", "USD 5,000,000 → ≈ €4.6M (April 2025)."))

add("E11", CAT_E, "Indian lakh / crore notation",
    "'Rs. 100 Cr', '1,00,00,00,000', 'INR 10 Lakhs'.",
    "1 lakh = 100,000; 1 crore = 10,000,000. Indian digit grouping (2-2-3). Parse before converting.",
    "INFO", "INFO", "FX",
    "Amount stated in crore/lakh notation ({amountOriginal}).",
    "—",
    cues={"en": ["crore", "Cr", "lakh", "lac", "Rs.", "INR"]},
    example=S("sample 05", "'INR 1,00,00,00,000' = INR 1 billion."))

add("E12", CAT_E, "European vs Anglo-Saxon thousand/decimal separators",
    "'1.000.000,00' vs '1,000,000.00'; Swiss '1'000'000'; French '1 000 000'.",
    "Parse per locale of the document, never by global regex. Sanity check: PL limits < 10,000 are almost certainly mis-parsed.",
    "INFO", "INFO", "AMOUNT_PARSING",
    "—", "—",
    example=S("samples 03, 09", "CHF 20'000'000 ; 5.000.000 EUR."))

add("E13", CAT_E, "Abbreviations: Mio., M€, k€, Mn, MM, bn, Md",
    "Scale words and symbols.",
    "Mio./M/Mn/MM = 10^6; k/T (DE 'TEUR') = 10^3; bn/Md/Mrd = 10^9. Currency may precede or follow.",
    "INFO", "INFO", "AMOUNT_PARSING",
    "—", "—",
    cues={"de": ["Mio.", "TEUR", "Mrd."], "fr": ["M€", "k€", "Md€"], "en": ["Mn", "MM", "bn"], "it": ["Mln", "Mld"], "es": ["MM", "millones"]},
    example=S("sample 08", "'5 Mio. EUR'."))

add("E14", CAT_E, "Amount written in words differs from figures",
    "'Five million' vs '5.000.000' vs '500.000'.",
    "Words prevail legally; flag mismatch → review.",
    "MINOR", "REVIEW", "AMOUNT_PARSING",
    "The amount in words ({words}) differs from the figure ({figure}).",
    "Please confirm the correct limit.",
    example=SYN("'EUR 5.000.000 (cinq cent mille euros)'."))

add("E15", CAT_E, "Per-guarantee sub-limit table with 'per claim / per year' columns",
    "Tabular certificates (IT, ES).",
    "Extract row × column faithfully; keep basis per cell.",
    "INFO", "INFO", "AMOUNT_PARSING",
    "—", "—",
    example=S("sample 10", "Italian table 'per sinistro / per anno'."))

add("E16", CAT_E, "Capacity share applied to limits",
    "Co-insurer's % share.",
    "Effective limit carried by the signing insurer = share × limit; but FORVIA needs 100 % evidenced (B11). Do not silently scale the limit: show both.",
    "BLOCKING", "NO_GO_STRUCTURAL", "COINSURANCE_COMPLETE",
    "Only {share} of the {limit} limit is carried by the signing insurer.",
    "Please provide evidence for the full limit from all co-insurers.",
    example=S("sample 05", "20 % of INR 1bn."))

add("E17", CAT_E, "Limit shared across several guarantees and insureds (aggregate erosion)",
    "One aggregate for GL + PL + recall + 16 companies.",
    "Compliant on paper, weaker in practice. INFO with explicit statement.",
    "INFO", "INFO", "AGGREGATE_BASIS",
    "A single annual aggregate is shared across guarantees and insured companies.",
    "—",
    example=S("sample 07", ""))

add("E18", CAT_E, "Sub-limit for USA/Canada lower than main limit",
    "Separate reduced limit for North America.",
    "Record both; USA/Canada secondary criterion earned only if ≥ profile `usaCanadaMin` (default: presence).",
    "INFO", "SECONDARY", "TERRITORY_USA_CANADA",
    "USA/Canada cover is limited to {amount} (main limit {headline}).",
    "—",
    cues={"en": ["USA/Canada sublimit", "North America limit"], "de": ["USA/Kanada Sublimit"], "fr": ["sous-limite USA/Canada"]},
    example=SYN("'Worldwide €20M; USA/Canada €5M'."))

add("E19", CAT_E, "Primary + excess / umbrella layers",
    "Two documents or two lines: primary €5M + excess €15M.",
    "Sum only if the excess certificate names the same insured, the same underlying policy and period. Otherwise treat separately.",
    "INFO", "REVIEW", "PRODUCT_LIABILITY",
    "Primary {primary} plus excess layer {excess} = {total} (tower evidenced).",
    "Please provide the excess/umbrella certificate referencing the primary policy.",
    cues={"en": ["excess of", "umbrella", "excess layer", "in excess of primary"], "fr": ["en excédent de", "ligne excédentaire"], "de": ["Exzedent", "Excedenten", "Umbrella"], "es": ["en exceso de"], "it": ["in eccesso a", "secondo rischio"]},
    example=SYN("'Excess Liability €15,000,000 xs €5,000,000 primary (Policy 123)'."))

add("E20", CAT_E, "Amount threshold exactly at the limit after FX rounding",
    "€19.97M after conversion vs €20M threshold.",
    "Binary rule says BELOW_MINIMUM; route to REVIEW when within ±3 % of threshold and the original currency ≠ EUR.",
    "MINOR", "REVIEW", "FX",
    "The converted amount ({amountEur}) is within 3 % of the threshold due to exchange rate.",
    "—",
    example=SYN("USD 22,000,000 → €19,850,000."))

add("E21", CAT_E, "Unlimited / 'no limit' / 'illimité' statements",
    "Some jurisdictions (e.g. motor) state unlimited; rare in PL.",
    "Treat as COMPLIANT with flag UNLIMITED; verify not a parsing error.",
    "INFO", "OK", "PRODUCT_LIABILITY",
    "Limit stated as unlimited.",
    "—",
    cues={"en": ["unlimited", "no limit"], "fr": ["illimité", "sans limitation de somme"], "de": ["unbegrenzt"], "es": ["ilimitado"], "it": ["illimitato"]})

add("E22", CAT_E, "Limit expressed per person / per property (BI/PD split)",
    "Separate limits for bodily injury and property damage.",
    "Product liability for FORVIA is mainly PD + financial. Use the PD figure (or combined if stated); record the split.",
    "INFO", "INFO", "PRODUCT_LIABILITY",
    "Limits are split: bodily injury {bi}, property damage {pd}.",
    "—",
    cues={"en": ["bodily injury", "property damage", "BI/PD"], "fr": ["dommages corporels", "dommages matériels"], "de": ["Personenschäden", "Sachschäden"], "es": ["daños personales", "daños materiales"], "it": ["danni a persone", "danni a cose"]},
    example=S("sample 04", "Separate lines for corporels / matériels / immatériels."))

add("E23", CAT_E, "Recall limit stated per 'campaign' or per 'recall event'",
    "Non-standard basis.",
    "Map as per occurrence; note basis.",
    "INFO", "INFO", "PRODUCT_RECALL",
    "Recall limit is per recall campaign.",
    "—",
    cues={"en": ["per recall", "per campaign"], "de": ["je Rückrufaktion"], "fr": ["par campagne de rappel"]})

add("E24", CAT_E, "Small 'typical' sub-limits that are NOT critical",
    "Pollution €500k–1M, goods in custody, keys, tenants' liability.",
    "Do not let many small sub-limits trigger alarms. Only the three critical guarantees are thresholded.",
    "INFO", "INFO", "OTHER",
    "—", "—",
    example=S("sample 04", "'Atteintes à l'environnement 500 000 €' (Richard: 'a bit low' but secondary)."))

add("E25", CAT_E, "Limit conditional on a clause ('subject to', 'provided that')",
    "Conditions attached to the figure.",
    "Extract the condition verbatim; route to review.",
    "MINOR", "REVIEW", "PRODUCT_LIABILITY",
    "The limit is conditional: \"{condition}\".",
    "Please clarify the condition attached to the limit.",
    cues={"en": ["subject to", "provided that", "conditional upon"], "fr": ["sous réserve", "à condition que"], "de": ["vorbehaltlich", "unter der Voraussetzung"], "it": ["a condizione che"]})

# ─────────────────────────────────────────────────────────────────────────────
# F — EXCLUSIONS, TRIGGER & TERRITORY
# ─────────────────────────────────────────────────────────────────────────────
CAT_F = "F. Exclusions, trigger & territory"

add("F01", CAT_F, "USA / Canada excluded",
    "Territorial scope excludes North America.",
    "Red flag for an automotive supplier (exports, OEM plants in US/MX). Critical exclusion → −10 points; expert may escalate. Not blocking under GPTC default (Q16 open).",
    "MAJOR", "PENALTY", "TERRITORY_USA_CANADA",
    "Cover excludes claims in USA/Canada.",
    "Please confirm whether USA/Canada cover can be added (extension and limit).",
    cues={"en": ["excluding USA/Canada", "excluding North America", "worldwide excluding", "except USA"],
          "fr": ["hors USA/Canada", "à l'exclusion des USA", "monde entier sauf"], "de": ["ohne USA/Kanada", "ausgenommen USA/Kanada", "weltweit ohne"],
          "es": ["excepto EE.UU. y Canadá"], "it": ["esclusi USA e Canada", "mondo intero esclusi"]},
    example=S("sample 04", "'Monde entier hors USA/Canada'."))

add("F02", CAT_F, "Territory limited to Europe / home country",
    "'Europe only', 'territoire national', 'Deutschland'.",
    "Same family as F01, more severe in practice. Penalty; show scope.",
    "MAJOR", "PENALTY", "TERRITORY_USA_CANADA",
    "Territorial scope is limited to {territory}.",
    "Please confirm worldwide cover (FORVIA plants and customers worldwide).",
    cues={"en": ["Europe only", "EU/EEA", "territory of"], "fr": ["France métropolitaine", "Union européenne", "territoire national"], "de": ["Europa", "Deutschland", "örtlicher Geltungsbereich: Europa"], "es": ["territorio español", "Unión Europea"], "it": ["Italia", "Unione Europea"]})

add("F03", CAT_F, "Claims-made trigger",
    "Occurrence vs claims-made.",
    "Claims-made is weaker for a buyer (cover ends when the policy ends, unless run-off). −5 points; show retroactive date (F04).",
    "MINOR", "PENALTY", "TRIGGER",
    "Policy is written on a claims-made basis.",
    "Please confirm the retroactive date and any extended reporting period.",
    cues={"en": ["claims made", "claims-made", "claims first made", "reported during the policy period"], "fr": ["base réclamation", "réclamation"], "de": ["Claims-made", "Anspruchserhebung"], "es": ["claims made", "base reclamación"], "it": ["claims made", "in base alla richiesta di risarcimento"]},
    example=S("sample 05", "'Claims made basis'."))

add("F04", CAT_F, "Retroactive date / extended reporting period",
    "Dates attached to claims-made.",
    "Retroactive date after the start of supply = gap. Review when retroactive date > FORVIA relationship start.",
    "MINOR", "REVIEW", "TRIGGER",
    "Retroactive date {date}; extended reporting period {erp}.",
    "—",
    cues={"en": ["retroactive date", "extended reporting period", "ERP", "tail"], "fr": ["date de reprise du passé", "garantie subséquente"], "de": ["Rückwärtsversicherung", "Nachhaftung", "Nachmeldefrist"], "it": ["retroattività", "postuma"], "es": ["retroactividad", "periodo adicional de notificación"]})

add("F05", CAT_F, "Exclusion of automotive safety-critical components",
    "Brakes, steering, airbags, seatbelts, tyres, fuel systems excluded.",
    "Fatal for a Tier-2 automotive supplier: the parts FORVIA buys may be exactly those. Critical exclusion → −10; expert: block. Flag `criticalExclusion=AUTOMOTIVE_PARTS`.",
    "MAJOR", "PENALTY", "CRITICAL_EXCLUSION",
    "The policy excludes safety-critical automotive components ({list}).",
    "Please confirm that the parts supplied to FORVIA are not within the excluded categories, or obtain removal of the exclusion.",
    cues={"en": ["brakes", "steering", "airbags", "seat belts", "tyres", "safety critical", "critical automobile parts", "automotive parts exclusion"],
          "fr": ["pièces de sécurité", "freinage", "direction"], "de": ["sicherheitsrelevante Teile", "Bremsen", "Lenkung", "Airbags"]},
    example=S("sample 05", "'Excluding: automobile critical parts – steering, brakes, tyres, seat belts, airbags…'"))

add("F06", CAT_F, "Exclusion of products for the automotive / aerospace industry",
    "Industry-wide exclusion.",
    "If automotive is excluded, the certificate is useless for FORVIA — treat as product liability MISSING. Aerospace exclusion is INFO.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_LIABILITY",
    "Products supplied to the automotive industry are excluded.",
    "Please provide cover that includes products supplied to the automotive industry.",
    cues={"en": ["automotive industry excluded", "aviation", "aerospace", "aircraft products"], "fr": ["industrie automobile exclue", "aéronautique"], "de": ["Kfz-Industrie ausgeschlossen", "Luftfahrt"], "it": ["settore automotive escluso", "aeronautico"]})

add("F07", CAT_F, "Pure financial loss explicitly excluded",
    "Exclusion clause for financial loss.",
    "Contradicts any PFL line → PFL = EXCLUDED (worse than missing).",
    "MAJOR", "REQUEST_CHANGES", "PURE_FINANCIAL_LOSS",
    "Pure financial loss is expressly excluded.",
    "Please obtain an endorsement covering pure financial loss (≥ €15M).",
    cues={"en": ["excluding pure financial loss", "financial loss excluded"], "fr": ["dommages immatériels non consécutifs exclus", "exclusion des pertes financières"], "de": ["Vermögensschäden ausgeschlossen", "ohne Vermögensschäden"], "it": ["esclusi i danni patrimoniali puri"]})

add("F08", CAT_F, "Recall excluded",
    "Exclusion clause for recall/withdrawal.",
    "PRODUCT_RECALL = EXCLUDED.",
    "MAJOR", "REQUEST_CHANGES", "PRODUCT_RECALL",
    "Recall costs are expressly excluded.",
    "Please obtain recall cover (≥ €15M).",
    cues={"en": ["recall excluded", "excluding recall expenses"], "fr": ["frais de rappel exclus"], "de": ["Rückrufkosten ausgeschlossen", "ohne Rückruf"], "it": ["esclusi i costi di ritiro"], "es": ["excluidos gastos de retirada"]})

add("F09", CAT_F, "Contractual liability exclusion",
    "'Liability assumed under contract' excluded.",
    "Standard in most wordings (liability beyond law). Not critical per se, but FORVIA GPTC are contractual obligations. INFO; expert review if broad.",
    "INFO", "INFO", "EXCLUSION",
    "Standard contractual liability exclusion noted.",
    "—",
    cues={"en": ["contractual liability", "liability assumed under contract"], "fr": ["responsabilité contractuelle au-delà", "engagements contractuels"], "de": ["vertragliche Haftung über die gesetzliche hinaus"], "it": ["responsabilità contrattuale"]})

add("F10", CAT_F, "Product efficacy / failure-to-perform exclusion",
    "Product does not do what it should, without damage.",
    "Standard; the gap is covered by PFL in part. INFO.",
    "INFO", "INFO", "EXCLUSION",
    "Efficacy exclusion noted (standard).",
    "—",
    cues={"en": ["efficacy", "failure to perform", "fitness for purpose"], "de": ["Erfüllungsansprüche", "Nachbesserung"], "fr": ["défaut de performance", "inexécution"]})

add("F11", CAT_F, "Known circumstances / prior claims exclusion",
    "Standard clause.",
    "INFO.",
    "INFO", "INFO", "EXCLUSION", "Known circumstances exclusion noted (standard).", "—",
    cues={"en": ["known circumstances", "prior claims"], "fr": ["sinistres connus"], "de": ["bekannte Umstände"]})

add("F12", CAT_F, "Sanctions, war, terrorism, nuclear, asbestos exclusions",
    "Market-standard exclusions.",
    "Never penalise. INFO only. Do not list them in the supplier email.",
    "INFO", "INFO", "EXCLUSION", "Market-standard exclusions noted.", "—",
    cues={"en": ["sanctions", "war", "terrorism", "nuclear", "asbestos", "radioactive"], "fr": ["sanctions", "guerre", "terrorisme", "nucléaire", "amiante"],
          "de": ["Sanktionsklausel", "Krieg", "Terror", "Kernenergie", "Asbest"], "es": ["sanciones", "guerra", "terrorismo", "nuclear", "amianto"], "it": ["sanzioni", "guerra", "terrorismo", "nucleare", "amianto"]})

add("F13", CAT_F, "Cyber / data exclusion",
    "Cyber exclusion on liability policies (LMA5400 style).",
    "INFO for parts; relevant if the supplier delivers software/ECUs — flag `softwareSupplier` in Ariba data if available.",
    "INFO", "INFO", "EXCLUSION", "Cyber exclusion noted.", "—",
    cues={"en": ["cyber", "data", "electronic data", "software"], "de": ["Cyber", "Daten"], "fr": ["cyber", "données"]})

add("F14", CAT_F, "Punitive / exemplary damages excluded",
    "US-style damages.",
    "Common, low impact. INFO.",
    "INFO", "INFO", "EXCLUSION", "Punitive damages exclusion noted.", "—",
    cues={"en": ["punitive", "exemplary damages"], "fr": ["dommages punitifs"], "de": ["Strafschadenersatz", "punitive damages"]})

add("F15", CAT_F, "Exclusion of recall ordered by authority vs voluntary",
    "Scope of recall trigger.",
    "If only authority-ordered recalls are covered, OEM-initiated recalls (the common case) are not. Review.",
    "MAJOR", "REVIEW", "PRODUCT_RECALL",
    "Recall cover applies only to recalls ordered by an authority.",
    "Please confirm that customer-initiated (voluntary) recalls are covered.",
    cues={"en": ["ordered by a government authority", "mandatory recall only", "voluntary recall"], "de": ["behördlich angeordnet", "freiwilliger Rückruf"], "fr": ["rappel ordonné par une autorité", "rappel volontaire"]})

add("F16", CAT_F, "Exclusion of pure financial loss from 'loss of use'",
    "US forms: 'loss of use of tangible property not physically injured' sub-clause.",
    "Partial PFL via 'loss of use' exception; never count it as €15M PFL. UNCLEAR → review.",
    "MINOR", "REVIEW", "PURE_FINANCIAL_LOSS",
    "Only limited 'loss of use' cover is evidenced; it does not equate to pure financial loss cover.",
    "Please confirm explicit pure financial loss cover.",
    cues={"en": ["loss of use", "impaired property"]})

add("F17", CAT_F, "Exclusion of damage to the insured's own product / work",
    "'Damage to your product', 'Eigenschaden'.",
    "Standard; recall/dismantling covers the gap partly. INFO.",
    "INFO", "INFO", "EXCLUSION", "Own-product damage exclusion noted (standard).", "—",
    cues={"en": ["damage to your product", "your work"], "de": ["Eigenschäden", "Schäden am eigenen Produkt"], "fr": ["dommages au produit livré lui-même"]})

add("F18", CAT_F, "Jurisdiction clause (courts) vs territory",
    "Where claims may be brought vs where damage occurs.",
    "Distinguish 'territorial scope' (damage location) from 'jurisdiction' (court). A 'worldwide except US courts' clause is a USA exclusion in disguise.",
    "MAJOR", "PENALTY", "TERRITORY_USA_CANADA",
    "Claims brought before USA/Canada courts are excluded (jurisdiction clause).",
    "Please confirm whether USA/Canada jurisdiction can be included.",
    cues={"en": ["jurisdiction", "courts of", "judgments rendered in"], "fr": ["juridiction", "tribunaux"], "de": ["Gerichtsstand", "Ansprüche vor Gerichten"], "it": ["giurisdizione"]})

# ─────────────────────────────────────────────────────────────────────────────
# G — PERIOD & TIMING
# ─────────────────────────────────────────────────────────────────────────────
CAT_G = "G. Period & timing"

add("G01", CAT_G, "Certificate expired at reference date",
    "period.to < referenceDate.",
    "Structural block. Demo clock = 2025-04-15 (samples are 2024-25 certificates).",
    "BLOCKING", "NO_GO_STRUCTURAL", "NOT_EXPIRED",
    "The certificate expired on {dateTo}.",
    "Please provide the current certificate.",
    example=SYN("Period 01/01/2024 – 31/12/2024, received 15/04/2025."))

add("G02", CAT_G, "Expires within the renewal window (e.g. < 60 days)",
    "period.to − referenceDate < profile `renewalWindowDays`.",
    "Not a defect, but schedule a reminder / request renewal now. INFO + task.",
    "INFO", "INFO", "NOT_EXPIRED",
    "The certificate expires in {days} days.",
    "Please send the renewed certificate as soon as available.",
    example=S("sample 03", "Swiss certificate with end-of-year expiry."))

add("G03", CAT_G, "Period starts in the future",
    "period.from > referenceDate.",
    "Cover not yet in force today (renewal certificate sent early). Accept if gap ≤ 30 days and a current certificate exists; else review.",
    "MINOR", "REVIEW", "DATES_PRESENT",
    "The cover starts on {dateFrom}, after the reference date.",
    "Please also provide the certificate for the current period.",
    example=SYN("Received 20 Nov 2025, period 01/01/2026 – 31/12/2026."))

add("G04", CAT_G, "Period shorter than 12 months / short-term policy",
    "Duration.",
    "Unusual; may indicate a project policy. INFO.",
    "INFO", "INFO", "DATES_PRESENT", "Policy period is {months} months.", "—")

add("G05", CAT_G, "Only 'valid until further notice' / tacit renewal, no end date",
    "Open-ended statements.",
    "DE/FR: 'verlängert sich stillschweigend'. Need a validity date for the certificate itself. If the certificate states its own validity (e.g. 'valid until 31/12/2025') use it; otherwise DATES_PRESENT → review.",
    "MINOR", "REVIEW", "DATES_PRESENT",
    "No end date is stated; the certificate refers to tacit renewal.",
    "Please state the current insurance period (from / to).",
    cues={"en": ["until further notice", "tacitly renewed", "automatically renewed"], "fr": ["tacite reconduction", "jusqu'à dénonciation"],
          "de": ["verlängert sich stillschweigend", "bis auf Weiteres"], "es": ["prórroga tácita"], "it": ["tacito rinnovo"]},
    example=S("sample 02", "German tacit-renewal wording alongside the period."))

add("G06", CAT_G, "Issue date much older than the period / stale certificate",
    "issueDate < referenceDate − 12 months.",
    "Even if the period is still open, an old certificate may not reflect mid-term changes. INFO; expert option to require ≤ 12-month-old certificates.",
    "INFO", "INFO", "DATES_PRESENT", "Certificate issued {months} months ago.", "—")

add("G07", CAT_G, "Issue date after the start of the period (normal) vs before (check)",
    "Consistency of issue date.",
    "Issuing after inception is normal. Issued before the policy even existed → review.",
    "MINOR", "REVIEW", "DATES_PRESENT", "The issue date precedes the policy inception by {days} days.", "—")

add("G08", CAT_G, "Date format ambiguity (DD/MM vs MM/DD)",
    "'04/08/2025'.",
    "Resolve by document locale/language; if both readings are plausible and change the expiry verdict → review.",
    "MINOR", "REVIEW", "DATES_PRESENT", "The date format is ambiguous.", "—",
    example=S("sample 05", "Indian document with US-style dates."))

add("G09", CAT_G, "Cancellation clause ('may be cancelled at any time')",
    "Standard notice clause.",
    "Normal. INFO. Some certificates promise notice to the certificate holder — positive.",
    "INFO", "INFO", "—", "Cancellation notice clause noted.", "—",
    cues={"en": ["cancelled", "notice of cancellation", "30 days notice"], "fr": ["résiliation", "préavis"], "de": ["Kündigung", "Kündigungsfrist"]})

# ─────────────────────────────────────────────────────────────────────────────
# H — CONSISTENCY & DATA QUALITY
# ─────────────────────────────────────────────────────────────────────────────
CAT_H = "H. Consistency & data quality"

add("H01", CAT_H, "Bilingual certificate: figures differ between languages",
    "FR/EN or DE/EN columns.",
    "Extract both; if they differ → review; the original-language version usually prevails (check 'prevailing language' clause).",
    "MINOR", "REVIEW", "AMOUNT_PARSING", "The two language versions state different figures.", "Please confirm the correct limits.",
    example=S("samples 01, 07", "Bilingual layouts."))

add("H02", CAT_H, "Summary table vs narrative text disagree",
    "Same guarantee, two amounts.",
    "Review; prefer the more specific statement; show both.",
    "MINOR", "REVIEW", "AMOUNT_PARSING", "The summary table and the text state different amounts for {guarantee}.", "Please confirm the applicable limit.")

add("H03", CAT_H, "Text layer garbled / absent → OCR fallback",
    "Text extraction yields noise or nothing.",
    "Run OCR (tesseract) and vision extraction; lower IAS; route to review if critical fields < 0.6.",
    "MINOR", "REVIEW", "IAS", "The PDF text layer was unusable; values were read by OCR and may need confirmation.", "—",
    example=S("sample 06 (Zurich ES / COPO)", "Corrupted text layer."))

add("H04", CAT_H, "Low-resolution or skewed scan",
    "Image quality.",
    "Deskew, upscale; lower confidence. If signature/stamp zones unreadable → formal gates to review.",
    "MINOR", "REVIEW", "IAS", "Scan quality is low; some values have reduced confidence.", "Please upload a higher-quality scan.",
    example=S("sample 04", "Scanned certificate."))

add("H05", CAT_H, "Handwritten amendments on a printed certificate",
    "Ink corrections.",
    "Suspicious unless initialled and stamped. Review.",
    "MAJOR", "REVIEW", "STAMP_PRESENT", "The certificate contains handwritten amendments.", "Please provide a clean re-issued certificate.")

add("H06", CAT_H, "Page missing ('page 2 of 3' but 2 pages)",
    "Page numbering.",
    "Incomplete document → review (sub-limits often on the last page).",
    "MAJOR", "REVIEW", "DOCUMENT_IS_CERTIFICATE", "The document appears incomplete ({have} of {total} pages).", "Please upload the complete certificate.")

add("H07", CAT_H, "Insured name spelled differently across pages",
    "Cross-page consistency.",
    "Minor typos → ignore; different entities → review.",
    "MINOR", "REVIEW", "ENTITY_MATCH", "The insured name varies across pages.", "Please confirm the legal name of the insured.")

add("H08", CAT_H, "Personal data present (names, emails, phone numbers)",
    "GDPR hygiene.",
    "Mask in exports, logs and emails; keep in the stored document. Not a defect.",

    "INFO", "INFO", "GDPR", "Personal data detected and masked in exports.", "—",
    example=S("sample 09", "Insurer employee's direct email on the cover letter."))

add("H09", CAT_H, "Multiple currencies on one certificate",
    "E.g. limits in EUR, deductible in CHF.",
    "Convert each with its own currency; never assume one currency per document.",
    "INFO", "INFO", "FX", "The certificate uses several currencies.", "—")

add("H10", CAT_H, "Language not in the supported set / mixed scripts",
    "E.g. Turkish, Polish, Chinese certificates.",
    "Extraction still attempted (LLM multilingual); IAS lowered; route to review if < 0.75.",
    "MINOR", "REVIEW", "IAS", "Document language ({lang}) has limited validation coverage; values should be confirmed.", "—")

add("H11", CAT_H, "Certificate for the right supplier but the wrong FORVIA request (duplicate / re-upload)",
    "Same file hash already analysed.",
    "Deduplicate by hash; link to the previous analysis; do not re-bill the LLM.",
    "INFO", "INFO", "—", "This document was already analysed on {date}.", "—")

# ─────────────────────────────────────────────────────────────────────────────
# Generation
# ─────────────────────────────────────────────────────────────────────────────
def main():
    out_json = ROOT / "data" / "checks" / "check_catalogue.json"
    out_md = ROOT / "docs" / "11_check_catalogue.md"
    out_json.parent.mkdir(parents=True, exist_ok=True)

    ids = [e["id"] for e in C]
    assert len(ids) == len(set(ids)), "duplicate ids"

    payload = {
        "version": "1.0.0",
        "generatedAt": datetime.date.today().isoformat(),
        "generatedBy": "tools/build_check_catalogue.py",
        "outcomeVocabulary": ["NO_GO_STRUCTURAL", "NO_GO_FORMAL", "REQUEST_CHANGES", "PENALTY", "SECONDARY", "REVIEW", "INFO", "OK"],
        "severityVocabulary": ["BLOCKING", "MAJOR", "MINOR", "INFO"],
        "count": len(C),
        "checks": C,
    }
    out_json.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    # Markdown
    cats = []
    for e in C:
        if e["category"] not in cats:
            cats.append(e["category"])
    lines = []
    lines.append("# 11 — Check catalogue: the big list of cases the POC must recognise\n")
    lines.append(f"_{len(C)} checks · generated from `tools/build_check_catalogue.py` → `data/checks/check_catalogue.json` (v{payload['version']}). Edit the script, not this file._\n")
    lines.append("This catalogue answers the question **\"what exactly should the AI look for, and what does it mean when it finds it?\"** "
                 "It extends the 13 blocking gates and the 3 thresholds of `docs/04_scoring_rules.md` with every concrete situation we expect "
                 "in FORVIA's 5,000–8,000 certificates a year. Each check carries: what to verify, multilingual cues (EN/FR/DE/ES/IT), how to read it, "
                 "the outcome in the decision model, an example (real sample when available), the English explanation template and the fix "
                 "to ask the supplier for.\n")
    lines.append("## How it is used\n")
    lines.append("- **Prompts** — `prompts/02_extract.md` injects the cue lists for categories D–F so the extractor labels guarantees, sub-limits and exclusions faithfully; "
                 "`prompts/04_explain.md` uses `explain` / `fix` templates so every finding is worded consistently.\n"
                 "- **Rules engine** — each check has a `ruleRef` (gate id, guarantee code or helper); `packages/rules` emits findings with `checkId` so the UI can show the catalogue card.\n"
                 "- **Dashboard** — the Findings tab displays `title` + filled `explain`; the supplier email is built from `fix` lines of REQUEST_CHANGES / NO_GO findings.\n"
                 "- **Eval** — `tools/eval` reports which checks fired on the 10 samples vs `ground_truth.json` expectations.\n")
    lines.append("## Outcome vocabulary\n")
    lines.append("| Outcome | Meaning |\n|---|---|\n| `NO_GO_STRUCTURAL` | Blocking; the document itself is wrong (nature, issuer, entity, expiry). Supplier must send another document. |\n"
                 "| `NO_GO_FORMAL` | Blocking; same certificate can be re-issued with the missing formality (stamp, signature, policy number, entity added). UI: *Not admissible · resubmit*. |\n"
                 "| `REQUEST_CHANGES` | Critical guarantee missing / below threshold / unverifiable → endorsement needed. |\n"
                 "| `PENALTY` | Risk Score penalty (critical exclusions −10 each, cap −20; claims-made −5). |\n"
                 "| `SECONDARY` | Secondary criterion (5 pts each). |\n| `REVIEW` | Ambiguous → human review queue. |\n| `INFO` | Recorded and displayed, no effect. |\n| `OK` | Positive signal. |\n")
    lines.append("## Summary by category\n")
    lines.append("| Category | Checks | Blocking | Major | Minor | Info |\n|---|---|---|---|---|---|")
    for c in cats:
        es = [e for e in C if e["category"] == c]
        cnt = lambda s: sum(1 for e in es if e["severity"] == s)
        lines.append(f"| {c} | {len(es)} | {cnt('BLOCKING')} | {cnt('MAJOR')} | {cnt('MINOR')} | {cnt('INFO')} |")
    lines.append("")
    lines.append("## Quick index\n")
    lines.append("| id | Check | Severity | Outcome | Rule ref |\n|---|---|---|---|---|")
    for e in C:
        lines.append(f"| {e['id']} | {e['title']} | {e['severity']} | `{e['outcome']}` | `{e['ruleRef']}` |")
    lines.append("")
    for c in cats:
        lines.append(f"\n## {c}\n")
        for e in [x for x in C if x["category"] == c]:
            lines.append(f"### {e['id']} — {e['title']}\n")
            lines.append(f"**Severity** {e['severity']} · **Outcome** `{e['outcome']}` · **Rule ref** `{e['ruleRef']}`\n")
            lines.append(f"- **Check:** {e['check']}")
            lines.append(f"- **How to read it:** {e['reading']}")
            if e["cues"]:
                cue_str = " · ".join(f"**{k.upper()}** {', '.join(v)}" for k, v in e["cues"].items())
                lines.append(f"- **Cues:** {cue_str}")
            if e["example"]:
                src = e["example"].get("source", "")
                txt = e["example"].get("text", "")
                lines.append(f"- **Example ({src}):** {txt}" if txt else f"- **Example:** {src}")
            if e["explain"] and e["explain"] != "—":
                lines.append(f"- **Explain (EN):** {e['explain']}")
            if e["fix"] and e["fix"] != "—":
                lines.append(f"- **Fix to request:** {e['fix']}")
            lines.append("")
    lines.append("\n## Coverage of the 10 seed samples\n")
    lines.append("| Sample | Checks that fire (expected) |\n|---|---|")
    sample_map = {
        "01 Chubb / Air Products": "B14 (disclaimer), D05 (DINC only 200k), D10 (recall 'Covered' no amount), D12 (CSL), E08 (SIR), E10 (USD→EUR), H01 (bilingual)",
        "02 Generali DE / Scherdel": "B01 (no stamp), D01 (recall-only), D13 (Kfz-Rückruf), G05 (tacit renewal wording)",
        "03 Swiss Mobiliar / Ekko-Meister": "B01 (no stamp), D12 (CSL CHF 20M), E02 (recall sub-limit 5M), E10 (CHF), E12 (Swiss separators), G02 (expiry window)",
        "04 Marron & Associés / MTS": "B05 (broker/agent issuer), D03 (withdrawal ≠ recall), D16 ('RC professionnelle' label), E01 (305k under 10M), E22 (BI/PD split), E24 (pollution 500k secondary), F01 (USA/Canada excluded), H04 (scan)",
        "05 ICICI Lombard / Naxnova": "A01 (quote), B02 (unsigned), B11/E16 (capacity 20%), D17 (irrelevant lines), E11 (INR crore), F03 (claims-made), F05 (critical auto parts excluded), G08 (date format)",
        "06 Zurich ES / COPO": "B04 (unnamed signature), C04 (FORVIA additional insured), D02 partially (recall 4M < 15M), D04 (PFL missing), H03 (garbled text layer)",
        "07 Zurich DE / IMI": "B01 (no stamp), C05/E17 (16 co-insured, shared 5M), D02 (recall missing), D04 (PFL missing), D12 (CSL), H01 (bilingual)",
        "08 Allianz AGCS / CeramTec": "B01 (no stamp), D01 (recall-only), D13 (Kfz-Rückruf 5M), E13 ('Mio.')",
        "09 Allianz / Beyer Polyvlies": "A04/A08 (cover letter + certificate), B01 (no stamp), D07 (extended PL 20M), D12 (CSL 5M/10M), D21 (USA/Canada included), E04 (5M / 10M), H08 (personal email)",
        "10 Generali IT / Metraton": "B01 (no stamp), C02 (master policy Landi Renzo), E15 (per sinistro / per anno table), D02 partially (recall 10M < 15M)",
    }
    for k, v in sample_map.items():
        lines.append(f"| {k} | {v} |")
    lines.append("\n_Expected firing lists are indicative; `ground_truth.json` remains the source of truth for decisions and scores._\n")
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(f"{len(C)} checks → {out_json.relative_to(ROOT)} and {out_md.relative_to(ROOT)}")
    from collections import Counter
    print(Counter(e["severity"] for e in C)); print(Counter(e["outcome"] for e in C))

if __name__ == "__main__":
    main()
