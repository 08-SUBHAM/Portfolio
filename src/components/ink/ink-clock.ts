/** One shared clock for all painting and displacement work. No hidden-tab frames. */
export interface InkFrame { now: number; dt: number }
type Listener = (frame: InkFrame) => void;
const listeners = new Set<Listener>();
let frame = 0, previous = 0;
function tick(now: number) {
  frame = 0;
  const dt = Math.min(0.05, (now - (previous || now)) / 1000);
  previous = now;
  for (const listener of listeners) listener({ now, dt });
  wake();
}
function wake() {
  if (!frame && listeners.size && !document.hidden) frame = requestAnimationFrame(tick);
}
function visibility() { previous = 0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); }
export function onInkFrame(listener: Listener) {
  if (!listeners.size) document.addEventListener('visibilitychange', visibility);
  listeners.add(listener); wake();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { cancelAnimationFrame(frame); frame = 0; previous = 0; document.removeEventListener('visibilitychange', visibility); }
  };
}
