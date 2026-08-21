"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  Coins,
  Building2,
  Download,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { DecisionChip, GapBar, KpiCard, type DecisionChipProps } from "@/components/coverscan";
import { formatCompactEur } from "@/lib/format";

/* ── Data shapes (aggregates.json slices — amounts in EUR MAJOR units) ── */

export interface PortfolioStats {
  total: number;
  compliant: number;
  requestChanges: number;
  notAdmissible: number;
  formal: number;
  structural: number;
  needsReview: number;
  expired: number;
  expiring90: number;
  avgSeconds: number;
  fieldAccuracy: number;
  reviewShare: number;
  demoClock: string;
}

/** One FORVIA contracting entity in the portfolio breakdown. */
interface ClientRow {
  entity: string;
  total: number;
  go: number;
  request: number;
  nogo: number;
}

/**
 * Compliance split across the FORVIA contracting entities.
 * Demo distribution of the same 150-certificate synthetic dataset the country
 * split used: the totals below sum exactly to the portfolio aggregates
 * (150 · 9 compliant · 61 request changes · 80 not admissible). The first three
 * entities are the ones actually named in the annotated certificates; the others
 * are FORVIA business-group entities added so the chart reads like a real portfolio.
 */
const BY_CLIENT: ClientRow[] = [
  { entity: "Faurecia Systèmes d'Échappement", total: 38, go: 3, request: 16, nogo: 19 },
  { entity: "Faurecia Intérieur Industrie", total: 31, go: 2, request: 13, nogo: 16 },
  { entity: "Faurecia Sièges d'Automobile", total: 26, go: 2, request: 11, nogo: 13 },
  { entity: "HELLA GmbH & Co. KGaA", total: 22, go: 1, request: 9, nogo: 12 },
  { entity: "Faurecia Automotive Exteriors España", total: 19, go: 1, request: 8, nogo: 10 },
  { entity: "Faurecia Clarion Electronics", total: 14, go: 0, request: 4, nogo: 10 },
];

export interface CountryRow {
  country: string;
  code: string;
  total: number;
  go: number;
  request: number;
  nogo: number;
}

export interface GuaranteeGapRow {
  guarantee: string;
  /** EUR major units */
  required: number;
  /** EUR major units */
  median: number;
  compliantShare: number;
}

export interface ExpiringItem {
  supplier: string;
  date: string;
  days: number;
  bucket: number;
}

export interface TopRiskRow {
  id: string;
  supplier: string;
  country: string;
  decision: string;
  worst: string;
  spend: string;
}

export interface PortfolioViewProps {
  portfolio: PortfolioStats;
  byCountry: CountryRow[];
  gapByGuarantee: GuaranteeGapRow[];
  expiring: ExpiringItem[];
  topRisks: TopRiskRow[];
  /** ids of the real cached certificates — a top-risk row only opens if its id is one of them */
  certificateIds: string[];
}

/* ── Local primitives, re-implemented from the ui_kit design-system contracts ── */

function Tooltip({
  content,
  children,
  style,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      {children}
      {open && content && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 40,
            bottom: "calc(100% + 6px)",
            left: 0,
            maxWidth: 320,
            width: "max-content",
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-popover)",
            padding: "8px 10px",
            fontSize: 12,
            lineHeight: 1.45,
            textAlign: "left",
            whiteSpace: "normal",
            pointerEvents: "none",
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

function Card({
  title,
  subtitle,
  actions,
  padded = true,
  children,
  style,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  padded?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        background: "var(--card)",
        color: "var(--card-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      {(title || actions) && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px var(--card-pad)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <h3 style={{ fontSize: "var(--text-h3)", fontWeight: 600, letterSpacing: "-0.01em" }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
              {actions}
            </div>
          )}
        </header>
      )}
      <div style={{ padding: padded ? "var(--card-pad)" : 0, flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </section>
  );
}

