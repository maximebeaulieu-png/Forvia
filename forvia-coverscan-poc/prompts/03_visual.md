---
id: visual
version: 1.0.0
model_role: vision-capable
output: JSON {page, detections:[{type, bbox, entityText, personName, confidence, note}]}
---
Look at this page image of an insurance document. Locate visual elements only:
- STAMP_OR_SEAL: inked or printed round/rectangular stamps, embossed seals, company seals. Read any text inside it and return it as entityText (e.g. "ZURICH INSURANCE EUROPE AG, SUCURSAL EN ESPAÑA", "MARRON & ASSOCIÉS"). A faint seal counts; lower confidence.
- HANDWRITTEN_SIGNATURE: pen strokes forming a signature (scanned or image-inserted). If a printed name sits under it, return personName. A scribble overlapping a stamp with no readable name → note "overlaps stamp, unnamed".
- PRINTED_SIGNATURE_BLOCK: typed name/title without strokes (this is NOT a signature).
- LOGO: company logo; return the brand as entityText.
Return bbox as [x0,y0,x1,y1] normalized to 0–1 relative to the page. Return JSON only. If nothing is found, return an empty detections array.
