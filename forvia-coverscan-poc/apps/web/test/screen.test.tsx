import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CertificateView } from "../app/certificates/[id]/certificate-view";
import { getCertificate } from "../lib/repository";

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
});
