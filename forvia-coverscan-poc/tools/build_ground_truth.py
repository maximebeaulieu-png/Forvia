#!/usr/bin/env python3
"""
Builds data/samples/ground_truth.json from the expert annotations below and the
scoring formula specified in docs/04_scoring_rules.md (default profile FORVIA_GPTC_DEFAULT).

Run:  python3 tools/build_ground_truth.py
The TypeScript rules engine (packages/rules) must reproduce these numbers exactly.
FX rates are INDICATIVE ECB reference rates at reception date; live mode fetches real ones.
"""
import json, datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "samples" / "ground_truth.json"

PROFILE = {
    "id": "FORVIA_GPTC_DEFAULT",
    "currency": "EUR",
    "expiryWindowMonths": 10,
    "expiryWindowSeverity": "WARNING",          # Richard (Q05) said BLOCK; demo default WARNING, configurable
    "critical": {                                # amount thresholds in EUR; below → REQUEST_CHANGES
        "PRODUCT_LIABILITY": 20_000_000,
        "PRODUCT_RECALL": 15_000_000,
        "PURE_FINANCIAL_LOSS": 15_000_000,
    },
    "secondary": {                               # affect score only (and appear in request list)
        "CONSEQUENTIAL_FINANCIAL_LOSS": 1_000_000,   # to confirm with FORVIA (Richard: 500k–1M)
        "DISMANTLING_REFITTING": "PRESENT",
        "EXTENDED_PRODUCT_LIABILITY": "PRESENT",
        "TERRITORY_USA_CANADA": "PRESENT",
        "AGGREGATE_BASIS": "PRESENT",
    },
    "weights": {
        "PRODUCT_LIABILITY": 30, "PRODUCT_RECALL": 30, "PURE_FINANCIAL_LOSS": 15,
        "CONSEQUENTIAL_FINANCIAL_LOSS": 5, "DISMANTLING_REFITTING": 5,
        "EXTENDED_PRODUCT_LIABILITY": 5, "TERRITORY_USA_CANADA": 5, "AGGREGATE_BASIS": 5,
    },
    "penalties": {"CRITICAL_EXCLUSION": -10, "CRITICAL_EXCLUSION_CAP": -20, "CLAIMS_MADE": -5},
    "gates": [
        "DOCUMENT_IS_CERTIFICATE", "ISSUER_IS_INSURER", "INSURER_IDENTIFIED", "INSURER_RATING_FLOOR",
        "STAMP_PRESENT", "SIGNATURE_PRESENT", "POLICY_NUMBER_PRESENT", "DATES_PRESENT",
        "NOT_EXPIRED", "ENTITY_MATCH", "COINSURANCE_COMPLETE", "CAPTIVE_FRONTED", "FILE_FORMAT_OK",
    ],
    "formalGates": ["STAMP_PRESENT", "SIGNATURE_PRESENT", "POLICY_NUMBER_PRESENT", "ENTITY_MATCH"],
    "accuracyReviewThreshold": 0.75,
    "fieldReviewThreshold": 0.60,
}

def eur(amount, ccy, rate):  # rate = units of ccy per 1 EUR
    return round(amount / rate)

def g(code, amount=None, ccy="EUR", rate=1.0, basis=None, status=None, label=None, page=None,
      deductible=None, note=None, confidence=0.95, excluded_territories=None):
    d = {"code": code, "labelOriginal": label, "page": page, "amountOriginal": amount, "currency": ccy,
         "fxRate": rate, "amountEur": eur(amount, ccy, rate) if amount is not None else None,
         "basis": basis, "deductible": deductible, "status": status, "confidence": confidence, "note": note}
    if excluded_territories:
        d["excludedTerritories"] = excluded_territories
    return d

def score(sample):
    """Risk score per docs/04_scoring_rules.md. Returns (score, breakdown, decision)."""
    P, W = PROFILE, PROFILE["weights"]
    gates = sample["gates"]
    failed = [k for k, v in gates.items() if v == "FAIL"]
    review = [k for k, v in gates.items() if v == "REVIEW"]
    by = {x["code"]: x for x in sample["guarantees"]}
    breakdown, total = {}, 0.0
    for code, req in P["critical"].items():
        x = by.get(code)
        if x and x.get("amountEur"):
            ratio = min(x["amountEur"] / req, 1.0)
            st = "COMPLIANT" if ratio >= 1 else "BELOW_MINIMUM"
        else:
            ratio, st = 0.0, (x["status"] if x else "MISSING")
        pts = round(W[code] * ratio, 1); total += pts
        breakdown[code] = {"required": req, "found": x["amountEur"] if x else None, "status": st, "points": pts, "max": W[code]}
    # secondary
    dic = by.get("CONSEQUENTIAL_FINANCIAL_LOSS")
    r = min((dic["amountEur"] or 0) / P["secondary"]["CONSEQUENTIAL_FINANCIAL_LOSS"], 1.0) if dic and dic.get("amountEur") else (1.0 if dic and dic["status"] == "COMPLIANT" else 0.0)
    pts = round(W["CONSEQUENTIAL_FINANCIAL_LOSS"] * r, 1); total += pts
    breakdown["CONSEQUENTIAL_FINANCIAL_LOSS"] = {"required": 1_000_000, "found": dic["amountEur"] if dic else None, "status": dic["status"] if dic else "MISSING", "points": pts, "max": 5}
    for code in ("DISMANTLING_REFITTING", "EXTENDED_PRODUCT_LIABILITY"):
        x = by.get(code); ok = bool(x) and x["status"] in ("COMPLIANT", "PRESENT")
        pts = W[code] if ok else 0; total += pts
        breakdown[code] = {"required": "PRESENT", "status": (x["status"] if x else "MISSING"), "points": pts, "max": W[code]}
    terr = sample["territory"]["usaCanada"]
    pts = W["TERRITORY_USA_CANADA"] if terr == "INCLUDED" else 0; total += pts
    breakdown["TERRITORY_USA_CANADA"] = {"status": terr, "points": pts, "max": 5}
    agg = sample["basisSummary"]
    pts = W["AGGREGATE_BASIS"] if agg in ("AGGREGATE", "BOTH") else 0; total += pts
    breakdown["AGGREGATE_BASIS"] = {"status": agg, "points": pts, "max": 5}
    pen = 0
    crit_excl = [e for e in sample["exclusions"] if e["critical"]]
    pen += max(P["penalties"]["CRITICAL_EXCLUSION"] * len(crit_excl), P["penalties"]["CRITICAL_EXCLUSION_CAP"])
    if sample["trigger"] == "CLAIMS_MADE":
        pen += P["penalties"]["CLAIMS_MADE"]
    total = max(0, min(100, round(total + pen)))
    breakdown["_penalties"] = pen
    critical_ok = all(breakdown[c]["status"] == "COMPLIANT" for c in P["critical"])
    if failed:
        decision = "NO_GO"
    elif critical_ok:
        decision = "GO"
    else:
        decision = "REQUEST_CHANGES"
    needs_review = bool(review) or sample["accuracyScore"] < P["accuracyReviewThreshold"]
    return total, breakdown, decision, needs_review, failed, review

