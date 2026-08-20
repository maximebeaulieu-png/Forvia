"use client";

import { Badge } from "@/components/ui/badge";
import { DecisionChip } from "./DecisionChip";
import type { DecisionChipProps } from "./DecisionChip";
import { PROFILE_LABEL, REFERENCE_DATE } from "@/lib/config";

export interface CertificateHeaderProps {
  supplier: string;
  country?: string;
  aribaId?: string;
  insurer?: string;
  rating?: string;
  policyNumber?: string;
  /** display string, e.g. "31 Dec 2025" */
  expiry?: string;
  /** days vs the demo clock; negative = expired */
  expiryDays?: number | null;
  decision: DecisionChipProps["decision"];
  needsReview?: boolean;
  /** 0–1 */
  accuracy?: number;
  seconds?: number;
  model?: string;
  runId?: string;
}

function validity(expiry?: string, days?: number | null) {
  if (!expiry) return null;
  if (days == null) return expiry;
  if (days < 0) return `${expiry} · expired ${Math.abs(days)} days ago`;
  return `${expiry} · valid · ${days} days left`;
}

export function CertificateHeader(p: CertificateHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="truncate">{p.supplier}</h1>
          <p className="text-muted-foreground" style={{ fontSize: "var(--text-caption)" }}>
            {[p.country, p.aribaId].filter(Boolean).join(" · ")}
          </p>
        </div>
        {p.insurer ? (
          <Badge variant="outline" className="border-border text-foreground">
            {p.insurer}
            {p.rating ? <span className="text-muted-foreground">&nbsp;· {p.rating}</span> : null}
          </Badge>
        ) : null}
        {p.policyNumber ? <span className="cs-code">{p.policyNumber}</span> : null}
        {p.expiry ? (
          <span
            className={p.expiryDays != null && p.expiryDays < 0 ? "text-(--status-red)" : "text-muted-foreground"}
            style={{ fontSize: "var(--text-caption)" }}
          >
            {validity(p.expiry, p.expiryDays)}
          </span>
        ) : null}
        <div className="ml-auto flex items-center gap-3">
          {p.needsReview ? (
            <Badge className="bg-(--status-review-bg) text-(--status-review) border-transparent">Needs review</Badge>
          ) : null}
          <DecisionChip decision={p.decision} size="lg" />
        </div>
      </div>
      <div
        className="mt-2 flex flex-wrap items-center gap-x-4 text-muted-foreground"
        style={{ fontSize: "var(--text-micro)" }}
      >
        {p.accuracy != null ? <span>Accuracy {Math.round(p.accuracy * 100)}%</span> : null}
        <span>{PROFILE_LABEL}</span>
        <span>Reference date {REFERENCE_DATE}</span>
        {p.seconds != null ? (
          <span className="cs-code">
            Analysed in {p.seconds}s{p.model ? ` · model ${p.model}` : ""}{p.runId ? ` · run ${p.runId}` : ""}
          </span>
        ) : null}
      </div>
    </header>
  );
}
