The certificates queue, the coverage grid, the top-10 risk list — every tabular surface in CoverScan.

```jsx
<DataTable
  columns={[
    { key: "status", header: "Status", render: r => <DecisionChip decision={r.decision} size="sm" /> },
    { key: "supplier", header: "Supplier" },
    { key: "score", header: "Score", align: "right", mono: true },
    { key: "expiry", header: "Expiry", mono: true }
  ]}
  rows={certificates} onRowClick={open} transition
/>
```

Always set `mono` on amount, date, score and policy-number columns. Set `transition` on the certificates table so the profile switch recolours rows in 150 ms.
