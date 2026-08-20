---
id: classify
version: 1.0.0
model_role: cheap, text + thumbnails
output: JSON {documentType, confidence, languages[], pagesToDiscard[], isScanned, premiumMentioned, notes[]}
---
You are classifying a document uploaded by a supplier as proof of liability insurance for FORVIA, an automotive manufacturer.

Decide what the document IS. Do not evaluate coverage.

documentType must be one of:
- CERTIFICATE — a certificate/attestation/confirmation of insurance issued for a third party (often says "certifies that", "atteste que", "bestätigt", "certifica", "dichiara"; contains a policy number and a period; usually 1–4 pages).
- CERTIFICATE_WITH_COVER_LETTER — a certificate preceded/followed by a cover letter or email page; list the letter pages in pagesToDiscard.
- QUOTE — an offer of insurance: words like quote, quotation, devis, Angebot, presupuesto, preventivo, "subject to declaration", "prior to binding", premium amounts, "12 months from inception" without dates.
- POLICY_EXCERPT — pages of the policy wording or schedule itself (clauses, conditions) rather than a certificate.
- EMAIL — only correspondence, no certificate.
- OTHER.

Also return: languages (ISO codes, in order of prominence), isScanned (true if text looks OCR'd or the layout suggests a scan), premiumMentioned, and short factual notes in English (e.g. "page 1 is a cover letter addressed to the policyholder", "text layer appears garbled").

Return JSON only.
