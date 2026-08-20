"use client";

import * as React from "react";
import Link from "next/link";
import type { CachedCertificateT } from "@coverscan/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CertificateHeader,
} from "@/components/coverscan/CertificateHeader";
import {
  CoverageGrid, type CoverageRow,
  DocumentViewer, type DocumentPage, type EvidenceHighlight,
  FindingsList, type Finding,
  ConfidenceDot,
  MaskedText,
  ProfileSwitcher,
  RequestEmailSheet, buildRequestEmail,
  ScoreRing,
  VerificationSeal, type SealGateState,
} from "@/components/coverscan";
import { formatEur } from "@/lib/format";
import { REFERENCE_DATE } from "@/lib/config";

/* The repository JSON is schema-validated at build time (scripts/build-cached-data.mjs).
   This local shape narrows the passthrough fields the screen consumes.
   NOTE: all amounts in the cached data are EUR MAJOR units — multiply by 100
   before handing them to the minor-unit formatters/components. */
interface DeepCert {
  id: string;
  supplier: string;
  country?: string;
  insurer?: string;
  rating?: string;
  policyNumber?: string;
  decision: "GO" | "REQUEST_CHANGES" | "FORMAL_DEFECT" | "STRUCTURAL" | "NEEDS_REVIEW" | "PROCESSING" | "PENDING";
  score?: number | null;
  provisional?: boolean;
  accuracy?: number;
  currency?: string;
  expiry?: string;
  expiryDays?: number | null;
  received?: string;
  assignee?: string;
  aribaId?: string;
  entity?: string;
  seconds?: number;
  model?: string;
  runId?: string;
  needsReview?: boolean;
  ocrUsed?: boolean;
  summary?: string;
  pages?: { n: number; imageUrl: string; lang?: string; ocrUsed?: boolean }[];
  gates?: Record<string, SealGateState>;
  coverage?: Array<{
    id: string; guarantee: string; required?: number; foundOriginal?: string;
    foundEur?: number | null; status: CoverageRow["status"]; basis?: string;
    deductible?: string; territory?: string; territoryExcluded?: boolean;
    confidence?: number; page?: number; quote?: string;
  }>;
  findings?: Finding[];
  highlights?: Array<{ id: string; page: number; x: number; y: number; w: number; h: number }>;
  email?: {
    contact?: string; validUntil?: string; dueDate?: string;
    formalPoints?: string[]; coveragePoints?: string[];
  };
  guarantees?: Array<{
    code: string; labelOriginal?: string; page?: number; amountOriginal?: number | null;
    currency?: string; amountEur?: number | null; basis?: string; deductible?: number | string | null;
    status: string; confidence?: number; note?: string | null;
  }>;
  exclusions?: Array<{ text: string; critical?: boolean }> | string[] | null;
  territory?: { statement?: string; usaCanada?: string };
  trigger?: string;
  basisSummary?: string;
  fx?: { rate?: number; date?: string; from?: string } | Record<string, never>;
  computed?: {
    riskScore?: number | null;
    breakdown?: Record<string, { required?: number | string; found?: number | null; status?: string; points?: number; max?: number }>;
  };
}

const eur = (major: number) => formatEur(Math.round(major * 100));

const BREAKDOWN_LABELS: Record<string, { label: string; group: CoverageRow["group"] }> = {
  PRODUCT_LIABILITY: { label: "Product liability", group: "critical" },
  PRODUCT_RECALL: { label: "Product recall / withdrawal costs", group: "critical" },
  PURE_FINANCIAL_LOSS: { label: "Pure financial loss", group: "critical" },
  CONSEQUENTIAL_FINANCIAL_LOSS: { label: "Consequential financial loss (DIC)", group: "secondary" },
  DISMANTLING_REFITTING: { label: "Dismantling and refitting", group: "secondary" },
  EXTENDED_PRODUCT_LIABILITY: { label: "Extended product liability", group: "secondary" },
  TERRITORY_USA_CANADA: { label: "Territory incl. USA/Canada", group: "secondary" },
  AGGREGATE_BASIS: { label: "Aggregate basis", group: "secondary" },
};

