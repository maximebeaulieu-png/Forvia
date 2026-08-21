import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TopHeader } from "../components/shell/TopHeader";
import { UploadDialog } from "../components/shell/UploadDialog";
import { setBatch, takeBatch } from "../lib/upload-batch";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, prefetch: vi.fn(), back: vi.fn() }),
}));

/* Spy on the real module — setBatch keeps its implementation but records calls. */
vi.mock("../lib/upload-batch", { spy: true });

afterEach(() => {
  cleanup();
  nav.push.mockReset();
  nav.replace.mockReset();
  vi.mocked(setBatch).mockClear();
  takeBatch(); /* drain the module store between tests */
});

const PROFILES = [{ id: "gptc", label: "GPTC default", version: "v3" }];

/** File with a controlled size — jsdom Files are tiny otherwise. */
function file(name: string, size = 1024): File {
  const f = new File(["x"], name);
  Object.defineProperty(f, "size", { value: size });
  return f;
}

/** The dialog's hidden multiple file input (rendered in the Radix portal). */
function fileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) throw new Error("file input not found");
  return input;
}

function addFiles(files: File[]) {
  fireEvent.change(fileInput(), { target: { files } });
}

describe("UploadDialog", () => {
  it("opens from the header Upload button instead of the native picker", () => {
    render(<TopHeader profiles={PROFILES} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(screen.getByRole("dialog", { name: "Upload certificates" })).toBeInTheDocument();
    expect(screen.getByText("Drop certificates here")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Browse files" })).toBeInTheDocument();
  });

  it("accumulates files across successive selections and ignores duplicates", () => {
    render(<UploadDialog open onOpenChange={() => {}} />);
    addFiles([file("allianz.pdf"), file("chubb.pdf")]);
    expect(screen.getByText("2 certificates ready")).toBeInTheDocument();
    /* second selection ADDS to the batch; allianz.pdf (same name + size) is ignored */
    addFiles([file("zurich.png"), file("allianz.pdf")]);
    expect(screen.getByText("3 certificates ready")).toBeInTheDocument();
    expect(screen.getAllByText("allianz.pdf")).toHaveLength(1);
    expect(screen.getByText("zurich.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyse 3 certificates" })).toBeEnabled();
  });

  it("marks unsupported extensions and excludes them from the counter", () => {
    render(<UploadDialog open onOpenChange={() => {}} />);
    addFiles([file("allianz.pdf"), file("notes.docx")]);
    expect(screen.getByText("notes.docx")).toBeInTheDocument();
    expect(screen.getByText("Unsupported")).toBeInTheDocument();
    expect(screen.getByText("1 certificate ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyse 1 certificate" })).toBeEnabled();
  });

  it("removes a file from the batch via its remove button", () => {
    render(<UploadDialog open onOpenChange={() => {}} />);
    addFiles([file("allianz.pdf"), file("chubb.pdf")]);
    fireEvent.click(screen.getByRole("button", { name: "Remove allianz.pdf" }));
    expect(screen.queryByText("allianz.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("1 certificate ready")).toBeInTheDocument();
  });

  it("disables the analyse button while the batch is empty", () => {
    render(<UploadDialog open onOpenChange={() => {}} />);
    expect(screen.getByText("0 certificates ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyse 0 certificates" })).toBeDisabled();
  });

  it("launches the batch: setBatch with supported files only, then navigates and closes", () => {
    const onOpenChange = vi.fn();
    render(<UploadDialog open onOpenChange={onOpenChange} />);
    addFiles([file("allianz.pdf", 2048), file("notes.docx", 512), file("chubb.jpg", 4096)]);
    fireEvent.click(screen.getByRole("button", { name: "Analyse 2 certificates" }));
    expect(setBatch).toHaveBeenCalledTimes(1);
    expect(setBatch).toHaveBeenCalledWith([
      { name: "allianz.pdf", size: 2048 },
      { name: "chubb.jpg", size: 4096 },
    ]);
    expect(nav.push).toHaveBeenCalledWith("/certificates?batch=1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
