"use client";

/**
 * Supplier 360 (mid-fi) — faithful port of Supplier360Screen from the ui_kit
 * (design-pack ui_kits/coverscan/MidFiScreens.jsx). Facts, policy numbers and
 * the year-by-year rows are the demo values from the ui_kit; the live fields
 * (supplier, insurer, rating, expiry, decision) come from certificate 10.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { DecisionChip, MaskedText, StatusMiniGrid } from "@/components/coverscan";
import type { DecisionChipProps } from "@/components/coverscan";
import type { GuaranteeStatus } from "@/components/coverscan/StatusMiniGrid";
import { Card, DataTable, DsBadge, DsButton, type TableColumn } from "../_midfi/ui";

export interface SupplierViewProps {
  certificateId: string;
  supplier: string;
  insurer: string;
  rating: string;
  expiry: string;
  decision: DecisionChipProps["decision"];
}

const FACTS: Array<[string, string]> = [
  ["Country", "Italy"],
  ["Ariba id", "SUP-0066012"],
  ["Category", "Metal components"],
  ["Spend tier", "Tier 2"],
  ["Contracting entity", "Faurecia Emissions Control Technologies Italy"],
];

const POLICY_NUMBERS: Array<[string, string]> = [
  ["2025", "IT-GEN-902244"],
  ["2024", "IT-GEN-881190"],
  ["2023", "IT-GEN-844021"],
];

interface YearRow {
  id: string;
  year: string;
  decision: DecisionChipProps["decision"];
  mini: { pl: GuaranteeStatus; recall: GuaranteeStatus; pfl: GuaranteeStatus };
  pl: string;
  recall: string;
  pfl: string;
  received: string;
}

const YEAR_ROWS: YearRow[] = [
  {
    id: "2025",
    year: "2025",
    decision: "FORMAL_DEFECT",
    mini: { pl: "COMPLIANT", recall: "BELOW_MINIMUM", pfl: "COMPLIANT" },
    pl: "€50,000,000",
    recall: "€10,000,000",
    pfl: "€15,000,000",
    received: "22 Feb 2025",
  },
  {
    id: "2024",
    year: "2024",
    decision: "REQUEST_CHANGES",
    mini: { pl: "COMPLIANT", recall: "COMPLIANT", pfl: "COMPLIANT" },
    pl: "€50,000,000",
    recall: "€15,000,000",
    pfl: "€15,000,000",
    received: "19 Feb 2024",
  },
  {
    id: "2023",
    year: "2023",
    decision: "REQUEST_CHANGES",
    mini: { pl: "COMPLIANT", recall: "BELOW_MINIMUM", pfl: "BELOW_MINIMUM" },
    pl: "€50,000,000",
    recall: "€8,000,000",
    pfl: "€5,000,000",
    received: "27 Feb 2023",
  },
];

export function SupplierView({ certificateId, supplier, insurer, rating, expiry, decision }: SupplierViewProps) {
  const router = useRouter();

  const columns: Array<TableColumn<YearRow>> = [
    { key: "year", header: "Year", mono: true },
    { key: "decision", header: "Decision", render: (r) => <DecisionChip decision={r.decision} size="sm" /> },
    {
      key: "mini",
      header: "PL · Recall · PFL",
      align: "center",
      render: (r) => <StatusMiniGrid pl={r.mini.pl} recall={r.mini.recall} pfl={r.mini.pfl} />,
    },
    { key: "pl", header: "Product liability", mono: true, align: "right" },
    { key: "recall", header: "Recall", mono: true, align: "right" },
    { key: "pfl", header: "Pure financial loss", mono: true, align: "right" },
    { key: "received", header: "Received", mono: true, muted: true },
  ];

  return (
    <div style={{ padding: "16px 24px 28px", display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "10px 12px",
          border: "1px solid var(--status-amber)",
          background: "var(--status-amber-bg)",
          borderRadius: "var(--radius)",
          fontSize: 13,
          color: "var(--status-amber)",
        }}
      >
        <TriangleAlert size={15} strokeWidth={1.75} aria-hidden="true" style={{ flex: "0 0 auto" }} />
        <span>
          <b style={{ fontWeight: 600 }}>Change detected</b> — product recall dropped from €15,000,000 to €10,000,000
          between the 2024 and 2025 certificates.
        </span>
        <span style={{ flex: 1 }} />
        <DsButton size="sm" disabled title="Sprint 1+">
          Compare
        </DsButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12 }}>
        <Card title={supplier} subtitle="Supplier profile">
          <div style={{ display: "grid", gap: 8 }}>
            {FACTS.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                <span style={{ width: 132, flex: "0 0 132px", color: "var(--muted-foreground)" }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
              <span style={{ width: 132, flex: "0 0 132px", color: "var(--muted-foreground)" }}>Contact</span>
              <MaskedText value="a.ferrari@metraton.it" />
            </div>
          </div>
        </Card>
        <Card title="Current status">
          <div style={{ display: "grid", gap: 10 }}>
            <DecisionChip decision={decision} size="md" />
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Best coverage in the batch — one-line fix: recall 10 → 15M and the insurer&apos;s stamp.
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Insurer</div>
                <div style={{ fontSize: 13 }}>
                  {insurer}{" "}
                  <DsBadge tone="ink" mono>
                    {rating}
                  </DsBadge>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Next expiry</div>
                <div className="cs-num" style={{ fontSize: 13 }}>
                  {expiry}
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card title="Policy numbers on file" subtitle="Kept for claims">
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            {POLICY_NUMBERS.map(([y, p]) => (
              <div key={y} style={{ display: "flex", gap: 12 }}>
                <span className="cs-num" style={{ color: "var(--muted-foreground)" }}>
                  {y}
                </span>
                <span className="cs-num">{p}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Certificates by year" padded={false}>
        <DataTable rows={YEAR_ROWS} onRowClick={() => router.push(`/certificates/${certificateId}`)} columns={columns} />
      </Card>
    </div>
  );
}
