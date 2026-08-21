import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DecisionChip } from "@/components/coverscan/DecisionChip";
import { ConfidenceDot } from "@/components/coverscan/ConfidenceDot";
import { ScoreRing } from "@/components/coverscan/ScoreRing";
import { StatusMiniGrid } from "@/components/coverscan/StatusMiniGrid";
import {
  SEAL_GATES,
  VerificationSeal,
  VerificationSealList,
  type SealGateState,
} from "@/components/coverscan/VerificationSeal";

afterEach(cleanup);

const ALL_DECISIONS = [
  "GO",
  "REQUEST_CHANGES",
  "FORMAL_DEFECT",
  "STRUCTURAL",
  "NEEDS_REVIEW",
  "PROCESSING",
  "PENDING",
] as const;

describe("DecisionChip", () => {
  it("never says Rejected", () => {
    for (const d of ALL_DECISIONS) {
      const { container, unmount } = render(<DecisionChip decision={d} />);
      expect(container.textContent).not.toMatch(/rejected/i);
      unmount();
    }
  });

  it("locked label for formal defect", () => {
    render(<DecisionChip decision="FORMAL_DEFECT" />);
    expect(screen.getByText("Not admissible · resubmit")).toBeInTheDocument();
  });

  it("renders the locked label for every decision", () => {
    const locked: Record<(typeof ALL_DECISIONS)[number], string> = {
      GO: "Compliant",
      REQUEST_CHANGES: "Request changes",
      FORMAL_DEFECT: "Not admissible · resubmit",
      STRUCTURAL: "Not admissible",
      NEEDS_REVIEW: "Needs review",
      PROCESSING: "Processing",
      PENDING: "Pending",
    };
    for (const d of ALL_DECISIONS) {
      const { unmount } = render(<DecisionChip decision={d} />);
      expect(screen.getByText(locked[d])).toBeInTheDocument();
      unmount();
    }
  });

  it("FORMAL_DEFECT is outlined, STRUCTURAL is solid", () => {
    const { container: outlined } = render(
      <DecisionChip decision="FORMAL_DEFECT" />,
    );
    const { container: solid } = render(<DecisionChip decision="STRUCTURAL" />);
    const outlinedChip = outlined.firstElementChild as HTMLElement;
    const solidChip = solid.firstElementChild as HTMLElement;
    expect(outlinedChip.style.background).toBe("transparent");
    expect(outlinedChip.style.border).toContain("var(--status-red)");
    expect(solidChip.style.background).toBe("var(--status-red-bg)");
  });

  it("always pairs an icon with the word", () => {
    for (const d of ALL_DECISIONS) {
      const { container, unmount } = render(<DecisionChip decision={d} />);
      expect(container.querySelector("svg")).not.toBeNull();
      expect(container.textContent?.trim().length).toBeGreaterThan(0);
      unmount();
    }
  });
});

describe("ConfidenceDot", () => {
  it("uses the confidenceGlyph thresholds", () => {
    const cases: Array<[number, string]> = [
      [0.96, "●"],
      [0.85, "●"],
      [0.72, "◐"],
      [0.6, "◐"],
      [0.41, "○"],
    ];
    for (const [value, glyph] of cases) {
      const { container, unmount } = render(<ConfidenceDot value={value} />);
      expect(container.textContent).toContain(glyph);
      unmount();
    }
  });

  it("shows the percentage when showValue is set", () => {
    const { container } = render(<ConfidenceDot value={0.82} showValue />);
    expect(container.textContent).toContain("82 %");
  });
});

describe("ScoreRing", () => {
  it("renders the value on a 0-100 ring", () => {
    render(<ScoreRing value={56} />);
    expect(
      screen.getByRole("img", { name: "Risk score 56 of 100" }),
    ).toBeInTheDocument();
    expect(screen.getByText("56")).toBeInTheDocument();
    expect(screen.getByText("/ 100")).toBeInTheDocument();
    expect(screen.getByText("Risk score")).toBeInTheDocument();
  });

  it("provisional mode is greyed with the provisional caption", () => {
    render(<ScoreRing value={3} provisional />);
    expect(
      screen.getByRole("img", { name: "Risk score 3 of 100, provisional" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Provisional — shown for information"),
    ).toBeInTheDocument();
    const number = screen.getByText("3");
    expect(number.getAttribute("fill")).toBe("var(--muted-foreground)");
  });
});

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

describe("VerificationSeal", () => {
  it("declares the 8 gates in fixed order", () => {
    expect(SEAL_GATES.map((g) => g.id)).toEqual([
      "stamp",
      "signature",
      "insurer",
      "policyNumber",
      "dates",
      "entity",
      "coinsurance",
      "documentType",
    ]);
  });

  it("counts failing gates and reads not admissible", () => {
    render(<VerificationSeal gates={gates} />);
    expect(
      screen.getByRole("img", {
        name: "Not admissible — 5 of 8 checks passed, 3 failed",
      }),
    ).toBeInTheDocument();
  });

  it("reads admissible when no gate fails", () => {
    const clean: Record<string, SealGateState> = Object.fromEntries(
      SEAL_GATES.map((g) => [g.id, { state: "pass" as const }]),
    );
    render(<VerificationSeal gates={clean} />);
    expect(
      screen.getByRole("img", { name: "Admissible — 8 of 8 checks passed" }),
    ).toBeInTheDocument();
  });

  it("never reads admissible while a gate is still under review", () => {
    const pending: Record<string, SealGateState> = Object.fromEntries(
      SEAL_GATES.map((g) => [g.id, { state: "pass" as const }]),
    );
    pending.stamp = { state: "review", note: "faint stamp, low contrast" };
    pending.signature = { state: "review", note: "signature not attributable" };
    render(<VerificationSeal gates={pending} />);
    expect(
      screen.getByRole("img", {
        name: "Pending review — 6 of 8 checks passed, 2 under review",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Admissible")).not.toBeInTheDocument();
  });

  it("list renders ✓ / ✗ / ? / – marks per gate state", () => {
    const mixed: Record<string, SealGateState> = {
      stamp: { state: "pass" },
      signature: { state: "fail" },
      insurer: { state: "review" },
      coinsurance: { state: "na" },
    };
    const { container } = render(<VerificationSealList gates={mixed} />);
    const marks = Array.from(container.querySelectorAll("li")).map(
      (li) => li.querySelector("span")?.textContent,
    );
    expect(marks[0]).toBe("✓"); // stamp pass
    expect(marks[1]).toBe("✗"); // signature fail
    expect(marks[2]).toBe("?"); // insurer review
    expect(marks[6]).toBe("–"); // coinsurance na
  });

  it("list carries the evidence notes", () => {
    render(<VerificationSealList gates={gates} />);
    expect(
      screen.getByText(/broker's stamp p\.1, no insurer stamp/),
    ).toBeInTheDocument();
  });
});

describe("StatusMiniGrid", () => {
  it("renders one mark per guarantee in PL · Recall · PFL order", () => {
    const { container } = render(
      <StatusMiniGrid pl="COMPLIANT" recall="BELOW_MINIMUM" pfl="MISSING" />,
    );
    expect(container.textContent).toBe("✓✗–");
  });

  it("maps the remaining states to their marks", () => {
    const { container } = render(
      <StatusMiniGrid pl="COVERED_NO_AMOUNT" recall="EXCLUDED" pfl="UNCLEAR" />,
    );
    expect(container.textContent).toBe("≈✗?");
  });
});
