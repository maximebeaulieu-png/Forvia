import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GapBar } from "@/components/coverscan/GapBar";
import { CoverageGrid, type CoverageRow } from "@/components/coverscan/CoverageGrid";
import { FindingsList, type Finding } from "@/components/coverscan/FindingsList";
import { KpiCard } from "@/components/coverscan/KpiCard";

afterEach(cleanup);

describe("GapBar", () => {
  it("fill width = found/required", () => {
    const { container } = render(
      <GapBar found={30500000} required={1500000000} status="BELOW_MINIMUM" />,
    );
    const fill = container.querySelector<HTMLElement>('[data-slot="gap-bar-fill"]');
    expect(fill).not.toBeNull();
    expect(fill!.style.width).toBe("2%");
  });

  it("missing renders empty track and no fill", () => {
    const { container } = render(<GapBar found={null} required={1500000000} status="MISSING" />);
    expect(container.querySelector('[data-slot="gap-bar-track"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="gap-bar-fill"]')).toBeNull();
    expect(container.querySelector('[data-slot="gap-bar-hatch"]')).toBeNull();
    expect(container.textContent).toContain("missing");
  });

  it("covered-no-amount renders the hatched overlay instead of a fill", () => {
    const { container } = render(<GapBar required={1500000000} status="COVERED_NO_AMOUNT" />);
    expect(container.querySelector('[data-slot="gap-bar-hatch"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="gap-bar-fill"]')).toBeNull();
    expect(container.textContent).toContain("no amount");
  });

  it("always shows the requirement tick", () => {
    const { container } = render(<GapBar found={null} required={1500000000} status="MISSING" />);
    expect(container.querySelector('[data-slot="gap-bar-tick"]')).not.toBeNull();
  });

  it("compliant fills the whole track and says meets requirement", () => {
    const { container } = render(
      <GapBar found={2000000000} required={2000000000} status="COMPLIANT" />,
    );
    const fill = container.querySelector<HTMLElement>('[data-slot="gap-bar-fill"]');
    expect(fill!.style.width).toBe("100%");
    expect(container.textContent).toContain("€20M · meets requirement");
  });
});

describe("CoverageGrid", () => {
  const rows: CoverageRow[] = [
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
    },
  ];

  it("formats minor-unit amounts through the shared formatters", () => {
    render(<CoverageGrid rows={rows} />);
    expect(screen.getByText("€10,000,000")).toBeInTheDocument();
    expect(screen.getByText(/required €20,000,000/)).toBeInTheDocument();
  });

  it("groups rows under critical and secondary headings", () => {
    render(<CoverageGrid rows={rows} />);
    expect(screen.getByText("Critical guarantees")).toBeInTheDocument();
    expect(screen.getByText("Secondary guarantees")).toBeInTheDocument();
  });

  it("shows the missing row as a status word with an empty gap track", () => {
    const { container } = render(<CoverageGrid rows={rows} />);
    expect(screen.getByText("Missing")).toBeInTheDocument();
    const pflRow = container.querySelector('[data-row-id="pfl"]')!;
    expect(pflRow.querySelector('[data-slot="gap-bar-fill"]')).toBeNull();
  });
});

describe("FindingsList", () => {
  const shuffled: Finding[] = [
    { ruleId: "DEDUCTIBLE_PRESENT", severity: "INFO", title: "Deductible of €1,500 per claim on material damage" },
    {
      ruleId: "RECALL_BELOW_MIN",
      severity: "CRITICAL",
      title: "Product recall costs at €305,000 against €15,000,000 required",
      quote: "Frais de retrait engagés par l'assuré 305.000 €",
      page: 2,
      lang: "fr",
      fix: "Request product recall / withdrawal costs of at least EUR 15,000,000, worldwide.",
    },
    { ruleId: "TERRITORY_EXCL_US_CA", severity: "WARNING", title: "Recall and refitting excluded for USA and Canada" },
    {
      ruleId: "ISSUER_IS_BROKER",
      severity: "BLOCK",
      title: "Certificate issued by a broker, not by the insurer",
      quote: "Marron & Associés — ORIAS 07 002 497",
      page: 1,
      lang: "fr",
      fix: "Request a certificate issued, signed and stamped by MMA.",
    },
  ];

  it("findings sorted by severity", () => {
    const { container } = render(<FindingsList findings={shuffled} />);
    const order = Array.from(container.querySelectorAll("[data-rule-id]")).map((el) =>
      el.getAttribute("data-rule-id"),
    );
    expect(order).toEqual([
      "ISSUER_IS_BROKER",
      "RECALL_BELOW_MIN",
      "TERRITORY_EXCL_US_CA",
      "DEDUCTIBLE_PRESENT",
    ]);
  });

  it("opens BLOCK findings on mount and toggles others on click", () => {
    render(<FindingsList findings={shuffled} />);
    expect(screen.getByText(/Marron & Associés/)).toBeInTheDocument();
    expect(screen.queryByText(/Frais de retrait/)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Product recall costs at €305,000/ }),
    );
    expect(screen.getByText(/Frais de retrait/)).toBeInTheDocument();
    expect(
      screen.getByText("Request product recall / withdrawal costs of at least EUR 15,000,000, worldwide."),
    ).toBeInTheDocument();
  });

  it("shows the mono rule id on every row", () => {
    render(<FindingsList findings={shuffled} />);
    expect(screen.getByText("ISSUER_IS_BROKER")).toBeInTheDocument();
    expect(screen.getByText("DEDUCTIBLE_PRESENT")).toBeInTheDocument();
  });

  it("clicking the quote fires onEvidenceClick", () => {
    const onEvidenceClick = vi.fn();
    render(<FindingsList findings={shuffled} onEvidenceClick={onEvidenceClick} />);
    fireEvent.click(screen.getByText(/Marron & Associés/));
    expect(onEvidenceClick).toHaveBeenCalledWith(
      expect.objectContaining({ ruleId: "ISSUER_IS_BROKER" }),
    );
  });
});

describe("KpiCard", () => {
  it("renders value, label and the interpretation line", () => {
    render(
      <KpiCard
        label="Not admissible"
        value="64"
        tone="red"
        icon="shield-x"
        sub="41 formal · 23 structural"
      />,
    );
    expect(screen.getByText("64")).toBeInTheDocument();
    expect(screen.getByText("Not admissible")).toBeInTheDocument();
    expect(screen.getByText("41 formal · 23 structural")).toBeInTheDocument();
  });

  it("renders the delta chip", () => {
    render(
      <KpiCard label="Suppliers covered" value="9 / 150" delta="+2" deltaTone="go" sub="6 % of the portfolio is compliant" />,
    );
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
