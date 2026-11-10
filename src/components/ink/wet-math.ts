export const ART_DEPTH = { stain: 0.08, bloom: 0.12, distant: 0.18, mid: 0.4, ridge: 0.72, branch: 1, stroke: 0.65, vermilion: 0.35 };
export const settle = (value: number, target: number, dt: number, rate = 5) => value + (target - value) * (1 - Math.exp(-rate * dt));
export const clampVelocity = (value: number) => Math.max(-1, Math.min(1, value));
export const TRAIL_DECAY = 0.75;
/** True only when the pointer really travelled on screen (scroll-generated repeats never paint). */
export const pointerMoved = (ax: number, ay: number, bx: number, by: number) => !(Number.isFinite(ax) && Number.isFinite(ay)) || Math.hypot(bx - ax, by - ay) > 0.5;
export function strokeSamples(ax: number, ay: number, bx: number, by: number, spacing = 5) {
  const count = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / spacing));
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / count;
    return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
  });
}
