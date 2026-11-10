import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import inkWash from "@/assets/ink-wash.jpg";
import { experience, otherProjects, playground, profile, projects, stack, type Project } from "@/content/portfolio";
import { Reveal, Seal, SectionHead, TiltCard } from "@/components/ink/primitives";
import { TimelineStroke } from "@/components/ink/scroll-paint";
import { HeroPaint } from "@/components/ink/hero-paint";
import { InkMural } from "@/components/ink/ink-mural";
import { Button } from "@/components/ui/button";
import { WetArt } from "@/components/ink/wet-art";

const TITLE = "Subham Ghosh — Creative Developer & 3D Explorer";
const DESC = "Portfolio of Subham Ghosh, frontend developer in Bengaluru, India — selected web work, experience, and 3D / game development explorations.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState<Project | null>(null);
  return (
    <div className="grain relative min-h-screen overflow-x-clip">
      <a href="#work" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-washi">Skip to content</a>
      <InkMural />
      <main className="relative z-10">
        <Hero />
        <Work onOpen={setOpen} />
        <About />
        <Playground />
        <Contact />
      </main>
      <AnimatePresence>{open && <ProjectOverlay project={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[94svh] items-end overflow-hidden bg-background pt-40"
    >
      <HeroPaint />
      <div className="mist pointer-events-none absolute inset-x-[-10%] bottom-0 z-[1] h-4/5" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 md:px-10 md:pb-16">
        <div className="mb-6 flex items-center gap-4">
          <Seal size={44} />
          <p className="eyebrow text-ink-soft">{profile.location} · {profile.role}</p>
        </div>
        <h1 className="hero-name font-display font-medium leading-[0.9]">
          {["SUBHAM", "GHOSH"].map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <span className={`block ${i === 1 ? "pl-6 italic md:pl-24" : ""}`}>
                {w}{i === 1 && <span className="text-vermilion">.</span>}
              </span>
            </span>
          ))}
        </h1>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-base leading-relaxed text-ink-soft md:text-lg">{profile.intro}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#work" className="bg-ink px-7 py-4 eyebrow text-washi transition-colors hover:bg-vermilion">View work</a>
            <a href="#contact" className="border border-ink px-7 py-4 eyebrow transition-colors hover:border-vermilion hover:text-vermilion">Get in touch</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Work({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <section id="work" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-28 md:px-10 md:py-40">
      <div className="hero-seam" aria-hidden="true" />
      <SectionHead num="01" label="Selected work" title={<>Work, brushed<br /><em className="text-vermilion">in ink.</em></>} />
      <div className="grid gap-16 md:gap-28">
        {projects.map((p, i) => (
          <div key={p.id}>
            <div className={`grid items-center gap-8 md:grid-cols-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <TiltCard className="md:col-span-7">
                <Button variant="ghost" type="button" onClick={() => onOpen(p)} className="art-mount paper group relative block h-auto w-full overflow-hidden whitespace-normal rounded-none p-3 text-left hover:bg-card md:p-4" aria-label={`Open case study: ${p.title}`}>
                  <img src={inkWash} alt="" loading="lazy" width={1200} height={912} className="absolute inset-0 h-full w-full object-cover opacity-40" aria-hidden="true" />
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <WetArt src={p.image} alt={`${p.title} screenshot`} className="h-full w-full" />
                  </div>
                  <span className="absolute right-6 top-6 bg-vermilion px-3 py-1 eyebrow text-[0.6rem] text-washi opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Open case</span>
                </Button>
              </TiltCard>
              <div className="washi-patch md:col-span-5">
                <p className="font-display text-7xl text-ink/10 md:text-8xl">{p.index}</p>
                <p className="eyebrow mt-2 text-vermilion">{p.kind}</p>
                <h3 className="mt-3 font-display text-4xl md:text-5xl">{p.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-ink-soft">{p.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">{p.stack.map((s) => <li key={s} className="border border-ink/20 px-3 py-1 font-mono text-xs">{s}</li>)}</ul>
                <div className="mt-7 flex flex-wrap gap-5">
                  <Button variant="link" type="button" onClick={() => onOpen(p)} className="eyebrow h-auto p-0 underline decoration-vermilion decoration-2 underline-offset-8 hover:text-vermilion">Case study</Button>
                  {p.live && <a href={p.live} target="_blank" rel="noreferrer" className="eyebrow hover:text-vermilion">Live ↗</a>}
                  {p.code && <a href={p.code} target="_blank" rel="noreferrer" className="eyebrow hover:text-vermilion">Code ↗</a>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Reveal className="washi-patch mt-28">
        <p className="eyebrow mb-6 text-ink-soft">Other noteworthy projects</p>
        <ul className="border-t border-ink/20">
          {otherProjects.map((o) => (
            <li key={o.title} className="group flex flex-col gap-3 border-b border-ink/20 py-6 md:flex-row md:items-center md:justify-between">
              <span className="font-display text-3xl transition-transform duration-500 group-hover:translate-x-3 md:text-4xl">{o.title}</span>
              <span className="flex gap-6">
                <a href={o.live} target="_blank" rel="noreferrer" className="eyebrow hover:text-vermilion">View project ↗</a>
                <a href={o.code} target="_blank" rel="noreferrer" className="eyebrow hover:text-vermilion">Code ↗</a>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function ProjectOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const dialog = closeRef.current?.closest('[role="dialog"]');
      const controls = dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = controls?.[0];
      const last = controls?.[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; prev?.focus(); };
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="case-title"
        className="paper relative max-h-[90vh] w-full max-w-4xl overflow-y-auto"
        initial={reduce ? false : { opacity: 0, y: 60, rotateX: 12, scale: 0.94 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={project.image} alt={`${project.title} screenshot`} className="aspect-[16/8] w-full object-cover" />
        <div className="relative p-6 md:p-12">
          <Seal size={48} className="absolute -top-6 right-8" />
          <p className="eyebrow text-vermilion">{project.index} · {project.kind}</p>
          <h3 id="case-title" className="mt-3 font-display text-4xl md:text-6xl">{project.title}</h3>
          <p className="mt-4 text-lg text-ink-soft">{project.summary}</p>
          <ul className="mt-8 space-y-3">{project.details.map((d) => <li key={d} className="flex gap-3"><span className="mt-2.5 h-1.5 w-4 shrink-0 bg-vermilion" />{d}</li>)}</ul>
          <ul className="mt-8 flex flex-wrap gap-2">{project.stack.map((s) => <li key={s} className="bg-ink px-3 py-1 font-mono text-xs text-washi">{s}</li>)}</ul>
          <div className="mt-10 flex flex-wrap gap-3">
            {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="bg-ink px-6 py-3 eyebrow text-washi hover:bg-vermilion">View live ↗</a>}
            {project.code && <a href={project.code} target="_blank" rel="noreferrer" className="border border-ink px-6 py-3 eyebrow hover:text-vermilion">GitHub ↗</a>}
            <Button variant="ghost" ref={closeRef} type="button" onClick={onClose} className="ml-auto eyebrow hover:text-vermilion">Close ✕</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-28 md:px-10">
      <SectionHead num="02" label="About" title={<>Path <em className="text-vermilion">&</em> tools.</>} />
      <div className="grid gap-16 md:grid-cols-12">
        <div className="washi-patch md:col-span-7">
          <p className="eyebrow mb-8 text-ink-soft">Experience</p>
          <ol className="timeline-ink relative pl-8">
            <TimelineStroke />
            {experience.map((e) => (
              <Reveal key={e.title}>
                <li className="relative pb-6">
                  <span className="absolute -left-[38px] top-1 h-3.5 w-3.5 rotate-45 bg-vermilion" aria-hidden="true" />
                  <p className="font-mono text-xs text-ink-soft">{e.period}</p>
                  <h3 className="mt-2 font-display text-3xl">{e.title}</h3>
                  <p className="mt-1 eyebrow">{e.org} · {e.mode} · <a href={e.link.href} target="_blank" rel="noreferrer" className="text-vermilion underline underline-offset-4">{e.link.label} ↗</a></p>
                  <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{e.body}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">{e.tags.map((t) => <li key={t} className="border border-ink/20 px-3 py-1 font-mono text-xs">{t}</li>)}</ul>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <div className="washi-patch md:col-span-5">
          <p className="eyebrow mb-8 text-ink-soft">Tech stack</p>
          <div className="space-y-6">
            {stack.map((g, i) => (
              <Reveal key={g.group} delay={i * 0.1}>
                <div className="tool-sheet p-6">
                  <h3 className="font-display text-xl">{g.group}</h3>
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">{g.items.map((s) => <li key={s} className="text-sm"><span className="mr-2 text-vermilion">·</span>{s}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Playground() {
  return (
    <section id="playground" className="playground-wash relative scroll-mt-20 overflow-hidden py-28 md:py-40">
      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="washi-patch mb-16">
          <p className="eyebrow text-vermilion">03 — Playground</p>
          <h2 className="playground-heading mt-3 font-display text-5xl leading-[0.95] md:text-7xl">Beyond the <em>browser.</em></h2>
        </Reveal>
        {[playground.modeling, playground.games].map((g) => (
          <div key={g.title} className="mb-24 last:mb-0">
            <Reveal className="washi-patch mb-8 grid gap-4 md:grid-cols-2">
              <h3 className="playground-heading font-display text-3xl md:text-4xl">{g.title}</h3>
              <p className="playground-description leading-relaxed">{g.body}</p>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {g.renders.map((r, i) => (
                <div key={r.title}>
                  <TiltCard>
                    <figure className={`art-mount group bg-card p-2 pb-4 text-ink ${i === 1 ? "md:translate-y-10" : ""}`}>
                      <div className="overflow-hidden"><WetArt src={r.src} alt={`${r.title} 3D render`} className="aspect-[4/3] w-full" /></div>
                      <figcaption className="mt-3 flex justify-between px-1"><span className="font-display">{r.title}</span><span className="eyebrow text-[0.6rem] text-vermilion">{r.tool}</span></figcaption>
                    </figure>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.location.href = `mailto:${profile.email}`; }
  };
  return (
    <section id="contact" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-28 md:px-10 md:py-40">
      <SectionHead num="04" label="Contact" title={<>Let's make<br />something <em className="text-vermilion">vivid.</em></>} />
      <Reveal className="washi-patch">
        <a href={`mailto:${profile.email}`} className="contact-email block font-display underline decoration-vermilion decoration-2 underline-offset-[10px] hover:text-vermilion">{profile.email}</a>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={copy} className="h-auto rounded-none px-7 py-4 eyebrow hover:bg-vermilion">{copied ? "Copied ✓" : "Copy email"}</Button>
          <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="border border-ink px-7 py-4 eyebrow hover:text-vermilion">View CV ↗</a>
          {profile.socials.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="border border-ink px-7 py-4 eyebrow hover:text-vermilion">{s.label} ↗</a>)}
          <span role="status" aria-live="polite" className="sr-only">{copied ? "Email copied to clipboard" : ""}</span>
        </div>
      </Reveal>
    </section>
  );
}
