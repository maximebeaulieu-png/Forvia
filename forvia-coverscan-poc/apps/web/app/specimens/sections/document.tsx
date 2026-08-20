"use client";

import * as React from "react";
import { ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/coverscan/DocumentViewer";
import { MaskedText } from "@/components/coverscan/MaskedText";
import { ProcessingStepper } from "@/components/coverscan/ProcessingStepper";
import { ProfileSwitcher } from "@/components/coverscan/ProfileSwitcher";
import {
  RequestEmailSheet,
  buildRequestEmail,
} from "@/components/coverscan/RequestEmailSheet";

const PROFILES = [
  {
    id: "gptc",
    label: "GPTC default",
    version: "v3",
    note: "PL €20M · recall and PFL €15M · stamp missing blocks",
  },
  {
    id: "expert",
    label: "Expert (R. Mekouar)",
    version: "v1",
    note: "Recall €5M accepted · stamp missing requests changes",
  },
];

const INITIAL_EMAIL = buildRequestEmail({
  supplier: "M.T.S. SAS",
  policyNumber: "144 725 803",
  insurer: "MMA (via Marron & Associés)",
  validUntil: "31 December 2025",
  dueDate: "30 April 2025",
  formalPoints: [
    "The certificate must be issued, signed and stamped by the insurer (not by a broker or agent).",
  ],
  coveragePoints: [
    "Product liability: at least EUR 20,000,000 (found: EUR 10,000,000).",
    "Product recall / withdrawal costs: at least EUR 15,000,000, worldwide including USA/Canada (found: EUR 305,000, excluded for USA/Canada).",
    "Pure financial loss: at least EUR 15,000,000 (found: missing).",
  ],
});

export function DocumentSection() {
  const [profile, setProfile] = React.useState("gptc");
  const [page, setPage] = React.useState(2);
  const [active, setActive] = React.useState("recall");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [email, setEmail] = React.useState(INITIAL_EMAIL);

  return (
    <section aria-labelledby="specimen-document">
      <h2 id="specimen-document" className="mb-1 text-lg font-semibold">
        Document &amp; pipeline
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        DocumentViewer with linked evidence, ProcessingStepper, ProfileSwitcher,
        RequestEmailSheet, MaskedText
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <ProfileSwitcher
          value={profile}
          onChange={setProfile}
          profiles={PROFILES}
        />
        <MaskedText
          value="nicole.hoffmann@polyvlies.de"
          onReveal={(v) => console.info("[audit] personal data revealed:", v)}
        />
        <MaskedText
          value="+49 5241 9345 12"
          kind="phone"
          onReveal={(v) => console.info("[audit] personal data revealed:", v)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setPage(2);
            setActive((a) => (a === "recall" ? "pl" : "recall"));
          }}
        >
          <ArrowRight size={13} />
          Pulse evidence
        </Button>
        <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>
          <Mail size={13} />
          Request changes
        </Button>
      </div>

      <div className="grid h-[330px] grid-cols-[1fr_240px] gap-3">
        <DocumentViewer
          pages={[
            { n: 1, imageUrl: "/pages/04_p1.jpeg", lang: "fr", ocrUsed: true },
            { n: 2, imageUrl: "/pages/04_p2.jpeg", lang: "fr", ocrUsed: true },
          ]}
          activePage={page}
          onPageChange={setPage}
          activeHighlightId={active}
          highlights={[
            { id: "recall", page: 2, x: 0.08, y: 0.36, w: 0.66, h: 0.028 },
            { id: "pl", page: 2, x: 0.08, y: 0.3, w: 0.66, h: 0.028 },
          ]}
          fileName="MTS_MMA_2025.pdf"
        />
        <div className="overflow-auto rounded-(--radius) border border-border bg-card p-3">
          <ProcessingStepper current={6} timings={[420, 3100, 900, 6400, 700, 1500]} />
        </div>
      </div>

      <RequestEmailSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        email={email}
        onChange={(e) => setEmail(e.target.value)}
        supplier="M.T.S. SAS"
      />
    </section>
  );
}

export default DocumentSection;
