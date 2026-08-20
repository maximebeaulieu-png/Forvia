import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CachedCertificate, toDisplayStatus } from "../src/index.js";
import raw from "../../../data/samples/04_marron-mma_mts_FR/expected.json";

const SAMPLES_DIR = fileURLToPath(new URL("../../../data/samples", import.meta.url));
const DS_DATA_JS = fileURLToPath(
  new URL(
    "../../../../design-pack/Design System Cover Scan/ui_kits/coverscan/data.js",
    import.meta.url,
  ),
);

describe("CachedCertificate deep fields", () => {
  it("parses real expected.json deep fields", () => {
    const r = CachedCertificate.pick({ computed: true }).safeParse({ computed: raw.computed });
    expect(r.success).toBe(true);
  });

  it("parses the computed block of all 10 expected.json samples", () => {
    const dirs = readdirSync(SAMPLES_DIR).filter((d) =>
      existsSync(join(SAMPLES_DIR, d, "expected.json")),
    );
    expect(dirs).toHaveLength(10);
    const Computed = CachedCertificate.pick({ computed: true });
    for (const dir of dirs) {
      const sample = JSON.parse(readFileSync(join(SAMPLES_DIR, dir, "expected.json"), "utf8"));
      const r = Computed.safeParse({ computed: sample.computed });
      expect(r.success, `${dir}: ${r.success ? "" : r.error.message}`).toBe(true);
    }
  });

  it("parses deep extraction fields of all 10 expected.json samples", () => {
    const dirs = readdirSync(SAMPLES_DIR).filter((d) =>
      existsSync(join(SAMPLES_DIR, d, "expected.json")),
    );
    const Deep = CachedCertificate.pick({
      guarantees: true,
      exclusions: true,
      deductibles: true,
      fx: true,
      territory: true,
      trigger: true,
      basisSummary: true,
      accuracyScore: true,
    });
    for (const dir of dirs) {
      const sample = JSON.parse(readFileSync(join(SAMPLES_DIR, dir, "expected.json"), "utf8"));
      const r = Deep.safeParse({
        guarantees: sample.guarantees,
        exclusions: sample.exclusions,
        deductibles: sample.deductibles ?? undefined,
        fx: sample.fx,
        territory: sample.territory,
        trigger: sample.trigger,
        basisSummary: sample.basisSummary,
        accuracyScore: sample.accuracyScore,
      });
      expect(r.success, `${dir}: ${r.success ? "" : r.error.message}`).toBe(true);
    }
  });
});

describe("CachedCertificate table-level fields", () => {
  it.skipIf(!existsSync(DS_DATA_JS))("parses all design-system data.js certificate rows", () => {
    // data.js is a browser IIFE assigning window.CS — execute it with a stub window.
    const win: { CS?: { certificates: unknown[] } } = {};
    new Function("window", readFileSync(DS_DATA_JS, "utf8"))(win);
    const rows = win.CS?.certificates ?? [];
    expect(rows).toHaveLength(10);
    for (const row of rows) {
      const r = CachedCertificate.safeParse(row);
      expect(r.success, r.success ? "" : r.error.message).toBe(true);
    }
  });
});

describe("toDisplayStatus", () => {
  it("maps NO_GO + FORMAL_DEFECT", () => {
    expect(toDisplayStatus("NO_GO", "FORMAL_DEFECT", true)).toBe("FORMAL_DEFECT");
  });

  it("maps NO_GO + STRUCTURAL even when review is requested", () => {
    expect(toDisplayStatus("NO_GO", "STRUCTURAL", true)).toBe("STRUCTURAL");
  });

  it("review wins over REQUEST_CHANGES", () => {
    expect(toDisplayStatus("REQUEST_CHANGES", null, true)).toBe("NEEDS_REVIEW");
  });

  it("review wins over GO", () => {
    expect(toDisplayStatus("GO", null, true)).toBe("NEEDS_REVIEW");
  });

  it("passes GO and REQUEST_CHANGES through when no review is needed", () => {
    expect(toDisplayStatus("GO", null, false)).toBe("GO");
    expect(toDisplayStatus("REQUEST_CHANGES", null, false)).toBe("REQUEST_CHANGES");
  });
});