function coverageRows(c: DeepCert): CoverageRow[] {
  if (c.coverage?.length) {
    return c.coverage.map((r) => ({
      ...r,
      required: r.required != null ? Math.round(r.required * 100) : undefined,
      foundEur: r.foundEur != null ? Math.round(r.foundEur * 100) : r.foundEur,
      group: ["pl", "recall", "pfl"].includes(r.id) ? "critical" : "secondary",
    }));
  }
  const rows: CoverageRow[] = [];
  const bd = c.computed?.breakdown ?? {};
  for (const [code, v] of Object.entries(bd)) {
    if (code.startsWith("_")) continue;
    const meta = BREAKDOWN_LABELS[code] ?? { label: code, group: "other" as const };
    const requiredMajor = typeof v.required === "number" ? v.required : undefined;
    rows.push({
      id: code.toLowerCase(),
      guarantee: meta.label,
      required: requiredMajor != null ? Math.round(requiredMajor * 100) : undefined,
      foundEur: v.found != null ? Math.round(v.found * 100) : v.found ?? null,
      foundOriginal: v.found != null ? eur(v.found) : undefined,
      status: (v.status ?? "UNCLEAR") as CoverageRow["status"],
      group: meta.group,
    });
  }
  for (const g of c.guarantees ?? []) {
    if (BREAKDOWN_LABELS[g.code] || bd[g.code]) continue;
    rows.push({
      id: g.code.toLowerCase(),
      guarantee: g.labelOriginal ?? g.code,
      foundEur: g.amountEur != null ? Math.round(g.amountEur * 100) : null,
      foundOriginal: g.amountOriginal != null && g.currency ? `${g.currency} ${g.amountOriginal.toLocaleString("en-US")}` : undefined,
      status: (g.status === "PRESENT" ? "PRESENT" : g.status) as CoverageRow["status"],
      basis: g.basis,
      confidence: g.confidence,
      page: g.page,
      group: "other",
    });
  }
  return rows;
}

