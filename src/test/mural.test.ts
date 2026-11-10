import { describe, expect, it } from "vitest";
import { buildMural, LAYER_ORDER, MURAL_CHAPTERS } from "@/components/ink/mural-plan";

const vh = 900, vw = 1440;
const regions = [
  { id: "work", top: 850, height: 4200 },
  { id: "about", top: 5050, height: 1800 },
  { id: "playground", top: 6850, height: 2600 },
  { id: "contact", top: 9450, height: 1000 },
];
const max = 10550 - vh;
const plan = buildMural(regions, vw, vh, max);

describe("Page-wide ink mural", () => {
  it("is deterministic: the same page produces the identical composition", () => {
    expect(buildMural(regions, vw, vh, max)).toEqual(plan);
  });
  it("adds pigment in every chapter", () => {
    for (const id of MURAL_CHAPTERS) expect(plan.filter((d) => d.chapter === id).length).toBeGreaterThanOrEqual(6);
  });
  it("lays paper stain before dark ridges before vermilion within a chapter", () => {
    const about = plan.filter((d) => d.chapter === "about" && !d.id.includes("-f"));
    const first = (asset: string) => about.find((d) => d.asset === asset)!.start - about.find((d) => d.asset === asset)!.y;
    expect(first("stain")).toBeLessThan(first("ridge"));
    expect(first("ridge")).toBeLessThan(first("vermilion"));
    expect(LAYER_ORDER[0]).toBe("stain");
  });
});
