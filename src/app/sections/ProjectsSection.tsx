"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export interface Project {
  tab: string;
  title: string;
  stack: string[];
  year: string;
  img: string;
  video?: string;
  poster?: string;
  blurb: string;
  github: string;
}

const TABS = [
  { id: "software", label: "Software" },
  { id: "data", label: "Data & NLP" },
  { id: "hw", label: "Hardware" },
];

const PLACEHOLDER_BULLETS = [
  "Designed the core architecture and key data structures from the ground up.",
  "Implemented and tested critical paths end-to-end, iterating on edge cases.",
  "Profiled performance and refined the approach based on real bottlenecks.",
];

const CARD_GAP = 16;
// Bare expression (no outer calc()) so it can be embedded inside other calc()s.
const CARD_BASIS_EXPR = `((100% - ${CARD_GAP * 2}px) / 3)`;
const CARD_BASIS = `calc${CARD_BASIS_EXPR}`;
const EXPANDED_BASIS = "80%";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// A <video> rather than a GIF: a GIF can't be paused, restarted, or held on a
// first frame, and encodes to roughly 20x the bytes for the same clip.
// Falls back to the filename placeholder for projects with no clip recorded yet.
function CardMedia({
  video,
  poster,
  label,
  active,
}: {
  video?: string;
  poster?: string;
  label: string;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.currentTime = 0;
      // Rejects when a quick collapse interrupts playback — expected, not an error.
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active]);

  if (!video) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] font-plex-mono text-[#a89b85]">
        {label}
      </div>
    );
  }

  return (
    <video
      ref={ref}
      src={video}
      poster={poster}
      loop
      muted
      playsInline
      // Nothing downloads until the card is expanded and play() is called.
      preload="none"
      className="w-full h-full object-cover"
    />
  );
}

interface ProjectsSectionProps {
  projects: Project[];
  onActiveProjectChange?: (project: Project | null) => void;
}

