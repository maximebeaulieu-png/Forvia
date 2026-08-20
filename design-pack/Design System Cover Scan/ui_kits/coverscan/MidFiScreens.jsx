/* Screens 4–6, mid-fidelity: Supplier 360, Requirements profiles, Integrations. */
const DS_ms = window.CoverScanDesignSystem_6debdf || {};
const { Card: MsCard, Button: MsButton, Icon: MsIcon, Badge: MsBadge, Input: MsInput, Select: MsSelect,
        DataTable: MsTable, DecisionChip: MsChip, StatusMiniGrid: MsMini, MaskedText: MsMasked, Progress: MsProgress } = DS_ms;

function Supplier360Screen({ data, onOpen }) {
  const c = data.certificates.find(x => x.id === "10");
  const facts = [["Country", "Italy"], ["Ariba id", "SUP-0066012"], ["Category", "Metal components"], ["Spend tier", "Tier 2"], ["Contracting entity", "Faurecia Emissions Control Technologies Italy"]];
  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid var(--status-amber)", background: "var(--status-amber-bg)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--status-amber)" }}>
        <MsIcon name="triangle-alert" size={15} />
        <span><b style={{ fontWeight: 600 }}>Change detected</b> — product recall dropped from €15,000,000 to €10,000,000 between the 2024 and 2025 certificates.</span>
        <span style={{ flex: 1 }} />
        <MsButton size="sm">Compare</MsButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12 }}>
        <MsCard title="Metraton S.r.l." subtitle="Supplier profile">
          <div style={{ display: "grid", gap: 8 }}>
            {facts.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                <span style={{ width: 132, flex: "0 0 132px", color: "var(--muted-foreground)" }}>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
              <span style={{ width: 132, flex: "0 0 132px", color: "var(--muted-foreground)" }}>Contact</span><MsMasked value="a.ferrari@metraton.it" />
            </div>
          </div>
        </MsCard>
        <MsCard title="Current status">
          <div style={{ display: "grid", gap: 10 }}>
            <MsChip decision="FORMAL_DEFECT" size="md" />
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Best coverage in the batch — one-line fix: recall 10 → 15M and the insurer's stamp.</div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <div><div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Insurer</div><div style={{ fontSize: 13 }}>Generali Italia <MsBadge tone="ink" mono>A · S&P</MsBadge></div></div>
              <div><div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Next expiry</div><div className="cs-num" style={{ fontSize: 13 }}>12 Jul 2025</div></div>
            </div>
          </div>
        </MsCard>
        <MsCard title="Policy numbers on file" subtitle="Kept for claims">
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            {[["2025", "IT-GEN-902244"], ["2024", "IT-GEN-881190"], ["2023", "IT-GEN-844021"]].map(([y, p]) => (
              <div key={y} style={{ display: "flex", gap: 12 }}><span className="cs-num" style={{ color: "var(--muted-foreground)" }}>{y}</span><span className="cs-num">{p}</span></div>
            ))}
          </div>
        </MsCard>
      </div>

      <MsCard title="Certificates by year" padded={false}>
        <MsTable rows={[
          { id: "2025", year: "2025", decision: "FORMAL_DEFECT", mini: { pl: "COMPLIANT", recall: "BELOW_MINIMUM", pfl: "COMPLIANT" }, pl: "€50,000,000", recall: "€10,000,000", pfl: "€15,000,000", received: "22 Feb 2025" },
          { id: "2024", year: "2024", decision: "REQUEST_CHANGES", mini: { pl: "COMPLIANT", recall: "COMPLIANT", pfl: "COMPLIANT" }, pl: "€50,000,000", recall: "€15,000,000", pfl: "€15,000,000", received: "19 Feb 2024" },
          { id: "2023", year: "2023", decision: "REQUEST_CHANGES", mini: { pl: "COMPLIANT", recall: "BELOW_MINIMUM", pfl: "BELOW_MINIMUM" }, pl: "€50,000,000", recall: "€8,000,000", pfl: "€5,000,000", received: "27 Feb 2023" }
        ]} onRowClick={() => onOpen && onOpen(c)} columns={[
          { key: "year", header: "Year", mono: true },
          { key: "decision", header: "Decision", render: r => <MsChip decision={r.decision} size="sm" /> },
          { key: "mini", header: "PL · Recall · PFL", align: "center", render: r => <MsMini pl={r.mini.pl} recall={r.mini.recall} pfl={r.mini.pfl} /> },
          { key: "pl", header: "Product liability", mono: true, align: "right" },
          { key: "recall", header: "Recall", mono: true, align: "right" },
          { key: "pfl", header: "Pure financial loss", mono: true, align: "right" },
          { key: "received", header: "Received", mono: true, muted: true }
        ]} />
      </MsCard>
    </div>
  );
}

