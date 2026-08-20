"use client";

/**
 * Integrations & exports (mid-fi) — faithful port of IntegrationsScreen from
 * the ui_kit (design-pack ui_kits/coverscan/MidFiScreens.jsx). Unwired
 * actions (sync, payload preview, download, refresh) are disabled and flagged
 * "Sprint 1+"; the Excel view selector is live but purely local.
 */

import * as React from "react";
import { CircleCheck, Download, RefreshCw } from "lucide-react";
import { Card, DsBadge, DsButton, DsSelect } from "../_midfi/ui";

const ARIBA_FACTS: Array<[string, string]> = [
  ["Last sync", "15 Apr 2025 06:00"],
  ["Schedule", "Daily at 06:00 CET"],
  ["Environment", "Sandbox (POC)"],
];

const MAPPED_FIELDS = [
  "decision",
  "riskScore",
  "validUntil",
  "productLiabilityEur",
  "recallEur",
  "pureFinancialLossEur",
  "needsHumanReview",
  "profileVersion",
];

const REGISTRY_FACTS: Array<[string, string]> = [
  ["Insurer registry", "v2025-03 · 1,412 entries"],
  ["Last ECB rates fetch", "15 Apr 2025 06:02"],
  ["ORIAS intermediary list", "v2025-01"],
];

const MODEL_FACTS: Array<[string, string]> = [
  ["Vision model", "v0.4"],
  ["Extraction prompt", "v3"],
  ["Scoring rules", "GPTC default v3"],
  ["Average analysis", "18 s"],
];

export function IntegrationsView() {
  const [view, setView] = React.useState("All");

  return (
    <div
      style={{
        padding: "16px 24px 28px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        alignItems: "start",
      }}
    >
      <Card
        title="SAP Ariba"
        subtitle="Supplier qualification questionnaire"
        actions={
          <DsBadge tone="go" icon={<CircleCheck size={11} strokeWidth={1.75} aria-hidden="true" />}>
            Connected
          </DsBadge>
        }
      >
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          {ARIBA_FACTS.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10 }}>
              <span style={{ width: 120, flex: "0 0 120px", color: "var(--muted-foreground)" }}>{k}</span>
              <span className="cs-num">{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted-foreground)" }}>Mapped questionnaire fields</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MAPPED_FIELDS.map((f) => (
              <span
                key={f}
                className="cs-code"
                style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}
              >
                {f}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <DsButton size="sm" disabled title="Sprint 1+">
              Payload preview
            </DsButton>
            <DsButton size="sm" variant="primary" disabled title="Sprint 1+">
              Sync now
            </DsButton>
          </div>
        </div>
      </Card>

      <Card title="Excel export" subtitle="One row per certificate, findings as text">
        <div style={{ display: "grid", gap: 10 }}>
          <DsSelect
            label="View"
            value={view}
            onChange={setView}
            options={["All", "Needs review", "Not admissible", "Expiring", "My suppliers"]}
          />
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Includes every grid column, the provisional score, and the FX rate used for each amount.
          </div>
          <div>
            <DsButton
              size="sm"
              disabled
              title="Sprint 1+"
              iconLeft={<Download size={13} strokeWidth={1.75} aria-hidden="true" />}
            >
              Download .xlsx
            </DsButton>
          </div>
        </div>
      </Card>

      <Card title="Registry & rates">
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          {REGISTRY_FACTS.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10 }}>
              <span style={{ width: 168, flex: "0 0 168px", color: "var(--muted-foreground)" }}>{k}</span>
              <span className="cs-num">{v}</span>
            </div>
          ))}
          <div>
            <DsButton
              size="sm"
              disabled
              title="Sprint 1+"
              iconLeft={<RefreshCw size={13} strokeWidth={1.75} aria-hidden="true" />}
            >
              Refresh registry
            </DsButton>
          </div>
        </div>
      </Card>

      <Card title="Model & prompts" subtitle="Recorded with every analysis for audit">
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          {MODEL_FACTS.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10 }}>
              <span style={{ width: 168, flex: "0 0 168px", color: "var(--muted-foreground)" }}>{k}</span>
              <span className="cs-num">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
