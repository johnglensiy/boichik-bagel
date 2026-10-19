"use client";

import { MaterialProvider } from "./core/materials";
import { spotProblems } from "./core/space";
import { DraggableLandmark } from "./DraggableLandmark";
import { LANDMARKS, type LandmarkDef } from "./landmarks";
import { GoldenGate } from "./landmarks/golden-gate/GoldenGate";
import { SAVED_LAYOUT, type Layout } from "./layout";
import type { SFStyle } from "./styles";
import { Hills } from "./terrain/Hills";
import { Streets } from "./terrain/Streets";
import { Terrain } from "./terrain/Terrain";

export { SF_GROUND_Y } from "./core/space";

/**
 * A caricatured San Francisco, cut out as a cube.
 *
 * The landmarks are not where they are in life and are not to each other's
 * scale. They're packed into one square block of city the way a souvenir model
 * packs them: close enough to touch, every one facing the viewer, the bay
 * folded into a corner so the bridge has something to cross. Recognition is the
 * whole job — if a shape doesn't read in one glance it doesn't earn its meshes.
 *
 * The cube is deliberate. Base, land and skyline are sized so the silhouette is
 * about as tall as it is wide (14 across, 6 of rock below, 8 of city above).
 *
 * Geometry is shared across all four styles; a style only changes palette,
 * material, edge treatment and light. That keeps the switcher a fair comparison
 * instead of four different models.
 *
 * Each landmark is its own module under landmarks/; there is no filler city
 * around them. The bridge and terrain are fixed; the landmarks in LANDMARKS
 * stand wherever the layout puts them and can be dragged in edit mode.
 */

/** Placement problems for one landmark at its layout spot. */
export function landmarkProblems(def: LandmarkDef, layout: Layout): string[] {
  const at = layout[def.id];
  if (!at) return ["not in the layout"];
  return spotProblems({ ...at, ...def.footprint });
}

/** Check the saved layout once, in development only. */
if (process.env.NODE_ENV !== "production") {
  const problems = LANDMARKS.flatMap((def) =>
    landmarkProblems(def, SAVED_LAYOUT).map((p) => `${def.id}: ${p}`),
  );
  if (problems.length) console.warn("[SFScene] layout problems:\n  " + problems.join("\n  "));
}

interface SFSceneProps {
  style: SFStyle;
  layout?: Layout;
  editing?: boolean;
  onMove?: (id: string, at: { u: number; v: number }) => void;
}

export default function SFScene({
  style,
  layout = SAVED_LAYOUT,
  editing = false,
  onMove,
}: SFSceneProps) {
  return (
    <MaterialProvider style={style}>
      <Terrain style={style} />
      <Hills style={style} />
      <Streets style={style} />
      {LANDMARKS.map((def) => {
        const at = layout[def.id];
        if (!at) return null;
        return (
          <DraggableLandmark
            key={def.id}
            def={def}
            at={at}
            editing={editing}
            problems={landmarkProblems(def, layout)}
            onMove={(id, next) => onMove?.(id, next)}
          >
            <def.Model style={style} />
          </DraggableLandmark>
        );
      })}
      <GoldenGate style={style} />
    </MaterialProvider>
  );
}
