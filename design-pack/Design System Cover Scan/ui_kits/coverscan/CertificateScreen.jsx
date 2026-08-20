/* Screen 1 (the core) — Certificate analysis: document left, FORVIA grid right, one decision. */
const DS_ca = window.CoverScanDesignSystem_6debdf || {};
const {
  DocumentViewer, CoverageGrid, FindingsList, VerificationSeal, VerificationSealList, ScoreRing,
  DecisionChip: CaChip, Badge: CaBadge, Button: CaButton, Icon: CaIcon, Tabs: CaTabs, Card: CaCard,
  Tooltip: CaTooltip, ConfidenceDot: CaDot, ProcessingStepper, RequestEmailSheet, BuildRequestEmail,
  MaskedText: CaMasked, Input: CaInput, Select: CaSelect, GapBar: CaGap
} = DS_ca;
const caBuildEmail = BuildRequestEmail || ((i) => {
  const block = (t, l) => (l && l.length ? `${t}\n${l.map(x => `- ${x}`).join("\n")}\n\n` : "");
  return `Subject: FORVIA — insurance certificate for ${i.supplier}: corrections required\n\nDear ${i.contact || "Sir or Madam"},\n\nAs part of FORVIA's supplier qualification, we reviewed the insurance certificate you provided\n(policy ${i.policyNumber || "—"}, ${i.insurer || "—"}, valid until ${i.validUntil || "—"}). To be accepted under FORVIA's General Purchasing\nTerms and Conditions, the following points must be addressed:\n\n${block("Formal requirements", i.formalPoints)}${block("Coverage requirements (per FORVIA GPTC)", i.coveragePoints)}Please send an updated certificate via SAP Ariba by ${i.dueDate || "—"}. Do not hesitate to forward this message to your insurer or broker.\n\nKind regards,\n${i.buyer || "FORVIA Purchasing"} — FORVIA Purchasing`;
});

function TopBar({ c, effectiveDecision }) {
  return (
    <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--card)", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 style={{ fontSize: "var(--text-h2)" }}>{c.supplier}</h1>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{c.country}</span>
          <span className="cs-code">{c.aribaId}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, fontSize: 12, color: "var(--muted-foreground)", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CaIcon name="building-2" size={12} />{c.insurer}</span>
          <CaBadge tone="ink" mono>{c.rating}</CaBadge>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CaIcon name="hash" size={12} /><span className="cs-num">{c.policyNumber}</span></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CaIcon name="calendar-clock" size={12} /><span className="cs-num">{c.expiry}</span>
            {c.expiryDays != null && <span style={{ color: c.expiryDays < 0 ? "var(--status-red)" : undefined }}>· {c.expiryDays < 0 ? "expired" : `valid · ${c.expiryDays} days left`}</span>}</span>
        </div>
      </div>
      <span style={{ flex: 1 }} />
      <div title={`Profile GPTC default v3 · reference date ${c.received} · model ${c.model} · run ${c.runId}`}
        style={{ textAlign: "right", fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.4, maxWidth: 180 }}>
        Analysed in <span className="cs-num">{c.seconds} s</span><br/>GPTC default v3
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CaDot value={c.accuracy} showValue />
        <CaChip decision={effectiveDecision} size="lg" />
        {c.needsReview && <CaChip decision="NEEDS_REVIEW" size="lg" />}
      </div>
    </div>
  );
}

