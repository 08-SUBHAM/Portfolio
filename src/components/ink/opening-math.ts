export const OPENING_MS = 3400;

/** Opening layer windows in [0,1] of the intro: 0 vermilion sun, 1 paper/pale washes, 2 middle greys, 3 dark ink. */
export const OPENING_WINDOWS: readonly [number, number][] = [
  [0.02, 0.34],
  [0.1, 0.52],
  [0.3, 0.74],
  [0.48, 0.97],
];

export function pigmentAmount(time: number, pass: number) {
  const [from, to] = OPENING_WINDOWS[pass] ?? [0, 1];
  if (time >= 1) return 1;
  return Math.max(0, Math.min(1, (time - from) / (to - from)));
}
