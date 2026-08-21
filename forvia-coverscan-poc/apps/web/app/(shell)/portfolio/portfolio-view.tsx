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

/* ── Certificates by client entity — donut of the client mix ──
 * Direct client request: "a circle with the client split, the name next to it,
 * and on hover the exact compliant / request changes / not admissible counts."
 *
 * COLOR EXCEPTION (palette validator): the six segment hues below are the
 * validated categorical set for client identity — the ONLY raw hex allowed in
 * this file, restricted to data segments and their legend swatches. Fixed
 * order, one hue per entity in descending-total order, never cycled. Status
 * colors (--status-*) must NOT be used for client identity. All text stays in
 * ink tokens (--foreground / --muted-foreground), never in the segment hue.
 */

const DONUT_HUES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"] as const;

/** Thick-stroke arc on the centreline circle of radius r, from angle a0 to a1 (rad, clockwise). */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(3)} ${y0.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`;
}

const complianceDetail = (r: ClientRow) =>
  `${r.go} compliant · ${r.request} request changes · ${r.nogo} not admissible`;

function ClientDonut({
  rows,
  onSelect,
}: {
  rows: ClientRow[];
  onSelect?: (r: ClientRow) => void;
}) {
  const [active, setActive] = React.useState<number | null>(null);

  /* Hues are assigned in descending-total order and never recycled: the donut
   * renders at most as many entities as there are validated hues (6 = 6 here). */
  const ordered = React.useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.total - a.total)
        .slice(0, DONUT_HUES.length)
        .map((row, i) => ({ row, hue: DONUT_HUES[i] })),
    [rows],
  );
  const total = ordered.reduce((sum, s) => sum + s.row.total, 0);

  const SIZE = 170;
  const C = SIZE / 2;
  const R = 62; // stroke centreline radius
  const SW = 22;
  const SW_ACTIVE = 27;
  const GAP_ANGLE = 2 / R; // 2px surface gap between segments, measured on the centreline

  let angle = -Math.PI / 2; // start at 12 o'clock, clockwise
  const segments = ordered.map(({ row, hue }) => {
    const sweep = (row.total / total) * Math.PI * 2;
    const seg = { row, hue, a0: angle + GAP_ANGLE / 2, a1: angle + sweep - GAP_ANGLE / 2 };
    angle += sweep;
    return seg;
  });

  const activate = (i: number | null) => setActive(i);
  const activeSeg = active === null ? null : segments[active];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
      <span style={{ position: "relative", flex: `0 0 ${SIZE}px`, width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden={false}>
          {segments.map((seg, i) => (
            <path
              key={seg.row.entity}
              d={arcPath(C, C, R, seg.a0, seg.a1)}
              fill="none"
              stroke={seg.hue}
              strokeWidth={active === i ? SW_ACTIVE : SW}
              strokeLinecap="butt"
              opacity={active === null || active === i ? 1 : 0.4}
              tabIndex={0}
              role="button"
              aria-label={`${seg.row.entity} — ${seg.row.total} of ${total} certificates · ${complianceDetail(seg.row)}. Press Enter to filter the certificates table.`}
              onMouseEnter={() => activate(i)}
              onMouseLeave={() => activate(null)}
              onFocus={() => activate(i)}
              onBlur={() => activate(null)}
              onClick={() => onSelect && onSelect(seg.row)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (onSelect) onSelect(seg.row);
                }
              }}
              style={{
                cursor: "pointer",
                outline: "none",
                /* --dur-recolour is zeroed under prefers-reduced-motion (motion.css),
                 * so the arc emphasis snaps instead of animating when the user asks. */
                transition:
                  "stroke-width var(--dur-recolour) var(--ease-standard), opacity var(--dur-recolour) var(--ease-standard)",
              }}
            />
          ))}
        </svg>
        {/* Centre total — text in ink tokens, never in a segment hue. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            className="cs-num"
            style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.1, color: "var(--foreground)" }}
          >
            {total}
          </span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>certificates</span>
        </span>
        {activeSeg && (
          <span
            role="tooltip"
            style={{
              position: "absolute",
              zIndex: 40,
              bottom: "calc(100% + 6px)",
              left: 0,
              maxWidth: 300,
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
            <span style={{ display: "block", fontWeight: 600 }}>{activeSeg.row.entity}</span>
            <span style={{ display: "block" }}>
              <span className="cs-num">{activeSeg.row.total}</span> certificates
            </span>
            <span style={{ display: "block", color: "var(--muted-foreground)" }}>
              {complianceDetail(activeSeg.row)}
            </span>
          </span>
        )}
      </span>
      {/* Direct labels: vertical legend — swatch + entity name + total, ink text only. */}
      <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 2 }}>
        {segments.map((seg, i) => (
          <button
            key={seg.row.entity}
            type="button"
            title={`${seg.row.entity} — ${seg.row.total} certificates`}
            onClick={() => onSelect && onSelect(seg.row)}
            onMouseEnter={() => activate(i)}
            onMouseLeave={() => activate(null)}
            onFocus={() => activate(i)}
            onBlur={() => activate(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              minWidth: 0,
              padding: "3px 6px",
              margin: 0,
              font: "inherit",
              textAlign: "left",
              color: "var(--foreground)",
              background: active === i ? "var(--accent)" : "transparent",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            <span
              aria-hidden
              style={{ width: 10, height: 10, borderRadius: 3, background: seg.hue, flex: "0 0 auto" }}
            />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 12.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {seg.row.entity}
            </span>
            <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {seg.row.total}
            </span>
          </button>
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
          {/* Name on its own line — the card now sits in a narrower 3-up column,
           * so the long Direction des Assurances labels must not wrap word-by-word
           * against the figures. */}
          <span style={{ fontSize: 13, fontWeight: 500, minWidth: 0 }}>
            {guaranteeLabel(r.guarantee)}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
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

/* ── Expiring soon — compact list (top row): soonest first, max 4 + View all ── */

function ExpiringCompact({
  items,
  onViewAll,
}: {
  items: ExpiringItem[];
  onViewAll: () => void;
}) {
  const list = [...items].sort((a, b) => a.days - b.days).slice(0, 4);
  return (
    <div style={{ display: "grid", gap: 2 }}>
      {list.map((i) => (
        <button
          key={i.supplier}
          type="button"
          onClick={onViewAll}
          title={`${i.supplier} — expires ${i.date}`}
          style={{
            display: "grid",
            gap: 1,
            width: "100%",
            minWidth: 0,
            padding: "5px 6px",
            margin: 0,
            font: "inherit",
            textAlign: "left",
            color: "var(--foreground)",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {i.supplier}
            </span>
            <span
              className="cs-num"
              style={{
                fontSize: 12,
                flex: "0 0 auto",
                color: i.bucket === -1 ? "var(--status-red)" : "var(--muted-foreground)",
              }}
            >
              {i.bucket === -1 ? "expired" : `${i.days} d`}
            </span>
          </span>
          <span className="cs-num" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {i.date}
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onViewAll}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          justifySelf: "start",
          marginTop: 6,
          padding: 0,
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
          color: "var(--primary)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        View all
        <ArrowUpRight size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ── Top risks table — design-system DataTable subset ── */

interface RiskColumn {
  key: string;
  header: string;
  align?: "left" | "right";
  /** Column absorbs the leftover width and truncates with an ellipsis (full text in `title`). */
  ellipsis?: boolean;
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
              {columns.map((c) => {
                const content = c.render
                  ? c.render(r)
                  : (r as unknown as Record<string, React.ReactNode>)[c.key];
                return (
                  <td
                    key={c.key}
                    style={{
                      padding: "0 10px",
                      borderBottom: "1px solid var(--border)",
                      textAlign: c.align || "left",
                      whiteSpace: "nowrap",
                      color: c.muted ? "var(--muted-foreground)" : undefined,
                      /* width:100% + maxWidth:0 lets this cell soak up the leftover
                       * width and shrink freely — the row never forces a horizontal
                       * scroll; the inner span ellipsizes instead. */
                      width: c.ellipsis ? "100%" : undefined,
                      maxWidth: c.ellipsis ? 0 : undefined,
                    }}
                  >
                    {c.ellipsis ? (
                      <span
                        title={typeof content === "string" ? content : undefined}
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {content}
                      </span>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
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

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 0.75fr", gap: 16 }}>
        <Card
          title={<CardTitle icon={Building2}>Certificates by client entity</CardTitle>}
          subtitle="Hover a segment for the compliance detail · click to filter the certificates table"
        >
          <ClientDonut rows={BY_CLIENT} onSelect={(r) => goClient(r.entity)} />
        </Card>
        <Card
          title={<CardTitle icon={Coins}>Coverage gap by guarantee</CardTitle>}
          subtitle="Median found against FORVIA GPTC requirement · Gap indicator — compliance itself is binary at the minimum."
        >
          <GapByGuarantee rows={gapByGuarantee} />
        </Card>
        <Card
          title={<CardTitle icon={CalendarClock}>Expiring soon</CardTitle>}
          subtitle="Next 90 days at the demo clock"
        >
          <ExpiringCompact items={expiring} onViewAll={() => goView("Expiring")} />
        </Card>
      </div>

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
            {
              key: "worst",
              header: "Worst finding",
              ellipsis: true,
              render: (r) => doctrineWording(r.worst),
            },
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
