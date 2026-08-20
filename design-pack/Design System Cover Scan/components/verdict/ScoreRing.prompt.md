The 0–100 risk score. Provisional scores exist on not-admissible certificates and must stay visible but clearly secondary.

```jsx
<ScoreRing value={12} size={72} onClick={openBreakdown} />          // Chubb / Air Products
<ScoreRing value={3} size={72} provisional onClick={openBreakdown} /> // Marron / MTS — not admissible
```

In tables show the number alone and put the provisional note in a tooltip; in the certificate header use the ring at 72 px with a breakdown popover.
