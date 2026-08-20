"use client";

/**
 * Requirements profiles (mid-fi) — faithful port of RequirementsScreen from
 * the ui_kit (design-pack ui_kits/coverscan/MidFiScreens.jsx). Profile
 * switching (GPTC default ↔ Expert) is live; unwired actions (simulate on
 * portfolio, new profile, gate edits) are disabled and flagged "Sprint 1+".
 */

import * as React from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Card, DsButton, DsInput, DsProgress, DsSelect } from "../_midfi/ui";

export interface ProfileItem {
  id: string;
  label: string;
  version: string;
  note: string;
}

const WEIGHTS: Array<[string, number]> = [
  ["Product liability", 35],
  ["Product recall", 30],
  ["Pure financial loss", 20],
  ["Territory", 10],
  ["Insurer rating", 5],
];

export function RequirementsView({ profiles }: { profiles: ProfileItem[] }) {
  const [profile, setProfile] = React.useState("gptc");
  const sum = WEIGHTS.reduce((a, w) => a + w[1], 0);
  const expert = profile === "expert";

  const thresholds: Array<[string, string]> = [
    ["Product liability", "20,000,000"],
    ["Product recall / withdrawal", expert ? "5,000,000" : "15,000,000"],
    ["Pure financial loss", expert ? "10,000,000" : "15,000,000"],
  ];

  const gates: Array<[string, string]> = [
    ["Insurer stamp missing", expert ? "Request changes" : "Block"],
    ["Issued by a broker", "Block"],
    ["Signature missing", "Block"],
    ["Document is a quote", "Block"],
    ["Expiry within 90 days", "Warning"],
    ["Insurer rating below A-", "Warning"],
  ];

  const simulation: Array<[string, string]> = [
    ["Decisions changed", expert ? "17" : "0"],
    ["Becomes compliant", expert ? "11" : "0"],
    ["Becomes request changes", expert ? "6" : "0"],
    ["Still not admissible", expert ? "47" : "64"],
  ];

  return (
    <div
      style={{
        padding: "16px 24px 28px",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 12,
        alignItems: "start",
      }}
    >
      <Card title="Profiles" padded={false}>
        <div style={{ padding: 6, display: "grid", gap: 2 }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfile(p.id)}
              style={{
                textAlign: "left",
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                background: p.id === profile ? "var(--accent)" : "transparent",
                font: "inherit",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>
                {p.label}
                <span className="cs-code">{p.version}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{p.note}</div>
            </button>
          ))}
          <button
            type="button"
            disabled
            title="Sprint 1+"
            style={{
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "not-allowed",
              background: "transparent",
              font: "inherit",
              fontSize: 13,
              color: "var(--muted-foreground)",
            }}
          >
            + New profile
          </button>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 12 }}>
        <Card
          title="Critical thresholds"
          subtitle="Applied to every certificate analysed under this profile"
          actions={
            <DsButton size="sm" variant="primary" disabled title="Sprint 1+">
              Simulate on portfolio
            </DsButton>
          }
        >
          <div style={{ display: "grid", gap: 10 }}>
            {thresholds.map(([l, v]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, width: 220, flex: "0 0 220px" }}>{l}</span>
                <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>EUR</span>
                <DsInput mono size="sm" value={v} readOnly style={{ width: 150 }} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card title="Gates and severity">
            <div style={{ display: "grid", gap: 10 }}>
              {gates.map(([l, v]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, flex: 1 }}>{l}</span>
                  <DsSelect
                    size="sm"
                    value={v}
                    options={["Block", "Request changes", "Warning", "Info"]}
                    title="Sprint 1+"
                  />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Weights" subtitle={`Must sum to 100 — currently ${sum}`}>
            <div style={{ display: "grid", gap: 10 }}>
              {WEIGHTS.map(([l, w]) => (
                <div
                  key={l}
                  style={{ display: "grid", gridTemplateColumns: "150px 1fr 34px", gap: 10, alignItems: "center" }}
                >
                  <span style={{ fontSize: 13 }}>{l}</span>
                  <DsProgress value={w} max={40} />
                  <span className="cs-num" style={{ fontSize: 13, textAlign: "right" }}>
                    {w}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: sum === 100 ? "var(--status-go)" : "var(--status-red)",
                  marginTop: 4,
                }}
              >
                {sum === 100 ? (
                  <CircleCheck size={13} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <TriangleAlert size={13} strokeWidth={1.75} aria-hidden="true" />
                )}
                {sum === 100 ? "Weights are valid" : `Weights sum to ${sum}`}
              </div>
            </div>
          </Card>
        </div>

        <Card title="Simulation on the current portfolio" subtitle="Powered by stored breakdowns — no re-analysis needed">
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {simulation.map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>{l}</div>
                <div className="cs-num" style={{ fontSize: 20, fontWeight: 600 }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
