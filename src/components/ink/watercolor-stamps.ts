/** Deterministic watercolour wash stamps: irregular blotches with mottled pigment, feathered edges and darker backrun rims. */
const hash = (x: number, y: number, s: number) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
function noise(x: number, y: number, s: number) {
  const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
export const fbm = (x: number, y: number, s: number) => noise(x, y, s) * .5 + noise(x * 2.1, y * 2.1, s + 1) * .27 + noise(x * 4.3, y * 4.3, s + 2) * .15 + noise(x * 9.1, y * 9.1, s + 3) * .08;

/** Alpha (0..1) of wash variant `seed` at normalised position (u,v in -1..1). Pure, so it can be tested. */
export function washAlpha(u: number, v: number, seed: number, pool = false) {
  const d = Math.hypot(u, v), th = Math.atan2(v, u);
  // Wandering boundary: a few low-frequency lobes plus a fibrous, noisy edge — never a circle.
  let R = (pool ? .55 : .72) + .09 * Math.sin(2 * th + seed * 1.7) + .07 * Math.sin(3 * th + seed * 2.9) + .05 * Math.sin(5 * th + seed * .6);
  R += (fbm(Math.cos(th) * 2.2 + seed, Math.sin(th) * 2.2 - seed, seed) - .5) * .32;
  const edge = (R - d) / R; if (edge <= 0) return 0;
  const feather = Math.min(1, edge / (pool ? .12 : .32));
  const mottle = .45 + .75 * fbm(u * 3.2 + seed * 3, v * 3.2, seed + 9);
  const grain = .8 + .4 * noise(u * 40 + seed, v * 40, seed + 4);
  const backrun = Math.exp(-(((d - R * .9) / (R * .09)) ** 2)) * (pool ? .55 : .4); // pigment collects where the wet edge dried
  return Math.min(1, (feather * mottle * (pool ? 1.1 : .62) + backrun * feather) * grain);
}

let cache: HTMLCanvasElement[] | null = null;
/** Six wash variants and three pigment pools, generated once at 160px and scaled per stamp. */
export function washStamps() {
  if (cache || typeof document === 'undefined') return cache ?? [];
  const S = 160; cache = [];
  for (let k = 0; k < 9; k++) {
    const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); if (!g) continue;
    const img = g.createImageData(S, S), pool = k >= 6;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const a = washAlpha((x + .5) / S * 2 - 1, (y + .5) / S * 2 - 1, k + 1.3, pool), i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(a * 255);
    }
    g.putImageData(img, 0, 0); cache.push(c);
  }
  return cache;
}
