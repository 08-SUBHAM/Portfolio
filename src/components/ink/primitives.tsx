import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";

export function Seal({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="6" className="fill-vermilion" />
      <rect x="10" y="10" width="44" height="44" rx="3" fill="none" className="stroke-washi" strokeWidth="2.5" />
      <path d="M22 22h20M32 22v20M22 42h20" className="stroke-washi" strokeWidth="4" strokeLinecap="square" fill="none" />
      <circle cx="47" cy="47" r="2" className="fill-washi" />
    </svg>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function SectionHead({ num, label, title }: { num: string; label: string; title: ReactNode }) {
  return (
    <Reveal className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="washi-patch">
        <p className="eyebrow text-vermilion">{num} — {label}</p>
        <h2 className="chapter-title mt-3 font-display text-5xl leading-[0.95] md:text-7xl">{title}</h2>
      </div>
    </Reveal>
  );
}

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}
