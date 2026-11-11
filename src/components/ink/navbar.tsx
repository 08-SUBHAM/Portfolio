import { useEffect, useState } from "react";
import { profile } from "@/content/portfolio";
import { Seal } from "./primitives";
import { ArrowUpRight, Menu, X, FileText } from "lucide-react";

const SECTIONS = [
  { id: "work", num: "01", label: "Work" },
  { id: "about", num: "02", label: "About" },
  { id: "playground", num: "03", label: "Playground" },
  { id: "contact", num: "04", label: "Contact" },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Determine active section
      const scrollPos = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          return;
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const target = id === "top" ? 0 : document.getElementById(id);
    if (window.__lenis) {
      window.__lenis.scrollTo(target || 0);
    } else if (target && typeof target !== "number") {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-washi/90 backdrop-blur-md border-b border-ink/10 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-10">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => scrollTo("top")}
          className="group flex items-center gap-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
          aria-label="Subham Ghosh, scroll to top"
        >
          <Seal size={32} className="transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-display font-semibold tracking-wide text-ink text-sm sm:text-base leading-none">
              SUBHAM GHOSH
            </span>
            <span className="eyebrow text-[0.62rem] text-ink-soft leading-tight mt-0.5 hidden sm:inline-block">
              Bengaluru, IN
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(sec.id);
                }}
                className={`relative px-3.5 py-1.5 eyebrow text-xs transition-colors rounded-none ${
                  isActive
                    ? "text-vermilion font-medium"
                    : "text-ink/70 hover:text-ink hover:bg-ink/5"
                }`}
              >
                <span className="text-[0.65rem] opacity-40 mr-1">{sec.num}</span>
                {sec.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-vermilion" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Status Pill & Resume Action */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 border border-ink/15 bg-card/60 px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="eyebrow text-[0.65rem] text-ink-soft">Available for work</span>
          </div>

          <a
            href={profile.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-ink px-4 py-2 eyebrow text-xs hover:bg-ink hover:text-washi transition-all duration-200"
          >
            <FileText size={12} />
            <span>Resume</span>
            <ArrowUpRight size={12} />
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={profile.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="border border-ink/40 px-2.5 py-1.5 eyebrow text-[0.65rem] hover:bg-ink hover:text-washi"
          >
            CV ↗
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-ink hover:text-vermilion cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-ink/10 bg-washi/95 backdrop-blur-lg px-6 py-6 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="eyebrow text-[0.7rem] text-ink-soft">Available for work</span>
            </div>
            <span className="font-mono text-xs text-ink/50">{profile.location}</span>
          </div>

          <nav className="flex flex-col space-y-3">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(sec.id);
                }}
                className="flex items-center justify-between py-2 border-b border-ink/5 font-display text-xl text-ink hover:text-vermilion"
              >
                <span>{sec.label}</span>
                <span className="font-mono text-xs text-ink-soft">{sec.num}</span>
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="bg-ink px-4 py-3 eyebrow text-center text-washi hover:bg-vermilion transition-colors"
              >
                Get in touch
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
