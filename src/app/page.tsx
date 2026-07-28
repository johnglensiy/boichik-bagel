"use client";

import { useState, useEffect, useMemo } from "react";

/**
 * Portfolio2a — warm-neutral single-page portfolio.
 * Tailwind + TypeScript. Types intentionally left loose — tighten as you like.
 *
 * Props:
 *   openToWork  show the "Open to work" pill (default true)
 *   autoplay    auto-advance the project carousel (default false)
 *   pinSidebar  keep the sidebar open always (default false)
 *
 * Fonts: add this once in your document <head>:
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
 *
 * Tailwind: these use arbitrary values for the warm-neutral palette + font stacks,
 * so no tailwind.config changes are required. Optionally alias them as theme tokens.
 */

interface Props {
  openToWork?: boolean;
  autoplay?: boolean;
  pinSidebar?: boolean;
}

const TABS = [
  { id: "software", label: "Software" },
  { id: "data", label: "Data & NLP" },
  { id: "hw", label: "Hardware" },
];

const PROJECTS = [
  {
    tab: "software",
    title: "Gitlet",
    tech: "Java",
    year: "2022",
    img: "gitlet.png",
    blurb:
      "Git's version control, rebuilt from scratch in Java — content-addressed commits, branching, and merges with conflict detection.",
  },
  {
    tab: "software",
    title: "Secure File Sharing",
    tech: "Golang",
    year: "2023",
    img: "secure-fs.png",
    blurb:
      "End-to-end encrypted file client, secure even against a malicious server. Built the crypto layer from primitives.",
  },
  {
    tab: "software",
    title: "SQL Query Optimizer",
    tech: "Java",
    year: "2023",
    img: "sql-opt.png",
    blurb:
      "Faster SQL engines through cost-based query-plan optimization and join reordering.",
  },
  {
    tab: "data",
    title: "Avolingo",
    tech: "PyTorch",
    year: "2023",
    img: "avolingo.png",
    blurb:
      "Neural translation across 40+ languages with a sequence-to-sequence model in PyTorch.",
  },
  {
    tab: "hw",
    title: "S1XT33N",
    tech: "Arduino",
    year: "2023",
    img: "s1xt33n.png",
    blurb:
      "A voice-controlled autonomous car — PCA command classification driving a tuned closed-loop controller.",
  },
  {
    tab: "hw",
    title: "RISC-V CPU",
    tech: "Logisim",
    year: "2023",
    img: "riscv.png",
    blurb:
      "A working pipelined RISC-V CPU designed and built gate-by-gate in Logisim.",
  },
];

const TIMELINE = [
  { year: "2023", title: "Secure File Sharing", filled: true },
  { year: "2023", title: "Avolingo", filled: false },
  { year: "2022", title: "Gitlet", filled: false },
];

const NAV = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects", active: true },
  { href: "#coursework", label: "Coursework" },
  { href: "#contact", label: "Contact" },
];

const FONT_GROTESK = "font-['Space_Grotesk']";
const FONT_MONO = "font-['IBM_Plex_Mono']";
const FONT_SERIF = "font-['Newsreader']";

