/**
 * Deterministic composition for the page-wide ink mural.
 * Pure data + math only (no DOM), so it can be tested and is identical every render.
 */
export type MuralAsset = "stain" | "bloom" | "distant" | "mid" | "ridge" | "branch" | "stroke" | "vermilion";
export type Gesture = "sweep" | "rise" | "fall" | "bloom" | "reach";

/** Painting order: paper stain -> underwash -> far -> middle -> dark -> pines -> calligraphy -> vermilion. */
export const LAYER_ORDER: MuralAsset[] = ["stain", "bloom", "distant", "mid", "ridge", "branch", "stroke", "vermilion"];
export const ASPECT: Record<MuralAsset, number> = {
  stain: 1.25, bloom: 1.25, distant: 2.5, mid: 2.5, ridge: 2.5, branch: 1.5, stroke: 3, vermilion: 1,
};
export const MURAL_CHAPTERS = ["work", "about", "playground", "contact"] as const;

export interface Region { id: string; top: number; height: number }
export interface Deposit {
  id: string; chapter: string; asset: MuralAsset; layer: number;
  x: number; y: number; w: number; h: number; rot: number; flip: boolean;
  alpha: number; gesture: Gesture; seed: number; start: number; end: number;
}

type Entry = [asset: MuralAsset, fx: number, fy: number, fw: number, rot: number, flip: boolean, alpha: number, gesture: Gesture];

/** Each chapter adds its own stage of the same landscape. fx/fw are viewport-width fractions, fy is chapter height fraction. */
const RECIPES: Record<string, Entry[]> = {
  // 01 Work: the underwash and the far range emerge out of the hero mist.
  work: [
    ["stain", -0.12, 0.0, 0.75, -6, false, 0.55, "bloom"],
    ["bloom", 0.52, 0.015, 0.6, 12, true, 0.38, "bloom"],
    ["distant", -0.08, 0.03, 1.15, 0, false, 0.78, "sweep"],
    ["mid", 0.4, 0.09, 0.8, 0, true, 0.5, "rise"],
    ["stroke", -0.18, 0.2, 0.95, -9, false, 0.62, "sweep"],
    ["vermilion", 0.8, 0.02, 0.15, 0, false, 0.85, "bloom"],
  ],
  // 02 About: middle distance thickens and the first dark ridge arrives.
  about: [
    ["stain", 0.45, 0.0, 0.7, 8, true, 0.5, "bloom"],
    ["distant", 0.1, 0.02, 1.0, 0, true, 0.6, "sweep"],
    ["mid", -0.15, 0.1, 0.95, 0, false, 0.7, "rise"],
    ["ridge", 0.42, 0.28, 0.75, 0, true, 0.8, "rise"],
    ["branch", -0.12, 0.55, 0.55, 6, false, 0.85, "reach"],
    ["vermilion", 0.06, 0.12, 0.08, 0, false, 0.8, "bloom"],
  ],
  // 03 Playground: dark foreground ink, pines and a long calligraphic sweep.
  playground: [
    ["bloom", -0.1, 0.0, 0.8, -10, false, 0.45, "bloom"],
    ["mid", 0.3, 0.04, 0.9, 0, true, 0.6, "sweep"],
    ["ridge", -0.2, 0.12, 1.05, 0, false, 0.92, "rise"],
    ["branch", 0.55, 0.42, 0.6, -8, true, 0.88, "reach"],
    ["stroke", 0.15, 0.7, 1.0, 7, true, 0.72, "sweep"],
    ["vermilion", 0.86, 0.3, 0.1, 0, false, 0.85, "bloom"],
  ],
  // 04 Contact: the painting is resolved with a big seal-sun and closing ridge.
  contact: [
    ["stain", 0.1, 0.0, 0.9, 4, false, 0.5, "bloom"],
    ["distant", -0.1, 0.05, 1.2, 0, true, 0.7, "sweep"],
    ["mid", 0.35, 0.22, 0.8, 0, false, 0.62, "rise"],
    ["ridge", 0.25, 0.48, 1.0, 0, true, 0.9, "rise"],
    ["branch", -0.15, 0.3, 0.5, 10, false, 0.8, "reach"],
    ["stroke", -0.25, 0.75, 0.9, -5, false, 0.6, "sweep"],
    ["vermilion", 0.68, 0.06, 0.24, 0, false, 0.9, "bloom"],
  ],
};

/** Interstitial passes keep every screenful of a long chapter gaining pigment. */
const FILLER: Entry[][] = [
  [["bloom", 0.6, 0, 0.55, 15, false, 0.4, "bloom"], ["mid", -0.25, 0.05, 0.75, 0, false, 0.55, "rise"], ["vermilion", 0.9, 0.04, 0.06, 0, false, 0.75, "bloom"]],
  [["stain", -0.15, 0, 0.6, -12, true, 0.45, "bloom"], ["branch", 0.62, 0.08, 0.48, -4, true, 0.85, "reach"]],
  [["distant", 0.2, 0, 0.9, 0, true, 0.6, "sweep"], ["ridge", -0.3, 0.1, 0.7, 0, false, 0.85, "rise"]],
  [["bloom", 0.05, 0, 0.5, 4, true, 0.35, "bloom"], ["stroke", 0.4, 0.06, 0.75, 11, true, 0.6, "fall"]],
];

export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LAYER_DELAY = 0.05; // fraction of viewport between successive layers
const SPAN = 0.42; // viewport fraction for one deposit to finish

export function buildMural(regions: Region[], vw: number, vh: number, maxScroll: number): Deposit[] {
  const out: Deposit[] = [];
  const mobile = vw < 768;
  regions.forEach((region, ci) => {
    const recipe = RECIPES[region.id];
    if (!recipe) return;
    const entries: { e: Entry; anchor: number; tag: string }[] = recipe.map((e, i) => ({ e, anchor: region.top + e[2] * region.height, tag: `${i}` }));
    // add fillers every ~1.1 viewport for tall chapters
    const steps = Math.floor(region.height / (vh * 1.1));
    for (let k = 1; k < steps; k++) {
      const group = FILLER[(k + ci) % FILLER.length] ?? [];
      const base = region.top + k * vh * 1.1;
      group.forEach((e, i) => entries.push({ e, anchor: base + e[2] * vh, tag: `f${k}-${i}` }));
    }
    entries.forEach(({ e, anchor, tag }, i) => {
      const [asset, fx, , fw, rot, flip, alpha, gesture] = e;
      const layer = LAYER_ORDER.indexOf(asset);
      const w = vw * fw * (mobile ? (asset === "vermilion" ? 2.6 : 2.1) : 1);
      const h = w / ASPECT[asset];
      const x = vw * fx - (w - vw * fw) / 2;
      let start = anchor - vh + layer * LAYER_DELAY * vh;
      let end = start + SPAN * vh;
      // Final chapter: compress so the last pass completes at native max scroll.
      if (end > maxScroll) {
        const shift = end - maxScroll;
        end = maxScroll;
        start = Math.max(0, Math.min(start - shift, end - SPAN * vh * 0.5));
      }
      out.push({
        id: `${region.id}-${tag}`, chapter: region.id, asset, layer,
        x, y: anchor, w, h, rot: (rot * Math.PI) / 180, flip,
        alpha, gesture,
        seed: (ci + 1) * 977 + i * 131 + layer * 17, start, end,
      });
    });
  });
  // Lower layers draw first so pigment accumulates in painting order within a region.
  return out.sort((a, b) => a.layer - b.layer || a.y - b.y);
}

