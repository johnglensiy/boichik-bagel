"use client";

import { useState, useEffect } from "react";
import ContentSection, { type Project } from "./sections/ContentSection";
import HeroReel, { type HeroClip } from "@/components/HeroReel";

const PROJECTS: Project[] = [
  {
    tab: "software",
    title: "Real",
    tagline: "Live tennis scores, overlaid on Google search.",
    stack: ["TypeScript", "Redis", "Playwright"],
    year: "2026",
    img: "real.png",
    blurb:
      "Live tennis scores overlaid on Google search — Playwright scrapers publish over Redis pub/sub to a horizontally scaling SSE tier, with physics-based point replays.",
    github: "",
  },
  {
    tab: "software",
    title: "Gitlet",
    tagline: "Git's version control, rebuilt from scratch in Java.",
    stack: ["Java", "Git"],
    year: "2022",
    img: "gitlet.png",
    blurb:
      "Git's version control, rebuilt from scratch in Java — content-addressed commits, branching, and merges with conflict detection.",
    github: "",
    video: "demo.mp4",
    poster: "gitlet.png",
  },
  {
    tab: "software",
    title: "Secure File Sharing",
    tagline: "End-to-end encrypted file sharing, safe from its own server.",
    stack: ["Golang"],
    year: "2023",
    img: "secure-fs.png",
    blurb:
      "End-to-end encrypted file client, secure even against a malicious server. Built the crypto layer from primitives.",
    github: "",
  },
  {
    tab: "software",
    title: "SQL Query Optimizer",
    tagline: "Cost-based query planning that makes SQL engines faster.",
    stack: ["Java"],
    year: "2023",
    img: "sql-opt.png",
    blurb:
      "Faster SQL engines through cost-based query-plan optimization and join reordering.",
    github: "",
  },
  {
    tab: "software",
    title: "Pac-Man AI",
    tagline: "Search, game trees, and Q-learning agents that play Pac-Man.",
    stack: ["Python", "NumPy"],
    year: "2024",
    img: "pacman.png",
    blurb:
      "A full stack of AI agents for Pac-Man — A* search, minimax and expectimax game trees, particle-filter ghost tracking, and Q-learning, with the neural nets written straight from NumPy.",
    github: "",
  },
  {
    tab: "data",
    title: "Avolingo",
    tagline: "Neural translation across 40+ languages.",
    stack: ["PyTorch", "HuggingFace"],
    year: "2023",
    img: "avolingo.png",
    blurb:
      "Neural translation across 40+ languages with a sequence-to-sequence model in PyTorch.",
    github: "",
  },
  {
    tab: "data",
    title: "Spam Email Classifier",
    tagline: "Telling spam from ham with logistic regression.",
    stack: ["Python", "Pandas", "scikit-learn"],
    year: "2021",
    img: "spam-classifier.png",
    blurb:
      "Email spam detection built on hand-engineered text features and a logistic regression classifier, tuned against precision/recall tradeoffs on a held-out set.",
    github: "",
  },
  {
    tab: "data",
    title: "ATP Player Analysis",
    tagline: "What match data says about how pros actually win.",
    stack: ["Python", "Pandas", "Matplotlib"],
    year: "2025",
    img: "atp.png",
    blurb:
      "Exploratory analysis of ATP tour match data — serve and return splits, surface effects, and head-to-head trends pulled apart to see what separates players at the top.",
    github: "",
  },
  {
    tab: "hw",
    title: "S1XT33N",
    tagline: "A voice-controlled car that drives itself.",
    stack: ["Python", "Arduino"],
    year: "2023",
    img: "s1xt33n.png",
    blurb:
      "A voice-controlled autonomous car — PCA command classification driving a tuned closed-loop controller.",
    github: "",
  },
  {
    tab: "hw",
    title: "RISC-V CPU",
    tagline: "A pipelined RISC-V CPU built gate by gate.",
    stack: ["Logisim", "RISC-V assembly"],
    year: "2023",
    img: "riscv.png",
    blurb:
      "A working pipelined RISC-V CPU designed and built gate-by-gate in Logisim.",
    github: "",
  },
];

// Every project with a recorded clip, in PROJECTS order — the hero reel plays
// through them back to back, so adding a `video` to a project adds it here.
const HERO_CLIPS: HeroClip[] = PROJECTS.filter((p) => p.video).map((p) => ({
  title: p.title,
  tagline: p.tagline,
  video: `/videos/${p.video}`,
  poster: p.poster && `/images/projects/${p.poster}`,
}));

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

const PIN_SIDEBAR = false;

