"use client";

/**
 * Screen 3 — Certificates queue and table.
 * Faithful port of ui_kits/coverscan/CertificatesScreen.jsx: saved-view pills,
 * country/insurer filters, upload zone, dense DataTable, count line. View and
 * search state come from the URL (?view=, ?q=); each row carries a covering
 * link to /certificates/[id] so rows stay keyboard-accessible.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Download, Filter, Info, RefreshCw, Upload } from "lucide-react";
import type { CachedCertificateT } from "@coverscan/schemas";
import { ConfidenceDot, DecisionChip, StatusMiniGrid } from "@/components/coverscan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Cached certificate plus demo table extras kept by the schema's passthrough. */
export type CertificateRow = CachedCertificateT & {
  code?: string;
  assignee?: string;
};

export const VIEWS = [
  { slug: "all", label: "All" },
  { slug: "needs-review", label: "Needs review" },
  { slug: "not-admissible", label: "Not admissible" },
  { slug: "expiring", label: "Expiring" },
  { slug: "my-suppliers", label: "My suppliers" },
] as const;

export type ViewSlug = (typeof VIEWS)[number]["slug"];

const COUNTRY_OPTIONS = [
  "All countries",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Switzerland",
  "India",
];

const INSURER_OPTIONS = [
  "All insurers",
  "Allianz",
  "Chubb",
  "Generali",
  "Zurich",
  "Swiss Mobiliar",
  "ICICI Lombard",
  "MMA",
];

/* ---------------------------------------------------------------- toolbar */

function ToolbarButton({
  variant = "outline",
  iconLeft,
  children,
  onClick,
}: {
  variant?: "outline" | "ghost";
  iconLeft?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  const base =
    variant === "ghost"
      ? { background: "transparent", border: "1px solid transparent" }
      : { background: "var(--card)", border: "1px solid var(--border)" };
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
        fontSize: 13,
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        color: "var(--foreground)",
        borderRadius: "var(--radius-full)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 120ms var(--ease-standard)",
        ...base,
        ...(hover
          ? { background: "var(--accent)", color: "var(--accent-foreground)" }
          : null),
      }}
    >
      {iconLeft}
      {children}
    </button>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          height: 28,
          padding: "0 28px 0 10px",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          color: "var(--foreground)",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        style={{
          position: "absolute",
          right: 8,
          pointerEvents: "none",
          color: "var(--muted-foreground)",
          display: "flex",
        }}
      >
        <ChevronDown size={14} strokeWidth={1.75} />
      </span>
    </span>
  );
}

/* ------------------------------------------------------------ upload zone */