const DECISION_HERO = {
  GO: { icon: "shield-check", fg: "var(--status-go)", bg: "var(--status-go-bg)" },
  REQUEST_CHANGES: { icon: "shield-alert", fg: "var(--status-amber)", bg: "var(--status-amber-bg)" },
  FORMAL_DEFECT: { icon: "shield-x", fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  STRUCTURAL: { icon: "shield-x", fg: "var(--status-red)", bg: "var(--status-red-bg)" }
};
const GATE_LABELS = (DS_ca.SEAL_GATES || []).length ? DS_ca.SEAL_GATES : [
  { id: "stamp", label: "Insurer stamp" }, { id: "signature", label: "Insurer signature" },
  { id: "insurer", label: "Issuer is the insurer" }, { id: "policyNumber", label: "Policy number" },
  { id: "dates", label: "Validity dates" }, { id: "entity", label: "Contracting entity" },
  { id: "coinsurance", label: "Co-insurance shares" }, { id: "documentType", label: "Document type" }
];

function SummaryPane({ c, onEvidence, activeId, effectiveDecision }) {
  const hero = DECISION_HERO[effectiveDecision] || DECISION_HERO.REQUEST_CHANGES;
  const sentences = (c.summary || "").split(/(?<=\.)\s+/);
  const headline = sentences[0];
  const rest = sentences.slice(1).join(" ");
  const gateTarget = id => ({ id, page: id === "stamp" ? 1 : (c.pages[c.pages.length - 1] || {}).n });
  const failing = GATE_LABELS.filter(g => { const s = (c.gates[g.id] || {}).state; return s === "fail" || s === "review"; });
  const passing = GATE_LABELS.filter(g => { const s = (c.gates[g.id] || {}).state; return s !== "fail" && s !== "review"; });
  const critical = c.coverage.filter(r => (r.group || "critical") === "critical");
  const more = c.coverage.filter(r => (r.group || "critical") !== "critical");
  const [showMore, setShowMore] = React.useState(false);
  const majors = c.findings.filter(f => f.severity === "BLOCK" || f.severity === "CRITICAL");
  const minors = c.findings.filter(f => f.severity !== "BLOCK" && f.severity !== "CRITICAL");
  const [showMinors, setShowMinors] = React.useState(false);

  return (
    <div style={{ padding: 20, display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", padding: "18px 20px", borderRadius: "var(--radius-lg)", background: hero.bg, border: `1px solid color-mix(in oklch, ${hero.fg} 18%, transparent)` }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--card)", color: hero.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 44px", boxShadow: "var(--shadow-sm)" }}>
            <CaIcon name={hero.icon} size={22} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45, textWrap: "pretty", maxWidth: "58ch" }}>{headline}</div>
            {rest && <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted-foreground)", marginTop: 6, textWrap: "pretty", maxWidth: "66ch" }}>{rest}</div>}
          </div>
        </div>
        <ScoreRing value={c.score} provisional={c.provisional} size={104} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, alignItems: "center", padding: "16px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--card)" }}>
        <VerificationSeal gates={c.gates} size={104} onGateClick={id => onEvidence(gateTarget(id))} />
        <div style={{ minWidth: 0, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted-foreground)" }}>Admissibility · {8 - failing.filter(g => (c.gates[g.id] || {}).state === "fail").length} of 8 checks passed</div>
          {failing.length > 0 && (
            <div style={{ display: "grid", gap: 8 }}>
              {failing.map(g => {
                const e = c.gates[g.id] || {};
                const review = e.state === "review";
                return (
                  <button key={g.id} onClick={() => onEvidence(gateTarget(g.id))} style={{ display: "flex", gap: 8, alignItems: "baseline", background: "transparent", border: "none", padding: 0, cursor: "pointer", font: "inherit", textAlign: "left" }}>
                    <span style={{ color: review ? "var(--status-review)" : "var(--status-red)", fontFamily: "var(--font-mono)", fontWeight: 600, flex: "0 0 12px" }}>{review ? "?" : "✗"}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, flex: "0 0 auto" }}>{g.label}</span>
                    {e.note && <span style={{ fontSize: 13, color: "var(--muted-foreground)", minWidth: 0 }}>— {e.note}</span>}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {passing.map(g => {
              const e = c.gates[g.id] || {};
              const na = (e.state || "na") === "na";
              return (
                <CaTooltip key={g.id} content={e.note || (na ? "Not applicable to this certificate" : "Verified")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: "var(--radius-full)", background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 12, cursor: "default", transition: "color 120ms var(--ease-standard)" }}
                    onMouseEnter={e2 => { e2.currentTarget.style.color = "var(--foreground)"; }}
                    onMouseLeave={e2 => { e2.currentTarget.style.color = "var(--muted-foreground)"; }}>
                    <CaIcon name={na ? "minus" : "check"} size={12} color={na ? undefined : "var(--status-go)"} />{g.label}
                  </span>
                </CaTooltip>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <h2 style={{ fontSize: "var(--text-h3)", display: "inline-flex", alignItems: "center", gap: 7 }}><CaIcon name="coins" size={15} color="var(--primary)" />Coverage against FORVIA GPTC</h2>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Click a figure to see it on the document</span>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <CoverageGrid rows={showMore ? c.coverage : critical} activeId={activeId} onEvidenceClick={onEvidence} />
        </div>
        {more.length > 0 && (
          <button onClick={() => setShowMore(v => !v)} style={{ marginTop: 8, background: "transparent", border: "none", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 500, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 5, padding: 0 }}>
            <CaIcon name={showMore ? "chevron-up" : "chevron-down"} size={13} />{showMore ? "Hide" : "Show"} {more.length} secondary guarantee{more.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: "var(--text-h3)", marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 7 }}><CaIcon name="triangle-alert" size={15} color="var(--primary)" />What to fix</h2>
        <FindingsList findings={majors} onEvidenceClick={f => onEvidence({ id: f.ruleId, page: f.page })} />
        {minors.length > 0 && !showMinors && (
          <button onClick={() => setShowMinors(true)} style={{ marginTop: 8, background: "transparent", border: "none", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 500, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 5, padding: 0 }}>
            <CaIcon name="chevron-down" size={13} />Show {minors.length} minor finding{minors.length > 1 ? "s" : ""}
          </button>
        )}
        {showMinors && <FindingsList findings={minors} onEvidenceClick={f => onEvidence({ id: f.ruleId, page: f.page })} />}
      </div>
    </div>
  );
}

function ExtractedPane({ c, onEvidence }) {
  const rows = c.coverage.filter(r => r.foundOriginal || r.status === "MISSING");
  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
        Every field with its original text, the normalised value, the page and the confidence. Editing a value re-scores instantly and logs an override.
      </div>
      {c.currency !== "EUR" && (
        <div style={{ fontSize: 12, padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
          <span className="cs-num">{c.currency}→EUR 1.07</span> · ECB 2024-04-26 — applied to every amount on this certificate
        </div>
      )}
      <table style={{ width: "100%", fontSize: 13 }}>
        <thead><tr>{["Field", "Original text", "Normalised", "Page", "Conf."].map(h => (
          <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", padding: "0 8px 6px", borderBottom: "1px solid var(--border)" }}>{h}</th>
        ))}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ height: 40 }}>
              <td style={{ padding: "0 8px", borderBottom: "1px solid var(--border)" }}>{r.guarantee}</td>
              <td className="cs-quote" style={{ padding: "0 8px", borderBottom: "1px solid var(--border)", maxWidth: 260 }}>{r.quote ? `« ${r.quote} »` : "—"}</td>
              <td style={{ padding: "0 8px", borderBottom: "1px solid var(--border)" }}>
                {r.foundOriginal ? <CaInput mono size="sm" defaultValue={r.foundOriginal} style={{ width: 130 }} /> : <span style={{ color: "var(--status-red)", fontSize: 12 }}>missing</span>}
              </td>
              <td className="cs-num" style={{ padding: "0 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                {r.page != null ? <button onClick={() => onEvidence(r)} style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", color: "var(--primary)", padding: 0 }}>p.{r.page}</button> : "—"}
              </td>
              <td style={{ padding: "0 8px", borderBottom: "1px solid var(--border)" }}>{r.confidence != null && <CaDot value={r.confidence} page={r.page} quote={r.quote} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {c.contact && (
        <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--muted-foreground)" }}>Contact on cover letter</span><CaMasked value={c.contact} />
        </div>
      )}
    </div>
  );
}

function TerritoryPane({ c }) {
  const cells = [
    { label: "Worldwide", state: "included" },
    { label: "USA / Canada", state: c.coverage.some(r => r.territoryExcluded) ? "excluded" : "unclear" },
    { label: "Other territories", state: "included" }
  ];
  const color = s => s === "included" ? "var(--status-go)" : s === "excluded" ? "var(--status-red)" : "var(--status-review)";
  const exclusions = c.coverage.filter(r => r.territoryExcluded || r.status === "EXCLUDED");
  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {cells.map(t => (
          <div key={t.label} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, background: "var(--card)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}><CaIcon name="globe" size={13} />{t.label}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: color(t.state), textTransform: "capitalize" }}>{t.state}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: 8 }}>Exclusions that matter</h3>
        {exclusions.length === 0 && <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>No critical exclusion detected.</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {exclusions.map(r => (
            <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 13, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
              <CaBadge tone="red" icon={<CaIcon name="ban" size={11} />}>Critical</CaBadge>
              <span style={{ flex: 1 }}>{r.guarantee} — {r.territory || "excluded"}</span>
              {r.quote && <span className="cs-quote" style={{ flex: "0 0 42%" }}>« {r.quote} »</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryPane({ c }) {
  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid var(--status-amber)", background: "var(--status-amber-bg)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--status-amber)" }}>
        <CaIcon name="triangle-alert" size={15} />
        <span>No previous certificate on file for {c.supplier}. Change detection starts from this analysis.</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Policy numbers kept for claims: <span className="cs-num">{c.policyNumber}</span></div>
    </div>
  );
}

function AuditPane({ data }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "grid", gap: 0 }}>
        {data.audit.map((a, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "132px 1fr 130px 90px", gap: 10, alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
            <span className="cs-num" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{a.at}</span>
            <span>{a.what}</span>
            <span style={{ color: "var(--muted-foreground)" }}>{a.who}</span>
            <span className="cs-code">{a.ref}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionPanel({ c, effectiveDecision, onRequest, onApprove, onReject, onAriba, onMarkReviewed }) {
  const canApprove = effectiveDecision === "GO";
  return (
    <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--card)", boxShadow: "var(--shadow-sticky)", display: "flex", alignItems: "center", gap: 8 }}>
      <CaButton variant="primary" size="lg" iconLeft={<CaIcon name="mail" size={15} />} onClick={onRequest}>Request changes</CaButton>
      <CaTooltip content={canApprove ? "Approve this certificate" : "Approve requires a Compliant decision, or an override with justification"}>
        <CaButton size="lg" disabled={!canApprove} onClick={onApprove}>Approve</CaButton>
      </CaTooltip>
      <CaButton size="lg" variant="ghost" onClick={onReject}>Reject</CaButton>
      <span style={{ flex: 1 }} />
      {c.needsReview && <CaButton size="lg" variant="ghost" iconLeft={<CaIcon name="check" size={14} />} onClick={onMarkReviewed}>Mark reviewed</CaButton>}
      <CaButton size="lg" variant="secondary" iconLeft={<CaIcon name="external-link" size={14} />} onClick={onAriba}>Send to SAP Ariba</CaButton>
    </div>
  );
}

function CertificateScreen({ c, data, processing, profile, onBack }) {
  const [tab, setTab] = React.useState("summary");
  const [page, setPage] = React.useState((c.pages && c.pages[0] && c.pages[0].n) || 1);
  const [active, setActive] = React.useState(null);
  const [evidenceOn, setEvidenceOn] = React.useState(true);
  const [sheet, setSheet] = React.useState(null);
  const [reviewed, setReviewed] = React.useState(false);
  const effective = (profile === "expert" && c.flipsOnExpert) ? "REQUEST_CHANGES" : c.decision;

  const email = React.useMemo(() => {
    const e = c.email || {};
    return caBuildEmail({
      supplier: c.supplier, contact: e.contact, policyNumber: c.policyNumber, insurer: c.insurer,
      validUntil: e.validUntil || c.expiry, dueDate: e.dueDate || "30 April 2025",
      formalPoints: e.formalPoints || c.findings.filter(f => f.severity === "BLOCK").map(f => f.fix).filter(Boolean),
      coveragePoints: e.coveragePoints || c.findings.filter(f => f.severity === "CRITICAL").map(f => f.fix).filter(Boolean),
      buyer: "L. Fontaine"
    });
  }, [c]);
  const [emailText, setEmailText] = React.useState(email);
  React.useEffect(() => setEmailText(email), [email]);

  const onEvidence = target => {
    const hl = (c.highlights || []).find(h => h.id === (target.id || target));
    const p = (hl && hl.page) || target.page || page;
    setPage(p); setActive(null);
    requestAnimationFrame(() => setActive(target.id || target));
  };

  const cert = { ...c, needsReview: c.needsReview && !reviewed };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1, position: "relative" }}>
      <div style={{ padding: "10px 24px 0" }}>
        <CaButton size="sm" variant="ghost" iconLeft={<CaIcon name="arrow-right" size={13} style={{ transform: "rotate(180deg)" }} />} onClick={onBack}>Certificates</CaButton>
      </div>
      <TopBar c={cert} effectiveDecision={effective} />

      <div style={{ display: "flex", gap: "var(--split-gutter)", flex: 1, minHeight: 0, padding: "14px 24px" }}>
        <div style={{ flex: "0 0 43%", minWidth: 0, display: "flex" }}>
          <DocumentViewer pages={c.pages || []} activePage={page} onPageChange={setPage}
            highlights={c.highlights || []} activeHighlightId={active}
            showEvidence={evidenceOn} onToggleEvidence={() => setEvidenceOn(v => !v)}
            ocrUsed={c.ocrUsed} fileName={`${c.supplier}.pdf`} style={{ flex: 1, minWidth: 0 }} />
        </div>
        <div style={{ width: 6, flex: "0 0 6px", cursor: "col-resize", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 2, height: 28, background: "var(--border)", borderRadius: 1 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", overflow: "hidden" }}>
          {processing ? (
            <div style={{ padding: 20, display: "grid", gap: 16 }}>
              <h2 style={{ fontSize: "var(--text-h3)" }}>Analysing certificate</h2>
              <ProcessingStepper current={processing.current} timings={processing.timings} />
              <div style={{ display: "grid", gap: 8 }}>
                {[64, 120, 96].map((h, i) => <div key={i} style={{ height: h, borderRadius: "var(--radius)", background: "var(--muted)" }} />)}
              </div>
            </div>
          ) : (
            <CaTabs value={tab} onChange={setTab} style={{ flex: 1, minHeight: 0 }}
              tabs={[{ id: "summary", label: "Summary", icon: "file-text" }, { id: "data", label: "Extracted data", icon: "table", count: c.coverage.length },
                     { id: "excl", label: "Exclusions & territory", icon: "globe" }, { id: "hist", label: "History", icon: "clock" }, { id: "audit", label: "Audit", icon: "eye" }]}>
              {tab === "summary" && <SummaryPane c={cert} onEvidence={onEvidence} activeId={active} effectiveDecision={effective} />}
              {tab === "data" && <ExtractedPane c={cert} onEvidence={onEvidence} />}
              {tab === "excl" && <TerritoryPane c={cert} />}
              {tab === "hist" && <HistoryPane c={cert} />}
              {tab === "audit" && <AuditPane data={data} />}
            </CaTabs>
          )}
        </div>
      </div>

      {!processing && (
        <DecisionPanel c={cert} effectiveDecision={effective}
          onRequest={() => setSheet("email")} onApprove={() => setSheet("approve")}
          onReject={() => setSheet("reject")} onAriba={() => setSheet("ariba")}
          onMarkReviewed={() => setReviewed(true)} />
      )}

      <RequestEmailSheet open={sheet === "email"} onClose={() => setSheet(null)} supplier={c.supplier}
        email={emailText} onChange={e => setEmailText(e.target.value)} />

      {sheet === "ariba" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={() => setSheet(null)} style={{ position: "absolute", inset: 0, background: "rgba(1,0,61,.32)" }} />
          <aside style={{ position: "relative", width: 520, height: "100%", background: "var(--card)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-sheet)", display: "flex", flexDirection: "column" }}>
            <header style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}><h2 style={{ fontSize: "var(--text-h3)" }}>SAP Ariba payload</h2>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Preview only — sync is mocked in the POC</div></div>
              <CaButton size="sm" variant="ghost" onClick={() => setSheet(null)}><CaIcon name="x" size={15} /></CaButton>
            </header>
            <pre style={{ flex: 1, overflow: "auto", margin: 0, padding: 16, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--foreground)" }}>{JSON.stringify({
              supplierId: c.aribaId, certificateId: c.id, decision: effective,
              riskScore: c.provisional ? null : c.score, provisionalScore: c.provisional ? c.score : undefined,
              profile: "FORVIA_GPTC_DEFAULT@v3",
              guarantees: c.coverage.filter(r => r.required).map(r => ({ code: r.id, requiredEur: r.required, foundEur: r.foundEur || null, status: r.status })),
              validUntil: c.expiry, needsHumanReview: !!c.needsReview, runId: c.runId
            }, null, 2)}</pre>
            <footer style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <CaButton onClick={() => setSheet(null)}>Close</CaButton>
              <CaButton variant="primary" onClick={() => setSheet(null)}>Sync now</CaButton>
            </footer>
          </aside>
        </div>
      )}

      {(sheet === "reject" || sheet === "approve") && (
        <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "grid", placeItems: "center" }}>
          <div onClick={() => setSheet(null)} style={{ position: "absolute", inset: 0, background: "rgba(1,0,61,.32)" }} />
          <div style={{ position: "relative", width: 420, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-popover)", padding: 16, display: "grid", gap: 12 }}>
            <h2 style={{ fontSize: "var(--text-h3)" }}>{sheet === "reject" ? "Reject certificate" : "Approve with override"}</h2>
            {sheet === "reject"
              ? <CaSelect label="Reason" width={240} value="Not admissible — broker-issued" options={["Not admissible — broker-issued", "Not admissible — no insurer stamp", "Coverage insufficient", "Document is a quote", "Other"]} />
              : <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>This certificate is not compliant. A written justification is required and will be logged against your name.</div>}
            <CaInput multiline rows={4} placeholder="Note (logged)" />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <CaButton onClick={() => setSheet(null)}>Cancel</CaButton>
              <CaButton variant={sheet === "reject" ? "destructive" : "primary"} onClick={() => setSheet(null)}>{sheet === "reject" ? "Reject" : "Approve"}</CaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CertificateScreen });
