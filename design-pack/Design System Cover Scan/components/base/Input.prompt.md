Single-line or multiline text field — global search, inline reviewer edits, the editable request email.

```jsx
<Input iconLeft={<Icon name="search" size={14} />} placeholder="Search supplier or policy number" />
<Input mono size="sm" value="10,000,000" />
<Input multiline rows={14} value={email} onChange={e => setEmail(e.target.value)} />
```

Inline edits on extracted fields re-score instantly and log an override — pair the field with the confidence dot it came from.