function derivedFindings(c: DeepCert): Finding[] {
  if (c.findings?.length) return c.findings;
  const out: Finding[] = [];
  for (const [gate, s] of Object.entries(c.gates ?? {})) {
    if (s.state === "fail") out.push({ ruleId: `GATE_${gate.toUpperCase()}`, severity: "BLOCK", title: s.note ?? `${gate} check failed`, fix: `Resolve the ${gate} defect and resubmit the certificate.` });
    else if (s.state === "review") out.push({ ruleId: `GATE_${gate.toUpperCase()}`, severity: "WARNING", title: s.note ?? `${gate} needs human review` });
  }
  for (const [code, v] of Object.entries(c.computed?.breakdown ?? {})) {
    if (v.status === "BELOW_MINIMUM" && typeof v.required === "number") {
      out.push({
        ruleId: code, severity: "CRITICAL",
        title: `${BREAKDOWN_LABELS[code]?.label ?? code}: ${v.found != null ? eur(v.found) : "n/a"} against ${eur(v.required)} required`,
        fix: `Increase ${BREAKDOWN_LABELS[code]?.label ?? code} to at least ${eur(v.required)}.`,
      });
    } else if (v.status === "MISSING") {
      out.push({ ruleId: code, severity: "CRITICAL", title: `${BREAKDOWN_LABELS[code]?.label ?? code} is not mentioned in the certificate`, fix: `Add ${BREAKDOWN_LABELS[code]?.label ?? code} cover${typeof v.required === "number" ? ` of at least ${eur(v.required)}` : ""}.` });
    }
  }
  const order = { BLOCK: 0, CRITICAL: 1, WARNING: 2, INFO: 3 } as const;
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

function emailText(c: DeepCert, findings: Finding[]): string {
  const gaps = findings.filter((f) => f.severity === "CRITICAL").map((f) => f.fix ?? f.title);
  const formal = findings.filter((f) => f.severity === "BLOCK").map((f) => f.fix ?? f.title);
  return buildRequestEmail({
    supplier: c.supplier,
    contact: c.email?.contact,
    policyNumber: c.policyNumber,
    insurer: c.insurer,
    validUntil: c.email?.validUntil ?? c.expiry,
    dueDate: c.email?.dueDate,
    formalPoints: c.email?.formalPoints ?? formal,
    coveragePoints: c.email?.coveragePoints ?? gaps,
  });
}

const TERRITORY_CELLS: Array<{ key: string; label: string }> = [
  { key: "worldwide", label: "Worldwide" },
  { key: "usaCanada", label: "USA / Canada" },
  { key: "other", label: "Other" },
];

export function CertificateView({ cert, prevId, nextId }: { cert: CachedCertificateT; prevId?: string; nextId?: string }) {
  const c = cert as unknown as DeepCert;
  const [activePage, setActivePage] = React.useState(c.pages?.[0]?.n ?? 1);
  const [activeHighlightId, setActiveHighlightId] = React.useState<string | undefined>();
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);

  const rows = React.useMemo(() => coverageRows(c), [c]);
  const findings = React.useMemo(() => derivedFindings(c), [c]);
  const highlights: EvidenceHighlight[] = (c.highlights ?? []) as EvidenceHighlight[];
  const pages: DocumentPage[] = (c.pages ?? []) as DocumentPage[];
  const provisional = c.decision === "FORMAL_DEFECT" || c.decision === "STRUCTURAL";

  const jumpToEvidence = (id?: string, page?: number) => {
    const h = id ? highlights.find((x) => x.id === id) : undefined;
    if (h) { setActivePage(h.page); setActiveHighlightId(h.id); }
    else if (page) { setActivePage(page); setActiveHighlightId(undefined); }
  };

  const usaCanada = c.territory?.usaCanada ?? "UNCLEAR";
  const cellState = (key: string) =>
    key === "usaCanada"
      ? usaCanada === "INCLUDED" ? "included" : usaCanada === "PARTIAL_EXCLUDED" ? "partially excluded" : usaCanada === "EXCLUDED" ? "excluded" : "unclear"
      : key === "worldwide" ? "included" : "see wording";

  return (
    <div className="flex h-screen flex-col bg-background">
      <CertificateHeader
        supplier={c.supplier} country={c.country} aribaId={c.aribaId}
        insurer={c.insurer} rating={c.rating} policyNumber={c.policyNumber}
        expiry={c.expiry} expiryDays={c.expiryDays}
        decision={c.decision} needsReview={c.needsReview}
        accuracy={c.accuracy} seconds={c.seconds} model={c.model} runId={c.runId}
      />
      <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-1.5">
        <Button variant="ghost" size="sm" asChild disabled={!prevId}>
          <Link href={prevId ? `/certificates/${prevId}` : "#"} aria-disabled={!prevId}>← Prev</Link>
        </Button>
        <span className="cs-code">Certificate {c.id} / 10</span>
        <Button variant="ghost" size="sm" asChild disabled={!nextId}>
          <Link href={nextId ? `/certificates/${nextId}` : "#"} aria-disabled={!nextId}>Next →</Link>
        </Button>
        <div className="ml-auto">
          <ProfileSwitcher
            value="gptc"
            profiles={[
              { id: "gptc", label: "FORVIA GPTC default" },
              { id: "expert", label: "Expert (R. Mekouar)" },
            ]}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <section className="w-[46%] min-w-0 border-r border-border" aria-label="Document">
          <DocumentViewer
            pages={pages} activePage={activePage} onPageChange={setActivePage}
            highlights={highlights} activeHighlightId={activeHighlightId}
            ocrUsed={c.ocrUsed}
          />
        </section>

        <section className="flex min-w-0 flex-1 flex-col" aria-label="Analysis">
          <Tabs defaultValue="summary" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-6 mt-3 self-start">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="extracted">Extracted data</TabsTrigger>
              <TabsTrigger value="exclusions">Exclusions &amp; territory</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-4">
              <TabsContent value="summary" className="space-y-6">
                {c.summary ? <p style={{ maxWidth: "70ch" }}>{c.summary}</p> : null}
                <div className="flex flex-wrap items-start gap-8">
                  {c.gates ? (
                    <VerificationSeal gates={c.gates} onGateClick={() => jumpToEvidence(undefined, 1)} />
                  ) : null}
                  {c.score != null ? (
                    <div>
                      <ScoreRing value={c.score} provisional={provisional} onClick={() => setBreakdownOpen((v) => !v)} />
                      {breakdownOpen && c.computed?.breakdown ? (
                        <Card className="mt-2 max-w-xs p-3">
                          <p className="mb-1 font-medium" style={{ fontSize: "var(--text-caption)" }}>Score breakdown</p>
                          <ul className="space-y-0.5" style={{ fontSize: "var(--text-micro)" }}>
                            {Object.entries(c.computed.breakdown).map(([k, v]) =>
                              typeof v === "object" && v.max != null ? (
                                <li key={k} className="flex justify-between gap-3">
                                  <span className="text-muted-foreground">{BREAKDOWN_LABELS[k]?.label ?? k}</span>
                                  <span className="cs-num">{v.points ?? 0}/{v.max}</span>
                                </li>
                              ) : null,
                            )}
                          </ul>
                        </Card>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <CoverageGrid
                  rows={rows} activeId={activeHighlightId}
                  onEvidenceClick={(r) => jumpToEvidence(r.id, r.page)}
                />
                <FindingsList findings={findings} onEvidenceClick={(f) => jumpToEvidence(undefined, f.page)} />
              </TabsContent>

              <TabsContent value="extracted">
                <table className="w-full border-collapse" style={{ fontSize: "var(--text-dense)" }}>
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Original label</th>
                      <th className="py-2 pr-3 font-medium">Original value</th>
                      <th className="py-2 pr-3 font-medium">EUR</th>
                      <th className="py-2 pr-3 font-medium">Basis</th>
                      <th className="py-2 pr-3 font-medium">Page</th>
                      <th className="py-2 font-medium">Conf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(c.guarantees ?? []).map((g, i) => (
                      <tr key={i} className="border-b border-border align-top">
                        <td className="max-w-[26ch] py-2 pr-3">{g.labelOriginal ?? g.code}</td>
                        <td className="py-2 pr-3"><span className="cs-num">{g.amountOriginal != null ? `${g.currency ?? ""} ${g.amountOriginal.toLocaleString("en-US")}` : "—"}</span></td>
                        <td className="py-2 pr-3"><span className="cs-num">{g.amountEur != null ? eur(g.amountEur) : "—"}</span></td>
                        <td className="py-2 pr-3 text-muted-foreground">{g.basis ?? "—"}</td>
                        <td className="py-2 pr-3"><button className="text-primary" onClick={() => jumpToEvidence(undefined, g.page)}>p.{g.page ?? "—"}</button></td>
                        <td className="py-2">{g.confidence != null ? <ConfidenceDot value={g.confidence} /> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-muted-foreground" style={{ fontSize: "var(--text-micro)" }}>
                  {c.fx && "rate" in c.fx && c.fx.rate !== 1
                    ? `FX ${c.fx.from ?? c.currency}→EUR ${c.fx.rate} · ECB ${c.fx.date ?? REFERENCE_DATE}`
                    : `All amounts in EUR — no conversion applied · reference date ${REFERENCE_DATE}`}
                </p>
                <p className="mt-1 text-muted-foreground" style={{ fontSize: "var(--text-micro)" }}>
                  Inline field editing with instant re-score arrives with the rules engine (Sprint 1).
                </p>
              </TabsContent>

              <TabsContent value="exclusions" className="space-y-5">
                <div className="grid max-w-xl grid-cols-3 gap-2">
                  {TERRITORY_CELLS.map((cell) => {
                    const state = cellState(cell.key);
                    const bad = state.includes("exclu");
                    return (
                      <Card key={cell.key} className={`p-3 text-center ${bad ? "border-(--status-red)" : ""}`}>
                        <p className="font-medium" style={{ fontSize: "var(--text-caption)" }}>{cell.label}</p>
                        <p className={bad ? "text-(--status-red)" : "text-muted-foreground"} style={{ fontSize: "var(--text-micro)" }}>{state}</p>
                      </Card>
                    );
                  })}
                </div>
                {c.territory?.statement ? <p className="cs-quote">“{c.territory.statement}”</p> : null}
                <ul className="space-y-2">
                  {(Array.isArray(c.exclusions) ? c.exclusions : []).map((e, i) => {
                    const item = typeof e === "string" ? { text: e, critical: false } : e;
                    return (
                      <li key={i} className="flex items-start gap-2" style={{ fontSize: "var(--text-dense)" }}>
                        <span className={item.critical ? "text-(--status-red)" : "text-muted-foreground"}>{item.critical ? "✕" : "–"}</span>
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </TabsContent>

              <TabsContent value="history">
                <p className="text-muted-foreground">No previous certificates on file for {c.supplier}. Change detection across certificate years arrives with Supplier 360 (Sprint 3).</p>
              </TabsContent>

              <TabsContent value="audit">
                <ul className="space-y-3" style={{ fontSize: "var(--text-dense)" }}>
                  <li className="flex gap-3">
                    <span className="cs-code w-28 shrink-0">{c.received ?? "—"}</span>
                    <span>Certificate received and ingested</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="cs-code w-28 shrink-0">{REFERENCE_DATE}</span>
                    <span>
                      Analysed in {c.seconds ?? "—"}s · model {c.model ?? "—"} · run <span className="cs-code">{c.runId ?? "—"}</span>
                      {c.assignee ? <> · assigned to <MaskedText value={c.assignee} kind="name" onReveal={() => console.info("[audit] reveal assignee", c.id)} /></> : null}
                    </span>
                  </li>
                </ul>
              </TabsContent>
            </div>
          </Tabs>

          <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-card px-6 py-3">
            <Button onClick={() => { setEmail((e) => e ?? emailText(c, findings)); setEmailOpen(true); }}>
              Request changes
            </Button>
            <Button variant="outline" disabled={c.decision !== "GO"} title={c.decision !== "GO" ? "Enabled when the certificate is compliant" : undefined}>
              Approve
            </Button>
            <Select>
              <SelectTrigger className="w-36"><SelectValue placeholder="Reject…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="not-admissible">Not admissible</SelectItem>
                <SelectItem value="wrong-supplier">Wrong supplier</SelectItem>
                <SelectItem value="unreadable">Unreadable document</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" disabled title="Sprint 2">Send to SAP Ariba</Button>
              <Button variant="ghost" onClick={() => setReviewed((v) => !v)}>
                {reviewed ? "Reviewed ✓" : "Mark reviewed"}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <RequestEmailSheet
        open={emailOpen} onClose={() => setEmailOpen(false)}
        supplier={c.supplier} email={email ?? ""}
        onChange={(e) => setEmail(e.target.value)}
        onCopy={() => navigator.clipboard?.writeText(email ?? "")}
      />
    </div>
  );
}