function SmallButton({
  iconLeft,
  children,
  onClick,
}: {
  iconLeft?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 28,
        padding: "0 10px",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: "var(--radius-full)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        background: hover ? "var(--accent)" : "var(--card)",
        color: hover ? "var(--accent-foreground)" : "var(--foreground)",
        border: "1px solid var(--border)",
        transition: "background 120ms var(--ease-standard), filter 120ms var(--ease-standard)",
      }}
    >
      {iconLeft}
      {children}
    </button>
  );
}

function CardTitle({ icon: IconGlyph, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <IconGlyph size={15} color="var(--primary)" strokeWidth={1.75} />
      {children}
    </span>
  );
}

/** Compact EUR label for MAJOR-unit amounts — matches the ui_kit `compact` helper. */
const compactMajor = (v: number) => formatCompactEur(v * 100);

/* ── Doctrine wording (client technical dossier, §1.3) ──────────────────────
 * Compliance is binary at the minimum: nothing on this screen may read as a
 * partial or graded verdict below the requirement. Portfolio-level ratios
 * (median cover, share of compliant certificates) are indicators and are
 * labelled as such. The guarantee taxonomy shows the Direction des Assurances
 * terms — frais de retrait, DINC, DIC — next to the spec wording.
 */

/** aggregates.json guarantee names → the label carrying both vocabularies. */
const GUARANTEE_LABEL: Record<string, string> = {
  "Product liability": "Product liability",
  "Product recall / withdrawal": "Product recall / withdrawal costs (frais de retrait)",
  "Product recall / withdrawal costs": "Product recall / withdrawal costs (frais de retrait)",
  "Pure financial loss": "Pure financial loss (DINC)",
  "Consequential financial loss": "Consequential financial loss (DIC)",
  "Consequential loss": "Consequential financial loss (DIC)",
  "Dismantling and refitting": "Dismantling and refitting costs",
};

const guaranteeLabel = (name: string) => GUARANTEE_LABEL[name] ?? name;


