The container for every block on a screen — KPI groups, charts, tables, tab bodies.

```jsx
<Card title="Coverage gap by guarantee" subtitle="Median found vs required, all suppliers"
      actions={<Button size="sm">Export Excel</Button>}>
  …
</Card>
<Card padded={false}><DataTable … /></Card>
```

Set `padded={false}` whenever the body is a table or chart so rows run edge to edge.
