import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(cleanup);

import { DocumentViewer } from "@/components/coverscan/DocumentViewer";
import { MaskedText } from "@/components/coverscan/MaskedText";
import {
  PIPELINE_STEPS,
  ProcessingStepper,
} from "@/components/coverscan/ProcessingStepper";
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

describe("MaskedText", () => {
  it("masks the value by default and reveals on click, firing onReveal", () => {
    const onReveal = vi.fn();
    render(
      <MaskedText value="nicole.hoffmann@polyvlies.de" onReveal={onReveal} />
    );

    expect(
      screen.queryByText("nicole.hoffmann@polyvlies.de")
    ).not.toBeInTheDocument();
    expect(screen.getByText("n.•••@polyvlies.de")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Reveal personal data" })
    );

    expect(screen.getByText("nicole.hoffmann@polyvlies.de")).toBeInTheDocument();
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onReveal).toHaveBeenCalledWith("nicole.hoffmann@polyvlies.de");
  });

  it("does not fire onReveal again when hiding", () => {
    const onReveal = vi.fn();
    render(<MaskedText value="jane.doe@forvia.com" onReveal={onReveal} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Reveal personal data" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide personal data" }));

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("jane.doe@forvia.com")).not.toBeInTheDocument();
  });

  it("masks phone numbers with the phone shape", () => {
    render(<MaskedText value="+49 5241 9345 12" kind="phone" />);
    expect(screen.queryByText("+49 5241 9345 12")).not.toBeInTheDocument();
    expect(screen.getByText(/^\+49 /)).toBeInTheDocument();
  });
});

