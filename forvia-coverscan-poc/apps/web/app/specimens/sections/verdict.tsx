import type { ReactNode } from "react";
import { ConfidenceDot } from "@/components/coverscan/ConfidenceDot";
import { DecisionChip } from "@/components/coverscan/DecisionChip";
import { ScoreRing } from "@/components/coverscan/ScoreRing";
import { StatusMiniGrid } from "@/components/coverscan/StatusMiniGrid";
import {
  VerificationSeal,
  VerificationSealList,
  type SealGateState,
} from "@/components/coverscan/VerificationSeal";

/**
 * Specimen section for the verdict group — mirrors the states shown in
 * $DS/components/verdict/verdict.card.html (Marron / MMA gate set).
 */

const gates: Record<string, SealGateState> = {
  stamp: { state: "fail", note: "broker's stamp p.1, no insurer stamp" },
  signature: { state: "fail", note: "no insurer signature" },
  insurer: { state: "fail", note: "issuer is a broker — ORIAS 07 002 497" },
  policyNumber: { state: "pass", note: "144 725 803" },
  dates: { state: "pass", note: "1 Jan → 31 Dec 2025" },
  entity: { state: "pass" },
  coinsurance: { state: "na" },
  documentType: { state: "pass", note: "certificate" },
};

function RowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}

export function VerdictSection() {
  return (
    <section aria-labelledby="specimen-verdict">
      <h2 id="specimen-verdict" className="mb-1 text-lg font-semibold">
        Verdict
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        DecisionChip, VerificationSeal, ScoreRing, StatusMiniGrid, ConfidenceDot
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RowLabel>Decision</RowLabel>
        <DecisionChip decision="GO" size="lg" />
        <DecisionChip decision="REQUEST_CHANGES" size="lg" />
        <DecisionChip decision="FORMAL_DEFECT" size="lg" />
        <DecisionChip decision="STRUCTURAL" size="lg" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RowLabel>sm / md</RowLabel>
        <DecisionChip decision="STRUCTURAL" size="sm" />
        <DecisionChip decision="NEEDS_REVIEW" size="sm" />
        <DecisionChip decision="PROCESSING" size="sm" />
        <DecisionChip decision="PENDING" size="sm" />
        <DecisionChip decision="REQUEST_CHANGES" size="md" />
      </div>

      <div className="mt-1 flex flex-wrap items-start gap-6">
        <VerificationSeal gates={gates} size={96} />
        <VerificationSeal gates={gates} size={40} />
        <VerificationSealList gates={gates} style={{ flex: 1, minWidth: 0 }} />
        <div className="flex gap-4">
          <ScoreRing value={56} />
          <ScoreRing value={3} provisional />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <RowLabel>Mini-grid</RowLabel>
        <StatusMiniGrid pl="COMPLIANT" recall="BELOW_MINIMUM" pfl="COMPLIANT" />
        <StatusMiniGrid
          pl="BELOW_MINIMUM"
          recall="BELOW_MINIMUM"
          pfl="MISSING"
          tooltips={{ recall: "Found €305,000 · required €15,000,000" }}
        />
        <StatusMiniGrid pl="COVERED_NO_AMOUNT" recall="EXCLUDED" pfl="UNCLEAR" />
        <span className="ml-3 shrink-0 font-mono text-[11px] text-muted-foreground">
          Confidence
        </span>
        <ConfidenceDot value={0.96} />
        <ConfidenceDot value={0.72} />
        <ConfidenceDot value={0.41} />
        <ConfidenceDot
          value={0.82}
          showValue
          page={2}
          quote="Frais de retrait engagés par l'assuré 305.000 €"
        />
      </div>
    </section>
  );
}

export default VerdictSection;