S = []

# ---------------------------------------------------------------- 01 CHUBB / AIR PRODUCTS (FR, USD)
S.append({
 "id": "01_chubb_air-products_FR", "file": "20240419__FR__AO__ADMIN__ATTEST__Assurance_RC.pdf",
 "language": ["fr", "en"], "pages": 2, "format": "PDF_TEXT", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "AIR PRODUCTS SAS", "country": "FR", "ariba_id": "S-000101"},
 "issuer": {"name": "Chubb European Group SE", "type": "INSURER", "country": "FR", "regulator": "ACPR", "ratingIndicative": "AA (S&P)"},
 "policyholder": "AIR PRODUCTS SAS", "additionalInsureds": [], "policyNumber": "FRCANA00801",
 "period": {"from": "2024-06-01", "to": "2025-05-31"}, "issuedAt": "2024-04-19", "issuedPlace": "Courbevoie",
 "receivedAt": "2024-04-26", "fx": {"USD": 1.07},
 "visual": {"stamp": {"present": True, "page": 2, "confidence": 0.80, "note": "faint company seal over signature block"},
            "signature": {"present": True, "page": 2, "confidence": 0.65, "note": "'Signed on behalf of Chubb' with scribble inside seal — ambiguous, route to review"},
            "logo": {"present": True, "page": 1}},
 "territory": {"statement": None, "usaCanada": "UNCLEAR"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("COMBINED_GL_PL", 5_000_000, "USD", 1.07, "PER_CLAIM_AND_ANNUAL", "BELOW_MINIMUM", "Responsabilité Civile Exploitation et Produit combinés / Public and Product Liability combined limit", 1, note="Claims paid excess of SIR"),
   g("PRODUCT_LIABILITY", 5_000_000, "USD", 1.07, "PER_CLAIM_AND_ANNUAL", "BELOW_MINIMUM", "Responsabilité Civile Produit — 'Covered' (no own amount; combined limit applies)", 1, note="Line says 'Covered' without amount → COVERED_NO_AMOUNT; amount inherited from combined limit"),
   g("GENERAL_LIABILITY", None, "USD", 1.07, "PER_CLAIM", "COVERED_NO_AMOUNT", "Responsabilité Civile Exploitation — Covered", 1),
   g("EMPLOYERS_LIABILITY", 1_000_000, "USD", 1.07, "PER_CLAIM_AND_ANNUAL", "PRESENT", "Faute Inexcusable / Employer's Liability – Gross Negligence", 1),
   g("POLLUTION_ACCIDENTAL", 500_000, "USD", 1.07, "PER_CLAIM_AND_ANNUAL", "PRESENT", "Pollution Accidentelle / Sudden and Accidental Pollution", 1),
   g("PURE_FINANCIAL_LOSS", 200_000, "USD", 1.07, "PER_CLAIM_AND_ANNUAL", "BELOW_MINIMUM", "Dommages Immatériels Non Consécutifs / Pure Financial Losses", 1, note="Listed twice (under GL and under PL), same amount"),
   g("CONSEQUENTIAL_FINANCIAL_LOSS", None, "USD", 1.07, None, "MISSING", None, None, note="DIC not mentioned — Richard: 'il manque les DIC' → alert"),
   g("PRODUCT_RECALL", None, "USD", 1.07, None, "MISSING", None, None),
 ],
 "exclusions": [], "deductibles": "SIR (self-insured retention) mentioned, amount not stated",
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "PASS", "SIGNATURE_PRESENT": "REVIEW", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "accuracyScore": 0.90,
 "expert": {"reviewedInSession": True, "verdict": "REQUEST_CHANGES",
            "quotes": ["C'est la mieux… un vrai certificat d'assurance (logo Chubb, tampon page 2)",
                       "5 millions de dollars… ça fait 4 millions d'euros — alerte",
                       "Dommages immatériels non consécutifs 200 000 € — absolument pas suffisant, on demandera 500 000 ou 1 million",
                       "Il manque les DIC — alerte, blocage",
                       "Elle passe à la rigueur avec des demandes d'amélioration"]},
 "demoAngle": "Best of the batch and still far below GPTC. Shows currency conversion, 'Covered' without amount, missing DIC/recall.",
})

