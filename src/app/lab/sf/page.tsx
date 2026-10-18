"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SF_STYLES, SF_STYLE_ORDER, type SFStyleId } from "@/components/sf/styles";
import { SAVED_LAYOUT, type Layout } from "@/components/sf/layout";

// Arranging the city writes layout.json in the source tree, which only the dev
// server can do, so the editor only exists there.
const CAN_EDIT = process.env.NODE_ENV === "development";

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
  const [layout, setLayout] = useState<Layout>(SAVED_LAYOUT);
  const [saved, setSaved] = useState<Layout>(SAVED_LAYOUT);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const dirty = JSON.stringify(layout) !== JSON.stringify(saved);

  const move = (id: string, at: { u: number; v: number }) => {
    setLayout((l) => ({ ...l, [id]: at }));
    setStatus(null);
  };

  const save = async () => {
    setStatus("saving…");
    try {
      const res = await fetch("/api/sf-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setLayout(data.layout);
      setSaved(data.layout);
      setStatus("saved to layout.json");
    } catch (err) {
      setStatus(`not saved: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

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
          and light change. Drag to turn it, shift-drag to move it, scroll to zoom;
          the turntable stops once you do.
        </p>

        <div className="mt-6 rounded-[18px] overflow-hidden border border-[#e2dbcc]">
          <SFDiorama
            styleId={styleId}
            className="w-full h-[clamp(420px,64vh,620px)]"
            layout={layout}
            editing={editing}
            onMove={move}
          />
        </div>

        {CAN_EDIT && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-grotesk">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              aria-pressed={editing}
              className={`rounded-[9px] px-3 py-1.5 border cursor-pointer ${
                editing
                  ? "bg-[#efe6d5] border-[#c47b52] text-[#33302a]"
                  : "bg-[#f4efe7] border-[#e2dbcc] text-[#5d554a] hover:bg-[#efe9dd]"
              }`}
            >
              {editing ? "Done arranging" : "Arrange landmarks"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty}
              className="rounded-[9px] px-3 py-1.5 border border-[#e2dbcc] bg-[#f4efe7] text-[#5d554a] enabled:hover:bg-[#efe9dd] enabled:cursor-pointer disabled:opacity-45"
            >
              Save layout
            </button>
            <button
              type="button"
              onClick={() => {
                setLayout(saved);
                setStatus(null);
              }}
              disabled={!dirty}
              className="rounded-[9px] px-3 py-1.5 border border-[#e2dbcc] bg-[#f4efe7] text-[#5d554a] enabled:hover:bg-[#efe9dd] enabled:cursor-pointer disabled:opacity-45"
            >
              Revert
            </button>
            <span className="text-[11px] font-plex-mono text-[#b3a794]">
              {status ?? (editing ? "drag a landmark to move it · dev only" : dirty ? "unsaved changes" : "")}
            </span>
          </div>
        )}

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
