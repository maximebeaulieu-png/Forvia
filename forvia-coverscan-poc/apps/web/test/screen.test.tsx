import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CertificateView } from "../app/(shell)/certificates/[id]/certificate-view";
import { getCertificate } from "../lib/repository";

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

  it("renders a compact cert (07) with derived coverage rows", () => {
    render(<CertificateView cert={getCertificate("07")!} />);
    expect(screen.getByText("Product liability")).toBeInTheDocument();
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
