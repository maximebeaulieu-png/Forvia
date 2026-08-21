import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BatchPanel, BATCH_MAX_FILES } from "../app/(shell)/certificates/batch-panel";
import {
  CertificatesView,
  type CertificateRow,
} from "../app/(shell)/certificates/certificates-view";
import { setBatch, takeBatch, type BatchFile } from "../lib/upload-batch";
import { getCertificates } from "../lib/repository";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => nav.searchParams,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.searchParams = new URLSearchParams();
  takeBatch(); /* drain the module store between tests */
});

function pdf(name: string, size = 120_000): BatchFile {
  return { name, size };
}

/** Flush the chained replay timers — each act() lets the next step be scheduled. */
function runReplay(iterations = 16) {
  for (let i = 0; i < iterations; i += 1) {
    act(() => {
      vi.advanceTimersByTime(1_600);
    });
  }
}

describe("upload batch store", () => {
  it("takeBatch returns the stored metadata once, then empties", () => {
    setBatch([pdf("a.pdf"), pdf("b.pdf")]);
    expect(takeBatch()).toEqual([pdf("a.pdf"), pdf("b.pdf")]);
    expect(takeBatch()).toBeNull();
  });
});

describe("BatchPanel", () => {
  it("replays a batch of 3 and resolves each row into a decision chip with cycled links", () => {
    vi.useFakeTimers();
    render(
      <BatchPanel
        files={[pdf("allianz.pdf"), pdf("chubb.pdf"), pdf("zurich.pdf")]}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText("Analysing 3 certificates — demo replay")).toBeInTheDocument();
    expect(screen.getByText("0 of 3 analysed")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(3);
    /* the current pipeline step is surfaced per row */
    expect(screen.getAllByText("Ingest").length).toBeGreaterThan(0);

    runReplay();

    expect(screen.getByText("3 of 3 analysed")).toBeInTheDocument();
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);

    /* deterministic cycle over the cached certificates: file i -> cert (i % 10) */
    const certs = getCertificates();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/certificates/01");
    expect(links[1]).toHaveAttribute("href", "/certificates/02");
    expect(links[2]).toHaveAttribute("href", "/certificates/03");
    expect(links[0]).toHaveTextContent(certs[0]!.supplier);

    /* resolved decision chips: 01 = Request changes, 02 & 03 = Formal defect */
    expect(screen.getByText("Request changes")).toBeInTheDocument();
    expect(screen.getAllByText("Not admissible · resubmit")).toHaveLength(2);
  });

  it("lists unsupported formats as inert greyed rows without a progress bar", () => {
    vi.useFakeTimers();
    render(
      <BatchPanel
        files={[pdf("cert.pdf"), pdf("notes.txt"), pdf("scan.PNG")]}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByText("Unsupported format")).toBeInTheDocument();
    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    /* only the two supported files are analysed */
    expect(screen.getByText("Analysing 2 certificates — demo replay")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(2);
  });

  it("caps the replay at 20 files and says so", () => {
    vi.useFakeTimers();
    const files = Array.from({ length: 25 }, (_, i) => pdf(`cert-${i + 1}.pdf`));
    render(<BatchPanel files={files} onDismiss={vi.fn()} />);
    expect(screen.getAllByRole("progressbar")).toHaveLength(BATCH_MAX_FILES);
    expect(screen.getByText("Showing the first 20 of 25 files")).toBeInTheDocument();
    expect(screen.getByText("Analysing 20 certificates — demo replay")).toBeInTheDocument();
  });
});

describe("CertificatesView batch pickup", () => {
  const certificates = getCertificates() as CertificateRow[];

  it("takes the pending batch on ?batch=1, shows the panel and cleans the URL", () => {
    vi.useFakeTimers();
    nav.searchParams = new URLSearchParams("batch=1");
    setBatch([pdf("a.pdf"), pdf("b.pdf"), pdf("c.pdf")]);
    render(<CertificatesView certificates={certificates} view="all" q="" />);

    expect(screen.getByText("Analysing 3 certificates — demo replay")).toBeInTheDocument();
    expect(nav.replace).toHaveBeenCalledWith("/certificates", { scroll: false });
    /* the store is drained — a reload would find nothing */
    expect(takeBatch()).toBeNull();

    /* Dismiss clears the batch card */
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(
      screen.queryByText("Analysing 3 certificates — demo replay"),
    ).not.toBeInTheDocument();
  });

  it("ignores ?batch=1 cleanly when no batch is pending (hard reload)", () => {
    vi.useFakeTimers();
    nav.searchParams = new URLSearchParams("batch=1");
    render(<CertificatesView certificates={certificates} view="all" q="" />);
    expect(screen.queryByText(/demo replay$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
