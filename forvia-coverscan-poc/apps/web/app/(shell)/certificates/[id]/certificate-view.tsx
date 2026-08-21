"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs as TabsPrimitive } from "radix-ui";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Hash,
  Link2,
  Minus,
  PenLine,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Table,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { CachedCertificateT } from "@coverscan/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ConfidenceDot,
  CoverageGrid, type CoverageRow,
  DecisionChip,
  DocumentViewer, type DocumentPage, type EvidenceHighlight,
  FindingsList, type Finding,
  MaskedText,
  PIPELINE_STEPS, ProcessingStepper,
  RequestEmailSheet, buildRequestEmail,
  ScoreRing,
  SEAL_GATES,
  VerificationSeal, type SealGateState,
} from "@/components/coverscan";
import { formatEur } from "@/lib/format";
import { REFERENCE_DATE } from "@/lib/config";
import {
  NO_SCORE_REASON,
  binaryPoints,
  binaryStatus,
  fxLine,
  publishesRiskScore,
} from "@/lib/doctrine";

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
  seconds?: number | null;
  model?: string;
  runId?: string;
  needsReview?: boolean;
  ocrUsed?: boolean;
  summary?: string | null;
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

/* Labels carry the Direction des Assurances taxonomy alongside the spec wording
   (dossier §2 vocabulary: retrait / frais de retrait, DIC, DINC). */
const BREAKDOWN_LABELS: Record<string, { label: string; group: CoverageRow["group"] }> = {
  PRODUCT_LIABILITY: { label: "Product liability (RC produits)", group: "critical" },
  PRODUCT_RECALL: { label: "Product recall / withdrawal costs (frais de retrait)", group: "critical" },
  PURE_FINANCIAL_LOSS: { label: "Pure financial loss (DINC)", group: "critical" },
  CONSEQUENTIAL_FINANCIAL_LOSS: { label: "Consequential financial loss (DIC)", group: "secondary" },
  DISMANTLING_REFITTING: { label: "Dismantling and refitting (dépose-repose)", group: "secondary" },
  EXTENDED_PRODUCT_LIABILITY: { label: "Extended product liability", group: "secondary" },
  TERRITORY_USA_CANADA: { label: "Territory incl. USA/Canada", group: "secondary" },
  AGGREGATE_BASIS: { label: "Aggregate basis", group: "secondary" },
};

/* --------------------------------------------------------- binary scoring */

/** Dataset verdicts for the presence-type criteria (no amount to compare) that mean "satisfied". */
const PRESENCE_OK = new Set(["PRESENT", "INCLUDED", "BOTH", "COMPLIANT", "COMPLIANT_STRONG"]);

interface ScoreRow {
  code: string;
  label: string;
  /** points under the binary rule — 0 or the full weight, never a proportion */
  points: number;
  max: number;
  requiredEur: number | null;
  foundEur: number | null;
  /** explicit reason whenever the criterion scores nothing */
  note: string;
}

/**
 * Score breakdown under the binary-minimum doctrine (dossier §1.3): below the
 * minimum a guarantee scores 0, never a share of its weight. The dataset's own
 * `points` (7.5 / 30 for a quarter of the requirement) are deliberately ignored.
 */
function scoreRows(c: DeepCert): ScoreRow[] {
  const out: ScoreRow[] = [];
  for (const [code, v] of Object.entries(c.computed?.breakdown ?? {})) {
    if (code.startsWith("_") || v == null || typeof v !== "object") continue;
    const requiredEur = typeof v.required === "number" ? v.required : null;
    const foundEur = typeof v.found === "number" ? v.found : null;
    const max = v.max ?? 0;
    const fallback = v.status && PRESENCE_OK.has(v.status) ? "PRESENT" : v.status;
    const points = binaryPoints(foundEur, requiredEur, max, fallback);
    const note =
      requiredEur == null
        ? points === 0
          ? "not evidenced — no credit"
          : ""
        : binaryStatus(foundEur, requiredEur) === "NON_COMPLIANT"
          ? foundEur == null
            ? "not evidenced — no credit"
            : "below minimum — no partial credit"
          : "";
    out.push({
      code,
      label: BREAKDOWN_LABELS[code]?.label ?? code,
      points,
      max,
      requiredEur,
      foundEur,
      note,
    });
  }
  return out;
}

/* Same taxonomy for the rows the dataset ships pre-built. Rows outside the
   Direction des Assurances vocabulary (employer's liability, DIC/DIL wording,
   sub-limits…) keep their own label. */
