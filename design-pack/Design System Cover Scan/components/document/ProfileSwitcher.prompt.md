Always visible in the header — the profile switch must be discoverable, and its effect must be visible in the table.

```jsx
<ProfileSwitcher value={profile} onChange={setProfile} profiles={[
  { id: "gptc", label: "GPTC default", version: "v3", note: "PL €20M · recall and PFL €15M · stamp missing blocks" },
  { id: "expert", label: "Expert (R. Mekouar)", version: "v1", note: "Recall €5M accepted · stamp missing requests changes" }
]} />
```

Pair it with `DataTable transition` so rows recolour rather than jump.
