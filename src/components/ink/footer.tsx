import { useEffect, useState } from "react";
import { profile } from "@/content/portfolio";
import { Seal } from "./primitives";
import { ArrowUp, Clock, Github, Mail, FileText } from "lucide-react";

export function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const ist = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date());
        setTime(ist);
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-10 border-t border-ink/15 bg-card/40 backdrop-blur-xs mt-20">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between pb-10 border-b border-ink/10">
          <div className="flex items-center gap-4">
            <Seal size={40} />
            <div>
              <p className="font-display font-medium text-lg leading-tight text-ink">
                {profile.name}
              </p>
              <p className="eyebrow text-xs text-ink-soft mt-0.5">
                {profile.role} · {profile.location}
              </p>
            </div>
          </div>

          {/* Live Bengaluru Time indicator */}
          <div className="flex items-center gap-2 border border-ink/15 bg-washi/80 px-4 py-2 w-fit">
            <Clock size={14} className="text-vermilion animate-pulse" />
            <div className="flex flex-col">
              <span className="eyebrow text-[0.62rem] text-ink-soft">Bengaluru, IN (IST)</span>
              <span className="font-mono text-xs font-medium text-ink">{time || "12:00:00 PM"}</span>
            </div>
          </div>

          {/* Socials & Back to Top */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 border border-ink/20 px-3.5 py-2 eyebrow text-xs hover:border-vermilion hover:text-vermilion transition-colors"
              title="Email Subham"
            >
              <Mail size={13} />
              <span>Email</span>
            </a>
            {profile.socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-ink/20 px-3.5 py-2 eyebrow text-xs hover:border-vermilion hover:text-vermilion transition-colors"
              >
                <Github size={13} />
                <span>{s.label}</span>
              </a>
            ))}
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border border-ink/20 px-3.5 py-2 eyebrow text-xs hover:border-vermilion hover:text-vermilion transition-colors"
            >
              <FileText size={13} />
              <span>CV</span>
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 bg-ink text-washi px-3.5 py-2 eyebrow text-xs hover:bg-vermilion transition-colors cursor-pointer ml-auto md:ml-0"
              aria-label="Back to top"
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-soft">
          <p className="eyebrow text-[0.65rem]">
            © {new Date().getFullYear()} Subham Ghosh. All rights reserved.
          </p>
          <p className="font-mono text-[0.68rem]">
            Brushed with ink, crafted with TanStack Start & React 19.
          </p>
        </div>
      </div>
    </footer>
  );
}
