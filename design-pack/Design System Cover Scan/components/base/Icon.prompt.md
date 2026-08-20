Inline lucide icon loaded from `assets/icons/` — use it anywhere CoverScan needs a glyph; never hand-write SVG.

```jsx
<Icon name="shield-x" size={16} />
<Icon name="stamp" size={14} color="var(--status-red)" title="No insurer stamp" />
```

The CoverScan glyph set (from the tokens spec): `shield-check` Compliant · `shield-alert` Request changes · `shield-x` Not admissible · `eye` Needs review · `file-question-mark` Awaiting certificate · `stamp` · `pen-line` signature · `building-2` insurer · `hash` policy no. · `calendar-clock` expiry · `globe` territory · `coins` amounts · `arrow-up-right` open.

Set `window.__CS_ICON_BASE__` once per page when the relative path differs from `../../assets/icons`.