# ---------------------------------------------------------------- 02 GENERALI DE / SCHERDEL (recall-only)
S.append({
 "id": "02_generali-de_scherdel_DE", "file": "20250408_VEB_Scherdel_GmbH_Ru_ckruf.pdf",
 "language": ["de", "en"], "pages": 2, "format": "PDF_TEXT", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "Scherdel GmbH", "country": "DE", "ariba_id": "S-000102"},
 "issuer": {"name": "Generali Deutschland Versicherung AG", "type": "INSURER", "country": "DE", "regulator": "BaFin", "ratingIndicative": "A+ (AM Best)"},
 "policyholder": "Scherdel GmbH", "additionalInsureds": [], "policyNumber": "DE-CAS-AB70346-2025",
 "period": {"from": "2025-01-01", "to": "2026-01-01"}, "issuedAt": "2025-01-09", "issuedPlace": "München",
 "receivedAt": "2025-01-16", "fx": {},
 "visual": {"stamp": {"present": False, "confidence": 0.90},
            "signature": {"present": True, "page": 2, "confidence": 0.85, "note": "two scanned handwritten signatures (ppa. S. Vogel, i.A. A. Heindl)"},
            "logo": {"present": True, "page": 1}},
 "territory": {"statement": None, "usaCanada": "UNCLEAR"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("AUTOMOTIVE_RECALL", 2_000_000, basis="PER_EVENT_2X_ANNUAL", status="PRESENT", label="KFZ Rückrufkostenversicherung (inkl. Aus- und Einbaukosten ohne Rückruf)", page=2, note="double annual aggregate = 4M"),
   g("PRODUCT_RECALL", 5_000_000, basis="PER_EVENT_1X_ANNUAL", status="BELOW_MINIMUM", label="Produktrückrufkosten / Product recall cost insurance", page=2),
   g("DISMANTLING_REFITTING", 2_000_000, basis="PER_EVENT_2X_ANNUAL", status="PRESENT", label="Aus- und Einbaukosten ohne Rückruf (within automotive recall)", page=2),
   g("PRODUCT_LIABILITY", None, status="MISSING", note="Recall-only certificate: no general/product liability at all"),
   g("PURE_FINANCIAL_LOSS", None, status="MISSING", note="Recall costs are 'pure financial loss' but restricted to enumerated recall expenses — does not satisfy PFL requirement"),
 ],
 "exclusions": [{"text": "No coverage for bodily injury or property damage as such", "critical": False}],
 "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "PASS", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "accuracyScore": 0.93,
 "expert": {"reviewedInSession": True, "verdict": "NO_GO",
            "quotes": ["Plein d'imperfections : il n'y a pas la signature d'une personne, il n'y a pas le cachet (note: signatures are in fact present on p.2; stamp is absent)",
                       "Garantie globale mais très peu de sous-garanties, pas détaillé en ligne, pas les sous-limites",
                       "Pour moi c'est pas bon — blocage niveau 1"]},
 "demoAngle": "Formal No-Go (no stamp) + structural gap: recall-only certificate. Request must ask for stamp AND a GL/PL certificate AND recall ≥ €15M.",
})

# ---------------------------------------------------------------- 03 SWISS MOBILIAR / EKKO-MEISTER (CHF)
S.append({
 "id": "03_swiss-mobiliar_ekko-meister_CH", "file": "433__9171_002__EKKOMEISTER_AG__20252_e.pdf",
 "language": ["en"], "pages": 1, "format": "PDF_TEXT", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "EKKO-MEISTER AG", "country": "CH", "ariba_id": "S-000103"},
 "issuer": {"name": "Swiss Mobiliar Insurance Company Ltd.", "type": "INSURER", "country": "CH", "regulator": "FINMA", "ratingIndicative": "A+ (S&P) — to verify; Richard perceived it as a small company"},
 "policyholder": "EKKO-MEISTER AG", "additionalInsureds": [], "policyNumber": "433 9171.002 / G-1398-4996",
 "period": {"from": "2025-01-01", "to": "2025-12-31"}, "issuedAt": "2025-03-12", "issuedPlace": "Berne",
 "receivedAt": "2025-03-19", "fx": {"CHF": 0.96},
 "visual": {"stamp": {"present": False, "confidence": 0.92},
            "signature": {"present": True, "page": 1, "confidence": 0.92, "note": "two handwritten signatures (T. Nemeth, A. Wyss)"},
            "logo": {"present": True, "page": 1}, "brokerContact": "Howden Schweiz AG (contact only, not issuer)"},
 "territory": {"statement": "Worldwide, including USA and Canada (loss occurrence)", "usaCanada": "INCLUDED"}, "trigger": "OCCURRENCE", "basisSummary": "AGGREGATE",
 "guarantees": [
   g("COMBINED_GL_PL", 20_000_000, "CHF", 0.96, "ANNUAL_AGGREGATE", "COMPLIANT", "CHF 20'000'000 combined single limit for bodily injury and property damage, annual aggregate (one-time guarantee)", 1, note="CSL BI+PD only; counted as PL per default CSL rule (Q13 open)"),
   g("PRODUCT_LIABILITY", 20_000_000, "CHF", 0.96, "ANNUAL_AGGREGATE", "COMPLIANT", "General- and Products Liability insurance (inherits CSL)", 1),
   g("PRODUCT_RECALL", 5_000_000, "CHF", 0.96, "ANNUAL_AGGREGATE", "BELOW_MINIMUM", "Sublimit: CHF 5'000'000 Recall Costs", 1),
   g("PURE_FINANCIAL_LOSS", None, "CHF", 0.96, None, "MISSING", note="CSL covers BI & PD only — pure financial loss not mentioned"),
 ],
 "exclusions": [], "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "REVIEW",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "PASS", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "expiryWarning": "9.4 months remaining at reception (< 10-month window)",
 "accuracyScore": 0.94,
 "expert": {"reviewedInSession": True, "verdict": "NO_GO",
            "quotes": ["Il manque beaucoup de choses : pas les seuils, pas le tampon, pas les sous-limites",
                       "Toute petite compagnie suisse — sa solidité aussi",
                       "Alerte : non validé donc non scoré — veuillez demander plus de précisions"]},
 "demoAngle": "CHF conversion puts PL just above €20M; recall sub-limit €5.2M; no stamp; expiry < 10 months warning; insurer rating lookup.",
})

