/* Screen 3 — Certificates queue and table. */
const DS_cq = window.CoverScanDesignSystem_6debdf || {};
const { Card: CqCard, DataTable: CqTable, DecisionChip: CqChip, StatusMiniGrid: CqMini, ConfidenceDot: CqDot, Badge: CqBadge, Button: CqButton, Icon: CqIcon, Select: CqSelect, Input: CqInput, Tooltip: CqTooltip } = DS_cq;

const VIEWS = ["All", "Needs review", "Not admissible", "Expiring", "My suppliers"];

function UploadZone({ onUpload }) {
  const [over, setOver] = React.useState(false);
  return (
    <div onClick={onUpload}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onUpload(); }}
      style={{
        border: `1px dashed ${over ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius-lg)",
        background: over ? "var(--accent)" : "transparent", padding: "9px 14px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10, transition: "background 120ms var(--ease-standard)"
      }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--secondary)", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 28px" }}>
        <CqIcon name="upload" size={14} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>Drop a certificate here</span>
      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>PDF or PNG · analysed in under 30 s</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--primary)" }}>Browse files</span>
    </div>
  );
}

function CertificatesScreen({ data, view, onView, onOpen, onUpload, profile, filter }) {
  const all = data.certificates;
  const rows = React.useMemo(() => {
    let r = all;
    if (view === "Needs review") r = r.filter(c => c.needsReview);
    if (view === "Not admissible") r = r.filter(c => c.decision === "FORMAL_DEFECT" || c.decision === "STRUCTURAL");
    if (view === "Expiring") r = r.filter(c => c.expiryDays != null && c.expiryDays <= 90);
    if (view === "My suppliers") r = r.filter(c => c.assignee === "L. Fontaine");
    if (filter) r = r.filter(c => c.country === filter || c.decision === "STRUCTURAL" || c.decision === "FORMAL_DEFECT");
    return r;
  }, [view, filter, all]);

  const effective = c => (profile === "expert" && c.flipsOnExpert) ? "REQUEST_CHANGES" : c.decision;

  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 2, background: "var(--muted)", padding: 3, borderRadius: "var(--radius-full)" }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => onView(v)} style={{
              height: 26, padding: "0 12px", fontSize: 12, fontWeight: v === view ? 600 : 450,
              background: v === view ? "var(--card)" : "transparent", color: "var(--foreground)",
              border: "none", borderRadius: "var(--radius-full)", cursor: "pointer", font: "inherit",
              boxShadow: v === view ? "var(--shadow-sm)" : "none"
            }}>{v}</button>
          ))}
        </div>
        <CqSelect size="sm" value="All countries" options={["All countries", "Germany", "France", "Spain", "Italy", "Switzerland", "India"]} />
        <CqSelect size="sm" value="All insurers" options={["All insurers", "Allianz", "Chubb", "Generali", "Zurich", "Swiss Mobiliar", "ICICI Lombard", "MMA"]} />
        <CqButton size="sm" variant="ghost" iconLeft={<CqIcon name="funnel" size={13} />}>More filters</CqButton>
        <span style={{ flex: 1 }} />
        <CqButton size="sm" iconLeft={<CqIcon name="refresh-cw" size={13} />}>Re-run with profile</CqButton>
        <CqButton size="sm" iconLeft={<CqIcon name="download" size={13} />}>Export Excel</CqButton>
      </div>

      <UploadZone onUpload={onUpload} />

      <CqCard padded={false} subtitle={null} title={null}>
        <CqTable rows={rows} onRowClick={onOpen} transition emptyMessage="No certificates match. Clear filters or upload one." columns={[
          { key: "decision", header: "Status", render: r => (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CqChip decision={effective(r)} size="sm" />
              {r.needsReview && <CqChip decision="NEEDS_REVIEW" size="sm" />}
            </span>
          ) },
          { key: "supplier", header: "Supplier", render: r => (
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontWeight: 500 }}>{r.supplier}</span>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{r.code}</span>
            </span>
          ) },
          { key: "insurer", header: "Insurer", render: r => (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {r.insurer}<CqBadge tone="ink" mono>{r.rating}</CqBadge>
            </span>
          ) },
          { key: "mini", header: "PL · Recall · PFL", align: "center", render: r => <CqMini pl={r.mini.pl} recall={r.mini.recall} pfl={r.mini.pfl} /> },
          { key: "score", header: "Score", align: "right", mono: true, render: r => r.provisional
            ? <CqTooltip content={`Provisional ${r.score} — not admissible, shown for information`}><span style={{ color: "var(--muted-foreground)" }}>—</span></CqTooltip>
            : <span>{r.score}</span> },
          { key: "accuracy", header: "Accuracy", align: "center", render: r => <CqDot value={r.accuracy} /> },
          { key: "expiry", header: "Expiry", mono: true, render: r => (
            <span style={{ color: r.expiryDays != null && r.expiryDays < 0 ? "var(--status-red)" : undefined }}>
              {r.expiry}{r.expiryDays != null && <span style={{ color: "var(--muted-foreground)" }}> · {r.expiryDays < 0 ? "expired" : `in ${r.expiryDays} d`}</span>}
            </span>
          ) },
          { key: "received", header: "Received", mono: true, muted: true },
          { key: "assignee", header: "Assignee", render: r => r.assignee && r.assignee !== "—" ? (
            <span title={r.assignee} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 22, height: 22, borderRadius: "var(--radius-full)", background: "var(--secondary)", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, letterSpacing: ".02em" }}>{r.assignee.split(/[.\s]+/).filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase()}</span>
              <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{r.assignee}</span>
            </span>
          ) : <span style={{ color: "var(--muted-foreground)" }}>—</span> }
        ]} />
      </CqCard>
      <div style={{ fontSize: 11, color: "var(--muted-foreground)", padding: "0 6px" }}>
        Showing {rows.length} of 150 · the 10 real FORVIA certificates are shown; 140 synthetic rows are hidden in this mockup.
      </div>
    </div>
  );
}

Object.assign(window, { CertificatesScreen });
