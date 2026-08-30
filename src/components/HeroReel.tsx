"use client";

import { useEffect, useRef, useState } from "react";

export interface HeroClip {
  title: string;
  tagline?: string;
  video: string;
  poster?: string;
}

interface HeroReelProps {
  clips: HeroClip[];
  className?: string;
}

// Cycles through every project demo clip, one after another. A single <video>
// swapped between sources rather than one element per clip: only the visible
// clip is ever in the document, so nothing preloads or decodes off-screen.
export default function HeroReel({ clips, className = "" }: HeroReelProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [idx, setIdx] = useState(0);

  const active = clips[idx];

  // Autoplay the newly-swapped source. Rejects if the browser blocks autoplay
  // or the source changes mid-play — neither is an error worth surfacing.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }, [idx]);

  if (!active) return null;

  const advance = () => {
    if (clips.length <= 1) {
      // Nothing to swap to, so restart in place instead of re-rendering.
      const el = ref.current;
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
      return;
    }
    setIdx((i) => (i + 1) % clips.length);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative aspect-[4/3] rounded-[20px] bg-[#ece5d8] border border-[#ddd6c8] shadow-[0_2px_20px_rgba(60,50,35,.06)] overflow-hidden">
        <video
          ref={ref}
          key={active.video}
          src={active.video}
          poster={active.poster}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={advance}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Caption sits under the frame so it never covers the clip */}
      <div className="flex flex-col items-center text-center mt-3.5">
        {/* One line wherever there's room; wraps only on the narrowest screens,
            where nowrap would push the caption past the viewport edge. */}
        <p className="text-[12px] leading-[1.5] font-grotesk text-[#8a8072] sm:whitespace-nowrap">
          <span className="font-medium text-[#3a342c]">{active.title}</span>
          {active.tagline && ` — ${active.tagline}`}
        </p>
        {clips.length > 1 && (
          <div className="flex items-center gap-[6px] mt-2.5">
            {clips.map((c, i) => (
              <button
                key={c.video}
                onClick={() => setIdx(i)}
                aria-label={`Play ${c.title} demo`}
                className={`w-[6px] h-[6px] rounded-full transition-colors duration-200 cursor-pointer ${
                  i === idx ? "bg-[#c47b52]" : "bg-[#ddd6c8] hover:bg-[#c2b8a4]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