# ---------------------------------------------------------------- 04 MARRON & ASSOCIÉS (MMA) / M.T.S. — broker-issued, scanned
S.append({
 "id": "04_marron-mma_mts_FR", "file": "Attestation_2025_MTS_RC_.pdf",
 "language": ["fr"], "pages": 2, "format": "PDF_SCANNED", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "M.T.S.", "country": "FR", "ariba_id": "S-000104"},
 "issuer": {"name": "SARL MARRON & ASSOCIÉS", "type": "AGENT_BROKER", "country": "FR", "regulator": "ORIAS 07 002 497", "ratingIndicative": None,
            "note": "'Assureur Conseil' — Agent Général Exclusif MMA et Courtier. Underlying insurer: MMA IARD / MMA ENTREPRISE"},
 "policyholder": "La Société M.T.S.", "additionalInsureds": [], "policyNumber": "L48 362 819",
 "period": {"from": "2025-01-01", "to": "2025-12-31"}, "issuedAt": "2025-01-07", "issuedPlace": "Oyonnax",
 "receivedAt": "2025-01-14", "fx": {},
 "visual": {"stamp": {"present": True, "page": 1, "confidence": 0.85, "note": "stamp is the BROKER's (Marron & Associés), not the insurer's → does not satisfy gate"},
            "signature": {"present": False, "confidence": 0.70, "note": "no insurer signature; names of broker staff printed in the margin"},
            "logo": {"present": True, "page": 2, "note": "MMA Entreprise logo bottom-right (insurer logo on a broker document)"}},
 "territory": {"statement": "USA/Canada section with reduced limits and exclusions", "usaCanada": "PARTIAL_EXCLUDED"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("GENERAL_LIABILITY", 10_000_000, basis="PER_CLAIM", status="PRESENT", label="RC Exploitation — Tous dommages confondus", page=2),
   g("CONSEQUENTIAL_FINANCIAL_LOSS", 2_000_000, basis="PER_CLAIM", status="COMPLIANT", label="Dommages matériels et immatériels consécutifs y compris biens confiés", page=2, deductible=750),
   g("PURE_FINANCIAL_LOSS", 305_000, basis="PER_CLAIM", status="BELOW_MINIMUM", label="Dommages immatériels non consécutifs", page=2, deductible=1500),
   g("POLLUTION_ACCIDENTAL", 750_000, basis="PER_CLAIM", status="PRESENT", label="Atteintes à l'environnement accidentelles", page=2, deductible=2000),
   g("PRODUCT_LIABILITY", 5_000_000, basis="PER_CLAIM_AND_ANNUAL", status="BELOW_MINIMUM", label="RC Après Livraison — Tous dommages confondus (hors USA/Canada)", page=2, excluded_territories=["USA", "Canada"]),
   g("PRODUCT_RECALL", 305_000, basis="PER_CLAIM_AND_ANNUAL", status="BELOW_MINIMUM", label="Frais de retrait engagés par l'assuré", page=2, deductible=3000, excluded_territories=["USA", "Canada"]),
   g("DISMANTLING_REFITTING", 305_000, basis="PER_CLAIM_AND_ANNUAL", status="PRESENT", label="Frais de dépose repose engagés par l'assuré", page=2, deductible=3000, excluded_territories=["USA", "Canada"]),
   g("OTHER", 500_000, basis="PER_CLAIM_AND_ANNUAL", status="PRESENT", label="DINC y compris frais de dépose repose et de retrait engagés par un tiers", page=2, deductible=3000),
 ],
 "exclusions": [
   {"text": "USA/Canada: Dommages immatériels non consécutifs suite à un vice caché (loss of use) — Exclu", "critical": True},
   {"text": "USA/Canada: Frais de dépose repose — Exclu", "critical": True},
   {"text": "USA/Canada: Frais de retrait — Exclu", "critical": True},
   {"text": "Tout dispositif/matériel implantable dans le corps humain", "critical": False},
 ],
 "deductibles": "€750–€15,000 per claim depending on line",
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "FAIL", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "FAIL", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "accuracyScore": 0.82,
 "expert": {"reviewedInSession": True, "verdict": "NO_GO",
            "quotes": ["Marron & Associés c'est pas un assureur, c'est un petit courtier… refus total",
                       "Le mec te fait une attestation pour faire plaisir à son copain client — aucune valeur juridique",
                       "Frais de retrait 305 000 € — absolument pas suffisant ; je demande souvent 1, 2 voire 5 millions",
                       "Ils annoncent un seuil global mais il y a des sous-limites",
                       "Aux États-Unis/Canada les frais de dépose-repose et de retrait sont carrément exclus — red flag énorme",
                       "Elle est doublement bidon : Marron et associés + sous-limites inacceptables"]},
 "demoAngle": "THE demo case: broker-issued (ORIAS lookup), scanned OCR, €10M headline vs €305k recall sub-limit, USA/Canada exclusions in the fine print.",
})

