Side panel for anything that must not lose the certificate behind it.

```jsx
<Sheet open={open} onClose={close} width={560}
  title="Request changes" subtitle="Generated from findings · editable · nothing is sent in the POC"
  footer={<><Button iconLeft={<Icon name="copy" size={14} />}>Copy</Button>
            <Button variant="primary" iconLeft={<Icon name="download" size={14} />}>Download .eml</Button></>}>
  <Input multiline rows={18} value={email} onChange={e => setEmail(e.target.value)} />
</Sheet>
```

For the request email use `RequestEmailSheet`, which pre-fills the template from the findings.
