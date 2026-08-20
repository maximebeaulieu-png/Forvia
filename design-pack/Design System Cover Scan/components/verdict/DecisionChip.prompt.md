The verdict chip — the single most repeated element in CoverScan. Use `lg` in the certificate header, `sm` in table rows.

```jsx
<DecisionChip decision="STRUCTURAL" size="lg" />      // Not admissible        (broker-issued, quote)
<DecisionChip decision="FORMAL_DEFECT" size="lg" />   // Not admissible · resubmit (outlined: paperwork)
<DecisionChip decision="REQUEST_CHANGES" size="sm" />
<DecisionChip decision="NEEDS_REVIEW" size="sm" />    // overlay flag, shown next to the decision
```

Never write "Rejected" for a machine result — rejection is a human action and lives on the Reject button. `NEEDS_REVIEW` is a flag that sits *beside* the decision, not instead of it.