# ---------------------------------------------------------------- 05 ICICI LOMBARD / NAXNOVA — a QUOTE, INR
S.append({
 "id": "05_icici-lombard_naxnova_IN", "file": "CGL_QUOTE_Naxnova_Technologies_Private_Limited75.pdf",
 "language": ["en"], "pages": 5, "format": "PDF_TEXT", "documentType": "QUOTE",
 "supplierMaster": {"name": "Naxnova Technologies Private Limited", "country": "IN", "ariba_id": "S-000105"},
 "issuer": {"name": "ICICI Lombard General Insurance", "type": "INSURER", "country": "IN", "regulator": "IRDAI", "ratingIndicative": "domestic AAA (CRISIL); international rating to verify",
            "note": "Capacity (20%) — ICICI Lombard carries only 20% of the risk; co-insurers unknown"},
 "policyholder": "Naxnova Technologies Private Limited", "additionalInsureds": [], "policyNumber": None,
 "period": {"from": None, "to": None, "statement": "12 months from policy inception date"}, "issuedAt": "2025-04-29", "issuedPlace": "Mumbai",
 "receivedAt": "2025-05-06", "fx": {"INR": 95.5},
 "visual": {"stamp": {"present": False, "confidence": 0.95},
            "signature": {"present": False, "confidence": 0.98, "note": "'This is a computer generated letter and does not require signature'"},
            "logo": {"present": False}},
 "territory": {"statement": "General: India; Products/Completed operations: Worldwide incl. USA & Canada", "usaCanada": "INCLUDED"}, "trigger": "CLAIMS_MADE", "basisSummary": "BOTH",
 "guarantees": [
   g("COMBINED_GL_PL", 1_000_000_000, "INR", 95.5, "PER_OCCURRENCE_AND_AGGREGATE", "BELOW_MINIMUM", "Limit of Indemnity INR 1,000,000,000 per occurrence and in the aggregate", 1, note="Only 20% capacity from this insurer"),
   g("PRODUCT_LIABILITY", 1_000_000_000, "INR", 95.5, "PER_OCCURRENCE_AND_AGGREGATE", "BELOW_MINIMUM", "Product & Completed Operations — Policy Limits", 1, deductible="INR 250,000 India / 350,000 USA-Canada / 500,000 ROW"),
   g("PRODUCT_RECALL", 1_000_000_000, "INR", 95.5, "PER_ACCIDENT_AND_AGGREGATE", "BELOW_MINIMUM", "Product Recall — INR 1,000,000,000 Per Accident and in Aggregate", 1, deductible="INR 3,500,000"),
   g("PURE_FINANCIAL_LOSS", None, "INR", 95.5, None, "MISSING"),
   g("POLLUTION_ACCIDENTAL", None, "INR", 95.5, None, "COVERED_NO_AMOUNT", "72 hours Sudden & Accidental Pollution — Sub Limit: Policy Limit", 1),
   g("GOODS_IN_CUSTODY", 50_000_000, "INR", 95.5, "PER_OCCURRENCE_AND_AGGREGATE", "PRESENT", "Care, Custody and control", 3),
 ],
 "exclusions": [
   {"text": "No cover for Automobile Critical Components: steering, brakes, wheel, tyres, seatbelts & airbags (except sub-components)", "critical": True},
   {"text": "Failure to supply exclusion", "critical": True},
   {"text": "Cyber risk exclusion; Electronic data exclusion; Professional liability exclusion; Punitive damages; Unapproved product; Aircraft products; Offshore/Aviation/Defence/Railways", "critical": False},
 ],
 "deductibles": "INR 85,000 general; recall INR 3,500,000",
 "gates": {"DOCUMENT_IS_CERTIFICATE": "FAIL", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "REVIEW",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "FAIL", "POLICY_NUMBER_PRESENT": "FAIL", "DATES_PRESENT": "FAIL",
           "NOT_EXPIRED": "REVIEW", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "FAIL", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "accuracyScore": 0.91,
 "expert": {"reviewedInSession": True, "verdict": "NO_GO",
            "quotes": ["Pas de signature écrite — je veux les deux (tampon + signature)",
                       "Ils ont 1 milliard — mais ça veut dire quoi en euros ? Il faut convertir",
                       "Je pose quand même des questions sur l'assureur, je ne le connais pas — savoir s'il a une notation AM Best",
                       "Pour moi elle n'est pas conforme"]},
 "demoAngle": "Not a certificate but a QUOTE; no signature/stamp/policy no./dates; 20% capacity; claims-made; INR conversion; critical automotive exclusion on page 4.",
})

# ---------------------------------------------------------------- 06 ZURICH ES / COPO — garbled text, stamp+scribble, parent/subsidiary
S.append({
 "id": "06_zurich-es_copo_ES", "file": "Certificado_cobertura_COPO_COMPONENTE_VEHICULOS__2025_ENG.pdf",
 "language": ["en"], "pages": 1, "format": "PDF_TEXT_GARBLED", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "Componentes de Vehículos de Galicia, S.A.", "country": "ES", "ariba_id": "S-000106"},
 "issuer": {"name": "Zurich Insurance Europe AG, Spanish Branch", "type": "INSURER", "country": "ES", "regulator": "DGSFP / BaFin (EU branch)", "ratingIndicative": "AA- (S&P)"},
 "policyholder": "GRUPO EMPRESARIAL COPO, S.A. (NIF A36321883)", "additionalInsureds": ["Componentes de vehículos de Galicia, S.A. (CIF A-36121176)"], "policyNumber": "00000136128303",
 "period": {"from": "2024-12-31", "to": "2025-12-30"}, "issuedAt": "2024-12-23", "issuedPlace": "Madrid",
 "receivedAt": "2024-12-30", "fx": {},
 "visual": {"stamp": {"present": True, "page": 1, "confidence": 0.95, "note": "round Zurich Spanish branch stamp"},
            "signature": {"present": True, "page": 1, "confidence": 0.55, "note": "scribble overlapping the stamp — cannot confirm a named signatory → review"},
            "logo": {"present": True, "page": 1}},
 "territory": {"statement": None, "usaCanada": "UNCLEAR"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("GENERAL_LIABILITY", 20_000_000, basis="SUM_INSURED_AND_ANNUAL", status="PRESENT", label="General Liability (Premises)", page=1),
   g("GOODS_IN_CUSTODY", 2_000_000, basis="SUM_INSURED_AND_ANNUAL", status="PRESENT", label="Goods under custody", page=1),
   g("EMPLOYERS_LIABILITY", 20_000_000, basis="SUM_INSURED_AND_ANNUAL", status="PRESENT", label="Employers' Liability", page=1),
   g("POLLUTION_ACCIDENTAL", 20_000_000, basis="SUM_INSURED_AND_ANNUAL", status="PRESENT", label="Civil liability for Accidental Pollution", page=1),
   g("PRODUCT_LIABILITY", 20_000_000, basis="SUM_INSURED_AND_ANNUAL", status="COMPLIANT", label="Products Liability", page=1),
   g("PRODUCT_RECALL", 4_000_000, basis="SUM_INSURED_AND_ANNUAL", status="BELOW_MINIMUM", label="Prodcut recall (sic)", page=1),
   g("EXTENDED_PRODUCT_LIABILITY", 2_000_000, basis="SUM_INSURED_AND_ANNUAL", status="PRESENT", label="Mixing and Blending", page=1),
   g("DISMANTLING_REFITTING", 4_000_000, basis="SUM_INSURED_AND_ANNUAL", status="PRESENT", label="Dismantling and assembly Cost", page=1),
   g("PURE_FINANCIAL_LOSS", 3_000_000, basis="SUM_INSURED_AND_ANNUAL", status="BELOW_MINIMUM", label="Pure Financial Loss", page=1),
 ],
 "exclusions": [{"text": "Sanctions clause (standard)", "critical": False}, {"text": "Spanish version prevails over English", "critical": False}],
 "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "PASS", "SIGNATURE_PRESENT": "REVIEW", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "entityMatchNote": "Supplier is the ADDITIONAL INSURED, policyholder is the parent group — accepted because explicitly named (Q26)",
 "accuracyScore": 0.86,
 "expert": {"reviewedInSession": True, "verdict": "REQUEST_CHANGES",
            "quotes": ["Il y a le tampon à la fin, ça va. Mais il n'y a pas de signature écrite. Je veux les deux."]},
 "demoAngle": "Only certificate compliant on Product Liability (€20M). Garbled PDF text → OCR path. Parent vs subsidiary entity match. Signature ambiguity → review.",
})