describe("ProcessingStepper", () => {
  it("exposes the 8 locked pipeline steps", () => {
    expect(PIPELINE_STEPS).toEqual([
      "Ingest",
      "Text layer / OCR",
      "Classify",
      "Extract (vision)",
      "Normalize & convert",
      "Verify insurer & entity",
      "Score",
      "Explain",
    ]);
  });

  it("renders all 8 steps in order with the current state", () => {
    const { container } = render(
      <ProcessingStepper current={4} timings={[420, 3100, 900, 6400]} />
    );

    for (const label of PIPELINE_STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const text = container.textContent ?? "";
    let cursor = -1;
    for (const label of PIPELINE_STEPS) {
      const next = text.indexOf(label);
      expect(next).toBeGreaterThan(cursor);
      cursor = next;
    }

    expect(screen.getByText("Step 5 of 8")).toBeInTheDocument();
    expect(screen.getByText("0.4 s")).toBeInTheDocument(); // 420 ms done step
    expect(screen.getByText("10.8 s")).toBeInTheDocument(); // summed total
  });

  it("shows completion when current === steps.length", () => {
    render(
      <ProcessingStepper
        current={8}
        timings={[420, 3100, 900, 6400, 700, 1500, 300, 2600]}
      />
    );
    expect(screen.getByText("Analysis complete")).toBeInTheDocument();
    expect(screen.getByText("15.9 s")).toBeInTheDocument();
  });
});

describe("ProfileSwitcher", () => {
  it("disables the Expert profile with the Sprint 1 title", () => {
    render(<ProfileSwitcher value="gptc" profiles={PROFILES} />);

    fireEvent.click(screen.getByRole("button", { name: /Profile/ }));

    const expert = screen.getByTitle("Recalcul au Sprint 1");
    expect(expert).toBeDisabled();
    expect(expert).toHaveTextContent("Expert (R. Mekouar)");
  });

  it("selecting an enabled profile fires onChange; the disabled one never does", () => {
    const onChange = vi.fn();
    render(
      <ProfileSwitcher value="gptc" profiles={PROFILES} onChange={onChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Profile/ }));
    fireEvent.click(screen.getByTitle("Recalcul au Sprint 1"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("option", { name: /GPTC default/ }));
    expect(onChange).toHaveBeenCalledWith("gptc");
  });
});

describe("DocumentViewer", () => {
  const pages = [
    { n: 1, imageUrl: "/pages/04_p1.jpeg", lang: "fr", ocrUsed: true },
    { n: 2, imageUrl: "/pages/04_p2.jpeg", lang: "fr", ocrUsed: true },
  ];
  const highlights = [
    { id: "recall", page: 2, x: 0.08, y: 0.36, w: 0.66, h: 0.028 },
    { id: "pl", page: 2, x: 0.08, y: 0.3, w: 0.66, h: 0.028 },
    { id: "other", page: 1, x: 0.1, y: 0.1, w: 0.2, h: 0.02 },
  ];

  it("renders thumbnails and the active page with normalised evidence overlays", () => {
    const { container } = render(
      <DocumentViewer
        pages={pages}
        activePage={2}
        highlights={highlights}
        activeHighlightId="recall"
        fileName="MTS_MMA_2025.pdf"
      />
    );

    expect(screen.getByAltText("Page 1")).toBeInTheDocument();
    expect(screen.getByAltText("Page 2")).toBeInTheDocument();
    expect(screen.getByAltText("Certificate page 2")).toHaveAttribute(
      "src",
      "/pages/04_p2.jpeg"
    );
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    // only page-2 highlights are drawn
    const drawn = container.querySelectorAll("[data-highlight-id]");
    expect(drawn).toHaveLength(2);
    const recall = container.querySelector(
      '[data-highlight-id="recall"]'
    ) as HTMLElement;
    expect(recall.style.left).toBe("8%");
    expect(recall.style.top).toBe("36%");
    expect(recall.style.width).toBe("66%");
    expect(parseFloat(recall.style.height)).toBeCloseTo(2.8);
    expect(recall.className).toContain("cs-pulse");
  });

  it("clicking a thumbnail changes page and notifies onPageChange", () => {
    const onPageChange = vi.fn();
    render(
      <DocumentViewer pages={pages} activePage={2} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Page 1/ }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(screen.getByAltText("Certificate page 1")).toBeInTheDocument();
  });

  it("hides evidence overlays when showEvidence is false", () => {
    const { container } = render(
      <DocumentViewer
        pages={pages}
        activePage={2}
        highlights={highlights}
        showEvidence={false}
      />
    );
    expect(container.querySelectorAll("[data-highlight-id]")).toHaveLength(0);
  });
});

describe("RequestEmailSheet", () => {
  it("buildRequestEmail renders the approved template from findings", () => {
    const email = buildRequestEmail({
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
        "Pure financial loss: at least EUR 15,000,000 (found: missing).",
      ],
    });

    expect(email).toContain(
      "Subject: FORVIA — insurance certificate for M.T.S. SAS: corrections required"
    );
    expect(email).toContain("Formal requirements");
    expect(email).toContain(
      "- Product liability: at least EUR 20,000,000 (found: EUR 10,000,000)."
    );
    expect(email).toContain("Coverage requirements (per FORVIA GPTC)");
    expect(email).toContain("policy 144 725 803");
    expect(email).toContain("by 30 April 2025");
    expect(email).toContain("Kind regards,");
  });

  it("omits an empty findings block", () => {
    const email = buildRequestEmail({ supplier: "ACME", coveragePoints: [] });
    expect(email).not.toContain("Coverage requirements");
    expect(email).not.toContain("Formal requirements");
  });

  it("renders the sheet with the editable email body when open", () => {
    const email = buildRequestEmail({
      supplier: "M.T.S. SAS",
      coveragePoints: ["Pure financial loss: at least EUR 15,000,000."],
    });
    render(<RequestEmailSheet open email={email} supplier="M.T.S. SAS" />);

    expect(screen.getByText("Request changes")).toBeInTheDocument();
    expect(screen.getByText(/M\.T\.S\. SAS · editable/)).toBeInTheDocument();
    const textarea = screen.getByRole("textbox", {
      name: "Generated email",
    }) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Subject: FORVIA");
    expect(
      screen.getByRole("button", { name: /Download \.eml/ })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy/ })).toBeInTheDocument();
  });
});
