/* CoverScan app shell — sidebar, header, role and profile switches. */
const DS_shell = window.CoverScanDesignSystem_6debdf || {};
const { Icon: ShIcon, Input: ShInput, Select: ShSelect, ProfileSwitcher: ShProfile, Button: ShButton } = DS_shell;

const NAV = [
  { group: "Monitor", items: [
    { id: "portfolio", label: "Portfolio", icon: "layout-dashboard" },
    { id: "certificates", label: "Certificates", icon: "table" },
    { id: "review", label: "Review queue", icon: "eye", count: 16 }
  ]},
  { group: "Manage", items: [
    { id: "suppliers", label: "Suppliers", icon: "users" },
    { id: "requirements", label: "Requirements", icon: "sliders-horizontal" },
    { id: "integrations", label: "Integrations", icon: "plug" }
  ]}
];

function Sidebar({ route, onNavigate, collapsed, onToggle }) {
  const w = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";
  return (
    <nav style={{ width: w, flex: `0 0 ${w}`, borderRight: "1px solid var(--border)", background: "var(--card)", display: "flex", flexDirection: "column", transition: "width 150ms var(--ease-standard)" }}>
      <div style={{ height: "var(--header-h)", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: "1px solid var(--border)" }}>
        {collapsed
          ? <img src="../../assets/logo-mark.svg" alt="FORVIA" style={{ height: 16, display: "block" }} />
          : <>
              <img src="../../assets/logo-wordmark.png" alt="FORVIA" style={{ height: 14, display: "block" }} />
              <span style={{ width: 1, height: 18, background: "var(--border)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>CoverScan</span>
            </>}
      </div>
      <div style={{ padding: "12px 10px", display: "grid", gap: 4, flex: 1, alignContent: "start" }}>
        {NAV.map(g => (
          <React.Fragment key={g.group}>
            {!collapsed && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted-foreground)", padding: "10px 10px 4px" }}>{g.group}</div>}
            {collapsed && <div style={{ height: 8 }} />}
            {g.items.map(n => {
              const active = n.id === route;
              return (
                <button key={n.id} onClick={() => onNavigate(n.id)} title={n.label} style={{
                  display: "flex", alignItems: "center", gap: 10, height: 36, padding: "0 10px",
                  background: active ? "var(--accent)" : "transparent", color: active ? "var(--primary)" : "var(--foreground)",
                  border: "none", borderRadius: "var(--radius)", cursor: "pointer", font: "inherit", fontSize: 13,
                  fontWeight: active ? 600 : 450, textAlign: "left", width: "100%",
                  transition: "background 120ms var(--ease-standard)"
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--muted)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "var(--accent)" : "transparent"; }}>
                  <ShIcon name={n.icon} size={15} />
                  {!collapsed && <><span style={{ flex: 1 }}>{n.label}</span>
                    {n.count != null && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 18, padding: "0 5px", borderRadius: "var(--radius-full)", background: "var(--status-review-bg)", color: "var(--status-review)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600 }}>{n.count}</span>}</>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ padding: 8, borderTop: "1px solid var(--border)" }}>
        <button onClick={onToggle} title="Collapse sidebar" style={{ display: "flex", alignItems: "center", gap: 10, height: 30, width: "100%", padding: "0 8px", background: "transparent", border: "none", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--muted-foreground)", font: "inherit", fontSize: 12 }}>
          <ShIcon name="panel-left" size={15} />{!collapsed && "Collapse"}
        </button>
      </div>
    </nav>
  );
}

function Header({ role, onRole, profile, onProfile, profiles, onUpload, theme, onTheme }) {
  return (
    <header style={{ height: "var(--header-h)", flex: "0 0 var(--header-h)", borderBottom: "1px solid var(--border)", background: "var(--card)", display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
      <div style={{ width: 320 }}>
        <ShInput size="sm" iconLeft={<ShIcon name="search" size={14} />} placeholder="Search supplier or policy number" style={{ borderRadius: "var(--radius-full)", paddingLeft: 12 }} />
      </div>
      <span style={{ flex: 1 }} />
      <span title="All dates in the demo are computed against this reference date" style={{ fontSize: 11, color: "var(--muted-foreground)", display: "inline-flex", alignItems: "center", gap: 5 }}>
        <ShIcon name="clock" size={12} /><span className="cs-num">15 Apr 2025</span>
      </span>
      <ShProfile value={profile} profiles={profiles} onChange={onProfile} />
      <ShSelect size="sm" value={role} onChange={onRole} options={["Buyer", "Insurance analyst", "Director", "Admin"]} />
      <ShButton size="sm" variant="primary" iconLeft={<ShIcon name="upload" size={14} />} onClick={onUpload}>Upload</ShButton>
      <ShButton size="sm" variant="ghost" title="Toggle dark theme" onClick={onTheme}><ShIcon name={theme === "dark" ? "eye" : "eye-off"} size={14} /></ShButton>
    </header>
  );
}

function PageHeading({ title, sub, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 24px 0" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: "var(--text-h1)" }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
    </div>
  );
}

Object.assign(window, { Sidebar, Header, PageHeading, NAV });