/** Appends the Direction des Assurances term wherever a guarantee is named in prose. */
const TERM_RULES: Array<[RegExp, string]> = [
  [/Product recall(?: \/ withdrawal)? costs(?! \()/g, "Product recall / withdrawal costs (frais de retrait)"],
  [/Pure financial loss(?! \()/g, "Pure financial loss (DINC)"],
  [/Consequential (?:financial )?loss(?! \()/g, "Consequential financial loss (DIC)"],
];

function doctrineWording(text: string): string {
  return TERM_RULES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

/* ── Compliance by client entity — stacked go / request / nogo bars ── */

function ComplianceByClient({
  rows,
  onSelect,
}: {
  rows: ClientRow[];
  onSelect?: (r: ClientRow) => void;
}) {
  const max = Math.max(...rows.map((r) => r.total));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r) => (
        <div
          key={r.entity}
          onClick={() => onSelect && onSelect(r)}
          style={{
            display: "grid",
            gridTemplateColumns: "190px 1fr 40px",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {r.entity}
          </span>
          <span
            style={{
              display: "flex",
              height: 14,
              width: `${(r.total / max) * 100}%`,
              borderRadius: 2,
              overflow: "hidden",
              background: "var(--gap-track)",
            }}
          >
            <Tooltip content={`${r.go} compliant`} style={{ width: `${(r.go / r.total) * 100}%` }}>
              <span style={{ width: "100%", background: "var(--status-go)", height: 14, display: "block" }} />
            </Tooltip>
            <Tooltip
              content={`${r.request} request changes`}
              style={{ width: `${(r.request / r.total) * 100}%` }}
            >
              <span style={{ width: "100%", background: "var(--status-amber)", height: 14, display: "block" }} />
            </Tooltip>
            <Tooltip
              content={`${r.nogo} not admissible`}
              style={{ width: `${(r.nogo / r.total) * 100}%` }}
            >
              <span style={{ width: "100%", background: "var(--status-red)", height: 14, display: "block" }} />
            </Tooltip>
          </span>
          <span className="cs-num" style={{ fontSize: 12, textAlign: "right", color: "var(--muted-foreground)" }}>
            {r.total}
          </span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 11, color: "var(--muted-foreground)" }}>
        {(
          [
            ["Compliant", "var(--status-go)"],
            ["Request changes", "var(--status-amber)"],
            ["Not admissible", "var(--status-red)"],
          ] as const
        ).map(([l, c]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Coverage gap by guarantee — required vs median on a GapBar ──
 * Portfolio indicator only. The percentage is the size of the gap against the
 * requirement, never a degree of compliance: below the minimum a certificate is
 * non-compliant, full stop. Hence "% of requirement" and "% of certificates
 * compliant" — no bare percentage that could read as partial credit.
 */

function GapByGuarantee({ rows }: { rows: GuaranteeGapRow[] }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {rows.map((r) => (
        <div key={r.guarantee} style={{ display: "grid", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{guaranteeLabel(r.guarantee)}</span>
            <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              required {compactMajor(r.required)}
            </span>
            <span className="cs-num" style={{ fontSize: 12, color: "var(--status-go)" }}>
              {Math.round(r.compliantShare * 100)} % of certificates compliant
            </span>
          </div>
          <GapBar
            found={r.median * 100}
            required={r.required * 100}
            width="100%"
            stacked
            label={`median ${compactMajor(r.median)} · ${Math.round((r.median / r.required) * 100)} % of requirement`}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Expiring timeline — bucketed supplier chips ── */

function ExpiringTimeline({
  items,
  onOpen,
}: {
  items: ExpiringItem[];
  onOpen?: () => void;
}) {
  const buckets = [
    { k: -1, label: "Expired" },
    { k: 30, label: "≤ 30 days" },
    { k: 60, label: "≤ 60 days" },
    { k: 90, label: "≤ 90 days" },
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {buckets.map((b) => {
        const list = items.filter((i) => i.bucket === b.k);
        return (
          <div
            key={b.k}
            style={{ display: "grid", gridTemplateColumns: "86px 1fr", gap: 12, alignItems: "start" }}
          >
            <span
              style={{
                fontSize: 12,
                color: b.k === -1 ? "var(--status-red)" : "var(--muted-foreground)",
                paddingTop: 3,
              }}
            >
              {b.label}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {list.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>
              )}
              {list.map((i) => (
                <span
                  key={i.supplier}
                  onClick={onOpen}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 22,
                    padding: "0 8px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                    cursor: onOpen ? "pointer" : "default",
                  }}
                >
                  {i.supplier}
                  <span className="cs-num" style={{ color: "var(--muted-foreground)" }}>{i.date}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Top risks table — design-system DataTable subset ── */

interface RiskColumn {
  key: string;
  header: string;
  align?: "left" | "right";
  wrap?: boolean;
  muted?: boolean;
  render?: (r: TopRiskRow) => React.ReactNode;
}

function RiskTable({
  columns,
  rows,
  onRowClick,
}: {
  columns: RiskColumn[];
  rows: TopRiskRow[];
  onRowClick?: (r: TopRiskRow) => void;
}) {
  return (
    <div style={{ overflow: "auto" }} tabIndex={0} role="region" aria-label="Top 10 risks table">
      <table style={{ width: "100%", fontSize: "var(--text-dense)", tableLayout: "auto" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  textAlign: c.align || "left",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  background: "var(--card)",
                  padding: "0 10px",
                  height: 32,
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              style={{ height: "var(--row-h)", cursor: onRowClick ? "pointer" : "default", background: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: "0 10px",
                    borderBottom: "1px solid var(--border)",
                    textAlign: c.align || "left",
                    whiteSpace: c.wrap ? "normal" : "nowrap",
                    color: c.muted ? "var(--muted-foreground)" : undefined,
                  }}
                >
                  {c.render ? c.render(r) : (r as unknown as Record<string, React.ReactNode>)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Screen ── */

export function PortfolioView({
  portfolio: p,
  byCountry,
  gapByGuarantee,
  expiring,
  topRisks,
  certificateIds,
}: PortfolioViewProps) {
  const router = useRouter();
  const goView = (view: string) => router.push(`/certificates?view=${encodeURIComponent(view)}`);
  const goClient = (entity: string) =>
    router.push(`/certificates?filter=${encodeURIComponent(entity)}`);
  const openRisk = (r: TopRiskRow) => {
    if (certificateIds.includes(r.id)) router.push(`/certificates/${r.id}`);
  };

  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard
          label="Certificates compliant"
          value={`${p.compliant} / ${p.total}`}
          icon="shield-check"
          tone="go"
          delta="+2"
          deltaTone="go"
          sub="6 % of the portfolio · verdicts are per certificate"
        />
        <KpiCard
          label="Not admissible"
          value={p.notAdmissible}
          tone="red"
          icon="shield-x"
          sub={`${p.formal} formal · ${p.structural} structural`}
          onClick={() => goView("Not admissible")}
        />
        <KpiCard
          label="Critical gaps"
          value={118}
          tone="amber"
          icon="coins"
          sub="Recall (frais de retrait) is the #1 gap — 78 % of certificates under the minimum"
        />
        <KpiCard
          label="Expiring ≤ 90 days"
          value={p.expiring90}
          tone="review"
          icon="calendar-clock"
          delta={`${p.expired} expired`}
          deltaTone="red"
          sub="Chubb and IMI renew before July"
          onClick={() => goView("Expiring")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card
          title={<CardTitle icon={Building2}>Compliance by client entity</CardTitle>}
          subtitle="Click an entity to filter the certificates table"
        >
          <ComplianceByClient rows={BY_CLIENT} onSelect={(r) => goClient(r.entity)} />
        </Card>
        <Card
          title={<CardTitle icon={Coins}>Coverage gap by guarantee</CardTitle>}
          subtitle="Median found against FORVIA GPTC requirement · Gap indicator — compliance itself is binary at the minimum."
        >
          <GapByGuarantee rows={gapByGuarantee} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Card
          title={<CardTitle icon={TriangleAlert}>Top 10 risks</CardTitle>}
          subtitle="One row = one certificate — the verdict belongs to that certificate, not to the supplier"
          padded={false}
          actions={
            <SmallButton iconLeft={<Download size={13} strokeWidth={1.75} />}>Export Excel</SmallButton>
          }
        >
          <RiskTable
            rows={topRisks}
            onRowClick={openRisk}
            columns={[
              {
                key: "decision",
                header: "Status",
                render: (r) => (
                  <DecisionChip decision={r.decision as DecisionChipProps["decision"]} size="sm" />
                ),
              },
              { key: "supplier", header: "Supplier" },
              { key: "country", header: "Country", muted: true },
              { key: "worst", header: "Worst finding", wrap: true, render: (r) => doctrineWording(r.worst) },
              { key: "spend", header: "Spend", muted: true },
              {
                key: "open",
                header: "",
                align: "right",
                render: () => (
                  <ArrowUpRight size={14} color="var(--muted-foreground)" strokeWidth={1.75} />
                ),
              },
            ]}
          />
        </Card>
        <Card
          title={<CardTitle icon={CalendarClock}>Expiring soon</CardTitle>}
          subtitle="Next 90 days at the demo clock"
        >
          <ExpiringTimeline items={expiring} onOpen={() => goView("Expiring")} />
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          flexWrap: "wrap",
          padding: "2px 6px 0",
          fontSize: 12,
          color: "var(--muted-foreground)",
        }}
      >
        {(
          [
            [`${p.total}`, "analysed this month"],
            [`${p.avgSeconds} s`, "average per certificate"],
            [`${Math.round(p.reviewShare * 100)} %`, "sent to human review"],
            [`${Math.round(p.fieldAccuracy * 100)} %`, "field accuracy on the reviewed set"],
          ] as const
        ).map(([v, l], i) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
            {i > 0 && <span style={{ margin: "0 8px", color: "var(--border)" }}>·</span>}
            <span className="cs-num" style={{ fontWeight: 600, color: "var(--foreground)" }}>{v}</span>
            {l}
          </span>
        ))}
        <span style={{ flex: 1 }} />
        <span>Demo dataset: 10 real + 140 synthetic</span>
      </div>
    </div>
  );
}
