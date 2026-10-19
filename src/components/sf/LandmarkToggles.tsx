"use client";

import { LANDMARKS } from "./landmarks";

interface Props {
  hidden: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

/**
 * A checkbox per landmark, bridge included, to show or hide it. A viewing
 * aid for the lab page: what's hidden isn't saved with the layout. Lives
 * beside the scene so it loads with it, rather than pulling the landmark
 * models into the page's first load just for their labels.
 */
export default function LandmarkToggles({ hidden, onToggle }: Props) {
  return (
    <fieldset className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-grotesk text-[#5d554a] border-0 p-0 m-0">
      <legend className="sr-only">Show landmarks</legend>
      {LANDMARKS.map((def) => (
        <label key={def.id} className="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!hidden.has(def.id)}
            onChange={() => onToggle(def.id)}
            className="accent-[#c47b52] cursor-pointer"
          />
          {def.label}
        </label>
      ))}
    </fieldset>
  );
}
