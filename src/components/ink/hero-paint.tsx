import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-sumi.jpg";
import bristles from "@/assets/pigment-brush.png";
import { OPENING_MS, pigmentAmount } from "./opening-math";
import { paintMask } from "./brush-mask";
import type { Gesture } from "./mural-plan";
import { onInkFrame } from "./ink-clock";
import { wetSurface } from "./wet-surface";

/** Horizontal focus of the cover crop. Shared by the canvas and the no-JS image. */
const FOCUS_X = 0.78;
const SUN = { x: 0.655, y: 0.155, r: 0.11 };
const PASSES: { gesture: Gesture; seed: number }[] = [
  { gesture: "bloom", seed: 11 },
  { gesture: "sweep", seed: 23 },
  { gesture: "sweep", seed: 47 },
  { gesture: "rise", seed: 89 },
];
const smooth = (a: number, b: number, v: number) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * The persistent hero artwork. The opening deposits the exact hero image in four
 * pigment passes whose weights sum to the original, composited additively, so the
 * final opening frame and the resting hero are the same pixels in the same crop.
 */
export function HeroPaint() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wet = useRef<HTMLCanvasElement>(null);
  const finish = useRef<() => void>(() => {});
  const [painting, setPainting] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = canvas.current;
    const ctx = target?.getContext("2d");
    if (!target || !ctx) return;
    let cancelled = false, resize: ResizeObserver | undefined;
    let stop = () => {}, disposeWet = () => {};
    const image = new Image(), brush = new Image();
    image.src = hero; brush.src = bristles;
    void Promise.all([image.decode(), brush.decode()]).then(() => {
      if (cancelled) return;
      const w = window.innerWidth < 768 ? 900 : 1280, h = Math.round(w * image.height / image.width);
      const source = document.createElement("canvas"); source.width = w; source.height = h;
      const sourceCtx = source.getContext("2d", { willReadFrequently: true }); if (!sourceCtx) return;
      sourceCtx.drawImage(image, 0, 0, w, h);
      const original = sourceCtx.getImageData(0, 0, w, h).data;
      // Soft pigment separation: weights per pixel sum to 1, so additive layers rebuild the original.
      const layers = PASSES.map((_, pass) => {
        const layer = document.createElement("canvas"); layer.width = w; layer.height = h;
        const lctx = layer.getContext("2d"); if (!lctx) return layer;
        const px = new ImageData(new Uint8ClampedArray(original), w, h);
        const d = px.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i] ?? 0, g = d[i + 1] ?? 0, b = d[i + 2] ?? 0;
          const red = smooth(0.05, 0.16, (r - Math.max(g, b)) / 255);
          const lum = (r + g + b) / 3;
          const light = smooth(150, 205, lum), dark = 1 - smooth(55, 115, lum);
          const weights = [red, (1 - red) * light, (1 - red) * (1 - light - dark), (1 - red) * dark];
          d[i + 3] = Math.round((weights[pass] ?? 0) * 255);
        }
        lctx.putImageData(px, 0, 0); return layer;
      });
      const mask = document.createElement("canvas"); mask.width = w; mask.height = h;
      const masked = document.createElement("canvas"); masked.width = w; masked.height = h;
      const mc = mask.getContext("2d"), lc = masked.getContext("2d"); if (!mc || !lc) return;
      let time = 0, bounds = target.getBoundingClientRect();
      const draw = () => {
        if (cancelled) return;
        const ratio = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2);
        const tw = Math.round(bounds.width * ratio), th = Math.round(bounds.height * ratio);
        if (target.width !== tw || target.height !== th) { target.width = tw; target.height = th; }
        target.dataset["time"] = time.toFixed(3);
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, tw, th);
        const scale = Math.max(tw / w, th / h), dx = (tw - w * scale) * FOCUS_X, dy = (th - h * scale) / 2;
        layers.forEach((layer, pass) => {
          const amount = pigmentAmount(time, pass);
          if (amount <= 0) return;
          const spec = PASSES[pass];
          if (!spec) return;
          if (pass === 0) {
            // the sun is dabbed in its own place, then the last wet pass saturates everywhere
            mc.clearRect(0, 0, w, h);
            const bw = SUN.r * 2.6 * w, bh = bw;
            mc.save(); mc.translate(SUN.x * w - bw / 2, SUN.y * h - bh / 2);
            paintMask(mc, brush, bw, bh, amount, spec.gesture, spec.seed);
            mc.restore();
            if (amount > 0.8) { mc.globalAlpha = (amount - 0.8) / 0.2; mc.fillRect(0, 0, w, h); mc.globalAlpha = 1; }
          } else {
            paintMask(mc, brush, w, h, amount, spec.gesture, spec.seed);
          }
          lc.globalCompositeOperation = "source-over";
          lc.clearRect(0, 0, w, h);
          lc.drawImage(layer, 0, 0);
          lc.globalCompositeOperation = "destination-in";
          lc.drawImage(mask, 0, 0);
          ctx.globalCompositeOperation = "lighter";
          ctx.drawImage(masked, dx, dy, w * scale, h * scale);
        });
        ctx.globalCompositeOperation = "source-over";
        target.dataset["revision"] = String(performance.now());
      };
      setReady(true); setPainting(true);
      const start = performance.now();
      let done = false;
      const complete = () => { if (done) return; done = true; time = 1; stop(); draw(); setPainting(false); };
      finish.current = complete;
      stop = onInkFrame(({ now }) => { time = Math.min(1, (now - start) / OPENING_MS); if (time >= 1) { complete(); return; } draw(); });
      const output = wet.current;
      const scope = target.closest<HTMLElement>("section");
      if (output && scope) disposeWet = wetSurface(target, output, scope);
      resize = new ResizeObserver(() => { bounds = target.getBoundingClientRect(); if (done) draw(); });
      resize.observe(target);
    }).catch(() => { setReady(false); setPainting(false); });
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") finish.current(); };
    window.addEventListener("keydown", key);
    return () => { cancelled = true; stop(); disposeWet(); resize?.disconnect(); window.removeEventListener("keydown", key); };
  }, []);
  return <>
    <div className="hero-paint-art" role="img" aria-label="Sumi-e ink landscape: a black cliff with pines, misty peaks and a vermilion sun" data-opening={painting ? "painting" : "complete"}>
      <img src={hero} alt="" width={1920} height={1088} className={ready ? "hero-fallback hero-fallback-hidden" : "hero-fallback"} />
      <canvas ref={canvas} className="hero-pigment-canvas" aria-hidden="true" />
      <canvas ref={wet} className="hero-pigment-canvas wet-output" aria-hidden="true" data-wet="hero" />
    </div>
    {painting && <Button variant="ghost" className="opening-skip eyebrow" onClick={() => finish.current()}>Skip</Button>}
  </>;
}
