Action button — use `primary` once per screen (the decision), `outline` for everything else.

```jsx
<Button variant="primary" size="lg" iconLeft={<Icon name="mail" size={15} />}>Request changes</Button>
<Button>Approve</Button>
<Button variant="ghost" size="sm">Mark reviewed</Button>
```

Labels are verbs in sentence case. `Approve` is disabled unless the decision is Compliant, or an override justification has been entered.
