Tab bar for the right pane of Certificate analysis, and for saved views elsewhere.

```jsx
<Tabs value={tab} onChange={setTab}
  tabs={[{id:"summary",label:"Summary"},{id:"data",label:"Extracted data"},
         {id:"excl",label:"Exclusions & territory"},{id:"hist",label:"History"},{id:"audit",label:"Audit"}]}>
  {tab === "summary" && <SummaryPane … />}
</Tabs>
```

Tab order on screen 3 is fixed: Summary · Extracted data · Exclusions & territory · History · Audit. Summary is the default.
