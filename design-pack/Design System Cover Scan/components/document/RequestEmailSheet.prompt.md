The end of the buyer's journey: one message that covers the formality and the coverage gaps at once.

```jsx
const [email, setEmail] = React.useState(() => buildRequestEmail({
  supplier: "M.T.S. SAS", policyNumber: "144 725 803", insurer: "MMA (via Marron & Associés)",
  validUntil: "31 December 2025", dueDate: "30 April 2025",
  formalPoints: ["The certificate must be issued, signed and stamped by the insurer (not by a broker or agent)."],
  coveragePoints: [
    "Product liability: at least EUR 20,000,000 (found: EUR 10,000,000).",
    "Product recall / withdrawal costs: at least EUR 15,000,000, worldwide including USA/Canada (found: EUR 305,000, excluded for USA/Canada).",
    "Pure financial loss: at least EUR 15,000,000 (found: missing)."
  ]
}));

<RequestEmailSheet open={open} onClose={close} email={email} onChange={e => setEmail(e.target.value)} supplier="M.T.S. SAS" />
```

Keep the template wording as approved — buyers forward it verbatim to insurers and brokers. From the window namespace, read the builder as `BuildRequestEmail` (only capitalized exports are exposed).
