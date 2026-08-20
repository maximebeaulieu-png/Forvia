import { describe, expect, it } from "vitest";
import { getCertificate, getCertificates } from "@/lib/repository";

describe("certificate repository", () => {
  it("loads all 10 certificates", () => {
    expect(getCertificates()).toHaveLength(10);
  });

  it("cert 04 is the broker NO_GO case", () => {
    const c = getCertificate("04")!;
    expect(c.supplier).toMatch(/M\.?T\.?S/);
    expect(["FORMAL_DEFECT", "STRUCTURAL"]).toContain(c.decision);
  });

  it("unknown id returns undefined", () => {
    expect(getCertificate("99")).toBeUndefined();
  });

  it("every certificate has at least one page after merge", () => {
    for (const c of getCertificates()) {
      expect(c.pages, `cert ${c.id} should have pages[]`).toBeDefined();
      expect(c.pages!.length, `cert ${c.id} pages count`).toBeGreaterThanOrEqual(1);
    }
  });
});
