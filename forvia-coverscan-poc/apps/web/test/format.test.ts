import { describe, expect, it } from "vitest";

import {
  confidenceGlyph,
  daysLeft,
  formatAmount,
  formatCompactEur,
  formatEur,
  gapPercent,
} from "../lib/format";

describe("formatEur", () => {
  it("formats minor units as whole euros with en-US grouping", () => {
    expect(formatEur(2000000000)).toBe("€20,000,000");
  });
});

describe("formatAmount", () => {
  it("formats minor units with the ISO currency code prefix", () => {
    expect(formatAmount(500000000, "USD")).toBe("USD 5,000,000");
  });
});

describe("formatCompactEur", () => {
  it("compacts millions", () => {
    expect(formatCompactEur(2000000000)).toBe("€20M");
  });

  it("compacts thousands", () => {
    expect(formatCompactEur(30500000)).toBe("€305k");
  });
});

describe("gapPercent", () => {
  it("returns the found/required ratio as an integer percent", () => {
    expect(gapPercent(30500000, 1500000000)).toBe(2);
  });

  it("clamps above the requirement to 100", () => {
    expect(gapPercent(3000000000, 1500000000)).toBe(100);
  });

  it("returns 0 when found is null", () => {
    expect(gapPercent(null, 1500000000)).toBe(0);
  });
});

describe("daysLeft", () => {
  it("counts calendar days from the reference date", () => {
    expect(daysLeft("2025-05-31", "2025-04-15")).toBe(46);
  });

  it("is negative when the date is in the past", () => {
    expect(daysLeft("2025-04-10", "2025-04-15")).toBe(-5);
  });
});

describe("confidenceGlyph", () => {
  it("returns the full dot at the 0.85 boundary", () => {
    expect(confidenceGlyph(0.85)).toBe("●");
  });

  it("returns the half dot at the 0.6 boundary", () => {
    expect(confidenceGlyph(0.6)).toBe("◐");
  });

  it("returns the empty dot below 0.6", () => {
    expect(confidenceGlyph(0.59)).toBe("○");
  });
});
