import type { ReactNode } from "react";
import { CoverageGrid, type CoverageRow } from "@/components/coverscan/CoverageGrid";
import { FindingsList, type Finding } from "@/components/coverscan/FindingsList";
import { GapBar } from "@/components/coverscan/GapBar";
import { KpiCard } from "@/components/coverscan/KpiCard";

const GRID_ROWS: CoverageRow[] = [
  {
    id: "pl",
    guarantee: "Product liability",
    required: 2000000000,
    foundOriginal: "€10,000,000",
    foundEur: 1000000000,
    status: "BELOW_MINIMUM",
    basis: "per occurrence",
    confidence: 0.88,
    page: 1,
  },
  {
    id: "recall",
    guarantee: "Product recall / withdrawal costs",
    required: 1500000000,
    foundOriginal: "€305,000",
    foundEur: 30500000,
    status: "BELOW_MINIMUM",
    territory: "Excl. USA/Canada",
    territoryExcluded: true,
    confidence: 0.82,
    page: 2,
    quote: "Frais de retrait engagés par l'assuré 305.000 €",
  },
  {
    id: "pfl",
    guarantee: "Pure financial loss",
    required: 1500000000,
    status: "MISSING",
    confidence: 0.9,
  },
  {
    id: "dism",
    guarantee: "Dismantling and refitting costs",
    status: "COVERED_NO_AMOUNT",
    group: "secondary",
    confidence: 0.7,
    territory: "Excl. USA/Canada",
    territoryExcluded: true,
  },
];

const FINDINGS: Finding[] = [
  {
    ruleId: "ISSUER_IS_BROKER",
    severity: "BLOCK",
    title: "Certificate issued by a broker, not by the insurer",
    quote: "Marron & Associés — ORIAS 07 002 497",
    page: 1,
    lang: "fr",
    fix: "Request a certificate issued, signed and stamped by MMA.",
  },
  {
    ruleId: "RECALL_BELOW_MIN",
    severity: "CRITICAL",
    title: "Product recall costs at €305,000 against €15,000,000 required",
    quote: "Frais de retrait engagés par l'assuré 305.000 €",
    page: 2,
    lang: "fr",
    fix: "Request product recall / withdrawal costs of at least EUR 15,000,000, worldwide.",
  },
  {
    ruleId: "TERRITORY_EXCL_US_CA",
    severity: "WARNING",
    title: "Recall and refitting excluded for USA and Canada",
    page: 2,
    lang: "fr",
    fix: "Request worldwide cover including USA and Canada.",
  },
  {
    ruleId: "DEDUCTIBLE_PRESENT",
    severity: "INFO",
    title: "Deductible of €1,500 per claim on material damage",
    page: 2,
    lang: "fr",
  },
];

const GAP_BAR_STATES: Array<{ label: string; bar: ReactNode }> = [
  {
    label: "below minimum",
    bar: <GapBar found={30500000} required={1500000000} />,
  },
  { label: "missing", bar: <GapBar required={1500000000} status="MISSING" /> },
  {
    label: "no amount",
    bar: <GapBar required={1500000000} status="COVERED_NO_AMOUNT" />,
  },
  {
    label: "excluded",
    bar: <GapBar found={400000000} required={1500000000} status="EXCLUDED" />,
  },
  {
    label: "compliant",
    bar: <GapBar found={2000000000} required={2000000000} status="COMPLIANT" />,
  },
];

/** Coverage group specimens — GapBar states, KpiCard, CoverageGrid, FindingsList. */
export function CoverageSection() {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {GAP_BAR_STATES.map(({ label, bar }) => (
          <div
            key={label}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
          >
            <span
              className="cs-code"
              style={{ width: 110, flex: "0 0 110px", fontSize: 11 }}
            >
              {label}
            </span>
            {bar}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <KpiCard
          label="Suppliers covered"
          value="9 / 150"
          sub="6 % compliant · +2 this month"
          icon="shield-check"
        />
        <KpiCard
          label="Not admissible"
          value="64"
          tone="red"
          sub="41 formal · 23 structural"
          icon="shield-x"
        />
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--card)",
        }}
      >
        <CoverageGrid rows={GRID_ROWS} />
      </div>

      <FindingsList findings={FINDINGS} />
    </section>
  );
}
