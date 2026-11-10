import { describe, expect, it } from "vitest";
import { OPENING_MS, pigmentAmount } from "@/components/ink/opening-math";

describe("Persistent hero painting", () => {
  it("finishes in the requested three-to-four second range", () => {
    expect(OPENING_MS).toBeGreaterThanOrEqual(3000);
    expect(OPENING_MS).toBeLessThanOrEqual(4000);
  });
  it("begins on empty paper and completes every pigment layer", () => {
    for (let pass = 0; pass < 4; pass++) {
      expect(pigmentAmount(0, pass)).toBe(0);
      expect(pigmentAmount(1, pass)).toBe(1);
    }
  });
  it("deposits the red pigment before dark foreground ink", () => {
    expect(pigmentAmount(0.2, 0)).toBeGreaterThan(0);
    expect(pigmentAmount(0.2, 3)).toBe(0);
  });
});