import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PortfolioView } from "../app/(shell)/portfolio/portfolio-view";
import { getAggregates, getCertificates } from "../lib/repository";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

afterEach(cleanup);
beforeEach(() => push.mockClear());

/**
 * Portfolio relayout (client video feedback):
 * - client split as a DONUT — 6 validated categorical hues in fixed
 *   descending-total order, direct legend labels in ink, hover/focus tooltip
 *   with the exact compliant / request changes / not admissible counts;
 * - Expiring soon compacted into the top row (max 4 + View all);
 * - Top 10 risks on its own full-width row.
 */

/** The validated categorical set — fixed order, one hue per entity by descending total. */
const DONUT_HUES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];

const ENTITIES_DESC: Array<[string, number]> = [
  ["Faurecia Systèmes d'Échappement", 38],
  ["Faurecia Intérieur Industrie", 31],
  ["Faurecia Sièges d'Automobile", 26],
  ["HELLA GmbH & Co. KGaA", 22],
  ["Faurecia Automotive Exteriors España", 19],
  ["Faurecia Clarion Electronics", 14],
];

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

const donutSegments = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<SVGPathElement>('path[role="button"]'));

describe("Client donut — validated categorical hues, fixed order", () => {
  it("renders exactly 6 segments, hues assigned in descending-total order, never a status color", () => {
    const { container } = renderPortfolio();
    const segments = donutSegments(container);
    expect(segments).toHaveLength(6);
    segments.forEach((seg, i) => {
      expect(seg.getAttribute("stroke")).toBe(DONUT_HUES[i]);
      const [entity, total] = ENTITIES_DESC[i];
      expect(seg.getAttribute("aria-label")).toContain(`${entity} — ${total} of 150 certificates`);
    });
  });

  it("shows the 150 total in the donut centre", () => {
    renderPortfolio();
    const card = screen
      .getByText("Certificates by client entity")
      .closest("section")! as HTMLElement;
    const total = within(card).getByText("150");
    expect(total).toHaveClass("cs-num");
    expect(within(card).getByText("certificates")).toBeInTheDocument();
  });

  it("labels every entity directly in the legend — ink text, hue only on the swatch", () => {
    renderPortfolio();
    for (const [entity, total] of ENTITIES_DESC) {
      const row = screen.getByTitle(`${entity} — ${total} certificates`);
      expect(within(row).getByText(entity)).toBeInTheDocument();
      expect(within(row).getByText(String(total))).toHaveClass("cs-num");
      /* The entity name is never set in the segment hue — identity comes from the swatch. */
      const name = within(row).getByText(entity);
      for (const hue of DONUT_HUES) expect(name.style.color).not.toBe(hue);
    }
  });

  it("shows the exact compliance detail in a tooltip on keyboard focus, and hides it on blur", () => {
    const { container } = renderPortfolio();
    const [first] = donutSegments(container);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.focus(first);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Faurecia Systèmes d'Échappement");
    expect(tooltip).toHaveTextContent("38");
    expect(tooltip).toHaveTextContent("3 compliant · 16 request changes · 19 not admissible");
    fireEvent.blur(first);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("keeps the filter navigation on segment click, Enter key, and legend click", () => {
    const { container } = renderPortfolio();
    const segments = donutSegments(container);

    fireEvent.click(segments[0]);
    expect(push).toHaveBeenLastCalledWith(
      `/certificates?filter=${encodeURIComponent("Faurecia Systèmes d'Échappement")}`,
    );

    fireEvent.keyDown(segments[3], { key: "Enter" });
    expect(push).toHaveBeenLastCalledWith(
      `/certificates?filter=${encodeURIComponent("HELLA GmbH & Co. KGaA")}`,
    );

    fireEvent.click(screen.getByTitle("Faurecia Intérieur Industrie — 31 certificates"));
    expect(push).toHaveBeenLastCalledWith(
      `/certificates?filter=${encodeURIComponent("Faurecia Intérieur Industrie")}`,
    );
    expect(push).toHaveBeenCalledTimes(3);
  });
});

describe("Relayout — compact Expiring soon in the top row, full-width Top 10 risks", () => {
  it("puts donut, coverage gap and compact expiring on one 3-column row", () => {
    renderPortfolio();
    const row = screen
      .getByText("Certificates by client entity")
      .closest("section")!.parentElement!;
    expect(row.style.gridTemplateColumns.split(" ")).toHaveLength(3);
    expect(within(row as HTMLElement).getByText("Coverage gap by guarantee")).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("Expiring soon")).toBeInTheDocument();
  });

  it("gives Top 10 risks its own full-width row (not a column of a grid row)", () => {
    renderPortfolio();
    const risksCard = screen.getByText("Top 10 risks").closest("section")!;
    const donutRow = screen
      .getByText("Certificates by client entity")
      .closest("section")!.parentElement!;
    /* Same parent as the 3-column row wrapper — i.e. a direct child of the page grid. */
    expect(risksCard.parentElement).toBe(donutRow.parentElement);
  });

  it("compacts Expiring soon to the 4 soonest entries plus a View all link", () => {
    renderPortfolio();
    const card = screen.getByText("Expiring soon").closest("section")! as HTMLElement;
    const scoped = within(card);
    /* Soonest first — the expired one leads and carries the label. */
    expect(scoped.getByText("Polyvlies Franz Beyer")).toBeInTheDocument();
    expect(scoped.getByText("expired")).toBeInTheDocument();
    expect(scoped.getByText("Scherdel GmbH")).toBeInTheDocument();
    expect(scoped.getByText("Air Products SAS")).toBeInTheDocument();
    expect(scoped.getByText("Norgren GmbH (IMI)")).toBeInTheDocument();
    /* Beyond 4 entries the list stops — View all carries the rest. */
    expect(scoped.queryByText("Metraton S.r.l.")).not.toBeInTheDocument();
    expect(scoped.queryByText("EKKO-MEISTER AG")).not.toBeInTheDocument();

    fireEvent.click(scoped.getByText("View all"));
    expect(push).toHaveBeenCalledWith("/certificates?view=Expiring");
  });

  it("keeps every Worst finding readable in full via the title attribute", () => {
    renderPortfolio();
    const cell = screen.getByText(
      "Recall (frais de retrait) €10M against €15M required — under the minimum",
    );
    expect(cell).toHaveAttribute(
      "title",
      "Recall (frais de retrait) €10M against €15M required — under the minimum",
    );
  });
});
