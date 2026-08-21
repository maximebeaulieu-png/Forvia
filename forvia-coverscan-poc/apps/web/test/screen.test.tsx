import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CertificateView } from "../app/(shell)/certificates/[id]/certificate-view";
import { getCertificate } from "../lib/repository";
import { NO_SCORE_REASON } from "../lib/doctrine";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

afterEach(cleanup);

describe("Certificate analysis screen", () => {
  it("renders cert 04 as Not admissible with the locked chip label", () => {
    render(<CertificateView cert={getCertificate("04")!} prevId="03" nextId="05" />);
    expect(screen.getAllByText("Not admissible").length).toBeGreaterThan(0);
    expect(screen.queryByText(/rejected/i)).not.toBeInTheDocument();
  });

  it("folds the verdict detail behind Read more, headline always visible (cert 04)", async () => {
    render(<CertificateView cert={getCertificate("04")!} />);
    /* First sentence in bold, always on screen. */
    expect(screen.getByText(/issued by a broker \(Marron & Associés\)/)).toBeInTheDocument();
    /* The rest of the summary is collapsed by default — not in the DOM at all. */
    expect(screen.queryByText(/Even if reissued by MMA/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recommended action/)).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Read more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "verdict-read-more");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Even if reissued by MMA/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Read less" })).toBe(toggle);

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    /* The folded copy leaves the DOM once the collapse settles. */
    await waitFor(() =>
      expect(screen.queryByText(/Even if reissued by MMA/)).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Read more" })).toBeInTheDocument();
  });

  it("keeps the coverage evidence hint as an info-icon tooltip, not standing copy", () => {
    render(<CertificateView cert={getCertificate("04")!} />);
    const hint = screen.getByLabelText("Click a figure to see it on the document");
    expect(hint).toHaveAttribute("title", "Click a figure to see it on the document");
    /* No permanent text node carries the sentence any more. */
    expect(
      screen.queryByText("Click a figure to see it on the document"),
    ).not.toBeInTheDocument();
  });

  it("shows the five locked tabs and switches to Extracted data", () => {
    render(<CertificateView cert={getCertificate("04")!} />);
    for (const tab of ["Summary", "Extracted data", "Exclusions & territory", "History", "Audit"]) {
      expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
    }
    const trigger = screen.getByRole("tab", { name: "Extracted data" });
    fireEvent.mouseDown(trigger, { button: 0 });
    fireEvent.click(trigger);
    expect(screen.getByText(/RC Exploitation/)).toBeInTheDocument();
  });

  it("renders a compact cert (07) with derived coverage rows carrying the DA taxonomy", () => {
    render(<CertificateView cert={getCertificate("07")!} />);
    expect(screen.getByText("Product liability (RC produits)")).toBeInTheDocument();
    expect(screen.getByText("Product recall / withdrawal costs (frais de retrait)")).toBeInTheDocument();
    expect(screen.getByText("Pure financial loss (DINC)")).toBeInTheDocument();
    expect(screen.getByText("Consequential financial loss (DIC)")).toBeInTheDocument();
    expect(screen.getByText("Dismantling and refitting (dépose-repose)")).toBeInTheDocument();
  });

  it("Approve is disabled when the decision is not GO", () => {
    render(<CertificateView cert={getCertificate("04")!} />);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("Reject is a plain button that records the rejection inline", () => {
    render(<CertificateView cert={getCertificate("04")!} />);
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(screen.queryByText("Rejected — reason recorded")).not.toBeInTheDocument();
    fireEvent.click(reject);
    expect(screen.getByRole("status")).toHaveTextContent("Rejected — reason recorded");
  });

  it("offers prev/next certificate navigation with accessible labels", () => {
    render(<CertificateView cert={getCertificate("04")!} prevId="03" nextId="05" />);
    expect(screen.getByRole("link", { name: "Previous certificate" })).toHaveAttribute("href", "/certificates/03");
    expect(screen.getByRole("link", { name: "Next certificate" })).toHaveAttribute("href", "/certificates/05");
  });

  it("scores guarantees under the binary rule — nothing below the minimum", () => {
    render(<CertificateView cert={getCertificate("07")!} />);
    /* Cert 07 covers €5M of the €20M product liability requirement: the dataset
       hands it 7.5 / 30, the doctrine hands it nothing. */
    expect(screen.queryByText("7.5 / 30")).not.toBeInTheDocument();
    /* The doctrine sentence is compressed to a short visible caption; the full
       wording stays discoverable as the ring's (and caption's) title. */
    expect(screen.getByText("Binary scoring")).toHaveAttribute(
      "title",
      "Binary compliance at the minimum (dossier §1.3)",
    );
    expect(screen.getByRole("button", { name: /score breakdown/i })).toHaveAttribute(
      "title",
      "Binary compliance at the minimum (dossier §1.3)",
    );
    fireEvent.click(screen.getByRole("button", { name: /score breakdown/i }));
    const dialog = screen.getByRole("dialog", { name: "Score breakdown" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getAllByText("0 / 30").length).toBeGreaterThan(0);
    expect(screen.getByText("below minimum — no partial credit")).toBeInTheDocument();
    expect(screen.queryByText("7.5 / 30")).not.toBeInTheDocument();
    /* 5 (extended PL) + 5 (territory) + 5 (aggregate basis) = 15, never the dataset's 22. */
    expect(screen.getByText("15 / 100")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Risk score 15 of 100/ })).toBeInTheDocument();
  });

  it("withholds the risk score below the accuracy threshold and routes to human review", () => {
    const lowAccuracy = { ...getCertificate("01")!, accuracy: 0.62 };
    render(<CertificateView cert={lowAccuracy} />);
    expect(screen.getByText(NO_SCORE_REASON)).toBeInTheDocument();
    expect(screen.getAllByText("Human review").length).toBeGreaterThan(0);
    expect(screen.queryByRole("img", { name: /Risk score/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /score breakdown/i })).not.toBeInTheDocument();
    /* The rest of the analysis stays on screen. */
    expect(screen.getByText(/Admissibility · \d of 8 checks passed/)).toBeInTheDocument();
    expect(screen.getByText("Coverage against FORVIA GPTC")).toBeInTheDocument();
    expect(screen.getByText("What to fix")).toBeInTheDocument();
  });

  it("publishes the score above the accuracy threshold (cert 01, accuracy 0.90)", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    expect(screen.getByRole("img", { name: /Risk score 5 of 100/ })).toBeInTheDocument();
    expect(screen.queryByText(NO_SCORE_REASON)).not.toBeInTheDocument();
  });

  it("applies the DA taxonomy to the pre-built coverage rows too (cert 01)", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    expect(screen.getByText("Product liability (RC produits)")).toBeInTheDocument();
    expect(screen.getByText("Product recall / withdrawal costs (frais de retrait)")).toBeInTheDocument();
    expect(screen.getByText("Pure financial loss (DINC)")).toBeInTheDocument();
    expect(screen.queryByText("Product liability")).not.toBeInTheDocument();
  });

  it("raises a blocking entity alert with its reason when the entity gate is not clean (cert 06)", () => {
    render(<CertificateView cert={getCertificate("06")!} />);
    expect(screen.getByText("Blocking alert — contracting entity")).toBeInTheDocument();
    expect(
      screen.getByText(
        "One certificate = one contracting entity — a certificate issued to the parent company is inoperative for the contracting subsidiary.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reason: additional insured of Grupo COPO — parent policy"),
    ).toBeInTheDocument();
  });

  it("keeps a clean entity gate free of the blocking alert (cert 01)", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    expect(screen.queryByText("Blocking alert — contracting entity")).not.toBeInTheDocument();
  });

  it("never shows a failing gate without a reason (cert 07 stamp gate has no note)", () => {
    render(<CertificateView cert={getCertificate("07")!} />);
    expect(screen.getAllByText("— Reason not recorded — human review").length).toBeGreaterThan(0);
  });

  it("traces the FX rate to the ECB rate of the reception date (cert 01, USD)", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    const trigger = screen.getByRole("tab", { name: "Extracted data" });
    fireEvent.mouseDown(trigger, { button: 0 });
    fireEvent.click(trigger);
    expect(screen.getByText("USD→EUR 1.07 · ECB rate at reception (03 May 2024)")).toBeInTheDocument();
    expect(
      screen.getByText(/the ECB rate of the day this certificate was received/),
    ).toBeInTheDocument();
  });

  it("restates the FX finding from the reception date, not the analysis date (cert 01)", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    fireEvent.click(screen.getByRole("button", { name: /Show \d+ secondary finding/ }));
    expect(screen.getByText("USD→EUR 1.07 · ECB rate at reception (03 May 2024)")).toBeInTheDocument();
    expect(screen.queryByText(/converted at ECB 1.07 on 26 April 2024/)).not.toBeInTheDocument();
  });

  it("replay mode on cert 06 shows the processing stepper and hides the tabs", () => {
    render(<CertificateView cert={getCertificate("06")!} processing />);
    expect(screen.getByText("Analysing certificate")).toBeInTheDocument();
    expect(screen.getByText("Text layer / OCR")).toBeInTheDocument();
    expect(screen.getAllByText("Processing").length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("reveals the analysis tabs once the simulated pipeline completes", () => {
    vi.useFakeTimers();
    try {
      render(<CertificateView cert={getCertificate("06")!} processing />);
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
      /* The steps chain setTimeouts — each act() flush lets the next one be scheduled. */
      for (let i = 0; i < 12; i += 1) {
        act(() => {
          vi.advanceTimersByTime(1_500);
        });
      }
      expect(screen.queryByText("Analysing certificate")).not.toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(5);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Reviewer clearance flow", () => {
  it("confirming the gates under review lifts the seal to 8 of 8", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    expect(screen.getByText(/6 of 8 checks passed · 2 under review/)).toBeInTheDocument();
    for (const btn of screen.getAllByRole("button", { name: "Confirm" })) fireEvent.click(btn);
    expect(screen.getByText(/8 of 8 checks passed/)).toBeInTheDocument();
    expect(screen.queryByText(/under review/)).not.toBeInTheDocument();
  });

  it("keeps Approve disabled after clearing when the cover is below the minimum", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    for (const btn of screen.getAllByRole("button", { name: "Confirm" })) fireEvent.click(btn);
    const approve = screen.getByRole("button", { name: "Approve" });
    expect(approve).toBeDisabled();
    expect(approve).toHaveAttribute(
      "title",
      expect.stringContaining("every critical guarantee meets the minimum"),
    );
  });

  it("explains that the review must be cleared before approving", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    expect(screen.getByRole("button", { name: "Approve" })).toHaveAttribute(
      "title",
      expect.stringContaining("under review first"),
    );
  });

  it("lets the reviewer undo their decisions", () => {
    render(<CertificateView cert={getCertificate("01")!} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Undo my review decisions" }));
    expect(screen.getByText(/6 of 8 checks passed · 2 under review/)).toBeInTheDocument();
  });
});
