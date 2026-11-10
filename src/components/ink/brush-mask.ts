import { seeded, type Gesture } from "./mural-plan";

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Paints a deterministic pigment mask into `m` (w×h) using a real bristle texture as alpha.
 * Stroke tracks curve, change pressure and arrive one after another, so there are no
 * repeated rows or geometric fronts. At p = 1 the mask is fully saturated.
 */
export function paintMask(
  m: CanvasRenderingContext2D, brush: CanvasImageSource, w: number, h: number,
  p: number, gesture: Gesture, seed: number,
) {
  m.globalCompositeOperation = "source-over";
  m.globalAlpha = 1;
  m.clearRect(0, 0, w, h);
  if (p <= 0) return;
  const rand = seeded(seed);
  const stamp = (x: number, y: number, len: number, thick: number, ang: number, a: number) => {
    if (a <= 0.001) return;
    m.save();
    m.globalAlpha = Math.min(1, a);
    m.translate(x, y);
    m.rotate(ang);
    m.drawImage(brush, -len / 2, -thick / 2, len, thick);
    m.restore();
  };

  if (gesture === "bloom") {
    // Pigment pools outward from a slightly off-centre drop, each dab rotated differently.
    const cx = w * (0.42 + rand() * 0.16), cy = h * (0.42 + rand() * 0.16);
    for (let i = 0; i < 11; i++) {
      const ang = rand() * Math.PI, off = rand() * 0.16, ra = rand(), rb = rand(), rc = rand();
      const t = clamp((p - i * 0.055) / 0.42);
      if (t <= 0) continue;
      const ox = Math.cos(ang * 2) * off * w * t, oy = Math.sin(ang * 2) * off * h * t;
      stamp(cx + ox, cy + oy, w * (0.4 + 0.85 * t) * (0.8 + ra * 0.4), h * (0.35 + 0.8 * t) * (0.8 + rb * 0.4), ang, (0.45 + rc * 0.5) * Math.min(1, t * 2.2));
    }
  } else {
    const vertical = gesture === "rise" || gesture === "fall";
    const L = vertical ? h : w, C = vertical ? w : h;
    const K = gesture === "reach" ? 2 : 3 + Math.floor(rand() * 2);
    const n = 10;
    for (let j = 0; j < K; j++) {
      const c = C * ((j + 0.5) / K) + (rand() - 0.5) * (C / K) * 0.6;
      const amp = C * (0.04 + rand() * 0.08), freq = 0.8 + rand() * 1.6, phase = rand() * 6.28;
      const lag = gesture === "reach" ? j * 0.22 : j * 0.09 + rand() * 0.05;
      const t = clamp((p - lag) / 0.6);
      for (let i = 0; i < n; i++) {
        const s = i / (n - 1);
        const ra = rand(), rb = rand(), rc = rand(), rd = rand();
        const front = clamp((t * 1.08 - s) * n);
        if (front <= 0) continue;
        let along = -0.05 * L + s * 1.1 * L;
        if (gesture === "rise") along = L - along;
        const cross = c + amp * Math.sin(s * Math.PI * freq + phase);
        const slope = amp * Math.PI * freq * Math.cos(s * Math.PI * freq + phase) / (1.1 * L);
        const len = L * 0.25 * (0.75 + ra * 0.6);
        const pressure = 0.6 + 0.6 * Math.sin(s * Math.PI) ;
        const thick = (C / K) * 2.3 * pressure * (0.8 + rb * 0.4);
        const ang = Math.atan(slope) + (rc - 0.5) * 0.28 + (vertical ? Math.PI / 2 : 0);
        const x = vertical ? cross : along, y = vertical ? along : cross;
        stamp(x, y, len, thick, ang, (0.5 + rd * 0.5) * front);
        // dry-brush flecks just ahead of the wet front
        if (front < 1 && rd > 0.45) stamp(x + (vertical ? 0 : len * 0.35), y + (vertical ? len * 0.35 : 0), len * 0.3, thick * 0.35, ang, 0.35 * front);
      }
    }
  }
  if (p > 0.8) {
    // the last wet pass saturates remaining paper fibres
    m.globalAlpha = clamp((p - 0.8) / 0.2);
    m.fillRect(0, 0, w, h);
    m.globalAlpha = 1;
  }
}
