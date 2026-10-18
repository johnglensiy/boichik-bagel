"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SF_STYLES, SF_STYLE_ORDER, type SFStyleId } from "@/components/sf/styles";

// three + drei are ~170kb gzipped. Kept out of the first load so the page
// paints on the server render and the canvas arrives after.
const SFDiorama = dynamic(() => import("@/components/sf/SFDiorama"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center text-[11px] font-plex-mono text-[#b3a794]">
      building the city…
    </div>
  ),
});

export default function SFLabPage() {
  const [styleId, setStyleId] = useState<SFStyleId>("clay");
  const style = SF_STYLES[styleId];

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-[clamp(24px,5vw,72px)] py-[clamp(28px,5vh,56px)]">
      <div className="max-w-[1080px] mx-auto">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="text-[26px] font-newsreader text-[#2e2a24] m-0">
            San Francisco, four ways
          </h1>
          <Link href="/" className="text-[12px] font-grotesk">
            Back to the site
          </Link>
        </header>
        <p className="text-[12.5px] leading-[1.65] font-grotesk text-[#8a8072] mt-2 max-w-[62ch]">
          Same geometry and same camera in all four — only the palette, material
          and light change. Drag to turn it; the turntable stops once you do.
        </p>

        <div className="mt-6 rounded-[18px] overflow-hidden border border-[#e2dbcc]">
          <SFDiorama
            styleId={styleId}
            className="w-full h-[clamp(420px,64vh,620px)]"
          />
        </div>

        {/* Style switcher. Swatches rather than labels alone — the decision
            being made is a visual one. */}
        <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {SF_STYLE_ORDER.map((id) => {
            const s = SF_STYLES[id];
            const on = id === styleId;
            return (
              <button
                key={id}
                onClick={() => setStyleId(id)}
                aria-pressed={on}
                className={`text-left rounded-[13px] p-3.5 border transition-colors cursor-pointer ${
                  on
                    ? "bg-[#efe6d5] border-[#c47b52]"
                    : "bg-[#f4efe7] border-[#e2dbcc] hover:bg-[#efe9dd]"
                }`}
              >
                <div className="flex gap-1.5 mb-2.5">
                  {[s.orange, s.concrete, s.glass, s.hill, s.land].map((c, i) => (
                    <span
                      key={i}
                      className="w-full h-[18px] rounded-[4px] border border-black/5"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="text-[13px] font-semibold font-grotesk text-[#33302a]">
                  {s.name}
                </div>
                <div className="text-[11px] leading-[1.45] font-grotesk text-[#8f8172] mt-1">
                  {s.note}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] font-plex-mono text-[#b3a794] mt-5">
          showing {style.name.toLowerCase()}
        </p>
      </div>
    </main>
  );
}