export default function Page() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(
    PROJECTS[0] ?? null,
  );

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

  const sidebarShown = PIN_SIDEBAR || !heroVisible;

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
        {/* <div
          className={`w-[54px] h-[54px] rounded-full bg-[repeating-linear-gradient(45deg,#e2dbcc,#e2dbcc_5px,#eae4d7_5px,#eae4d7_10px)] flex items-center justify-center text-[9px] ${FONT_MONO} text-[#a89b85] mb-3`}
        >
          photo
        </div> */}
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
        <div className="flex items-center gap-[14px] mt-3">
          <a
            href="https://www.linkedin.com/in/johnglensiy/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-[#a89b85] hover:text-[#c47b52] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.7065 3H4.34844C3.62264 3 3.04199 3.58065 3.04199 4.30645V19.6935C3.04199 20.3903 3.62264 21 4.34844 21H19.6485C20.3743 21 20.9549 20.4194 20.9549 19.6935V4.27742C21.013 3.58065 20.4323 3 19.7065 3ZM8.35491 18.3H5.71297V9.73548H8.35491V18.3ZM7.01942 8.54516C6.14846 8.54516 5.4807 7.84839 5.4807 7.00645C5.4807 6.16452 6.17749 5.46774 7.01942 5.46774C7.86136 5.46774 8.55813 6.16452 8.55813 7.00645C8.55813 7.84839 7.91942 8.54516 7.01942 8.54516ZM18.371 18.3H15.7291V14.1484C15.7291 13.1613 15.7001 11.8548 14.3356 11.8548C12.942 11.8548 12.7388 12.9581 12.7388 14.0613V18.3H10.0968V9.73548H12.6807V10.9258H12.7097C13.0872 10.229 13.9291 9.53226 15.2356 9.53226C17.9356 9.53226 18.4291 11.2742 18.4291 13.6548V18.3H18.371Z" />
            </svg>
          </a>
          <a
            href="https://github.com/johnglensiy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-[#a89b85] hover:text-[#c47b52] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.24902C6.51613 2.24902 2 6.70064 2 12.249C2 16.6361 4.87097 20.3781 8.87097 21.7329C9.3871 21.8297 9.54839 21.5071 9.54839 21.2813C9.54839 21.0555 9.54839 20.4103 9.51613 19.5393C6.74194 20.1845 6.16129 18.1845 6.16129 18.1845C5.70968 17.0555 5.03226 16.7329 5.03226 16.7329C4.12903 16.0877 5.06452 16.0877 5.06452 16.0877C6.06452 16.12 6.6129 17.12 6.6129 17.12C7.48387 18.6684 8.96774 18.2168 9.51613 17.9264C9.6129 17.2813 9.87097 16.8297 10.1613 16.5716C7.96774 16.3458 5.6129 15.4748 5.6129 11.6684C5.6129 10.5716 6.03226 9.70064 6.64516 9.02322C6.54839 8.79741 6.19355 7.76515 6.74194 6.37806C6.74194 6.37806 7.6129 6.11999 9.51613 7.41031C10.3226 7.18451 11.1613 7.05548 12.0323 7.05548C12.9032 7.05548 13.7742 7.15225 14.5484 7.41031C16.4516 6.15225 17.2903 6.37806 17.2903 6.37806C17.8387 7.73289 17.5161 8.79741 17.3871 9.02322C18.0323 9.70064 18.4194 10.6039 18.4194 11.6684C18.4194 15.4748 16.0645 16.3458 13.871 16.5716C14.2258 16.8942 14.5484 17.5393 14.5484 18.4426C14.5484 19.7974 14.5161 20.8619 14.5161 21.1845C14.5161 21.4426 14.7097 21.7329 15.1935 21.6361C19.129 20.3135 22 16.6039 22 12.1845C21.9677 6.70064 17.4839 2.24902 12 2.24902Z" />
            </svg>
          </a>
          <a
            href="/johnglensiy_resume_swe_jan2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Résumé"
            className="text-[#a89b85] hover:text-[#c47b52] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 25 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13.3507 14.4422C13.3507 14.452 13.3509 14.4618 13.3513 14.4714V15.7696C13.3513 16.5024 12.7572 17.0965 12.0243 17.0965C11.2915 17.0965 10.6974 16.5024 10.6974 15.7696V7.65429C10.6974 7.24008 10.3616 6.90429 9.9474 6.90429C9.53319 6.90429 9.1974 7.24008 9.1974 7.65429V15.7696C9.1974 17.3309 10.4631 18.5965 12.0243 18.5965C13.5856 18.5965 14.8513 17.3309 14.8513 15.7696V6.15429C14.8513 6.14353 14.8511 6.13283 14.8506 6.12217C14.8336 3.84265 12.9804 2 10.6968 2C8.40272 2 6.54297 3.85976 6.54297 6.15388V14.4422C6.54297 14.4492 6.54306 14.456 6.54325 14.4629V16.5192C6.54325 19.5462 8.99709 22 12.0241 22C15.051 22 17.5049 19.5461 17.5049 16.5192V9.55775C17.5049 9.14354 17.1691 8.80775 16.7549 8.80775C16.3407 8.80775 16.0049 9.14354 16.0049 9.55775V16.5192C16.0049 18.7177 14.2226 20.5 12.0241 20.5C9.82552 20.5 8.04325 18.7177 8.04325 16.5192V9.55775C8.04325 9.55085 8.04315 9.54397 8.04297 9.53711L8.04297 6.15388C8.04297 4.68818 9.23115 3.5 10.6968 3.5C12.1625 3.5 13.3507 4.68818 13.3507 6.15388L13.3507 14.4422Z" />
            </svg>
          </a>
        </div>
        <nav
          className={`flex flex-col gap-[9px] mt-[26px] text-[12px] ${FONT_GROTESK}`}
        >
          {NAV.map((n) => (
            <div key={n.href}>
              <a
                href={n.href}
                className={`pl-[11px] border-l-2 ${n.active ? "text-[#33302a] font-medium border-[#c47b52]" : "text-[#8d8677] border-transparent"}`}
              >
                {n.label}
              </a>
              {n.label === "Projects" && activeProject && (
                <div
                  className={`pl-[11px] mt-1 text-[10px] leading-[1.4] ${FONT_MONO} text-[#a89b85]`}
                >
                  viewing{" "}
                  <span
                    key={activeProject.title}
                    className="inline-block fade-slide-in"
                  >
                    {activeProject.title}...
                  </span>
                </div>
              )}
            </div>
          ))}
        </nav>
        {/* <div
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
        </div> */}
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
              {/* {openToWork && (
                <span
                  className={`inline-flex items-center gap-[7px] text-[11px] font-medium ${FONT_GROTESK} text-[#5c7a52] bg-[#e7ecdf] border border-[#d4dcc6] rounded-full px-3 py-[5px]`}
                >
                  <span className="w-[7px] h-[7px] rounded-full bg-[#7a9c64] block" />
                  Open to work
                </span>
              )} */}
              <a
                href="#contact"
                className="!text-[#2e2a24] border-b-[1.5px] border-[#c47b52] pb-0.5"
              >
                Contact ↗
              </a>
            </div>
          </header>
          <div className="flex flex-col lg:flex-row h-screen items-center justify-center gap-[clamp(32px,5vw,70px)]">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
              <h1
                className={`m-0 text-[clamp(34px,4.4vw,56px)] leading-[1.1] ${FONT_SERIF} text-[#2e2a24] tracking-[-.01em]`}
              >
                Hello! I'm John
              </h1>
              <p
                className={`text-[13.5px] leading-[1.7] ${FONT_GROTESK} text-[#8a8072] mt-[22px] max-w-[430px]`}
              >
                Currently building full-stack software for distributed systems -
                and fun data projects on the side.
                <br />
                Berkeley EECS alumni.
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

            <HeroReel
              clips={HERO_CLIPS}
              className="w-full max-w-[380px] lg:max-w-[440px]"
            />

            {/* <div className="aspect-[1/.82] rounded-[20px] bg-[#ece5d8] border border-[#ddd6c8] shadow-[0_2px_20px_rgba(60,50,35,.06)] flex flex-col items-center justify-center gap-2.5">
              <div className="w-16 h-16 rounded-[14px] bg-[repeating-linear-gradient(45deg,#e0d7c8,#e0d7c8_7px,#e7dfd0_7px,#e7dfd0_14px)]" />
              <div
                className={`text-[12px] font-medium ${FONT_MONO} text-[#a89b85]`}
              >
                San Francisco diorama
              </div>
              <div className={`text-[11px] ${FONT_GROTESK} text-[#b3a794]`}>
                3D hero — dropping in next
              </div>
            </div> */}
          </div>
          <div
            className={`absolute left-1/2 bottom-[26px] -translate-x-1/2 flex flex-col items-center gap-1.5 text-[10.5px] ${FONT_MONO} text-[#b3a794]`}
          >
            scroll<span className="text-sm">↓</span>
          </div>
        </section>
      </div>

      {/* Projects + Contact — fade in from below instead of shifting right */}
      <ContentSection
        sidebarShown={sidebarShown}
        projects={PROJECTS}
        onActiveProjectChange={setActiveProject}
      />
    </div>
  );
}