# ---------------------------------------------------------------- 07 ZURICH DE / IMI GERMANY HOLDING — group policy, 16 co-insured
S.append({
 "id": "07_zurich-de_imi-germany_DE", "file": "Certificate_Bilingual_IMI_Germany_Holding_B_V___Co__KG_LA_20240715_v1_0.pdf",
 "language": ["de", "en"], "pages": 4, "format": "PDF_TEXT", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "Norgren GmbH", "country": "DE", "ariba_id": "S-000107", "note": "hypothetical FORVIA-contracting entity chosen among the 16 co-insured for the demo"},
 "issuer": {"name": "Zurich Insurance Europe AG, Niederlassung für Deutschland", "type": "INSURER", "country": "DE", "regulator": "BaFin", "ratingIndicative": "AA- (S&P)"},
 "policyholder": "IMI Germany Holding B.V. & Co. KG", "additionalInsureds": ["Bahr Modultechnik Holding GmbH", "Bahr Modultechnik GmbH", "Bopp & Reuther Valves GmbH", "Buschjost GmbH", "Fluid Automation Systems GmbH", "Heimeier GmbH", "Herion Systemtechnik GmbH", "IMI Critical Engineering Holding GmbH", "IMI Deutschland II GmbH & CO KG", "IMI Deutschland Verwaltungs GmbH", "IMI Hydronic Engineering Deutschland GmbH", "Norgren GmbH", "Th Jansen-Armaturen GmbH", "THJ Holding GmbH", "Valves Holding GmbH", "Z&J Technologies GmbH"],
 "policyNumber": "801.380.041.190",
 "period": {"from": "2024-06-30", "to": "2025-06-29"}, "issuedAt": "2024-07-15", "issuedPlace": "Frankfurt am Main",
 "receivedAt": "2024-07-22", "fx": {},
 "visual": {"stamp": {"present": False, "confidence": 0.92},
            "signature": {"present": True, "page": 4, "confidence": 0.93, "note": "handwritten signature Dr. Carsten Schildknecht"},
            "logo": {"present": True, "page": 1}},
 "territory": {"statement": "Weltweite Exporte / Exports worldwide", "usaCanada": "INCLUDED"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("COMBINED_GL_PL", 5_000_000, basis="PER_EVENT_AND_ANNUAL", status="BELOW_MINIMUM", label="Betriebs- und Produkt-Haftpflichtversicherung / Combined limit for General and Product Liability — BI & PD", page=1),
   g("PRODUCT_LIABILITY", 5_000_000, basis="PER_EVENT_AND_ANNUAL", status="BELOW_MINIMUM", label="(inherits combined limit)", page=1),
   g("EXTENDED_PRODUCT_LIABILITY", None, status="PRESENT", label="erweiterte Produkt-Haftpflicht (named in type of insurance, no sublimit shown)", page=1),
   g("POLLUTION_ACCIDENTAL", 5_000_000, basis="PER_EVENT_AND_ANNUAL", status="PRESENT", label="Umwelt-Haftpflichtversicherung", page=2),
   g("PROFESSIONAL_INDEMNITY", 5_000_000, basis="PER_EVENT_AND_ANNUAL", status="PRESENT", label="Berufshaftpflicht für Architekten und Ingenieure", page=2),
   g("PRODUCT_RECALL", None, status="MISSING"),
   g("PURE_FINANCIAL_LOSS", None, status="MISSING", note="'named pure financial loss' only within environmental liability"),
 ],
 "exclusions": [{"text": "Only the German contract is binding; coverage amounts may be reduced by claim payments", "critical": False}],
 "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "PASS", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "entityMatchNote": "Supplier matched as co-insured (1 of 16)",
 "accuracyScore": 0.95,
 "expert": {"reviewedInSession": False, "verdict": "NO_GO", "quotes": [], "note": "Not discussed individually; verdict inferred from stated rules (no stamp; €5M vs €20M; no recall)"},
 "demoAngle": "Group policy with 16 co-insured → entity matching. Premium-paid statement. €5M combined limit far below €20M.",
})

