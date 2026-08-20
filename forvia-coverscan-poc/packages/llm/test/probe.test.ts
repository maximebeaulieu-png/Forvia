import { describe, expect, it } from "vitest";
import { similarity, tokenizeWords } from "../src/ocr/probe.js";

describe("tokenizeWords", () => {
  it("lowercases, splits on whitespace and strips edge punctuation", () => {
    expect(tokenizeWords("Hello,  WORLD!\n(test)")).toEqual([
      "hello",
      "world",
      "test",
    ]);
  });

  it("keeps inner punctuation (amounts, policy numbers)", () => {
    expect(tokenizeWords("896,176,662 euros — n°450 327 374.")).toEqual([
      "896,176,662",
      "euros",
      "n°450",
      "327",
      "374",
    ]);
  });

  it("returns empty array for blank input", () => {
    expect(tokenizeWords("  \n\t ")).toEqual([]);
  });
});

describe("similarity", () => {
  it("identical word arrays give 1", () => {
    expect(similarity(["a", "b", "c"], ["a", "b", "c"])).toBe(1);
  });

  it("disjoint word arrays give 0", () => {
    expect(similarity(["a", "b"], ["x", "y", "z"])).toBe(0);
  });

  it("computes SequenceMatcher-style ratio 2*LCS/(lenA+lenB)", () => {
    // LCS of [a b c d] and [a x c] is [a c] -> 2*2/(4+3)
    expect(similarity(["a", "b", "c", "d"], ["a", "x", "c"])).toBeCloseTo(
      4 / 7,
      10,
    );
  });

  it("both empty gives 1, one empty gives 0", () => {
    expect(similarity([], [])).toBe(1);
    expect(similarity(["a"], [])).toBe(0);
  });
});
