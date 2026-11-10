import { useEffect, useRef } from "react";
import stain from "@/assets/mural/stain.webp";
import bloom from "@/assets/mural/bloom.webp";
import distant from "@/assets/mural/distant.webp";
import mid from "@/assets/mural/mid.webp";
import ridge from "@/assets/mural/ridge.webp";
import branch from "@/assets/mural/branch.webp";
import stroke from "@/assets/mural/stroke.webp";
import vermilion from "@/assets/mural/vermilion.webp";
import { buildMural, MURAL_CHAPTERS, type Deposit, type MuralAsset } from "./mural-plan";
import { wetSurface, type WetMotion } from "./wet-surface";
import { ART_DEPTH } from "./wet-math";

const SOURCES: Record<MuralAsset, string> = { stain, bloom, distant, mid, ridge, branch, stroke, vermilion };

/**
 * One fixed Canvas2D behind all content. It renders the viewport slice of a single,
 * always fully painted page-tall composition. Scrolling only moves the viewport over it;
 * nothing is uncovered, wiped or masked by scroll.
 */
export function InkMural() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wet = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false, ready = false, plan: Deposit[] = [], ratio = 1, vw = 0, vh = 0;
    const images = {} as Record<MuralAsset, HTMLImageElement>;

    const measure = () => {
      vw = document.documentElement.clientWidth; vh = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio || 1, vw < 768 ? 1 : 1.5);
      canvas.width = Math.round(vw * ratio); canvas.height = Math.round(vh * ratio);
      const regions = MURAL_CHAPTERS.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ id, top: r.top + window.scrollY, height: r.height }];
      });
      plan = buildMural(regions, vw, vh, Math.max(0, document.documentElement.scrollHeight - vh));
    };

    let revision = 0;
    let motion: WetMotion = { x: 0, y: 0, scroll: 0, time: 0 };
    const draw = () => {
      if (!ready || cancelled) return;
      const y0 = window.scrollY;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      let painted = 0, ink = 0;
      for (const d of plan) {
        const img = images[d.asset];
        const sy = d.y - y0, pad = Math.max(d.w, d.h) * 0.2;
        if (!img || sy > vh + pad || sy + d.h < -pad) continue;
        ink += d.alpha;
        ctx.save();
        const depth = ART_DEPTH[d.asset];
        const drift = reduce ? 0 : Math.sin(motion.time * 0.13 + d.seed) * (1 - depth) * 2;
        ctx.translate(d.x + d.w / 2 + motion.x * depth * 14 + drift, sy + d.h / 2 + motion.y * depth * 9);
        ctx.rotate(d.rot);
        if (d.flip) ctx.scale(-1, 1);
        ctx.globalAlpha = d.alpha;
        ctx.drawImage(img, -d.w / 2, -d.h / 2, d.w, d.h);
        painted++;
        ctx.restore();
      }
      canvas.dataset["deposits"] = String(plan.length);
      canvas.dataset["painted"] = String(painted);
      canvas.dataset["ink"] = ink.toFixed(2);
      canvas.dataset["revision"] = String(++revision);
    };
    let scrolling = 0;
    const queue = () => { scrolling = performance.now(); draw(); };
    let disposeWet = () => {};
    let resizeTimer = 0;
    const onResize = () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => { measure(); queue(); }, 120); };

    const loads = (Object.keys(SOURCES) as MuralAsset[]).map((key) => {
      const img = new Image();
      img.src = SOURCES[key];
      images[key] = img;
      return img.decode();
    });
    void Promise.all(loads).then(() => {
      if (cancelled) return;
      ready = true;
      measure();
      canvas.dataset["ready"] = "true";
      draw();
      const output = wet.current;
      if (output) {
        let last = 0;
        disposeWet = wetSurface(canvas, output, canvas, (next) => {
          motion = next;
          if (next.time - last > 1 / 24) { last = next.time; draw(); }
        }, { fade: true, attach: true, hold: () => performance.now() - scrolling < 180, ignore: (t) => t instanceof Element && !!t.closest('.wet-art, [role=dialog]') });
      }
    }).catch(() => { canvas.dataset["ready"] = "error"; });

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);
    return () => {
      cancelled = true;
      disposeWet();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);
  return <><canvas ref={ref} className="ink-mural" aria-hidden="true" /><canvas ref={wet} className="ink-mural wet-output" aria-hidden="true" data-wet="mural" /></>;
}
