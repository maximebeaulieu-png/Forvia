Wraps any element to show provenance on hover. Every number in CoverScan has one.

```jsx
<Tooltip content={<>USD 5,000,000 → €4,672,897<br/>ECB 1.07 · 26 Apr 2024</>}>
  <span className="cs-num">€4,672,897</span>
</Tooltip>

<Tooltip content="Page 2 · « Frais de retrait engagés par l'assuré 305.000 € »">
  <ConfidenceDot value={0.82} />
</Tooltip>
```

Never use a tooltip as the only carrier of a decision — it supplements text, it does not replace it.