# ---------------------------------------------------------------- 08 ALLIANZ AGCS / CTEC-CERAMTEC — recall-only, expert likes it
S.append({
 "id": "08_allianz-agcs_ctec-ceramtec_DE", "file": "VB_2025_Haft_CTEC_I__Kfz_RR_5_Mio.pdf",
 "language": ["de", "en"], "pages": 2, "format": "PDF_TEXT", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "CeramTec GmbH", "country": "DE", "ariba_id": "S-000108"},
 "issuer": {"name": "Allianz Global Corporate & Specialty SE", "type": "INSURER", "country": "DE", "regulator": "BaFin", "ratingIndicative": "AA (S&P)"},
 "policyholder": "CTEC I GmbH", "additionalInsureds": ["CeramTec GmbH, Deutschland"], "policyNumber": "DEL006608250M",
 "period": {"from": "2025-01-01", "to": "2026-01-01"}, "issuedAt": "2024-11-29", "issuedPlace": "Köln",
 "receivedAt": "2024-12-06", "fx": {},
 "visual": {"stamp": {"present": False, "confidence": 0.93},
            "signature": {"present": True, "page": 2, "confidence": 0.95, "note": "two handwritten signatures (Dr. Vogler, Williams)"},
            "logo": {"present": True, "page": 1}},
 "territory": {"statement": "weltweit/worldwide", "usaCanada": "INCLUDED"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("AUTOMOTIVE_RECALL", 5_000_000, basis="PER_OCCURRENCE_AND_ANNUAL", status="BELOW_MINIMUM", label="Rückrufkosten-Haftpflichtversicherung für Kfz-Teile-Zulieferer / Recall Liability Insurance for Automotive Component Suppliers — pure financial loss", page=2),
   g("PRODUCT_RECALL", 5_000_000, basis="PER_OCCURRENCE_AND_ANNUAL", status="BELOW_MINIMUM", label="(automotive recall counts toward product recall)", page=2),
   g("PRODUCT_LIABILITY", None, status="MISSING", note="Recall-only certificate"),
   g("PURE_FINANCIAL_LOSS", None, status="MISSING", note="Restricted to enumerated recall expenses"),
 ],
 "exclusions": [{"text": "No coverage for bodily injury or property damage as such", "critical": False}],
 "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "PASS", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "accuracyScore": 0.96,
 "expert": {"reviewedInSession": True, "verdict": "REQUEST_CHANGES",
            "quotes": ["Elle n'est pas trop mal : il n'y a pas le tampon, mais à part le tampon, en termes de garantie ça va, tout y est",
                       "L'acheteur doit renvoyer l'attestation en disant : merci de mettre le tampon"],
            "conflict": "Richard considers €5M recall sufficient (his ~5M habit); GPTC requires €15M → profile calibration needed (Q08/Q44)"},
 "demoAngle": "Shows the GPTC-vs-expert threshold conflict and the 'formal defect' No-Go sub-type (stamp only). Switch profile live to 'Expert' and watch the decision change.",
})

# ---------------------------------------------------------------- 09 ALLIANZ DE / BEYER POLYVLIES — CSL + extended PL, personal data
S.append({
 "id": "09_allianz-de_beyer-polyvlies_DE", "file": "Versicherungsbesta_tigung_Betriebshaftpflichtversicherung_AS0749159962_20250212.pdf",
 "language": ["de", "en"], "pages": 4, "format": "PDF_TEXT", "documentType": "CERTIFICATE_WITH_COVER_LETTER",
 "supplierMaster": {"name": "Polyvlies Franz Beyer GmbH", "country": "DE", "ariba_id": "S-000109"},
 "issuer": {"name": "Allianz Versicherungs-Aktiengesellschaft", "type": "INSURER", "country": "DE", "regulator": "BaFin", "ratingIndicative": "AA (S&P)"},
 "policyholder": "Beyer Polyvlies Holding GmbH u. Co. KG", "additionalInsureds": ["Polyvlies Franz Beyer GmbH"], "policyNumber": "AS-0749159962",
 "period": {"from": "2019-01-01", "to": "2026-01-01"}, "issuedAt": "2025-02-12", "issuedPlace": "München",
 "receivedAt": "2025-02-19", "fx": {},
 "visual": {"stamp": {"present": False, "confidence": 0.93},
            "signature": {"present": True, "page": 4, "confidence": 0.95, "note": "two handwritten signatures of board members (F. Sommerfeld, U. Stephan)"},
            "logo": {"present": True, "page": 1}},
 "personalData": ["email n.damm@polyvlies.de on cover letter page 1 — mask in UI/exports"],
 "territory": {"statement": "weltweit / worldwide incl. USA, US-territories and Canada", "usaCanada": "INCLUDED"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("COMBINED_GL_PL", 10_000_000, basis="ANNUAL_AGGREGATE", status="BELOW_MINIMUM", label="Personen-, Sach- und Vermögensschäden pauschal — 5,000,000 EUR any one occurrence / 10,000,000 EUR aggregate (CSL incl. pure financial loss)", page=3, note="aggregate retained per Q12; per-occurrence 5M"),
   g("PRODUCT_LIABILITY", 10_000_000, basis="ANNUAL_AGGREGATE", status="BELOW_MINIMUM", label="Produkthaftpflicht (inherits CSL aggregate)", page=2),
   g("EXTENDED_PRODUCT_LIABILITY", 20_000_000, basis="ANNUAL_AGGREGATE", status="PRESENT", label="Sublimit erweiterte Produkthaftpflicht — 10,000,000 EUR per occurrence / 20,000,000 EUR aggregate", page=3),
   g("DISMANTLING_REFITTING", 20_000_000, basis="ANNUAL_AGGREGATE", status="PRESENT", label="Aus- und Einbaukosten (within extended product liability)", page=2),
   g("PURE_FINANCIAL_LOSS", 10_000_000, basis="ANNUAL_AGGREGATE", status="BELOW_MINIMUM", label="Vermögensschäden within CSL", page=3),
   g("CONSEQUENTIAL_FINANCIAL_LOSS", 10_000_000, basis="ANNUAL_AGGREGATE", status="COMPLIANT", label="(consequential losses within CSL)", page=3),
   g("PRODUCT_RECALL", None, status="MISSING"),
 ],
 "exclusions": [], "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "PASS", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "accuracyScore": 0.92,
 "expert": {"reviewedInSession": True, "verdict": "REQUEST_CHANGES",
            "quotes": ["Allianz — ils ont tout mis en anglais, pas mal celle-là (likely this one)",
                       "Il faudrait montrer que vous avez bien compris l'attestation en la retransposant sur une grille FORVIA"],
            "note": "Attribution of the quote to this file is probable, not certain"},
 "demoAngle": "Per-occurrence vs aggregate choice (5M vs 10M), extended product liability with dismantling/testing costs, personal data masking, cover-letter page to discard.",
})