const COVERAGE_ALIASES: Record<string, string> = {
  pl: "Product liability (RC produits)",
  recall: "Product recall / withdrawal costs (frais de retrait)",
  pfl: "Pure financial loss (DINC)",
  consequential: "Consequential financial loss (DIC)",
  dismantling: "Dismantling and refitting (dépose-repose)",
};

function coverageRows(c: DeepCert): CoverageRow[] {
  if (c.coverage?.length) {
    return c.coverage.map((r) => ({
      ...r,
      guarantee: COVERAGE_ALIASES[r.id] ?? r.guarantee,
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

/** The cached dataset carries FX either as { rate, date } or keyed by the source currency. */
function fxRateOf(c: DeepCert): number | undefined {
  const fx = (c.fx ?? {}) as Record<string, unknown>;
  if (typeof fx.rate === "number") return fx.rate;
  if (c.currency && typeof fx[c.currency] === "number") return fx[c.currency] as number;
  return undefined;
}

function derivedFindings(c: DeepCert): Finding[] {
  /* The FX provenance finding is re-stated from the reception date (dossier §5) so the
     screen never quotes two different rate dates for the same certificate. */
  const withFx = (list: Finding[]) =>
    list.map((f) =>
      f.ruleId === "FX_APPLIED"
        ? { ...f, title: fxLine(c.currency, fxRateOf(c), c.received) }
        : f,
    );
  if (c.findings?.length) return withFx(c.findings);
  const out: Finding[] = [];
  for (const [gate, s] of Object.entries(c.gates ?? {})) {
    /* No verdict without a consultable reason (dossier §3). */
    const label = SEAL_GATES.find((g) => g.id === gate)?.label ?? gate;
    const reason = s.note ?? "Reason not recorded — human review";
    if (s.state === "fail") out.push({ ruleId: `GATE_${gate.toUpperCase()}`, severity: "BLOCK", title: `${label}: ${reason}`, fix: `Resolve the ${label.toLowerCase()} defect and resubmit the certificate.` });
    else if (s.state === "review") out.push({ ruleId: `GATE_${gate.toUpperCase()}`, severity: "WARNING", title: `${label}: ${reason}` });
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

/* ---------------------------------------------------------------- verdict */

const DECISION_HERO: Record<string, { icon: LucideIcon; fg: string; bg: string }> = {
  GO: { icon: ShieldCheck, fg: "var(--status-go)", bg: "var(--status-go-bg)" },
  REQUEST_CHANGES: { icon: ShieldAlert, fg: "var(--status-amber)", bg: "var(--status-amber-bg)" },
  FORMAL_DEFECT: { icon: ShieldX, fg: "var(--status-red)", bg: "var(--status-red-bg)" },
  STRUCTURAL: { icon: ShieldX, fg: "var(--status-red)", bg: "var(--status-red-bg)" },
};

const FALLBACK_SUMMARY: Record<string, string> = {
  GO: "This certificate meets FORVIA GPTC requirements.",
  REQUEST_CHANGES: "This certificate needs corrections before it can be accepted under FORVIA GPTC. See the findings below for what to fix.",
  FORMAL_DEFECT: "This certificate is not admissible as issued — a formal defect must be corrected and the certificate resubmitted. See the admissibility checks below for the exact defect.",
  STRUCTURAL: "This certificate is not admissible for FORVIA. See the admissibility checks below for the exact defect.",
};

/* ------------------------------------------------------------------- tabs */

const TAB_DEFS: Array<{ id: string; label: string; icon: LucideIcon; withCount?: boolean }> = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "extracted", label: "Extracted data", icon: Table, withCount: true },
  { id: "exclusions", label: "Exclusions & territory", icon: Globe },
  { id: "history", label: "History", icon: Clock },
  { id: "audit", label: "Audit", icon: Eye },
];

const TERRITORY_CELLS: Array<{ key: string; label: string }> = [
  { key: "worldwide", label: "Worldwide" },
  { key: "usaCanada", label: "USA / Canada" },
  { key: "other", label: "Other territories" },
];

const focusRing = "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Per-step replay timings (ms) from the ui_kit mock — the demo advances at max(220, t/6) ms. */
const PROCESSING_TIMINGS = [420, 3100, 900, 6400, 700, 1500, 300, 2600];

export function CertificateView({
  cert,
  prevId,
  nextId,
  processing = false,
}: {
  cert: CachedCertificateT;
  prevId?: string;
  nextId?: string;
  /** Replays the simulated 8-step pipeline before revealing the analysis (demo only). */
  processing?: boolean;
}) {
  const c = cert as unknown as DeepCert;
  const router = useRouter();
  const [tab, setTab] = React.useState("summary");
  const [activePage, setActivePage] = React.useState(c.pages?.[0]?.n ?? 1);
  const [activeHighlightId, setActiveHighlightId] = React.useState<string | undefined>();
  const [showEvidence, setShowEvidence] = React.useState(true);
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);
  const [reviewed, setReviewed] = React.useState(false);
  const [rejected, setRejected] = React.useState(false);
  const [showMinors, setShowMinors] = React.useState(false);
  const [scoreOpen, setScoreOpen] = React.useState(false);
  /* Simulated pipeline replay — running step index, or null once the analysis is shown. */
  const [processingStep, setProcessingStep] = React.useState<number | null>(processing ? 0 : null);
  const isProcessing = processingStep != null;
  const [revealed, setRevealed] = React.useState(!processing);

  const rows = React.useMemo(() => coverageRows(c), [c]);
  const findings = React.useMemo(() => derivedFindings(c), [c]);
  /* Score is rebuilt from the binary rule — the dataset's proportional points are not the source. */
  const breakdown = React.useMemo(() => scoreRows(c), [c]);
  const binaryTotal = React.useMemo(
    () => Math.round(breakdown.reduce((sum, r) => sum + r.points, 0)),
    [breakdown],
  );
  const scorePublished = publishesRiskScore(c.accuracy);
  const hasBreakdown = breakdown.length > 0;
  const ringValue = hasBreakdown ? binaryTotal : c.score ?? 0;
  const penalty = Number(
    (c.computed?.breakdown as Record<string, unknown> | undefined)?._penalties ?? 0,
  );
  const fxRate = fxRateOf(c);
  const fxConverted = !!c.currency && c.currency !== "EUR" && fxRate != null && fxRate !== 1;
  const highlights: EvidenceHighlight[] = (c.highlights ?? []) as EvidenceHighlight[];
  const pages: DocumentPage[] = (c.pages ?? []) as DocumentPage[];
  const provisional = c.provisional ?? (c.decision === "FORMAL_DEFECT" || c.decision === "STRUCTURAL");
  const hero = DECISION_HERO[c.decision] ?? DECISION_HERO.REQUEST_CHANGES!;
  const HeroIcon = hero.icon;

  /* ← / → navigate between certificates — ignored while typing or on the tablist */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (t?.closest?.('[role="tablist"]')) return;
      if (e.key === "ArrowLeft" && prevId) router.push(`/certificates/${prevId}`);
      else if (e.key === "ArrowRight" && nextId) router.push(`/certificates/${nextId}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);

  /* Chained timers mirror the ui_kit mock: each step lasts max(220, timing/6) ms; 600 ms
     after the last step the analysis is revealed and the ?processing=1 URL is cleaned. */
  React.useEffect(() => {
    if (processingStep == null) return;
    if (processingStep >= PIPELINE_STEPS.length) {
      const t = setTimeout(() => {
        setProcessingStep(null);
        router.replace(`/certificates/${c.id}`);
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setProcessingStep((s) => (s == null ? s : s + 1)),
      Math.max(220, (PROCESSING_TIMINGS[processingStep] ?? 0) / 6),
    );
    return () => clearTimeout(t);
  }, [processingStep, router, c.id]);

  /* Escape closes the score breakdown popover. */
  React.useEffect(() => {
    if (!scoreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scoreOpen]);

  /* Mount the tabs at opacity 0, then fade them in on the next frame. */
  React.useEffect(() => {
    if (!isProcessing && !revealed) {
      const raf = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isProcessing, revealed]);

  const jumpToEvidence = (id?: string, page?: number) => {
    const h = id ? highlights.find((x) => x.id === id) : undefined;
    if (h) { setActivePage(h.page); setActiveHighlightId(undefined); requestAnimationFrame(() => setActiveHighlightId(h.id)); }
    else if (page) { setActivePage(page); setActiveHighlightId(undefined); }
  };
  const gateEvidence = (gateId: string) =>
    jumpToEvidence(gateId, gateId === "stamp" ? 1 : pages[pages.length - 1]?.n ?? 1);

  /* summary split — headline is everything up to the first ". " inclusive */
  const sentences = (c.summary ?? FALLBACK_SUMMARY[c.decision] ?? "").split(/(?<=\.)\s+/);
  const headline = sentences[0] ?? "";
  const rest = sentences.slice(1).join(" ");

  const gates = c.gates ?? {};
  /* No verdict without a consultable reason (dossier §3) — never render a bare failure. */
  const gateReason = (g?: SealGateState) => g?.note ?? "Reason not recorded — human review";
  const entityGate = gates.entity;
  const entityBlocking = entityGate?.state === "fail" || entityGate?.state === "review";
  const failingGates = SEAL_GATES.filter((g) => { const s = gates[g.id]?.state; return s === "fail" || s === "review"; });
  const passingGates = SEAL_GATES.filter((g) => { const s = gates[g.id]?.state; return s !== "fail" && s !== "review"; });
  // A gate under review has NOT passed — only "pass" (and "na", which does not
  // apply to this certificate) may be counted, otherwise the header claims 8/8
  // next to two visible "?" marks.
  const passedCount = SEAL_GATES.filter((g) => {
    const st = gates[g.id]?.state;
    return st === "pass" || st === "na";
  }).length;

  const majors = findings.filter((f) => f.severity === "BLOCK" || f.severity === "CRITICAL");
  const minors = findings.filter((f) => f.severity !== "BLOCK" && f.severity !== "CRITICAL");

  const needsReview = !!c.needsReview && !reviewed;

  const usaCanada = c.territory?.usaCanada ?? "UNCLEAR";
  const cellState = (key: string) =>
    key === "usaCanada"
      ? usaCanada === "INCLUDED" ? "included" : usaCanada === "PARTIAL_EXCLUDED" ? "not fully covered" : usaCanada === "EXCLUDED" ? "excluded" : "unclear"
      : key === "worldwide" ? "included" : "see wording";
  const cellColor = (state: string) =>
    state === "included" ? "var(--status-go)" : state.includes("exclu") ? "var(--status-red)" : "var(--status-review)";
  const exclusionItems = (Array.isArray(c.exclusions) ? c.exclusions : []).map((e) =>
    typeof e === "string" ? { text: e, critical: false } : e,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1, position: "relative", background: "var(--background)" }}>
      {/* breadcrumb bar — back link left, prev/next cert right */}
      <div style={{ height: 40, flex: "0 0 40px", display: "flex", alignItems: "center", gap: 8, padding: "0 16px", background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/certificates"><ArrowLeft size={13} aria-hidden="true" />Certificates</Link>
        </Button>
        <span style={{ flex: 1 }} />
        {prevId ? (
          <Button size="icon-sm" variant="ghost" asChild aria-label="Previous certificate">
            <Link href={`/certificates/${prevId}`}><ChevronLeft size={15} aria-hidden="true" /></Link>
          </Button>
        ) : (
          <Button size="icon-sm" variant="ghost" disabled aria-label="Previous certificate"><ChevronLeft size={15} aria-hidden="true" /></Button>
        )}
        {nextId ? (
          <Button size="icon-sm" variant="ghost" asChild aria-label="Next certificate">
            <Link href={`/certificates/${nextId}`}><ChevronRight size={15} aria-hidden="true" /></Link>
          </Button>
        ) : (
          <Button size="icon-sm" variant="ghost" disabled aria-label="Next certificate"><ChevronRight size={15} aria-hidden="true" /></Button>
        )}
      </div>

      {/* certificate header */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--card)", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: "var(--text-h2)" }}>{c.supplier}</h1>
            {c.country && <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{c.country}</span>}
            {c.aribaId && <span className="cs-code">{c.aribaId}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, fontSize: 12, color: "var(--muted-foreground)", flexWrap: "wrap" }}>
            {c.insurer && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Building2 size={12} aria-hidden="true" />{c.insurer}
              </span>
            )}
            {c.rating && <Badge variant="outline" className="cs-num border-border text-foreground">{c.rating}</Badge>}
            {c.policyNumber && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Hash size={12} aria-hidden="true" /><span className="cs-num">{c.policyNumber}</span>
              </span>
            )}
            {c.expiry && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <CalendarClock size={12} aria-hidden="true" /><span className="cs-num">{c.expiry}</span>
                {c.expiryDays != null && (
                  <span style={{ color: c.expiryDays < 0 ? "var(--status-red)" : undefined }}>
                    · {c.expiryDays < 0 ? `expired ${Math.abs(c.expiryDays)} days ago` : `valid · ${c.expiryDays} days left`}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <span style={{ flex: 1 }} />
        <div
          title={`Profile GPTC default v3 · reference date ${REFERENCE_DATE}${c.model ? ` · model ${c.model}` : ""}${c.runId ? ` · run ${c.runId}` : ""}`}
          style={{ textAlign: "right", fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.4, whiteSpace: "nowrap" }}
        >
          {c.seconds != null && <>Analysed in <span className="cs-num">{c.seconds} s</span><br /></>}
          GPTC default v3
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isProcessing && (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Simulated replay</span>
          )}
          {c.accuracy != null && <ConfidenceDot value={c.accuracy} showValue />}
          <DecisionChip decision={isProcessing ? "PROCESSING" : c.decision} size="lg" />
          {needsReview && (
            <Badge className="border-transparent bg-(--status-review-bg) text-(--status-review)">Needs review</Badge>
          )}
        </div>
      </div>

      {/* body — document left, analysis card right */}
      <div style={{ display: "flex", gap: "var(--split-gutter)", flex: 1, minHeight: 0, padding: "14px 24px" }}>
        <section aria-label="Document" style={{ flex: "0 0 46%", minWidth: 0, display: "flex" }}>
          <DocumentViewer
            pages={pages} activePage={activePage} onPageChange={setActivePage}
            highlights={highlights} activeHighlightId={activeHighlightId}
            showEvidence={showEvidence} onToggleEvidence={() => setShowEvidence((v) => !v)}
            ocrUsed={c.ocrUsed} fileName={`${c.supplier}.pdf`} style={{ flex: 1, minWidth: 0 }}
          />
        </section>
        <div aria-hidden="true" style={{ width: 6, flex: "0 0 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 2, height: 28, background: "var(--border)", borderRadius: 1 }} />
        </div>

        <section
          aria-label="Analysis"
          style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", overflow: "hidden" }}
        >
          {isProcessing ? (
            <div style={{ padding: 20, display: "grid", gap: 16, alignContent: "start" }}>
              <h2 style={{ fontSize: "var(--text-h3)" }}>Analysing certificate</h2>
              <ProcessingStepper current={processingStep ?? 0} timings={PROCESSING_TIMINGS} />
              <div style={{ display: "grid", gap: 8 }}>
                {[64, 120, 96].map((h, i) => (
                  <div key={i} style={{ height: h, borderRadius: "var(--radius)", background: "var(--muted)" }} />
                ))}
              </div>
            </div>
          ) : (
          <TabsPrimitive.Root
            value={tab}
            onValueChange={setTab}
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flex: 1,
              opacity: revealed ? 1 : 0,
              transition: "opacity var(--dur-pulse) var(--ease-standard)",
            }}
          >
            <TabsPrimitive.List style={{ display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid var(--border)", paddingLeft: 4, flex: "0 0 auto", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "thin" }}>
              {TAB_DEFS.map((t) => {
                const active = t.id === tab;
                const TabIcon = t.icon;
                return (
                  <TabsPrimitive.Trigger
                    key={t.id}
                    value={t.id}
                    aria-label={t.label}
                    className="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                    style={{
                      appearance: "none", background: "transparent", cursor: "pointer",
                      border: "none", borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
                      padding: "0 10px", height: 38, fontSize: 13, fontFamily: "var(--font-sans)",
                      fontWeight: active ? 600 : 500, color: active ? "var(--primary)" : "var(--muted-foreground)",
                      display: "inline-flex", alignItems: "center", gap: 6, marginBottom: -1,
                      transition: "color 120ms var(--ease-standard)",
                    }}
                  >
                    <TabIcon size={14} aria-hidden="true" />
                    {t.label}
                    {t.withCount && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{rows.length}</span>
                    )}
                  </TabsPrimitive.Trigger>
                );
              })}
            </TabsPrimitive.List>

            <div
              tabIndex={0}
              role="region"
              aria-label="Analysis panel"
              className="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              style={{ flex: 1, minHeight: 0, overflow: "auto" }}
            >
              {/* ------------------------------------------------ Summary */}
              <TabsPrimitive.Content value="summary" className="outline-none">
                <div style={{ padding: 20, display: "grid", gap: 20 }}>
                  {/* verdict callout */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", padding: "18px 20px", borderRadius: "var(--radius-lg)", background: hero.bg, border: `1px solid color-mix(in oklch, ${hero.fg} 18%, transparent)` }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
                      <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--card)", color: hero.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 44px", boxShadow: "var(--shadow-sm)" }}>
                        <HeroIcon size={22} aria-hidden="true" />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45, color: "var(--foreground)", textWrap: "pretty", maxWidth: "58ch" }}>{headline}</div>
                        {rest && <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted-foreground)", marginTop: 6, textWrap: "pretty", maxWidth: "66ch" }}>{rest}</div>}
                      </div>
                    </div>
                    {/* Accuracy guard (dossier §6): below the threshold no risk score is published. */}
                    {!scorePublished ? (
                      <div style={{ maxWidth: 300, padding: 14, borderRadius: "var(--radius-lg)", background: "var(--muted)", display: "grid", gap: 8, justifyItems: "start" }}>
                        <Badge className="border-transparent bg-(--status-review-bg) text-(--status-review)">Human review</Badge>
                        <p style={{ fontSize: 12, lineHeight: 1.45, color: "var(--muted-foreground)", textWrap: "pretty" }}>{NO_SCORE_REASON}</p>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          Extraction accuracy <span className="cs-num">{c.accuracy != null ? `${Math.round(c.accuracy * 100)}%` : "—"}</span> · threshold <span className="cs-num">75%</span>
                        </span>
                      </div>
                    ) : !hasBreakdown ? (
                      c.score != null && <ScoreRing value={c.score} provisional={provisional} size={104} />
                    ) : (
                      <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => setScoreOpen((v) => !v)}
                          aria-expanded={scoreOpen}
                          aria-haspopup="dialog"
                          aria-label={`Risk score ${ringValue} of 100 — score breakdown`}
                          className={focusRing}
                          style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "inherit" }}
                        >
                          <ScoreRing value={ringValue} provisional={provisional} size={104} />
                        </button>
                        <span style={{ fontSize: 10, lineHeight: 1.35, color: "var(--muted-foreground)", textAlign: "center", maxWidth: 170 }}>
                          Binary compliance at the minimum (dossier §1.3)
                        </span>
                        {scoreOpen && (
                          <div
                            role="dialog"
                            aria-label="Score breakdown"
                            style={{ position: "absolute", top: "100%", right: 0, zIndex: 30, width: 360, marginTop: 6, padding: 14, background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-popover)", display: "grid", gap: 10, textAlign: "left" }}
                          >
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                              <h3 style={{ fontSize: 13, fontWeight: 600 }}>Score breakdown</h3>
                              <span style={{ flex: 1 }} />
                              <span className="cs-num" style={{ fontSize: 13, fontWeight: 600 }}>{binaryTotal} / 100</span>
                            </div>
                            <p style={{ fontSize: 11, lineHeight: 1.45, color: "var(--muted-foreground)" }}>
                              Any cover under the required minimum scores zero — no gradation, no partial credit. Bonus bands apply only at or above the minimum.
                            </p>
                            <div style={{ display: "grid", gap: 6 }}>
                              {breakdown.map((r) => (
                                <div key={r.code} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "baseline", paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, textWrap: "pretty" }}>{r.label}</div>
                                    {r.requiredEur != null && (
                                      <div className="cs-num" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                                        {r.foundEur != null ? eur(r.foundEur) : "not found"} of {eur(r.requiredEur)} required
                                      </div>
                                    )}
                                    {r.note && (
                                      <div style={{ fontSize: 11, color: "var(--status-red)" }}>{r.note}</div>
                                    )}
                                  </div>
                                  <span className="cs-num" style={{ fontSize: 12, fontWeight: 600, color: r.points === 0 ? "var(--status-red)" : "var(--foreground)" }}>
                                    {r.points} / {r.max}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {penalty !== 0 && (
                              <div style={{ fontSize: 11, lineHeight: 1.45, color: "var(--muted-foreground)" }}>
                                Formal defects recorded on this certificate (<span className="cs-num">{penalty}</span> in the legacy weighted model) are handled as blocking admissibility gates, not as a score deduction.
                              </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <Button size="sm" variant="ghost" onClick={() => setScoreOpen(false)}>Close</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* One certificate = one contracting entity (dossier §2) — blocking alert with its reason. */}
                  {entityBlocking && (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--status-red-bg)", border: "1px solid color-mix(in oklch, var(--status-red) 22%, transparent)" }}>
                      <ShieldX size={18} color="var(--status-red)" aria-hidden="true" style={{ flex: "0 0 18px", marginTop: 1 }} />
                      <div style={{ minWidth: 0, display: "grid", gap: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--status-red)" }}>
                          Blocking alert — contracting entity
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.45, color: "var(--foreground)", textWrap: "pretty", maxWidth: "70ch" }}>
                          One certificate = one contracting entity — a certificate issued to the parent company is inoperative for the contracting subsidiary.
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted-foreground)", textWrap: "pretty" }}>
                          Reason: {gateReason(entityGate)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* admissibility */}
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, alignItems: "center", padding: "16px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--card)" }}>
                    <VerificationSeal gates={gates} size={96} onGateClick={gateEvidence} />
                    <div style={{ minWidth: 0, display: "grid", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted-foreground)" }}>
                        Admissibility · {passedCount} of 8 checks passed
                      </div>
                      {failingGates.length > 0 && (
                        <div style={{ display: "grid", gap: 8 }}>
                          {failingGates.map((g) => {
                            const e = gates[g.id] ?? { state: "na" as const };
                            const review = e.state === "review";
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => gateEvidence(g.id)}
                                className={focusRing}
                                style={{ display: "flex", gap: 8, alignItems: "baseline", background: "transparent", border: "none", padding: 0, cursor: "pointer", font: "inherit", textAlign: "left" }}
                              >
                                <span aria-hidden="true" style={{ color: review ? "var(--status-review)" : "var(--status-red)", fontFamily: "var(--font-mono)", fontWeight: 600, flex: "0 0 12px" }}>{review ? "?" : "✗"}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, flex: "0 0 auto" }}>{g.label}</span>
                                <span style={{ fontSize: 13, color: "var(--muted-foreground)", minWidth: 0 }}>— {gateReason(e)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <TooltipProvider>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {passingGates.map((g) => {
                            const e = gates[g.id] ?? { state: "na" as const };
                            const na = (e.state ?? "na") === "na";
                            return (
                              <Tooltip key={g.id}>
                                <TooltipTrigger asChild>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: "var(--radius-full)", background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 12, cursor: "default" }}>
                                    {na
                                      ? <Minus size={12} aria-hidden="true" />
                                      : <Check size={12} aria-hidden="true" color="var(--status-go)" />}
                                    {g.label}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{e.note ?? (na ? "Not applicable to this certificate" : "Verified")}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* coverage */}
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                      <h2 style={{ fontSize: "var(--text-h3)", display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <Link2 size={15} color="var(--primary)" aria-hidden="true" />Coverage against FORVIA GPTC
                      </h2>
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Click a figure to see it on the document</span>
                    </div>
                    <div
                      style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflowX: "auto" }}
                      tabIndex={0}
                      role="region"
                      aria-label="Coverage grid"
                    >
                      <CoverageGrid rows={rows} activeId={activeHighlightId} onEvidenceClick={(r) => jumpToEvidence(r.id, r.page)} />
                    </div>
                  </div>

                  {/* findings */}
                  <div>
                    <h2 style={{ fontSize: "var(--text-h3)", marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <TriangleAlert size={15} color="var(--primary)" aria-hidden="true" />What to fix
                    </h2>
                    <FindingsList findings={majors} onEvidenceClick={(f) => jumpToEvidence(f.ruleId, f.page)} />
                    {minors.length > 0 && !showMinors && (
                      <button
                        type="button"
                        onClick={() => setShowMinors(true)}
                        className={focusRing}
                        style={{ marginTop: 8, background: "transparent", border: "none", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 500, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 5, padding: 0 }}
                      >
                        <ChevronDown size={13} aria-hidden="true" />Show {minors.length} secondary finding{minors.length > 1 ? "s" : ""}
                      </button>
                    )}
                    {showMinors && (
                      <>
                        <FindingsList findings={minors} onEvidenceClick={(f) => jumpToEvidence(f.ruleId, f.page)} style={{ marginTop: 8 }} />
                        <button
                          type="button"
                          onClick={() => setShowMinors(false)}
                          className={focusRing}
                          style={{ marginTop: 8, background: "transparent", border: "none", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 500, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 5, padding: 0 }}
                        >
                          <ChevronUp size={13} aria-hidden="true" />Hide secondary finding{minors.length > 1 ? "s" : ""}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </TabsPrimitive.Content>

              {/* ----------------------------------------- Extracted data */}
              <TabsPrimitive.Content value="extracted" className="outline-none">
                <div style={{ padding: 16, display: "grid", gap: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Every field with its original text, the normalised value, the page and the confidence.
                  </div>
                  <table style={{ width: "100%", fontSize: 13 }}>
                    <thead>
                      <tr>
                        {["Original label", "Original value", "EUR", "Basis", "Page", "Conf."].map((h) => (
                          <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", padding: "0 8px 6px", borderBottom: "1px solid var(--border)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(c.guarantees ?? []).map((g, i) => (
                        <tr key={i} style={{ height: 40 }}>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", maxWidth: 260 }}>{g.labelOriginal ?? g.code}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
                            <span className="cs-num">{g.amountOriginal != null ? `${g.currency ?? ""} ${g.amountOriginal.toLocaleString("en-US")}` : "—"}</span>
                          </td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
                            <span className="cs-num">{g.amountEur != null ? eur(g.amountEur) : "—"}</span>
                          </td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>{g.basis ?? "—"}</td>
                          <td className="cs-num" style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                            {g.page != null ? (
                              <button type="button" onClick={() => jumpToEvidence(undefined, g.page)} className={focusRing} style={{ background: "transparent", border: "none", cursor: "pointer", font: "inherit", color: "var(--primary)", padding: 0 }}>p.{g.page}</button>
                            ) : "—"}
                          </td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
                            {g.confidence != null ? <ConfidenceDot value={g.confidence} page={g.page} /> : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* FX provenance (dossier §5): ECB rate of the day the certificate was received. */}
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    <span className={fxConverted ? "cs-num" : undefined}>{fxLine(c.currency, fxRate, c.received)}</span>
                    {fxConverted && (
                      <> — the ECB rate of the day this certificate was received, applied to every amount on it.</>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Inline field editing with instant re-score arrives with the rules engine (Sprint 1).
                  </div>
                </div>
              </TabsPrimitive.Content>

              {/* --------------------------------- Exclusions & territory */}
              <TabsPrimitive.Content value="exclusions" className="outline-none">
                <div style={{ padding: 16, display: "grid", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {TERRITORY_CELLS.map((cell) => {
                      const state = cellState(cell.key);
                      return (
                        <div key={cell.key} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, background: "var(--card)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>
                            <Globe size={13} aria-hidden="true" />{cell.label}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: cellColor(state), textTransform: "capitalize" }}>{state}</div>
                        </div>
                      );
                    })}
                  </div>
                  {c.territory?.statement && <p className="cs-quote">« {c.territory.statement} »</p>}
                  <div>
                    <h3 style={{ fontSize: "var(--text-h3)", marginBottom: 8 }}>Exclusions that matter</h3>
                    {exclusionItems.length === 0 && (
                      <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>No critical exclusion detected.</div>
                    )}
                    <div style={{ display: "grid", gap: 8 }}>
                      {exclusionItems.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 13, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                          {item.critical ? (
                            <Badge className="border-transparent bg-(--status-red-bg) text-(--status-red)">Critical</Badge>
                          ) : (
                            <span aria-hidden="true" style={{ color: "var(--muted-foreground)" }}>–</span>
                          )}
                          <span style={{ flex: 1 }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsPrimitive.Content>

              {/* -------------------------------------------------- History */}
              <TabsPrimitive.Content value="history" className="outline-none">
                <div style={{ padding: 16, display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid var(--status-amber)", background: "var(--status-amber-bg)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--status-amber)" }}>
                    <TriangleAlert size={15} aria-hidden="true" />
                    <span>No previous certificates on file for {c.supplier}. Change detection across certificate years arrives with Supplier 360 (Sprint 3).</span>
                  </div>
                  {c.policyNumber && (
                    <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                      Policy numbers kept for claims: <span className="cs-num">{c.policyNumber}</span>
                    </div>
                  )}
                </div>
              </TabsPrimitive.Content>

              {/* ---------------------------------------------------- Audit */}
              <TabsPrimitive.Content value="audit" className="outline-none">
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gap: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "132px 1fr", gap: 10, alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <span className="cs-num" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{c.received ?? "—"}</span>
                      <span>Certificate received and ingested</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "132px 1fr", gap: 10, alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <span className="cs-num" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{REFERENCE_DATE}</span>
                      <span>
                        Analysed in {c.seconds ?? "—"}s · model {c.model ?? "—"} · run <span className="cs-code">{c.runId ?? "—"}</span>
                        {c.assignee ? <> · assigned to <MaskedText value={c.assignee} kind="name" /></> : null}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsPrimitive.Content>
            </div>
          </TabsPrimitive.Root>
          )}
        </section>
      </div>

      {/* full-width action bar — hidden while the simulated pipeline replays */}
      {!isProcessing && (
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--card)", boxShadow: "var(--shadow-sticky)", display: "flex", alignItems: "center", gap: 8 }}>
        <Button size="lg" onClick={() => { setEmail((e) => e ?? emailText(c, findings)); setEmailOpen(true); }}>
          <PenLine size={15} aria-hidden="true" />Request changes
        </Button>
        <Button size="lg" variant="outline" disabled={c.decision !== "GO"} title={c.decision !== "GO" ? "Approve requires a Compliant decision, or an override with justification" : undefined}>
          Approve
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setRejected(true)}>Reject</Button>
        {rejected && (
          <span role="status" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 12px", borderRadius: "var(--radius-full)", background: "var(--status-red-bg)", color: "var(--status-red)", fontSize: 12, fontWeight: 500 }}>
            Rejected — reason recorded
          </span>
        )}
        <span style={{ flex: 1 }} />
        <Button size="lg" variant="secondary" disabled title="Sprint 2">
          <ExternalLink size={14} aria-hidden="true" />Send to SAP Ariba
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setReviewed((v) => !v)}>
          <Check size={14} aria-hidden="true" />{reviewed ? "Reviewed ✓" : "Mark reviewed"}
        </Button>
      </div>
      )}

      <RequestEmailSheet
        open={emailOpen} onClose={() => setEmailOpen(false)}
        supplier={c.supplier} email={email ?? ""}
        onChange={(e) => setEmail(e.target.value)}
        onCopy={() => navigator.clipboard?.writeText(email ?? "")}
      />
    </div>
  );
}
