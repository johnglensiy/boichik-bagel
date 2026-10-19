"use client";

import { Suspense, useMemo, useState } from "react";
import { MaterialProvider } from "./core/materials";
import { spotProblems, type BridgeSpot } from "./core/space";
import { DraggableLandmark } from "./DraggableLandmark";
import { LANDMARKS, goldenGate, type LandmarkDef } from "./landmarks";
import { SAVED_LAYOUT, type Layout, type Placement } from "./layout";
import type { SFStyle } from "./styles";
import { GrassEditor } from "./GrassEditor";
import { SAVED_GRASS } from "./grass";
import { RoadEditor } from "./RoadEditor";
import { SAVED_ROADS, type Cell, type Road } from "./roads";
import { Grass } from "./terrain/Grass";
import { Roads } from "./terrain/Roads";
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
 * stand, face and size wherever the layout puts them, and can be dragged,
 * turned and resized in edit mode. That includes the bridge.
 */

/** Placement problems for one landmark at its layout spot. */
export function landmarkProblems(def: LandmarkDef, layout: Layout): string[] {
  const at = layout[def.id];
  if (!at) return ["not in the layout"];
  // The roadway is the bridge's own; it can't stand in itself.
  if (def.id === goldenGate.id) return [];
  const b = layout[goldenGate.id];
  const bridge: BridgeSpot = {
    u: b?.u ?? 0,
    v: b?.v ?? 0,
    turn: b?.turn ?? 0,
    scale: b?.scale ?? 1,
  };
  const s = at.scale ?? 1;
  return spotProblems(
    {
      u: at.u,
      v: at.v,
      across: def.footprint.across * s,
      along: def.footprint.along * s,
      turn: at.turn,
    },
    bridge,
  );
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
  /** Landmarks to leave out of the scene, by id. */
  hidden?: ReadonlySet<string>;
  editing?: boolean;
  onMove?: (id: string, at: Placement) => void;
  /** The streets; the saved ones when not given. */
  roads?: Road[];
  /** Road mode: click squares on the land to lay roads between them. */
  drawingRoads?: boolean;
  onRoadsChange?: (roads: Road[]) => void;
  /** Painted lawn squares; the saved ones when not given. */
  grass?: Cell[];
  /** Grass mode: click squares on the land to paint or clear lawn. */
  paintingGrass?: boolean;
  onGrassChange?: (grass: Cell[]) => void;
}

const NONE_HIDDEN: ReadonlySet<string> = new Set();

export default function SFScene({
  style,
  layout = SAVED_LAYOUT,
  hidden = NONE_HIDDEN,
  editing = false,
  onMove,
  roads = SAVED_ROADS,
  drawingRoads = false,
  onRoadsChange,
  grass = SAVED_GRASS,
  paintingGrass = false,
  onGrassChange,
}: SFSceneProps) {
  // Like text boxes: click one to select it, and only that one shows the ring
  // that arms the arrow keys, so the rings never crowd the whole block.
  const [selected, setSelected] = useState<string | null>(null);
  // Built once per style. A drag re-renders this scene every frame; handing
  // React the same elements lets it skip every model and the terrain, and
  // redo only the landmark being moved.
  const models = useMemo(
    () => Object.fromEntries(LANDMARKS.map((def) => [def.id, <def.Model key={def.id} style={style} />])),
    [style],
  );
  const ground = useMemo(() => <Terrain style={style} />, [style]);
  const lawns = useMemo(() => <Grass style={style} cells={grass} />, [style, grass]);
  return (
    <MaterialProvider style={style}>
      {ground}
      {lawns}
      {paintingGrass && <GrassEditor grass={grass} onChange={(next) => onGrassChange?.(next)} />}
      {/* The road tiles stream in once their models load; the land doesn't wait. */}
      <Suspense fallback={null}>
        <Roads style={style} roads={roads} />
      </Suspense>
      {drawingRoads && <RoadEditor roads={roads} onChange={(next) => onRoadsChange?.(next)} />}
      {LANDMARKS.map((def) => {
        const at = layout[def.id];
        if (!at || hidden.has(def.id)) return null;
        return (
          <DraggableLandmark
            key={def.id}
            def={def}
            at={at}
            editing={editing}
            selected={editing && selected === def.id}
            onSelect={setSelected}
            onMove={(id, next) => onMove?.(id, next)}
          >
            {models[def.id]}
          </DraggableLandmark>
        );
      })}
    </MaterialProvider>
  );
}