# ---------------------------------------------------------------- 10 GENERALI ITALIA / METRATON — best limits, master policy
S.append({
 "id": "10_generali-it_metraton_IT", "file": "dich_metraton_2025_.pdf",
 "language": ["en", "it"], "pages": 1, "format": "PDF_TEXT_PARTIAL", "documentType": "CERTIFICATE",
 "supplierMaster": {"name": "Metraton Spa", "country": "IT", "ariba_id": "S-000110"},
 "issuer": {"name": "Generali Italia S.p.A.", "type": "INSURER", "country": "IT", "regulator": "IVASS", "ratingIndicative": "A (AM Best)"},
 "policyholder": "Landi Renzo S.p.A.", "additionalInsureds": ["Metraton Spa (named insured under master policy)"], "policyNumber": "Master Policy n° 127/2009 and Policy n° 290680704",
 "period": {"from": "2024-12-31", "to": "2025-12-31"}, "issuedAt": "2025-02-18", "issuedPlace": "Milano",
 "receivedAt": "2025-02-25", "fx": {},
 "visual": {"stamp": {"present": False, "confidence": 0.90},
            "signature": {"present": True, "page": 1, "confidence": 0.92, "note": "handwritten signature, unnamed signatory"},
            "logo": {"present": True, "page": 1}},
 "territory": {"statement": "Worldwide", "usaCanada": "INCLUDED"}, "trigger": "UNSTATED", "basisSummary": "BOTH",
 "guarantees": [
   g("GENERAL_LIABILITY", 50_000_000, basis="EACH_LOSS_AND_ANNUAL", status="PRESENT", label="Third Party Liability €50,000,000 e.e.l.", page=1),
   g("PRODUCT_LIABILITY", 50_000_000, basis="EACH_LOSS_AND_ANNUAL", status="COMPLIANT", label="Products Liability €50,000,000 e.e.l.", page=1),
   g("PRODUCT_RECALL", 10_000_000, basis="EACH_LOSS", status="BELOW_MINIMUM", label="Recall €10,000,000 e.e.l.", page=1),
   g("PURE_FINANCIAL_LOSS", None, status="UNCLEAR", note="Not isolated; may be within €50M 'all guarantees' — clarification needed"),
 ],
 "exclusions": [{"text": "No coverage for punitive and/or exemplary damages", "critical": False}],
 "deductibles": None,
 "gates": {"DOCUMENT_IS_CERTIFICATE": "PASS", "ISSUER_IS_INSURER": "PASS", "INSURER_IDENTIFIED": "PASS", "INSURER_RATING_FLOOR": "PASS",
           "STAMP_PRESENT": "FAIL", "SIGNATURE_PRESENT": "PASS", "POLICY_NUMBER_PRESENT": "PASS", "DATES_PRESENT": "PASS",
           "NOT_EXPIRED": "PASS", "ENTITY_MATCH": "PASS", "COINSURANCE_COMPLETE": "PASS", "CAPTIVE_FRONTED": "PASS", "FILE_FORMAT_OK": "PASS"},
 "entityMatchNote": "Supplier is the named INSURED; policyholder is Landi Renzo (master policy) — accepted",
 "accuracyScore": 0.88,
 "expert": {"reviewedInSession": True, "verdict": "REQUEST_CHANGES",
            "quotes": ["Super compliqué… ils ont fait un truc assez bien (Richard was navigating between files; attribution probable)"],
            "note": "Under GPTC: PL €50M compliant; recall €10M < €15M; stamp missing"},
 "demoAngle": "Highest Risk Score of the batch; shows 'e.e.l./a.a.' Italian basis notation; master-policy entity relationship; one-line request (recall 10→15M + stamp).",
})

# ---------------------------------------------------------------- compute & write
for s in S:
    total, breakdown, decision, needs_review, failed, review = score(s)
    formal_only = failed and all(f in PROFILE["formalGates"] for f in failed)
    s["computed"] = {
        "profile": PROFILE["id"],
        "riskScore": total if decision != "NO_GO" else None,
        "riskScoreProvisional": total,                      # computed even for NO_GO, shown greyed "for information"
        "breakdown": breakdown,
        "decision": decision,
        "noGoSubtype": ("FORMAL_DEFECT" if formal_only else "STRUCTURAL") if decision == "NO_GO" else None,
        "failedGates": failed, "reviewGates": review,
        "needsHumanReview": needs_review,
        "matchesExpert": (decision == s["expert"]["verdict"]),
    }

out = {"profile": PROFILE, "demoClock": "2025-04-15", "generatedAt": dt.date.today().isoformat(), "samples": S}
OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

# summary table
print(f"{'id':36} {'decision':16} {'sub':14} {'score':>5} {'prov':>5} {'acc':>5} {'expert':16} {'match'}")
for s in S:
    c = s["computed"]
    print(f"{s['id']:36} {c['decision']:16} {str(c['noGoSubtype']):14} {str(c['riskScore']):>5} {c['riskScoreProvisional']:>5} {s['accuracyScore']:>5} {s['expert']['verdict']:16} {c['matchesExpert']}")
print("written", OUT)