export default function ProjectsSection({
  projects,
  onActiveProjectChange,
}: ProjectsSectionProps) {
  const tracks = useMemo(
    () =>
      TABS.map((t) => ({
        ...t,
        projects: projects.filter((p) => p.tab === t.id),
      })),
    [projects],
  );

  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({});

  const selectProject = (p: Project) => {
    setExpandedTitle((t) => (t === p.title ? null : p.title));
    onActiveProjectChange?.(p);
  };

  return (
    <section
      id="projects"
      className="min-h-screen flex flex-col justify-center py-[70px] px-[clamp(28px,6vw,90px)] bg-[#f7f3ec]"
    >
      <div className="text-[30px] leading-[1.1] font-medium font-newsreader text-[#3a342c] max-w-[860px] mx-auto w-full">
        Selected work
      </div>
      <p className="text-[12.5px] leading-[1.6] font-grotesk text-[#8a8072] max-w-[860px] mx-auto mt-2 w-full">
        A few things I&apos;ve built across systems, security, and applied ML —
        one track per area.
      </p>

      <div className="flex flex-col gap-10 max-w-[860px] w-full mx-auto mt-8">
        {tracks.map((track) => {
          if (track.projects.length === 0) return null;
          const shown = track.projects.slice(0, 3);
          const rest = track.projects.slice(3);
          const isOpen = !!openTracks[track.id];

          const renderCard = (p: Project) => {
            const isExpanded = expandedTitle === p.title;
            const flexStyle: CSSProperties = isExpanded
              ? { flex: `0 0 ${EXPANDED_BASIS}` }
              : { flex: `0 0 ${CARD_BASIS}` };

            const tagsEl = (
              <div className="flex flex-wrap gap-[6px]">
                {p.stack.map((t) => (
                  <span
                    key={t}
                    className="shrink-0 text-[9.5px] font-medium font-plex-mono text-[#7a6e5c] bg-[#e4dccd] rounded-full px-[9px] py-[3px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            );

            return (
              <div
                key={p.title}
                onClick={() => selectProject(p)}
                style={flexStyle}
                className="group relative rounded-2xl bg-[#f4efe7] hover:bg-[#efe6d5] transition-[flex-basis,flex-grow,background-color] duration-500 [transition-timing-function:cubic-bezier(.4,0,.2,1)] cursor-pointer overflow-hidden p-4"
              >
                {!isExpanded && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#e4dccd] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M1 8 L8 1 M3 1 H8 V6"
                        stroke="#7a6e5c"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
                <div className="relative h-[270px]">
                  {/* Persistent media — resizes directly, never fades */}
                  <div
                    className={`absolute top-0 left-0 overflow-hidden rounded-[10px] bg-[repeating-linear-gradient(45deg,#e4dccd,#e4dccd_7px,#ece5d8_7px,#ece5d8_14px)] transition-[width,height] duration-500 [transition-timing-function:cubic-bezier(.4,0,.2,1)] ${isExpanded ? "w-1/2 h-full" : "w-full h-[120px]"}`}
                  >
                    <CardMedia
                      video={p.video && `/videos/${p.video}`}
                      poster={p.poster && `/images/projects/${p.poster}`}
                      label={p.img}
                      active={isExpanded}
                    />
                  </div>

                  {/* Resting text: below the image */}
                  <div
                    className={`absolute inset-0 flex flex-col gap-3 ${isExpanded ? "opacity-0 duration-150 pointer-events-none" : "opacity-100 duration-200 delay-300"} transition-opacity`}
                  >
                    <div className="w-full h-[120px] shrink-0" />
                    <div>
                      <div className="text-[15.5px] font-semibold font-grotesk text-[#3a342c] mb-1.5">
                        {p.title}
                      </div>
                      {tagsEl}
                      <div className="text-[12px] leading-[1.55] font-grotesk text-[#8f8172] mt-2.5">
                        {p.blurb}
                      </div>
                    </div>
                  </div>

                  {/* Expanded text: to the right of the image */}
                  <div
                    className={`absolute inset-0 flex items-stretch gap-4 ${isExpanded ? "opacity-100 duration-200 delay-300" : "opacity-0 duration-150 pointer-events-none"} transition-opacity`}
                  >
                    <div className="w-1/2 h-full shrink-0" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="text-[15.5px] font-semibold font-grotesk text-[#3a342c] mb-1.5">
                        {p.title}
                      </div>
                      {tagsEl}
                      <div className="text-[12px] leading-[1.55] font-grotesk text-[#8f8172] mt-2.5">
                        {p.blurb}
                      </div>
                      <div className="mt-2.5">
                        <ul className="list-disc pl-[16px] flex flex-col gap-1 text-[11.5px] leading-[1.5] font-grotesk text-[#8f8172]">
                          {PLACEHOLDER_BULLETS.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        {p.github && (
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block mt-2.5 text-[10.5px] font-medium font-plex-mono"
                          >
                            View on GitHub ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          const shownRows = chunk(shown, 3);
          const restRows = chunk(rest, 3);

          // Content is packed at flex-start; a marginLeft offset (itself
          // animatable, unlike justify-content) slides the whole packed
          // group into start/center/end position so every transition —
          // expand, collapse, or switching between two expanded cards —
          // animates as one continuous motion instead of snapping.
          const rowOffsetStyle = (row: Project[]): CSSProperties => {
            const idx = row.findIndex((x) => x.title === expandedTitle);
            if (idx <= 0) return { marginLeft: 0 };
            const others = row.length - 1;
            const gaps = row.length - 1;
            const contentExpr = `${EXPANDED_BASIS} + ${others} * ${CARD_BASIS_EXPR} + ${gaps * CARD_GAP}px`;
            if (idx === row.length - 1) {
              return { marginLeft: `calc(100% - (${contentExpr}))` };
            }
            return { marginLeft: `calc((100% - (${contentExpr})) / 2)` };
          };

          return (
            <div key={track.id}>
              <div className="flex items-center text-[18px] font-newsreader font-semibold font-grotesk text-[#3a342c] mb-3">
                <span className="inline-block w-3 h-3 mr-1.5 bg-[#c47b52]" />
                {track.label}
              </div>
              <div className="flex flex-col gap-4">
                {shownRows.map((row, ri) => (
                  <div
                    key={ri}
                    style={rowOffsetStyle(row)}
                    className="flex items-stretch gap-4 overflow-hidden transition-[margin-left] duration-500 [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
                  >
                    {row.map((p) => renderCard(p))}
                  </div>
                ))}
              </div>
              {rest.length > 0 && (
                <>
                  <div
                    className={`grid transition-[grid-template-rows] duration-400 [transition-timing-function:cubic-bezier(.4,0,.2,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-4 pt-4">
                        {restRows.map((row, ri) => (
                          <div
                            key={ri}
                            style={rowOffsetStyle(row)}
                            className="flex items-stretch gap-4 overflow-hidden transition-[margin-left] duration-500 [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
                          >
                            {row.map((p) => renderCard(p))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setOpenTracks((o) => ({
                        ...o,
                        [track.id]: !o[track.id],
                      }))
                    }
                    className="mt-4 flex items-center gap-1.5 text-[11px] font-medium font-plex-mono text-[#8f8172] hover:text-[#5c5346] cursor-pointer transition-colors"
                  >
                    {isOpen ? "Show less" : `+${rest.length} more`}
                    <svg
                      width="9"
                      height="6"
                      viewBox="0 0 9 6"
                      fill="none"
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M1 1 L4.5 5 L8 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
