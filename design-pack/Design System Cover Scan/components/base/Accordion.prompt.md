Expandable rows. Prefer `FindingsList` for findings; use `Accordion` directly for extracted-data groups and audit detail.

```jsx
<Accordion defaultOpen={["ISSUER_IS_BROKER"]} items={[
  { id: "ISSUER_IS_BROKER", leading: <Badge tone="red">BLOCK</Badge>,
    title: "Certificate issued by a broker, not by the insurer",
    trailing: <span className="cs-code">ISSUER_IS_BROKER</span>,
    content: <>…evidence quote, then the fix to request…</> }
]} />
```
