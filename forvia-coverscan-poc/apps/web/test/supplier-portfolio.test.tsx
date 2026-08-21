import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SupplierView } from "../app/(shell)/suppliers/suppliers-view";
import { PortfolioView } from "../app/(shell)/portfolio/portfolio-view";
import { getAggregates, getCertificate, getCertificates } from "../lib/repository";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

afterEach(cleanup);

/**
 * Doctrine guards (client technical dossier §1.3) for the two portfolio-level
 * screens: no consolidated supplier score, no graded compliance below the
 * minimum, and the Direction des Assurances vocabulary next to the spec wording.
 */

/** Wording that would suggest a partial / graded verdict under the minimum. */
const GRADED_WORDING = /\b(minor|partial(?:ly)?|sous-assurance|under-?insurance|borderline)\b/i;

function renderSupplier() {
  const cert = getCertificate("10")!;
  return render(
    <SupplierView
      certificateId={cert.id}
      supplier={cert.supplier}
      insurer={cert.insurer}
      rating={cert.rating}
      expiry={cert.expiry}
      decision="FORMAL_DEFECT"
    />,
  );
}

function renderPortfolio() {
  const a = getAggregates();
  return render(
    <PortfolioView
      portfolio={a.portfolio}
      byCountry={a.byCountry}
      gapByGuarantee={a.gapByGuarantee}
      expiring={a.expiring}
      topRisks={a.topRisks}
      certificateIds={getCertificates().map((c) => c.id)}
    />,
  );
}

describe("Supplier 360 — no consolidated supplier score", () => {
  it("labels the header verdict as the latest certificate, with its date", () => {
    renderSupplier();
    expect(screen.getByText("Latest certificate · 22 Feb 2025")).toBeInTheDocument();
    expect(screen.getByText("2025 policy IT-GEN-902244 — one contracting entity")).toBeInTheDocument();
    /* The verdict itself is still shown, as a per-certificate decision chip. */
    expect(screen.getAllByText("Not admissible · resubmit").length).toBeGreaterThan(0);
  });

  it("states explicitly that verdicts are never consolidated", () => {
    renderSupplier();
    expect(
      screen.getByText(
        "Verdicts are per certificate — Forvia never consolidates several policies into one supplier score.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("One verdict per certificate — no supplier-level score is derived from these rows"),
    ).toBeInTheDocument();
  });

  it("keeps one verdict per row in Certificates by year", () => {
    renderSupplier();
    const rows = screen.getAllByRole("row").slice(1); // drop the header row
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.textContent).toMatch(/Not admissible · resubmit|Request changes|Compliant/);
    }
  });

  it("names the guarantees with the Direction des Assurances vocabulary", () => {
    renderSupplier();
    expect(
      screen.getAllByText(/Product recall \/ withdrawal costs \(frais de retrait\)/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pure financial loss \(DINC\)/).length).toBeGreaterThan(0);
  });

  it("shows the blocking motive and states the gap as non-compliance, not a degree", () => {
    const { container } = renderSupplier();
    expect(screen.getByText(/Blocking motive: no insurer stamp/)).toBeInTheDocument();
    expect(container.textContent).toContain("under the minimum, so non-compliant");
    expect(container.textContent).not.toMatch(GRADED_WORDING);
    expect(container.textContent).not.toContain("Best coverage in the batch");
  });
});

describe("Portfolio — gap indicator, never partial compliance", () => {
  it("frames the coverage gap card as an indicator over a binary rule", () => {
    renderPortfolio();
    expect(
      screen.getByText(
        "Median found against FORVIA GPTC requirement · Gap indicator — compliance itself is binary at the minimum.",
      ),
    ).toBeInTheDocument();
  });

  it("reads each percentage as a gap against the requirement", () => {
    renderPortfolio();
    expect(screen.getByText("median €5M · 25 % of requirement")).toBeInTheDocument();
    expect(screen.getByText("median €4M · 27 % of requirement")).toBeInTheDocument();
    /* The compliant share is a count of certificates, not a degree of cover. */
    expect(screen.getByText("14 % of certificates compliant")).toBeInTheDocument();
  });

  it("names the guarantees with the Direction des Assurances vocabulary", () => {
    renderPortfolio();
    expect(
      screen.getAllByText("Product recall / withdrawal costs (frais de retrait)").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Pure financial loss (DINC)").length).toBeGreaterThan(0);
  });

  it("keeps the KPI row on certificates, with no supplier-level roll-up", () => {
    renderPortfolio();
    expect(screen.getByText("Certificates compliant")).toBeInTheDocument();
    expect(screen.getByText("6 % of the portfolio · verdicts are per certificate")).toBeInTheDocument();
    expect(screen.queryByText("Suppliers covered")).not.toBeInTheDocument();
  });

  it("restates graded demo findings in binary terms in the Top 10 risks table", () => {
    const { container } = renderPortfolio();
    expect(
      screen.getByText("Recall (frais de retrait) €10M against €15M required — under the minimum"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("CHF 20,000,000 converts to €20.8M — at or above the €20M minimum"),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(GRADED_WORDING);
  });
});