export default function Portfolio2a({
  openToWork = true,
  autoplay = false,
  pinSidebar = false,
}: Props) {
  const [tab, setTab] = useState("software");
  const [index, setIndex] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);

  const list = useMemo(() => PROJECTS.filter((p) => p.tab === tab), [tab]);
  const count = list.length;

  // Reveal sidebar once the hero scrolls out of view.
  // Measured from getBoundingClientRect (robust inside nested/scaled/transformed
  // containers where IntersectionObserver's viewport root misreports).
  useEffect(() => {
    const measure = () => {
      const hero = document.getElementById("about");
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Hero still "on screen" while its bottom is below 20% of the viewport height.
      setHeroVisible(r.bottom > vh * 0.2);
    };
    measure();
    window.addEventListener("scroll", measure, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", measure, { passive: true });
    // Fallback for realms that don't deliver scroll events on position change.
    const poll = setInterval(measure, 150);
    return () => {
      window.removeEventListener("scroll", measure, { capture: true } as any);
      window.removeEventListener("resize", measure);
      clearInterval(poll);
    };
  }, []);

  // Carousel autoplay.
  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearInterval(t);
  }, [autoplay, count]);

  // Reset carousel when the tab changes.
  useEffect(() => setIndex(0), [tab]);

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  const sidebarShown = pinSidebar || !heroVisible;
  const arrowCls = `shrink-0 w-10 h-10 rounded-full bg-[#f4efe7] border border-[#e0d7c8] flex items-center justify-center text-base ${FONT_GROTESK} text-[#8f8172] cursor-pointer select-none`;

  return (
    <div
      className={`bg-[#f7f3ec] ${FONT_GROTESK} [&_a]:text-[#c47b52] [&_a:hover]:text-[#a5613b] scroll-smooth`}
    >
      {/* Sidebar */}
      <aside
        style={{
          transform: sidebarShown ? "translateX(0)" : "translateX(-102%)",
        }}
        className="fixed top-0 left-0 w-[236px] h-screen bg-[#f2efe9] border-r border-[#ddd6c8] z-[60] transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)] flex flex-col px-6 py-[30px] shadow-[6px_0_30px_rgba(60,50,35,.06)]"
      >
        <div
          className={`w-[54px] h-[54px] rounded-full bg-[repeating-linear-gradient(45deg,#e2dbcc,#e2dbcc_5px,#eae4d7_5px,#eae4d7_10px)] flex items-center justify-center text-[9px] ${FONT_MONO} text-[#a89b85] mb-3`}
        >
          photo
        </div>
        <div
          className={`text-[17px] font-semibold ${FONT_SERIF} text-[#33302a]`}
        >
          John Glen Siy
        </div>
        <div
          className={`text-[11.5px] leading-[1.5] ${FONT_GROTESK} text-[#8d8677] mt-0.5`}
        >
          EECS @ Berkeley
        </div>
        <nav
          className={`flex flex-col gap-[9px] mt-[26px] text-[12px] ${FONT_GROTESK}`}
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={`pl-[11px] border-l-2 ${n.active ? "text-[#33302a] font-medium border-[#c47b52]" : "text-[#8d8677] border-transparent"}`}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div
          className={`mt-[30px] pt-[22px] border-t border-[#ddd6c8] text-[10.5px] ${FONT_MONO} text-[#a89b85] tracking-[.02em]`}
        >
          RECENTLY
        </div>
        <div className="flex flex-col mt-[14px]">
          {TIMELINE.map((t, i) => {
            const last = i === TIMELINE.length - 1;
            return (
              <div key={i} className="flex gap-[11px]">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-2 h-2 rounded-full mt-1 ${t.filled ? "bg-[#c47b52]" : "bg-[#f2efe9] border-2 border-[#c47b52]"}`}
                  />
                  {!last && <span className="w-px flex-1 bg-[#ddd6c8]" />}
                </div>
                <div className={last ? "" : "pb-[15px]"}>
                  <div className={`text-[10px] ${FONT_MONO} text-[#a89b85]`}>
                    {t.year}
                  </div>
                  <div
                    className={`text-[12.5px] font-medium ${FONT_GROTESK} text-[#33302a]`}
                  >
                    {t.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={`mt-auto text-[10px] ${FONT_MONO} text-[#b3a794] pt-5`}>
          visitor #68
        </div>
      </aside>

      {/* Hero — shifts right instead of letting the fixed sidebar cover it */}
      <div
        style={{
          marginLeft: sidebarShown ? "236px" : "0",
        }}
        className="transition-[margin-left] duration-[550ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
      >
        <section
          id="about"
          className="min-h-screen relative flex flex-col px-[clamp(28px,6vw,90px)]"
        >
          <header className="flex justify-between items-center py-[26px]">
            <span
              className={`text-[13px] font-semibold ${FONT_GROTESK} text-[#2e2a24]`}
            >
              John Glen Siy
            </span>
            <div
              className={`flex items-center gap-[22px] text-[12px] ${FONT_GROTESK} text-[#8a8072]`}
            >
              <a href="#about" className="!text-[#8a8072]">
                About
              </a>
              <a href="#projects" className="!text-[#8a8072]">
                Work
              </a>
              <a href="#coursework" className="!text-[#8a8072]">
                Coursework
              </a>
              {openToWork && (
                <span
                  className={`inline-flex items-center gap-[7px] text-[11px] font-medium ${FONT_GROTESK} text-[#5c7a52] bg-[#e7ecdf] border border-[#d4dcc6] rounded-full px-3 py-[5px]`}
                >
                  <span className="w-[7px] h-[7px] rounded-full bg-[#7a9c64] block" />
                  Open to work
                </span>
              )}
              <a
                href="#contact"
                className="!text-[#2e2a24] border-b-[1.5px] border-[#c47b52] pb-0.5"
              >
                Contact ↗
              </a>
            </div>
          </header>
          <div className="flex-1 grid grid-cols-[1.05fr_.95fr] gap-12 items-center pb-[60px]">
            <div>
              <h1
                className={`m-0 text-[clamp(34px,4.4vw,56px)] leading-[1.1] ${FONT_SERIF} text-[#2e2a24] tracking-[-.01em]`}
              >
                Hi, I'm John
              </h1>
              <p
                className={`text-[13.5px] leading-[1.7] ${FONT_GROTESK} text-[#8a8072] mt-[22px] max-w-[430px]`}
              >
                Currently building full-stack software for distributed systems -
                and fun data projects on the side.
                <br />
                Former EECS @ Berkeley.
              </p>
              <div className="flex gap-3 mt-[30px]">
                <a
                  href="#projects"
                  className={`text-[12.5px] font-medium ${FONT_GROTESK} !text-[#f7f3ec] bg-[#2e2a24] rounded-[10px] px-5 py-[11px]`}
                >
                  See my work
                </a>
                <a
                  href="#contact"
                  className={`text-[12.5px] font-medium ${FONT_GROTESK} !text-[#5c5346] bg-[#efe9dd] border border-[#e2dbcc] rounded-[10px] px-5 py-[11px]`}
                >
                  Résumé ↓
                </a>
              </div>
            </div>
            <div className="aspect-[1/.82] rounded-[20px] bg-[#ece5d8] border border-[#ddd6c8] shadow-[0_2px_20px_rgba(60,50,35,.06)] flex flex-col items-center justify-center gap-2.5">
              <div className="w-16 h-16 rounded-[14px] bg-[repeating-linear-gradient(45deg,#e0d7c8,#e0d7c8_7px,#e7dfd0_7px,#e7dfd0_14px)]" />
              <div
                className={`text-[12px] font-medium ${FONT_MONO} text-[#a89b85]`}
              >
                San Francisco diorama
              </div>
              <div className={`text-[11px] ${FONT_GROTESK} text-[#b3a794]`}>
                3D hero — dropping in next
              </div>
            </div>
          </div>
          <div
            className={`absolute left-1/2 bottom-[26px] -translate-x-1/2 flex flex-col items-center gap-1.5 text-[10.5px] ${FONT_MONO} text-[#b3a794]`}
          >
            scroll<span className="text-sm">↓</span>
          </div>
        </section>
      </div>

      {/* Projects + Contact — fade in from below instead of shifting right */}
      <div
        style={{
          opacity: sidebarShown ? 1 : 0,
          transform: sidebarShown ? "translateY(0)" : "translateY(24px)",
        }}
        className="transition-[opacity,transform] duration-[550ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
      >
        <section
          id="projects"
          className="min-h-screen flex flex-col justify-center py-[70px] px-[clamp(28px,6vw,90px)] bg-[#f7f3ec]"
        >
          <div className="flex justify-between items-baseline max-w-[860px] mx-auto mb-1 w-full">
            <div
              className={`text-[30px] leading-[1.1] font-medium ${FONT_SERIF} text-[#3a342c]`}
            >
              Selected work
            </div>
            <div className={`text-[11px] ${FONT_MONO} text-[#a89b85]`}>
              {index + 1} / {count}
            </div>
          </div>
          <div className="flex gap-2 mt-5 mx-auto max-w-[860px] w-full">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <span
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`cursor-pointer text-[12px] font-medium ${FONT_GROTESK} rounded-[9px] px-4 py-2 transition-all duration-[180ms] select-none ${active ? "text-[#f4efe7] bg-[#3a342c]" : "text-[#6d6154] bg-[#e0d7c8]"}`}
                >
                  {t.label}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-4 max-w-[860px] w-full mx-auto mt-[22px]">
            <span onClick={prev} className={arrowCls}>
              ‹
            </span>
            <div className="flex-1 overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
                style={{ transform: `translateX(${-index * 100}%)` }}
              >
                {list.map((p, i) => (
                  <div
                    key={p.title}
                    className="shrink-0 w-full bg-[#f4efe7] p-[26px] flex gap-6 items-center"
                  >
                    <div
                      className={`w-[200px] h-[132px] shrink-0 rounded-[10px] bg-[repeating-linear-gradient(45deg,#e4dccd,#e4dccd_7px,#ece5d8_7px,#ece5d8_14px)] flex items-center justify-center text-[10px] ${FONT_MONO} text-[#a89b85]`}
                    >
                      {p.img}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-[10.5px] ${FONT_MONO} text-[#c47b52]`}
                      >
                        {String(i + 1).padStart(2, "0")} — {p.year}
                      </div>
                      <div
                        className={`text-[21px] font-semibold ${FONT_GROTESK} text-[#3a342c] my-[6px]`}
                      >
                        {p.title}
                      </div>
                      <div
                        className={`text-[12.5px] leading-[1.6] ${FONT_GROTESK} text-[#8f8172] max-w-[340px]`}
                      >
                        {p.blurb}
                      </div>
                      <div className="flex gap-[7px] mt-4">
                        <span
                          className={`text-[10px] font-medium ${FONT_MONO} text-[#7a6e5c] bg-[#e4dccd] rounded-full px-[11px] py-1`}
                        >
                          {p.tech}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <span onClick={next} className={arrowCls}>
              ›
            </span>
          </div>
          <div className="flex justify-center gap-[7px] mt-5">
            {list.map((_, i) => (
              <span
                key={i}
                onClick={() => setIndex(i)}
                className={`h-[5px] rounded-[3px] cursor-pointer transition-[width,background] duration-[250ms] ${i === index ? "w-5 bg-[#c47b52]" : "w-2 bg-[#d4c9b6]"}`}
              />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="py-[60px] px-[clamp(28px,6vw,90px)] bg-[#f7f3ec] flex flex-col items-center gap-[14px] text-center"
        >
          <div
            id="coursework"
            className={`text-[26px] ${FONT_SERIF} text-[#2e2a24]`}
          >
            Let's build something that lasts.
          </div>
          <div
            className={`flex gap-[22px] text-[12px] font-medium ${FONT_GROTESK} mt-1`}
          >
            {["Email", "GitHub", "LinkedIn", "Résumé ↓"].map((l) => (
              <a key={l} href="#" className="!text-[#5c5346]">
                {l}
              </a>
            ))}
          </div>
          <div
            className={`text-[10.5px] ${FONT_MONO} text-[#b3a794] mt-[18px]`}
          >
            © 2026 John Glen Siy · visitor #68
          </div>
        </section>
      </div>
    </div>
  );
}
