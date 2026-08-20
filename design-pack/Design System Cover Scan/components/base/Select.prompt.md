Dropdown for a small, known set of options.

```jsx
<Select label="Role" value={role} options={["Buyer","Insurance analyst","Director","Admin"]} onChange={setRole} />
<Select label="View" size="sm" value={view} options={["All","Needs review","Not admissible","Expiring","My suppliers"]} onChange={setView} />
```

For the requirements profile in the header use `ProfileSwitcher`, which adds the rescore behaviour.
