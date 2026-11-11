import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Global smooth inertial scrolling via Lenis.
 * Automatically respects prefers-reduced-motion, adjusts for dialog overlays,
 * and handles anchor link transitions smoothly.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: true,
      anchors: true,
      prevent: (node: Node) => {
        if (!node || node.nodeType !== 1) return false;
        const el = node as Element;
        return Boolean(el.closest('[data-lenis-prevent], [role="dialog"], [aria-modal="true"]'));
      },
    });

    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

