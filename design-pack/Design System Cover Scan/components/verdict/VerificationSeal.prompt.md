Signature element #3 — the 8-point admissibility check, compact enough for a table row and readable enough for the header. Always pair the seal with `VerificationSealList` on the Summary tab; the seal alone is a summary, not an explanation.

```jsx
const gates = {
  stamp:      { state: "fail", note: "broker's stamp found p.1, no insurer stamp" },
  signature:  { state: "fail", note: "no insurer signature" },
  insurer:    { state: "fail", note: "issuer is a broker — ORIAS 07 002 497" },
  policyNumber:{ state: "pass", note: "144 725 803" },
  dates:      { state: "pass", note: "1 Jan 2025 → 31 Dec 2025" },
  entity:     { state: "pass" },
  coinsurance:{ state: "na" },
  documentType:{ state: "pass", note: "certificate" }
};

<VerificationSeal gates={gates} size={96} onGateClick={scrollToEvidence} />
<VerificationSealList gates={gates} onGateClick={scrollToEvidence} />
<VerificationSeal gates={gates} size={40} />   // table row
```

Gate order is fixed and starts at 12 o'clock: stamp, signature, insurer, policy number, dates, entity, co-insurance, document type.
