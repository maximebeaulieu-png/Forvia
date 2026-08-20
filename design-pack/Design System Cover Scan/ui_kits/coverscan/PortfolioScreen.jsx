/* Screen 2 (brief priority) — Portfolio: exposure at a glance. */
const DS_pf = window.CoverScanDesignSystem_6debdf || {};
const { Card: PfCard, KpiCard, GapBar: PfGapBar, DecisionChip: PfChip, Button: PfButton, Icon: PfIcon, DataTable: PfTable, Tooltip: PfTooltip } = DS_pf;

const compact = v => v >= 1e6 ? `€${+(v / 1e6).toFixed(v % 1e6 ? 1 : 0)}M` : v >= 1e3 ? `€${Math.round(v / 1e3)}k` : `€${v}`;

function CardTitle({ icon, children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><PfIcon name={icon} size={15} color="var(--primary)" />{children}</span>;
}

function ComplianceByCountry({ rows, onSelect }) {
  const max = Math.max(...rows.map(r => r.total));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map(r => (
        <div key={r.code} onClick={() => onSelect && onSelect(r)} style={{ display: "grid", gridTemplateColumns: "104px 1fr 40px", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.country}</span>
          <span style={{ display: "flex", height: 14, width: `${(r.total / max) * 100}%`, borderRadius: 2, overflow: "hidden", background: "var(--gap-track)" }}>
            <PfTooltip content={`${r.go} compliant`} style={{ width: `${(r.go / r.total) * 100}%` }}><span style={{ width: "100%", background: "var(--status-go)", height: 14, display: "block" }} /></PfTooltip>
            <PfTooltip content={`${r.request} request changes`} style={{ width: `${(r.request / r.total) * 100}%` }}><span style={{ width: "100%", background: "var(--status-amber)", height: 14, display: "block" }} /></PfTooltip>
            <PfTooltip content={`${r.nogo} not admissible`} style={{ width: `${(r.nogo / r.total) * 100}%` }}><span style={{ width: "100%", background: "var(--status-red)", height: 14, display: "block" }} /></PfTooltip>
          </span>
          <span className="cs-num" style={{ fontSize: 12, textAlign: "right", color: "var(--muted-foreground)" }}>{r.total}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 11, color: "var(--muted-foreground)" }}>
        {[["Compliant", "var(--status-go)"], ["Request changes", "var(--status-amber)"], ["Not admissible", "var(--status-red)"]].map(([l, c]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function GapByGuarantee({ rows }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {rows.map(r => (
        <div key={r.guarantee} style={{ display: "grid", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{r.guarantee}</span>
            <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>required {compact(r.required)}</span>
            <span className="cs-num" style={{ fontSize: 12, color: "var(--status-go)" }}>{Math.round(r.compliantShare * 100)} % compliant</span>
          </div>
          <PfGapBar found={r.median} required={r.required} width={340} label={`median ${compact(r.median)} · ${Math.round((r.median / r.required) * 100)} %`} />
        </div>
      ))}
    </div>
  );
}

function ExpiringTimeline({ items }) {
  const buckets = [{ k: -1, label: "Expired" }, { k: 30, label: "≤ 30 days" }, { k: 60, label: "≤ 60 days" }, { k: 90, label: "≤ 90 days" }];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {buckets.map(b => {
        const list = items.filter(i => i.bucket === b.k);
        return (
          <div key={b.k} style={{ display: "grid", gridTemplateColumns: "86px 1fr", gap: 12, alignItems: "start" }}>
            <span style={{ fontSize: 12, color: b.k === -1 ? "var(--status-red)" : "var(--muted-foreground)", paddingTop: 3 }}>{b.label}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {list.length === 0 && <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>}
              {list.map(i => (
                <span key={i.supplier} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 8px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}>
                  {i.supplier}<span className="cs-num" style={{ color: "var(--muted-foreground)" }}>{i.date}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PortfolioScreen({ data, onOpen, onFilter }) {
  const p = data.portfolio;
  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard label="Suppliers covered" value={`${p.compliant} / ${p.total}`} icon="shield-check" tone="go" delta="+2" deltaTone="go" sub="6 % of the portfolio is compliant" />
        <KpiCard label="Not admissible" value={p.notAdmissible} tone="red" icon="shield-x" sub={`${p.formal} formal · ${p.structural} structural`} onClick={() => onFilter && onFilter("Not admissible")} />
        <KpiCard label="Critical gaps" value={118} tone="amber" icon="coins" sub="Recall is the #1 gap (78 %)" />
        <KpiCard label="Expiring ≤ 90 days" value={p.expiring90} tone="review" icon="calendar-clock" delta={`${p.expired} expired`} deltaTone="red" sub="Chubb and IMI renew before July" onClick={() => onFilter && onFilter("Expiring")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <PfCard title={<CardTitle icon="globe">Compliance by country</CardTitle>} subtitle="Click a country to filter the certificates table">
          <ComplianceByCountry rows={data.byCountry} onSelect={r => onFilter && onFilter(r.country)} />
        </PfCard>
        <PfCard title={<CardTitle icon="coins">Coverage gap by guarantee</CardTitle>} subtitle="Median found against FORVIA GPTC requirement">
          <GapByGuarantee rows={data.gapByGuarantee} />
        </PfCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <PfCard title={<CardTitle icon="triangle-alert">Top 10 risks</CardTitle>} padded={false} actions={<PfButton size="sm" iconLeft={<PfIcon name="download" size={13} />}>Export Excel</PfButton>}>
          <PfTable rows={data.topRisks} onRowClick={onOpen} columns={[
            { key: "decision", header: "Status", render: r => <PfChip decision={r.decision} size="sm" /> },
            { key: "supplier", header: "Supplier" },
            { key: "country", header: "Country", muted: true },
            { key: "worst", header: "Worst finding", wrap: true },
            { key: "spend", header: "Spend", muted: true },
            { key: "open", header: "", align: "right", render: () => <PfIcon name="arrow-up-right" size={14} color="var(--muted-foreground)" /> }
          ]} />
        </PfCard>
        <PfCard title={<CardTitle icon="calendar-clock">Expiring soon</CardTitle>} subtitle="Next 90 days at the demo clock">
          <ExpiringTimeline items={data.expiring} />
        </PfCard>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", padding: "2px 6px 0", fontSize: 12, color: "var(--muted-foreground)" }}>
        {[[`${p.total}`, "analysed this month"], [`${p.avgSeconds} s`, "average per certificate"], [`${Math.round(p.reviewShare * 100)} %`, "sent to human review"], [`${Math.round(p.fieldAccuracy * 100)} %`, "field accuracy on the reviewed set"]].map(([v, l], i) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
            {i > 0 && <span style={{ margin: "0 8px", color: "var(--border)" }}>·</span>}
            <span className="cs-num" style={{ fontWeight: 600, color: "var(--foreground)" }}>{v}</span>{l}
          </span>
        ))}
        <span style={{ flex: 1 }} />
        <span>Demo dataset: 10 real + 140 synthetic</span>
      </div>
    </div>
  );
}

Object.assign(window, { PortfolioScreen });