function RequirementsScreen({ data, profile, onProfile }) {
  const weights = [["Product liability", 35], ["Product recall", 30], ["Pure financial loss", 20], ["Territory", 10], ["Insurer rating", 5]];
  const sum = weights.reduce((a, w) => a + w[1], 0);
  const expert = profile === "expert";
  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 12, alignItems: "start" }}>
      <MsCard title="Profiles" padded={false}>
        <div style={{ padding: 6, display: "grid", gap: 2 }}>
          {data.profiles.map(p => (
            <button key={p.id} onClick={() => onProfile(p.id)} style={{
              textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer",
              background: p.id === profile ? "var(--accent)" : "transparent", font: "inherit"
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>{p.label}<span className="cs-code">{p.version}</span></div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{p.note}</div>
            </button>
          ))}
          <button style={{ textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: "transparent", font: "inherit", fontSize: 13, color: "var(--muted-foreground)" }}>+ New profile</button>
        </div>
      </MsCard>

      <div style={{ display: "grid", gap: 12 }}>
        <MsCard title="Critical thresholds" subtitle="Applied to every certificate analysed under this profile"
          actions={<MsButton size="sm" variant="primary">Simulate on portfolio</MsButton>}>
          <div style={{ display: "grid", gap: 10 }}>
            {[["Product liability", "20,000,000"], ["Product recall / withdrawal", expert ? "5,000,000" : "15,000,000"], ["Pure financial loss", expert ? "10,000,000" : "15,000,000"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, width: 220, flex: "0 0 220px" }}>{l}</span>
                <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>EUR</span>
                <MsInput mono size="sm" value={v} readOnly style={{ width: 150 }} />
              </div>
            ))}
          </div>
        </MsCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <MsCard title="Gates and severity">
            <div style={{ display: "grid", gap: 10 }}>
              {[["Insurer stamp missing", expert ? "Request changes" : "Block"], ["Issued by a broker", "Block"], ["Signature missing", "Block"], ["Document is a quote", "Block"], ["Expiry within 90 days", "Warning"], ["Insurer rating below A-", "Warning"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, flex: 1 }}>{l}</span>
                  <MsSelect size="sm" value={v} options={["Block", "Request changes", "Warning", "Info"]} />
                </div>
              ))}
            </div>
          </MsCard>
          <MsCard title="Weights" subtitle={`Must sum to 100 — currently ${sum}`}>
            <div style={{ display: "grid", gap: 10 }}>
              {weights.map(([l, w]) => (
                <div key={l} style={{ display: "grid", gridTemplateColumns: "150px 1fr 34px", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>{l}</span>
                  <MsProgress value={w} max={40} />
                  <span className="cs-num" style={{ fontSize: 13, textAlign: "right" }}>{w}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: sum === 100 ? "var(--status-go)" : "var(--status-red)", marginTop: 4 }}>
                <MsIcon name={sum === 100 ? "circle-check" : "triangle-alert"} size={13} />{sum === 100 ? "Weights are valid" : `Weights sum to ${sum}`}
              </div>
            </div>
          </MsCard>
        </div>

        <MsCard title="Simulation on the current portfolio" subtitle="Powered by stored breakdowns — no re-analysis needed">
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[["Decisions changed", expert ? "17" : "0"], ["Becomes compliant", expert ? "11" : "0"], ["Becomes request changes", expert ? "6" : "0"], ["Still not admissible", expert ? "47" : "64"]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>{l}</div><div className="cs-num" style={{ fontSize: 20, fontWeight: 600 }}>{v}</div></div>
            ))}
          </div>
        </MsCard>
      </div>
    </div>
  );
}

function IntegrationsScreen({ data }) {
  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
      <MsCard title="SAP Ariba" subtitle="Supplier qualification questionnaire" actions={<MsBadge tone="go" icon={<MsIcon name="circle-check" size={11} />}>Connected</MsBadge>}>
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          {[["Last sync", "15 Apr 2025 06:00"], ["Schedule", "Daily at 06:00 CET"], ["Environment", "Sandbox (POC)"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10 }}><span style={{ width: 120, flex: "0 0 120px", color: "var(--muted-foreground)" }}>{k}</span><span className="cs-num">{v}</span></div>
          ))}
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted-foreground)" }}>Mapped questionnaire fields</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["decision", "riskScore", "validUntil", "productLiabilityEur", "recallEur", "pureFinancialLossEur", "needsHumanReview", "profileVersion"].map(f => (
              <span key={f} className="cs-code" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>{f}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <MsButton size="sm">Payload preview</MsButton>
            <MsButton size="sm" variant="primary">Sync now</MsButton>
          </div>
        </div>
      </MsCard>

      <MsCard title="Excel export" subtitle="One row per certificate, findings as text">
        <div style={{ display: "grid", gap: 10 }}>
          <MsSelect label="View" value="All" options={["All", "Needs review", "Not admissible", "Expiring", "My suppliers"]} />
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Includes every grid column, the provisional score, and the FX rate used for each amount.</div>
          <div><MsButton size="sm" iconLeft={<MsIcon name="download" size={13} />}>Download .xlsx</MsButton></div>
        </div>
      </MsCard>

      <MsCard title="Registry & rates">
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          {[["Insurer registry", "v2025-03 · 1,412 entries"], ["Last ECB rates fetch", "15 Apr 2025 06:02"], ["ORIAS intermediary list", "v2025-01"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10 }}><span style={{ width: 168, flex: "0 0 168px", color: "var(--muted-foreground)" }}>{k}</span><span className="cs-num">{v}</span></div>
          ))}
          <div><MsButton size="sm" iconLeft={<MsIcon name="refresh-cw" size={13} />}>Refresh registry</MsButton></div>
        </div>
      </MsCard>

      <MsCard title="Model & prompts" subtitle="Recorded with every analysis for audit">
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          {[["Vision model", "v0.4"], ["Extraction prompt", "v3"], ["Scoring rules", "GPTC default v3"], ["Average analysis", "18 s"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10 }}><span style={{ width: 168, flex: "0 0 168px", color: "var(--muted-foreground)" }}>{k}</span><span className="cs-num">{v}</span></div>
          ))}
        </div>
      </MsCard>
    </div>
  );
}

Object.assign(window, { Supplier360Screen, RequirementsScreen, IntegrationsScreen });