function UploadZone({ onUpload }: { onUpload: () => void }) {
  const [over, setOver] = React.useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a certificate — demo replay of certificate 06"
      title="Demo replay — the live pipeline lands in Sprint 1"
      onClick={onUpload}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUpload();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        /* The dropped file is accepted then ignored — this is a demo replay. */
        e.preventDefault();
        setOver(false);
        onUpload();
      }}
      style={{
        border: `1px dashed ${over ? "var(--primary)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        background: over ? "var(--accent)" : "transparent",
        padding: "9px 14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "background 120ms var(--ease-standard)",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "var(--secondary)",
          color: "var(--primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 28px",
        }}
      >
        <Upload size={14} strokeWidth={1.75} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>Drop a certificate here</span>
      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
        PDF or PNG · analysed in under 30 s
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        Demo replay of certificate 06 — live pipeline arrives with Sprint 1
      </span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--primary)" }}>
        Browse files
      </span>
    </div>
  );
}

/* ------------------------------------------------------------ table cells */

const TD_BASE: React.CSSProperties = {
  padding: "0 10px",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

const TH_BASE: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  textAlign: "left",
  fontWeight: 500,
  fontSize: 12,
  color: "var(--muted-foreground)",
  background: "var(--card)",
  padding: "0 10px",
  height: 32,
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--border)",
};

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontVariantNumeric: "tabular-nums",
};

function initials(name: string): string {
  return name
    .split(/[.\s]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CertificateRowTr({ cert }: { cert: CertificateRow }) {
  const highlight = (e: React.SyntheticEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.background = "var(--accent)";
  };
  const clear = (e: React.SyntheticEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.background = "transparent";
  };
  const assignee = cert.assignee;
  return (
    <tr
      onMouseEnter={highlight}
      onMouseLeave={clear}
      onFocus={highlight}
      onBlur={clear}
      style={{
        position: "relative",
        height: "var(--row-h)",
        cursor: "pointer",
        background: "transparent",
        transition: "background var(--dur-recolour) var(--ease-standard)",
      }}
    >
      <td style={TD_BASE}>
        <Link
          href={`/certificates/${cert.id}`}
          aria-label={`Open certificate — ${cert.supplier}`}
          style={{ position: "absolute", inset: 0, zIndex: 0, borderBottom: "none" }}
        />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <DecisionChip decision={cert.decision} size="sm" />
          {cert.needsReview && <DecisionChip decision="NEEDS_REVIEW" size="sm" />}
        </span>
      </td>
      <td style={TD_BASE}>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontWeight: 500 }}>{cert.supplier}</span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{cert.code}</span>
        </span>
      </td>
      <td style={TD_BASE}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {cert.insurer}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              height: 20,
              padding: "0 8px",
              borderRadius: "var(--radius-full)",
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: "nowrap",
              color: "var(--foreground)",
              background: "var(--muted)",
              border: "1px solid transparent",
              ...MONO,
            }}
          >
            {cert.rating}
          </span>
        </span>
      </td>
      <td style={{ ...TD_BASE, textAlign: "center" }}>
        <StatusMiniGrid
          pl={cert.mini.pl}
          recall={cert.mini.recall}
          pfl={cert.mini.pfl}
          style={{ position: "relative", zIndex: 1 }}
        />
      </td>
      <td style={{ ...TD_BASE, textAlign: "right", ...MONO }}>
        {cert.provisional ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="cs-num"
                  style={{ position: "relative", zIndex: 1, color: "var(--muted-foreground)" }}
                >
                  —
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Provisional {cert.score} — not admissible, shown for information
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="cs-num">{cert.score}</span>
        )}
      </td>
      <td style={{ ...TD_BASE, textAlign: "center" }}>
        <ConfidenceDot value={cert.accuracy} style={{ position: "relative", zIndex: 1 }} />
      </td>
      <td style={{ ...TD_BASE, ...MONO }}>
        <span
          style={{
            color:
              cert.expiryDays != null && cert.expiryDays < 0 ? "var(--status-red)" : undefined,
          }}
        >
          {cert.expiry}
          {cert.expiryDays != null && (
            <span style={{ color: "var(--muted-foreground)" }}>
              {" "}
              · {cert.expiryDays < 0 ? "expired" : `in ${cert.expiryDays} d`}
            </span>
          )}
        </span>
      </td>
      <td style={{ ...TD_BASE, ...MONO, color: "var(--muted-foreground)" }}>{cert.received}</td>
      <td style={TD_BASE}>
        {assignee && assignee !== "—" ? (
          <span title={assignee} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "var(--radius-full)",
                background: "var(--secondary)",
                color: "var(--primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: ".02em",
              }}
            >
              {initials(assignee)}
            </span>
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{assignee}</span>
          </span>
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>—</span>
        )}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ view */

export function CertificatesView({
  certificates,
  view,
  q,
}: {
  certificates: CertificateRow[];
  view: ViewSlug;
  q: string;
}) {
  const router = useRouter();
  const [country, setCountry] = React.useState(COUNTRY_OPTIONS[0] as string);
  const [insurer, setInsurer] = React.useState(INSURER_OPTIONS[0] as string);

  const rows = React.useMemo(() => {
    let r = certificates;
    if (view === "needs-review") r = r.filter((c) => c.needsReview);
    if (view === "not-admissible")
      r = r.filter((c) => c.decision === "FORMAL_DEFECT" || c.decision === "STRUCTURAL");
    if (view === "expiring") r = r.filter((c) => c.expiryDays != null && c.expiryDays <= 90);
    if (view === "my-suppliers") r = r.filter((c) => c.assignee === "L. Fontaine");
    if (country !== COUNTRY_OPTIONS[0]) r = r.filter((c) => c.country === country);
    if (insurer !== INSURER_OPTIONS[0]) r = r.filter((c) => c.insurer.includes(insurer));
    const needle = q.trim().toLowerCase();
    if (needle)
      r = r.filter((c) => `${c.supplier} ${c.policyNumber}`.toLowerCase().includes(needle));
    return r;
  }, [certificates, view, country, insurer, q]);

  const viewLabel = VIEWS.find((v) => v.slug === view)?.label ?? "All";

  function onView(slug: ViewSlug) {
    const sp = new URLSearchParams();
    if (slug !== "all") sp.set("view", slug);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    router.push(qs ? `/certificates?${qs}` : "/certificates", { scroll: false });
  }

  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            gap: 2,
            background: "var(--muted)",
            padding: 3,
            borderRadius: "var(--radius-full)",
          }}
        >
          {VIEWS.map((v) => (
            <button
              key={v.slug}
              type="button"
              onClick={() => onView(v.slug)}
              aria-pressed={v.slug === view}
              style={{
                height: 26,
                padding: "0 12px",
                fontSize: 12,
                fontWeight: v.slug === view ? 600 : 450,
                background: v.slug === view ? "var(--card)" : "transparent",
                color: "var(--foreground)",
                border: "none",
                borderRadius: "var(--radius-full)",
                cursor: "pointer",
                font: "inherit",
                boxShadow: v.slug === view ? "var(--shadow-sm)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <FilterSelect
          ariaLabel="Filter by country"
          value={country}
          options={COUNTRY_OPTIONS}
          onChange={setCountry}
        />
        <FilterSelect
          ariaLabel="Filter by insurer"
          value={insurer}
          options={INSURER_OPTIONS}
          onChange={setInsurer}
        />
        <ToolbarButton variant="ghost" iconLeft={<Filter size={13} strokeWidth={1.75} />}>
          More filters
        </ToolbarButton>
        <span style={{ flex: 1 }} />
        <ToolbarButton iconLeft={<RefreshCw size={13} strokeWidth={1.75} />}>
          Re-run with profile
        </ToolbarButton>
        <ToolbarButton iconLeft={<Download size={13} strokeWidth={1.75} />}>
          Export Excel
        </ToolbarButton>
      </div>

      <UploadZone onUpload={() => router.push("/certificates/06?processing=1")} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          fontSize: 12,
          color: "var(--muted-foreground)",
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <Info size={13} strokeWidth={1.75} style={{ flex: "0 0 auto" }} />
        <span>
          Demo dataset: the 10 real annotated certificates — 140 synthetic rows arrive with the
          DB sprint
        </span>
      </div>

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
        }}
      >
        <div style={{ padding: 0, flex: 1, minWidth: 0 }}>
          <div style={{ overflow: "auto" }} tabIndex={0} role="region" aria-label="Certificates table">
            <table style={{ width: "100%", fontSize: "var(--text-dense)", tableLayout: "auto" }}>
              <thead>
                <tr>
                  <th style={TH_BASE}>Status</th>
                  <th style={TH_BASE}>Supplier</th>
                  <th style={TH_BASE}>Insurer</th>
                  <th style={{ ...TH_BASE, textAlign: "center" }}>PL · Recall · PFL</th>
                  <th style={{ ...TH_BASE, textAlign: "right" }}>Score</th>
                  <th style={{ ...TH_BASE, textAlign: "center" }}>Accuracy</th>
                  <th style={TH_BASE}>Expiry</th>
                  <th style={TH_BASE}>Received</th>
                  <th style={TH_BASE}>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)" }}
                    >
                      No certificates match. Clear filters or upload one.
                    </td>
                  </tr>
                )}
                {rows.map((c) => (
                  <CertificateRowTr key={c.id} cert={c} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div style={{ fontSize: 11, color: "var(--muted-foreground)", padding: "0 6px" }}>
        {rows.length} certificates · view {viewLabel}
      </div>
    </div>
  );
}
