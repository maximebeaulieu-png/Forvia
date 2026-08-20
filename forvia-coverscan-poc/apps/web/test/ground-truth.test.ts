import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toDisplayStatus, type DisplayStatusT } from "@coverscan/schemas";
import { getCertificates } from "../lib/repository";

/* The screen's chip renders cert.decision (already a DisplayStatus from the
   design-pack dataset). This test proves that value equals what the scoring
   docs' ground truth implies for every one of the 10 certificates. */

interface GroundTruthEntry {
  id?: string;
  computed?: { decision?: string; noGoSubtype?: string | null; needsHumanReview?: boolean };
}

const gtPath = join(__dirname, "../../../data/samples/ground_truth.json");
const groundTruth = JSON.parse(readFileSync(gtPath, "utf8")) as unknown;

function entries(): [string, GroundTruthEntry][] {
  if (Array.isArray(groundTruth)) {
    return (groundTruth as GroundTruthEntry[]).map((e) => [String(e.id ?? "").slice(0, 2), e]);
  }
  const obj = groundTruth as Record<string, GroundTruthEntry | GroundTruthEntry[]>;
  const list = (obj.samples ?? obj.certificates ?? obj) as Record<string, GroundTruthEntry> | GroundTruthEntry[];
  if (Array.isArray(list)) return list.map((e) => [String(e.id ?? "").slice(0, 2), e]);
  return Object.entries(list).map(([k, v]) => [k.slice(0, 2), v]);
}

describe("ground truth conformance", () => {
  it("every cached certificate's displayed decision matches the ground truth", () => {
    const gt = new Map(entries().filter(([k]) => /^\d{2}$/.test(k)));
    expect(gt.size).toBe(10);
    for (const cert of getCertificates()) {
      const entry = gt.get(cert.id);
      expect(entry, `ground truth entry for cert ${cert.id}`).toBeDefined();
      const c = entry!.computed!;
      const expected: DisplayStatusT = toDisplayStatus(
        c.decision as "GO" | "REQUEST_CHANGES" | "NO_GO",
        (c.noGoSubtype ?? null) as "FORMAL_DEFECT" | "STRUCTURAL" | null,
        Boolean(c.needsHumanReview),
      );
      const displayed = cert.needsReview && cert.decision === "REQUEST_CHANGES" ? "NEEDS_REVIEW" : cert.decision;
      expect(displayed, `cert ${cert.id} (${cert.supplier})`).toBe(expected);
    }
  });
});
