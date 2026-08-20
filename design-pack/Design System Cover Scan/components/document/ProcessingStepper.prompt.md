Shown in the right pane while a freshly uploaded certificate is being analysed; skeletons fill in behind it (gates first, then the grid).

```jsx
<ProcessingStepper current={4} timings={[420, 3100, 900, 6400]} />
<ProcessingStepper current={8} timings={[420,3100,900,6400,700,1500,300,2600]} />  // done, 15.9 s
```

Step order is fixed: Ingest · Text layer / OCR · Classify · Extract (vision) · Normalize & convert · Verify insurer & entity · Score · Explain. The total is the demo's proof point — keep it under 30 s.
