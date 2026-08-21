import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GapBar } from "@/components/coverscan/GapBar";
import { CoverageGrid, type CoverageRow } from "@/components/coverscan/CoverageGrid";
import { FindingsList, type Finding } from "@/components/coverscan/FindingsList";
import { KpiCard } from "@/components/coverscan/KpiCard";

afterEach(cleanup);

/** Wording the client dossier forbids: below the minimum there is no gradation at all. */
const FORBIDDEN = /minor|partial|underinsur|under-insur|sous-assurance|almost|nearly/i;

/** "Non-compliant" legitimately contains "compliant" — strip it before asserting the positive claim. */
function withoutNonCompliant(text: string | null): string {
  return (text ?? "").replace(/non[-\s]?compliant/gi, "");
}

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

  /* Doctrine §1.3 — the bar is a gap indicator, never a partial-compliance band. */

  it("names both figures so the percentage reads as a gap, not as a degree of compliance", () => {
    const { container } = render(<GapBar found={30500000} required={1500000000} />);
    expect(container.textContent).toContain("€305k of €15M · 2 % of requirement");
    expect(withoutNonCompliant(container.textContent)).not.toMatch(/compliant/i);
  });

  it("never uses a partial-compliance vocabulary in any state", () => {
    for (const status of ["BELOW_MINIMUM", "MISSING", "COVERED_NO_AMOUNT", "EXCLUDED"] as const) {
      const { container } = render(
        <GapBar found={30500000} required={1500000000} status={status} />,
      );
      expect(container.textContent).not.toMatch(FORBIDDEN);
      cleanup();
    }
  });

  it("nonCompliant reddens the label and reinforces the requirement tick", () => {
    const { container } = render(
      <GapBar found={500000000} required={2000000000} nonCompliant />,
    );
    const label = container.querySelector<HTMLElement>(".cs-num");
    expect(label!.style.color).toBe("var(--status-red)");
    const tick = container.querySelector<HTMLElement>('[data-slot="gap-bar-tick"]');
    expect(tick!.style.background).toBe("var(--status-red)");
    expect(tick!.style.width).toBe("3px");
  });

  it("without nonCompliant the tick stays the neutral requirement marker", () => {
    const { container } = render(<GapBar found={500000000} required={2000000000} />);
    const tick = container.querySelector<HTMLElement>('[data-slot="gap-bar-tick"]');
    expect(tick!.style.background).toBe("var(--required-marker)");
    expect(tick!.style.width).toBe("2px");
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

  /* ── Doctrine §1.3: binary compliance, no gradation under the minimum ── */

  const verdictOf = (container: HTMLElement, id: string) =>
    container
      .querySelector(`[data-row-id="${id}"]`)!
      .querySelector<HTMLElement>('[data-slot="binary-verdict"]')!;

  const row = (over: Partial<CoverageRow>): CoverageRow => ({
    id: "pl",
    guarantee: "Product liability",
    required: 2000000000,
    status: "BELOW_MINIMUM",
    ...over,
  });

  it("€5M against €20M required is non-compliant, never partially compliant", () => {
    const { container } = render(
      <CoverageGrid rows={[row({ foundEur: 500000000, status: "BELOW_MINIMUM" })]} />,
    );
    const verdict = verdictOf(container, "pl");
    expect(verdict.getAttribute("data-verdict")).toBe("NON_COMPLIANT");
    expect(verdict.textContent).toContain("Non-compliant");
    expect(verdict.style.color).toBe("var(--status-red)");
    expect(verdict.querySelector("svg")).not.toBeNull();
    expect(withoutNonCompliant(container.textContent)).not.toMatch(/compliant/i);
    expect(container.textContent).not.toMatch(FORBIDDEN);
  });

  it("€19M against €20M required is non-compliant too — no near-miss credit", () => {
    const { container } = render(
      <CoverageGrid rows={[row({ foundEur: 1900000000 })]} />,
    );
    expect(verdictOf(container, "pl").getAttribute("data-verdict")).toBe("NON_COMPLIANT");
    expect(withoutNonCompliant(container.textContent)).not.toMatch(/compliant/i);
    expect(container.textContent).not.toMatch(FORBIDDEN);
  });

  it("€20M against €20M required is compliant", () => {
    const { container } = render(
      <CoverageGrid rows={[row({ foundEur: 2000000000, status: "COMPLIANT" })]} />,
    );
    const verdict = verdictOf(container, "pl");
    expect(verdict.getAttribute("data-verdict")).toBe("COMPLIANT");
    expect(verdict.textContent).toContain("Compliant");
    expect(verdict.textContent).not.toMatch(/non-compliant/i);
    expect(verdict.style.color).toBe("var(--status-go)");
    expect(container.textContent).toContain("€20M of €20M required");
  });

  it("€30M against €20M required stays compliant — bonus band only above the minimum", () => {
    const { container } = render(
      <CoverageGrid rows={[row({ foundEur: 3000000000, status: "COMPLIANT" })]} />,
    );
    const verdict = verdictOf(container, "pl");
    expect(verdict.getAttribute("data-verdict")).toBe("COMPLIANT_STRONG");
    expect(verdict.textContent).toContain("Compliant");
    expect(container.textContent).toContain("€30M of €20M required · strong cover");
  });

  it("a missing guarantee is non-compliant with its motive next to the verdict", () => {
    const { container } = render(
      <CoverageGrid
        rows={[row({ id: "pfl", guarantee: "Pure financial loss", required: 1500000000, status: "MISSING" })]}
      />,
    );
    const verdict = verdictOf(container, "pfl");
    expect(verdict.textContent).toContain("Non-compliant · not mentioned");
    expect(container.textContent).toContain("nothing found · €15M required");
  });

  it("keeps every dataset status as a motive beside the binary verdict", () => {
    const { container } = render(
      <CoverageGrid
        rows={[
          row({ id: "a", status: "COVERED_NO_AMOUNT", foundEur: null }),
          row({ id: "b", status: "EXCLUDED", foundEur: 400000000 }),
          row({ id: "c", status: "UNCLEAR", foundEur: 2500000000 }),
        ]}
      />,
    );
    expect(verdictOf(container, "a").textContent).toContain(
      "Non-compliant · covered, no amount stated",
    );
    expect(verdictOf(container, "b").textContent).toContain(
      "Non-compliant · excluded from the policy",
    );
    // an amount above the requirement cannot rescue an unreadable guarantee
    expect(verdictOf(container, "c").textContent).toContain("Non-compliant · wording unclear");
    expect(container.textContent).not.toMatch(FORBIDDEN);
  });

  it("the gap line names both figures and calls the percentage a share of the requirement", () => {
    const { container } = render(
      <CoverageGrid
        rows={[
          row({
            id: "recall",
            guarantee: "Product recall / withdrawal costs (frais de retrait)",
            required: 1500000000,
            foundEur: 30500000,
          }),
        ]}
      />,
    );
    expect(container.textContent).toContain("€305k of €15M required · 2 % of the requirement");
    expect(withoutNonCompliant(container.textContent)).not.toMatch(/compliant/i);
  });

  it("a PRESENT guarantee with no requirement is neutral, not compliant", () => {
    const { container } = render(
      <CoverageGrid
        rows={[
          {
            id: "cyber",
            guarantee: "Cyber liability",
            status: "PRESENT",
            foundEur: 100000000,
            group: "other",
          },
        ]}
      />,
    );
    const verdict = verdictOf(container, "cyber");
    expect(verdict.getAttribute("data-verdict")).toBe("NOT_ASSESSABLE");
    expect(verdict.textContent).toContain("Not assessable");
    expect(withoutNonCompliant(container.textContent)).not.toMatch(/compliant/i);
  });

  /** The dataset answers presence-type criteria with scope words instead of the enum. */
  const scope = (s: string) => s as CoverageRow["status"];

  it("scores presence-type criteria yes / no, with the motive spelled out", () => {
    const { container } = render(
      <CoverageGrid
        rows={[
          {
            id: "terr",
            guarantee: "Territory incl. USA/Canada",
            status: scope("INCLUDED"),
            group: "secondary",
          },
          {
            id: "terr2",
            guarantee: "Territory incl. USA/Canada",
            status: scope("PARTIAL_EXCLUDED"),
            group: "secondary",
          },
        ]}
      />,
    );
    expect(verdictOf(container, "terr").textContent).toContain("Compliant · included as required");
    expect(verdictOf(container, "terr").getAttribute("data-verdict")).toBe("COMPLIANT");
    const failed = verdictOf(container, "terr2");
    expect(failed.getAttribute("data-verdict")).toBe("NON_COMPLIANT");
    expect(failed.textContent).toContain("Non-compliant · required territory not fully covered");
    expect(container.textContent).not.toMatch(FORBIDDEN);
  });

  it("gives every verdict a motive — no verdict without a consultable reason", () => {
    const { container } = render(
      <CoverageGrid
        rows={[
          row({ id: "a", foundEur: 500000000 }),
          row({ id: "b", required: undefined, status: "PRESENT", group: "other" }),
          row({ id: "c", required: undefined, status: "MISSING", group: "secondary" }),
        ]}
      />,
    );
    for (const id of ["a", "b", "c"]) {
      expect(verdictOf(container, id).textContent).toMatch(/ · \w/);
    }
  });

  it("marks the gap bar of a non-compliant row as non-compliant", () => {
    const { container } = render(
      <CoverageGrid rows={[row({ foundEur: 500000000 })]} />,
    );
    const bar = container.querySelector<HTMLElement>('[data-slot="gap-bar"]')!;
    expect(bar.getAttribute("data-non-compliant")).toBe("true");
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
