"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { Edges, RoundedBox } from "@react-three/drei";
import { makeToonRamp, type SFStyle } from "./styles";

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
 */

// --------------------------------------------------------------- dimensions

const CUBE = { half: 4.6, landTop: 0, baseTop: -0.8, bottom: -3.4 };

/**
 * The bridge runs the block's full diagonal and the city is packed around it.
 * Everything is placed in bridge-space rather than world XZ, because the two
 * constraints that matter are naturally expressed there:
 *
 *   u = distance along the shore axis, across the block
 *   v = distance from the bridge's centreline — must clear the roadway
 *
 * In world coordinates those rules are invisible and things end up standing in
 * the deck. Here they are arithmetic you can check. The block is a square, so
 * in bridge-space it is a diamond: |u| + |v| <= APEX.
 */
/** Half the main span, in the bridge's own (unscaled) units. */
const TOWER_D = 3.9;
const APEX = CUBE.half * Math.SQRT2;

/** Half the roadway's width, plus a little. Nothing may stand inside it. */
const DECK_HALF = 0.5;

/** The bridge's axis, as a rotation about Y. */
const BRIDGE_ROT = -Math.PI / 4;
/** Corner to corner, a hair short of poking out of the block. */
const BRIDGE_LEN = CUBE.half * 2 * Math.SQRT2 - 0.15;

/**
 * The whole bridge — towers, cables, deck section — is built at full size and
 * drawn at this scale. Only its length is exempt: DECK_LEN is stretched back
 * out so the roadway still runs corner to corner across the block.
 */
const BRIDGE_SCALE = 0.7;
const DECK_LEN = BRIDGE_LEN / BRIDGE_SCALE;

/** Bottom of the cube, in scene space - where the contact shadow sits. */
export const SF_GROUND_Y = CUBE.bottom;

function uv(u: number, v: number): [number, number] {
  return [(u - v) / Math.SQRT2, (u + v) / Math.SQRT2];
}

interface Spot {
  u: number;
  v: number;
  /** Half-extent perpendicular to the bridge — what has to clear the deck. */
  across: number;
  /** Half-extent along the bridge — what has to stay on the block. */
  along: number;
}

/**
 * Everything that isn't filler, placed once. The long buildings (the Ferry
 * Building, the Victorian row) run ALONG the bridge, so their length is in
 * `along` and only their narrow side has to clear the deck.
 */
const PLACE = {
  salesforce: { u: 2.6, v: -1.9, across: 0.78, along: 0.78 },
  transamerica: { u: 2.0, v: 1.9, across: 0.9, along: 0.9 },
  ferry: { u: 2.4, v: -1.35, across: 0.55, along: 1.85 },
  coit: { u: -3.0, v: -1.8, across: 0.7, along: 0.7 },
  ladies: { u: -2.4, v: 1.5, across: 0.6, along: 1.86 },
  lombard: { u: -2.0, v: -2.4, across: 0.7, along: 1.1 },
  cableCar: { u: -1.1, v: 1.3, across: 0.35, along: 0.35 },
  alcatraz: { u: -2.0, v: 2.6, across: 0.74, along: 0.74 },
} satisfies Record<string, Spot>;

/** World XZ for a placed item. */
function at(p: Spot): [number, number] {
  return uv(p.u, p.v);
}

// [u, v] in bridge-space. |v| keeps them out of the roadway and
// |u| + |v| < APEX keeps them on the block; every row below satisfies both.
const TOWERS: Array<{
  u: number;
  v: number;
  w: number;
  d: number;
  h: number;
  crown: "flat" | "step" | "spire";
}> = [
  { u: 0.5, v: 1.5, w: 0.62, d: 0.64, h: 2.3, crown: "step" },
  { u: 1.8, v: 1.4, w: 0.58, d: 0.6, h: 1.9, crown: "flat" },
  { u: 3.1, v: 1.3, w: 0.56, d: 0.58, h: 1.6, crown: "spire" },
  { u: 0.7, v: 2.7, w: 0.6, d: 0.62, h: 2.0, crown: "flat" },
  { u: 2.1, v: 2.5, w: 0.56, d: 0.58, h: 1.5, crown: "flat" },
  { u: 3.3, v: 1.9, w: 0.52, d: 0.54, h: 1.3, crown: "flat" },
  { u: -0.6, v: 1.6, w: 0.6, d: 0.62, h: 2.1, crown: "flat" },
  { u: -1.9, v: 1.5, w: 0.58, d: 0.56, h: 1.7, crown: "step" },
  { u: -3.2, v: 1.35, w: 0.54, d: 0.56, h: 1.4, crown: "flat" },
  { u: -0.8, v: 2.8, w: 0.56, d: 0.58, h: 1.6, crown: "flat" },
  { u: -3.4, v: 1.85, w: 0.5, d: 0.52, h: 1.2, crown: "flat" },
  { u: 0.6, v: -1.5, w: 0.62, d: 0.6, h: 2.2, crown: "flat" },
  { u: 1.3, v: -2.7, w: 0.58, d: 0.6, h: 1.8, crown: "step" },
  { u: 3.2, v: -1.3, w: 0.56, d: 0.58, h: 1.5, crown: "flat" },
  { u: 0.9, v: -3.4, w: 0.54, d: 0.56, h: 1.3, crown: "spire" },
  { u: 3.4, v: -1.9, w: 0.52, d: 0.54, h: 1.2, crown: "flat" },
  { u: -0.5, v: -1.6, w: 0.6, d: 0.62, h: 2.0, crown: "flat" },
  { u: -1.3, v: -1.4, w: 0.56, d: 0.58, h: 1.6, crown: "flat" },
  { u: -3.2, v: -1.35, w: 0.54, d: 0.56, h: 1.4, crown: "step" },
  { u: -0.7, v: -3.2, w: 0.56, d: 0.58, h: 1.5, crown: "flat" },
  { u: -3.5, v: -1.8, w: 0.5, d: 0.52, h: 1.1, crown: "flat" },
  { u: 4.4, v: -0.95, w: 0.5, d: 0.52, h: 1.1, crown: "flat" },
  { u: 4.5, v: 1.0, w: 0.5, d: 0.52, h: 1.2, crown: "flat" },
  { u: -4.4, v: -1.0, w: 0.5, d: 0.52, h: 1.2, crown: "flat" },
];

/**
 * The placement rules are one nudged number away from putting a tower in the
 * roadway or hanging it off the corner, and on a slowly turning model that is
 * easy to miss by eye. Check them once, in development only.
 */
if (process.env.NODE_ENV !== "production") {
  const problems: string[] = [];
  const check = (name: string, s: Spot) => {
    if (Math.abs(s.v) - s.across < DECK_HALF) problems.push(`${name}: in the roadway`);
    if (Math.abs(s.u) + s.along + Math.abs(s.v) + s.across > APEX)
      problems.push(`${name}: overhangs the block`);
  };
  for (const [name, spot] of Object.entries(PLACE)) check(name, spot);
  TOWERS.forEach((t, i) => {
    const r = ((t.w + t.d) / 2) * Math.SQRT1_2;
    check(`tower ${i}`, { u: t.u, v: t.v, across: r, along: r });
  });
  if (problems.length) {
    console.warn("[SFScene] layout problems:\n  " + problems.join("\n  "));
  }
}

// ---------------------------------------------------------------- materials

type Palette = (color: string) => THREE.Material;

const MaterialContext = createContext<Palette | null>(null);

function useMat(): Palette {
  const mat = useContext(MaterialContext);
  if (!mat) throw new Error("useMat must be used inside <MaterialProvider>");
  return mat;
}

/**
 * One material per palette entry for the whole scene.
 *
 * This is a provider rather than a hook each mesh calls, because the palette is
 * shared: built per-component it would be rebuilt per component *instance*, and
 * at this level of detail that's a few thousand redundant materials instead of
 * seventeen.
 */
function MaterialProvider({
  style,
  children,
}: {
  style: SFStyle;
  children: ReactNode;
}) {
  const built = useMemo(() => {
    const ramp = style.toon ? makeToonRamp(3) : undefined;
    const make = (color: string): THREE.Material =>
      style.toon
        ? new THREE.MeshToonMaterial({ color, gradientMap: ramp })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: style.roughness,
            metalness: style.metalness,
            flatShading: style.flatShading,
          });

    const colors = [
      style.land,
      style.landSide,
      style.hill,
      style.concrete,
      style.glass,
      style.orange,
      style.road,
      style.asphalt,
      style.window,
      style.trim,
      style.metal,
      ...style.victorian,
    ];
    const byColor = new Map(colors.map((c) => [c, make(c)]));
    const get: Palette = (c) => byColor.get(c) ?? byColor.get(style.concrete)!;
    return { ramp, byColor, get };
  }, [style]);

  useEffect(() => {
    const { ramp, byColor } = built;
    return () => {
      byColor.forEach((m) => m.dispose());
      ramp?.dispose();
    };
  }, [built]);

  return (
    <MaterialContext.Provider value={built.get}>{children}</MaterialContext.Provider>
  );
}

// ------------------------------------------------------------------ helpers

interface BlockProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  style: SFStyle;
  rotation?: [number, number, number];
  /**
   * Trim: square corners even in the rounded styles, no drawn edge, and no
   * shadow cast. These pieces are reveals and mouldings — they never change
   * the silhouette, so paying to render them into the shadow map is pure cost.
   */
  sharp?: boolean;
}

/**
 * The unit of the city. Rounded for the toy treatments, square for the cut-card
 * ones — swapping this one primitive is most of what separates Clay from Paper.
 */
function Block({ position, size, color, style, rotation, sharp }: BlockProps) {
  const mat = useMat();
  const common = {
    position,
    rotation,
    castShadow: style.shadows && !sharp,
    receiveShadow: style.shadows,
    material: mat(color),
  };

  if (style.rounded && !sharp) {
    const r = Math.min(0.1, Math.min(size[0], size[2]) * 0.2);
    return <RoundedBox args={size} radius={r} smoothness={3} {...common} />;
  }

  return (
    <mesh {...common}>
      <boxGeometry args={size} />
      {style.outline && !sharp && <Edges color={style.outline} threshold={15} />}
    </mesh>
  );
}

/**
 * Horizontal spandrel bands wrapping a tower. One thin box per floor rather
 * than one per face: four times fewer draw calls for the same read, and at this
 * scale nobody can tell the corners aren't mitred.
 */
function FloorBands({
  base,
  top,
  width,
  depth,
  floors,
  color,
  taper = 0,
}: {
  base: number;
  top: number;
  width: number;
  depth: number;
  floors: number;
  color: string;
  /** Fraction the footprint shrinks by at the top, for tapering towers. */
  taper?: number;
}) {
  const mat = useMat();
  const bands = [];
  for (let i = 0; i < floors; i++) {
    const t = (i + 0.5) / floors;
    const y = base + (top - base) * t;
    const k = 1 - taper * t;
    bands.push(
      <mesh key={i} position={[0, y, 0]} material={mat(color)} castShadow={false}>
        <boxGeometry args={[width * k + 0.03, 0.045, depth * k + 0.03]} />
      </mesh>,
    );
  }
  return <group>{bands}</group>;
}

/** Vertical ribs around a cylinder — Coit's fluting, a tower's mullions. */
function Flutes({
  count,
  radius,
  height,
  y,
  color,
  thickness = 0.05,
}: {
  count: number;
  radius: number;
  height: number;
  y: number;
  color: string;
  thickness?: number;
}) {
  const mat = useMat();
  const ribs = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    ribs.push(
      <mesh
        key={i}
        position={[Math.cos(a) * radius, y, Math.sin(a) * radius]}
        rotation={[0, -a, 0]}
        material={mat(color)}
        castShadow={false}
      >
        <boxGeometry args={[thickness, height, thickness * 1.6]} />
      </mesh>,
    );
  }
  return <group>{ribs}</group>;
}

// Deterministic per-index wobble. Paper is cut and glued by hand, so a row of
// houses that lines up perfectly reads as plastic.
function tilt(style: SFStyle, seed: number): [number, number, number] {
  if (!style.jitter) return [0, 0, 0];
  const a = Math.sin(seed * 12.9898) * 43758.5453;
  const b = Math.sin(seed * 78.233) * 12345.6789;
  const f = (n: number) => (n - Math.floor(n) - 0.5) * style.jitter;
  return [f(a) * 0.6, f(b) * 2.2, f(a + b) * 0.6];
}

// ------------------------------------------------------------------ terrain

function Terrain({ style }: { style: SFStyle }) {
  const mat = useMat();
  const h = CUBE.half;
  const baseH = CUBE.baseTop - CUBE.bottom;
  const landH = CUBE.landTop - CUBE.baseTop;

  return (
    <group>
      {/* The block of rock the whole thing is cut from. */}
      <mesh
        position={[0, CUBE.bottom + baseH / 2, 0]}
        receiveShadow={style.shadows}
        castShadow={style.shadows}
        material={mat(style.landSide)}
      >
        <boxGeometry args={[h * 2, baseH, h * 2]} />
        {style.outline && <Edges color={style.outline} threshold={15} />}
      </mesh>

      {/* Solid ground, corner to corner. */}
      <mesh
        position={[0, CUBE.baseTop + landH / 2, 0]}
        receiveShadow={style.shadows}
        castShadow={style.shadows}
        material={mat(style.land)}
      >
        <boxGeometry args={[h * 2, landH, h * 2]} />
        {style.outline && <Edges color={style.outline} threshold={25} />}
      </mesh>
    </group>
  );
}

function Hills({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Low domes, a pair per triangle, so neither half is a flat tray.
  // [u, v, radius, height] — bridge-space, same as everything else.
  const hills: Array<[number, number, number, number]> = [
    [-3.0, -1.8, 1.35, 0.95],
    [-1.6, 2.4, 1.1, 0.7],
    [3.0, 1.5, 1.2, 0.8],
    [1.8, -2.5, 1.0, 0.6],
  ];
  return (
    <group>
      {hills.map(([x, z, r, hh], i) => (
        <mesh
          key={i}
          position={[uv(x, z)[0], CUBE.landTop, uv(x, z)[1]]}
          scale={[r, hh, r]}
          castShadow={style.shadows}
          receiveShadow={style.shadows}
          material={mat(style.hill)}
        >
          <sphereGeometry
            args={[1, style.rounded ? 26 : 8, style.rounded ? 15 : 4, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A loose street grid. Cheap, and it's what makes the land read as a city. */
function Streets({ style }: { style: SFStyle }) {
  const mat = useMat();
  const y = CUBE.landTop + 0.04;
  // Run parallel to the shoreline, so the grid reads as following the water.
  // [u, v, length] — each runs across v at constant u, parallel to the deck.
  const strips: Array<[number, number, number]> = [
    [1.3, 0.0, 3.4],
    [2.9, 0.0, 2.8],
    [4.2, 0.0, 1.8],
    [-1.3, 0.0, 3.4],
    [-2.9, 0.0, 2.8],
    [-4.2, 0.0, 1.8],
  ];
  return (
    <group>
      {strips.map(([u, v, len], i) => (
        <mesh
          key={i}
          position={[uv(u, v)[0], y, uv(u, v)[1]]}
          rotation={[0, -Math.PI / 4, 0]}
          material={mat(style.road)}
        >
          <boxGeometry args={[len, 0.05, 0.26]} />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------- the bridge

/** Six lanes, three each way, between the rails. */
const LANE_W = 0.76;
/** Full deck width, rail to rail — the 90 ft that the towers are scaled against. */
const DECK_W = 0.92;
const LANE_COUNT = 6;
const DASH = 0.16;
const DASH_GAP = 0.2;
/**
 * Tower legs straddle the deck. Their inner faces stand on the deck's edge
 * (±DECK_W / 2) all the way up, and each setback is taken off the outer face,
 * so the openings stay the roadway's width and the lanes always run clear.
 */
const LEG_INNER = DECK_W / 2;
/**
 * Leg sections, bottom to top: [across, along] — thickness across the bridge
 * and depth along it. The real legs are deeper along the bridge (54 ft) than
 * across (33 ft); these keep that and step in at each strut.
 */
const LEG_SECTIONS: Array<[number, number]> = [
  [0.24, 0.37],
  [0.22, 0.34],
  [0.19, 0.3],
  [0.17, 0.27],
];
/**
 * The pale stone pier each tower stands on: one oval under both legs, long
 * across the bridge, with a margin of stone showing round the leg bases.
 */
const FOOTING_H = 0.16;
const FOOTING_RX = LEG_SECTIONS[0][1] / 2 + 0.1; // along the bridge
const FOOTING_RZ = LEG_INNER + LEG_SECTIONS[0][0] + 0.1; // across it
/** Height of the sloped ledge where a leg steps in. */
const LEDGE_H = 0.06;
/**
 * The cables ride right over the middle of each leg top, in the saddle under
 * the cap's hood, as on the real towers. That puts them a little outboard of
 * the deck edge, where a stiffening truss down each side takes the hangers.
 */
const CABLE_Z = LEG_INNER + LEG_SECTIONS[LEG_SECTIONS.length - 1][0] / 2;
/** Cap proportions: a cornice on the leg top, then the rounded saddle hood. */
const CAP_CORNICE_H = 0.06;
const CAP_HOOD_H = 0.13;

/**
 * Asphalt and lane paint laid on top of the deck. The dashes are one instanced
 * mesh: four lines of them run the full corner-to-corner span, which is ~140
 * boxes that would otherwise each be a draw call.
 */
function Roadway({ style, deckTop }: { style: SFStyle; deckTop: number }) {
  const mat = useMat();
  const dashes = useRef<THREE.InstancedMesh>(null);
  const paintY = deckTop + 0.024;

  const lane = LANE_W / LANE_COUNT;
  // Dividers between lanes, skipping the centreline, which is drawn solid.
  const dashedZ = [-2, -1, 1, 2].map((k) => k * lane);
  const perLine = Math.floor(DECK_LEN / (DASH + DASH_GAP));

  useLayoutEffect(() => {
    const m = dashes.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (const z of dashedZ) {
      for (let k = 0; k < perLine; k++) {
        o.position.set(-DECK_LEN / 2 + (k + 0.5) * (DASH + DASH_GAP), paintY, z);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <mesh position={[0, deckTop + 0.01, 0]} receiveShadow={style.shadows} material={mat(style.asphalt)}>
        <boxGeometry args={[DECK_LEN - 0.02, 0.02, LANE_W]} />
      </mesh>
      {/* Centre divider: two thin lines, so it reads as the median at a glance. */}
      {[-0.012, 0.012].map((z) => (
        <mesh key={z} position={[0, paintY, z]} material={mat(style.trim)}>
          <boxGeometry args={[DECK_LEN - 0.02, 0.006, 0.01]} />
        </mesh>
      ))}
      <instancedMesh
        ref={dashes}
        args={[undefined, mat(style.trim), dashedZ.length * perLine]}
      >
        <boxGeometry args={[DASH, 0.006, 0.012]} />
      </instancedMesh>
    </>
  );
}


/**
 * Heights of the four portal struts' top edges, as fractions of the tower
 * above the deck (0 = roadway, 1 = leg top), lowest first. Read top-down, the
 * two upper gaps are equal and the two lower gaps — between the bottom pair,
 * and from the lowest strut down to the roadway — are equal and taller, so the
 * openings open up toward the traffic.
 */
const PORTAL_FRACTIONS = (() => {
  const top = 0.96;
  const ratio = 1.3; // lower gap ÷ upper gap
  const upper = top / (2 + 2 * ratio);
  const lower = upper * ratio;
  return [lower, 2 * lower, 2 * lower + upper, top];
})();

/**
 * One portal strut, seen face-on: a solid panel between the legs whose edges
 * step twice where they meet each leg. The steps under a strut clip the top
 * corners of the opening below it, and the steps on top clip the bottom
 * corners of the opening above, so every opening gets the stepped Art Deco
 * corners the real towers have. Built in the tower's cross-section plane
 * (x across the bridge, y up) with its top edge at y = 0, then extruded along
 * the bridge by `thickness`.
 */
function portalStrut(
  height: number,
  thickness: number,
  topKnees: boolean,
): THREE.ExtrudeGeometry {
  // Runs a little into each leg so there's no seam at the inner face.
  const W = LEG_INNER + 0.05;
  const knees = [
    { reach: 0.14, rise: 0.04 }, // outer knee, reaching further into the opening
    { reach: 0.07, rise: 0.04 }, // inner knee, tucked against the leg
  ];
  // The right half's outline, walked clockwise from the top of the knees.
  const half: Array<[number, number]> = [];
  let top = 0;
  if (topKnees) {
    for (const k of knees) {
      half.push([LEG_INNER - k.reach, top]);
      top += k.rise;
      half.push([LEG_INNER - k.reach, top]);
    }
  }
  half.push([W, top]);
  let bottom = -height;
  const under: Array<[number, number]> = [];
  for (const k of knees) {
    under.push([LEG_INNER - k.reach, bottom]);
    bottom -= k.rise;
    under.push([LEG_INNER - k.reach, bottom]);
  }
  half.push([W, bottom], ...under.reverse());

  const shape = new THREE.Shape();
  shape.moveTo(-half[0][0], half[0][1]);
  half.forEach(([x, y]) => shape.lineTo(x, y));
  [...half].reverse().forEach(([x, y]) => shape.lineTo(-x, y));
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  return g;
}

/**
 * A rectangular leg piece whose inner face sits on z = 0 and whose body
 * extends toward +z. Its section goes from [across0, along0] at the bottom to
 * [across1, along1] at the top: equal for a straight run, smaller for the
 * sloped ledge at a setback. The far leg uses the same geometry turned half a
 * revolution, which keeps the faces pointing outward (a mirror would not).
 */
function legPiece(
  [across0, along0]: [number, number],
  [across1, along1]: [number, number],
  height: number,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0.5);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i);
    pos.setXYZ(
      i,
      pos.getX(i) * THREE.MathUtils.lerp(along0, along1, t),
      t * height,
      pos.getZ(i) * THREE.MathUtils.lerp(across0, across1, t),
    );
  }
  g.computeVertexNormals();
  return g;
}

/**
 * The cap on each leg, after the real towers: a cornice slightly proud of the
 * leg, then a rounded saddle hood arching along the bridge (the main cable
 * runs into it over the crown), and a small square turret on top with a
 * railed platform. Sits in the leg's frame (inner face on z = 0, body toward
 * +z).
 */
function LegCap({ top, style }: { top: number; style: SFStyle }) {
  const mat = useMat();
  const orange = mat(style.orange);
  const [across, along] = LEG_SECTIONS[LEG_SECTIONS.length - 1];
  const cz = across / 2;
  const hoodY = top + CAP_CORNICE_H;
  const turretH = 0.09;
  const turretY = hoodY + CAP_HOOD_H * 0.85;
  return (
    <group position={[0, 0, cz]}>
      <mesh position={[0, top + CAP_CORNICE_H / 2, 0]} castShadow={style.shadows} material={orange}>
        <boxGeometry args={[along + 0.03, CAP_CORNICE_H, across + 0.03]} />
      </mesh>
      {/* Half a cylinder lying across the bridge, squashed into a low arch:
          its curve runs the way the cable does. */}
      <group position={[0, hoodY, 0]} scale={[1, CAP_HOOD_H / (along / 2), 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={style.shadows} material={orange}>
          <cylinderGeometry
            args={[along / 2 + 0.01, along / 2 + 0.01, across + 0.01, style.rounded ? 20 : 8, 1, false, Math.PI / 2, Math.PI]}
          />
        </mesh>
      </group>
      <mesh position={[0, turretY + turretH / 2, 0]} castShadow={style.shadows} material={orange}>
        <boxGeometry args={[along * 0.3, turretH, across * 0.42]} />
      </mesh>
      <mesh position={[0, turretY + turretH + 0.012, 0]} material={orange}>
        <boxGeometry args={[along * 0.42, 0.024, across * 0.56]} />
      </mesh>
    </group>
  );
}

function GoldenGate({ style }: { style: SFStyle }) {
  const mat = useMat();
  const orange = mat(style.orange);

  const deckY = 1.3;
  const deckTop = deckY + 0.085;
  // The one proportion kept true to life: the real deck is 90 ft wide and the
  // towers rise 500 ft above it. Squash them and it stops reading as this
  // bridge — they are why it's on every postcard.
  const legTop = deckTop + DECK_W * (500 / 90);
  // The cable crests on the saddle, just under the crown of the cap's hood.
  const towerH = legTop + CAP_CORNICE_H + CAP_HOOD_H * 0.8;
  const towerX = useMemo(() => [-TOWER_D, TOWER_D], []);

  // Main cable: tower top, dipping to just above the deck mid-span, back up,
  // then down to an anchorage at each end of the deck. The dip is the
  // silhouette. The ends land on the rail tops at the block's corners, so the
  // cable runs the bridge's full length instead of stopping short.
  const cable = useMemo(() => {
    const anchorY = deckY + 0.2;
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-DECK_LEN / 2, anchorY, 0),
      new THREE.Vector3(towerX[0], towerH, 0),
      new THREE.Vector3(0, deckY + 0.72, 0),
      new THREE.Vector3(towerX[1], towerH, 0),
      new THREE.Vector3(DECK_LEN / 2, anchorY, 0),
    ]);
    c.curveType = "catmullrom";
    c.tension = 0.4;
    return c;
  }, [towerX, towerH]);

  const hangers = useMemo(() => {
    const out: Array<{ x: number; top: number }> = [];
    // Hangers on the side spans too, now the cable runs out over them; only
    // the stretch right beside each tower is left clear.
    for (let i = 0; i <= 52; i++) {
      const pt = cable.getPoint(i / 52);
      if (towerX.some((x) => Math.abs(pt.x - x) < 0.25)) continue;
      if (pt.y - deckY < 0.2) continue;
      out.push({ x: pt.x, top: pt.y });
    }
    return out;
  }, [cable, towerX]);

  // Real towers step back in stages on the way up, each setback just above a
  // strut. Every section is a straight run topped by a sloped ledge into the
  // next, narrower one; the last runs to the leg top.
  const tower = useMemo(() => {
    const strutY = PORTAL_FRACTIONS.map((f) => deckTop + f * (legTop - deckTop));
    const breaks = [CUBE.landTop, strutY[0], strutY[1], strutY[2], legTop];
    const pieces: Array<{ y: number; geometry: THREE.BufferGeometry }> = [];
    const ribs: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [];
    LEG_SECTIONS.forEach((sec, i) => {
      const next = LEG_SECTIONS[i + 1];
      const y0 = breaks[i];
      const runH = breaks[i + 1] - y0 - (next ? LEDGE_H : 0);
      pieces.push({ y: y0, geometry: legPiece(sec, sec, runH) });
      if (next) pieces.push({ y: y0 + runH, geometry: legPiece(sec, next, LEDGE_H) });

      // Fluting: raised ribs on the faces leave channels between them that
      // catch shadow, which is what the real towers' vertical grooves read as
      // from any distance. Two on each face along the bridge, one outboard.
      const [across, along] = sec;
      const ribH = runH - 0.06;
      const ribY = y0 + runH / 2;
      for (const sx of [-1, 1]) {
        for (const f of [0.33, 0.67]) {
          ribs.push({
            pos: [sx * (along / 2 + 0.006), ribY, f * across],
            size: [0.012, ribH, 0.026],
          });
        }
      }
      ribs.push({ pos: [0, ribY, across + 0.006], size: [0.03, ribH, 0.012] });
    });

    const strutDepth = LEG_SECTIONS[LEG_SECTIONS.length - 1][1] * 0.8;
    const struts = strutY.map((y, k) => {
      const isTop = k === strutY.length - 1;
      const height = isTop ? 0.22 : 0.14;
      return { y, height, geometry: portalStrut(height, strutDepth, !isTop) };
    });
    // Below the deck the legs are tied by a single X panel, with a horizontal
    // tie above and below it. Everything sits in the tower's mid-plane, the
    // full width between the legs' inner faces, and stops short of the footing.
    const braceTop = deckY - 0.26; // just under the deck's lower chord
    const braceBottom = CUBE.landTop + FOOTING_H + 0.06;
    const panels = 1;
    const panelH = (braceTop - braceBottom) / panels;
    const span = LEG_INNER * 2;
    const ties = Array.from({ length: panels + 1 }, (_, k) => braceBottom + k * panelH);
    const diagonals = Array.from({ length: panels }, (_, k) => ({
      y: braceBottom + (k + 0.5) * panelH,
      length: Math.hypot(span, panelH),
      angle: Math.atan2(panelH, span),
    }));

    return { pieces, ribs, struts, strutDepth, ties, diagonals };
  }, [deckY, deckTop, legTop]);
  useEffect(
    () => () => {
      tower.pieces.forEach((p) => p.geometry.dispose());
      tower.struts.forEach((st) => st.geometry.dispose());
    },
    [tower],
  );

  return (
    <group rotation={[0, BRIDGE_ROT, 0]} scale={BRIDGE_SCALE}>
      {/* Roadway, corner to corner, with a raised rail down each side. */}
      <mesh position={[0, deckY, 0]} castShadow={style.shadows} material={orange}>
        <boxGeometry args={[DECK_LEN, 0.17, DECK_W]} />
        {style.outline && <Edges color={style.outline} threshold={15} />}
      </mesh>
      <Roadway style={style} deckTop={deckTop} />
      {[-0.43, 0.43].map((z) => (
        <mesh key={z} position={[0, deckY + 0.15, z]} material={orange} castShadow={false}>
          <boxGeometry args={[DECK_LEN, 0.13, 0.05]} />
        </mesh>
      ))}
      {/* Stiffening trusses down each side, under the cables, which the
          hangers land on. They run straight through the tower legs. */}
      {[-CABLE_Z, CABLE_Z].map((z) => (
        <mesh key={`st${z}`} position={[0, deckY - 0.02, z]} castShadow={style.shadows} material={orange}>
          <boxGeometry args={[DECK_LEN, 0.22, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, deckY - 0.15, 0]} material={orange} castShadow={false}>
        <boxGeometry args={[DECK_LEN, 0.13, 0.48]} />
      </mesh>

      {towerX.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Two legs: the near one as built, the far one turned half a
              revolution so its inner face also lands on the deck edge. */}
          {[0, Math.PI].map((turn) => (
            <group key={turn} rotation={[0, turn, 0]}>
              <group position={[0, 0, LEG_INNER]}>
                {tower.pieces.map((p, k) => (
                  <mesh
                    key={k}
                    position={[0, p.y, 0]}
                    geometry={p.geometry}
                    castShadow={style.shadows}
                    material={orange}
                  />
                ))}
                {tower.ribs.map((r, k) => (
                  <mesh key={`r${k}`} position={r.pos} material={orange}>
                    <boxGeometry args={r.size} />
                  </mesh>
                ))}
                <LegCap top={legTop} style={style} />
              </group>
            </group>
          ))}
          <mesh
            position={[0, CUBE.landTop + FOOTING_H / 2, 0]}
            scale={[FOOTING_RX, 1, FOOTING_RZ]}
            castShadow={style.shadows}
            receiveShadow={style.shadows}
            material={mat(style.concrete)}
          >
            <cylinderGeometry args={[1, 1, FOOTING_H, style.rounded ? 32 : 12]} />
          </mesh>
          {/* Under-deck bracing, as on the real towers: an X between the
              legs from the deck down to the footing. */}
          {tower.ties.map((y, k) => (
            <mesh key={`t${k}`} position={[0, y, 0]} castShadow={style.shadows} material={orange}>
              <boxGeometry args={[tower.strutDepth, 0.07, LEG_INNER * 2]} />
            </mesh>
          ))}
          {tower.diagonals.flatMap((d, k) =>
            [-1, 1].map((dir) => (
              <mesh
                key={`d${k}${dir}`}
                position={[0, d.y, 0]}
                rotation={[dir * d.angle, 0, 0]}
                castShadow={style.shadows}
                material={orange}
              >
                <boxGeometry args={[tower.strutDepth * 0.7, 0.05, d.length]} />
              </mesh>
            )),
          )}
          {/* Portal bracing. The stacked struts are the Art Deco tell that
              separates this bridge from every other suspension bridge. Each is
              a solid panel; a raised lip along its top and bottom edges on
              both faces leaves the middle reading as a recessed panel. */}
          {tower.struts.map((st, k) => (
            <group key={k} position={[0, st.y, 0]}>
              <mesh
                rotation={[0, Math.PI / 2, 0]}
                castShadow={style.shadows}
                geometry={st.geometry}
                material={orange}
              />
              {[-1, 1].flatMap((sx) =>
                [-0.015, -st.height + 0.015].map((dy) => (
                  <mesh
                    key={`${sx}${dy}`}
                    position={[sx * (tower.strutDepth / 2 + 0.006), dy, 0]}
                    material={orange}
                  >
                    <boxGeometry args={[0.012, 0.03, LEG_INNER * 2]} />
                  </mesh>
                )),
              )}
            </group>
          ))}
        </group>
      ))}

      {[-CABLE_Z, CABLE_Z].map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow={style.shadows} material={orange}>
          <tubeGeometry args={[cable, 44, 0.028, style.rounded ? 7 : 4, false]} />
        </mesh>
      ))}

      {hangers.map((hg, i) =>
        [-CABLE_Z, CABLE_Z].map((z) => (
          <mesh key={`${i}-${z}`} position={[hg.x, (hg.top + deckY) / 2, z]} material={orange}>
            <boxGeometry args={[0.016, hg.top - deckY, 0.016]} />
          </mesh>
        )),
      )}
    </group>
  );
}

// ------------------------------------------------------------------- towers

function Transamerica({ style }: { style: SFStyle }) {
  const mat = useMat();
  const slices = 13;
  const baseR = 0.78;
  const bodyBase = 1.1;
  const bodyTop = 4.3;

  return (
    <group position={[at(PLACE.transamerica)[0], CUBE.landTop, at(PLACE.transamerica)[1]]}>
      <Block style={style} position={[0, 0.55, 0]} size={[1.5, 1.1, 1.5]} color={style.concrete} />
      <Block style={style} position={[0, 1.1, 0]} size={[1.62, 0.09, 1.62]} color={style.trim} sharp />

      {/* The spire as a stack of thin four-sided frustums. The gaps between
          them read as floor lines, which is what a single smooth cone can't
          give you — and it costs thirteen meshes instead of a texture. */}
      {Array.from({ length: slices }, (_, i) => {
        const t0 = i / slices;
        const t1 = (i + 1) / slices;
        const h = (bodyTop - bodyBase) / slices;
        return (
          <mesh
            key={i}
            position={[0, bodyBase + (bodyTop - bodyBase) * t0 + h / 2, 0]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow={style.shadows}
            material={mat(style.concrete)}
          >
            <cylinderGeometry
              args={[baseR * (1 - t1) * 1.41, baseR * (1 - t0) * 1.41, h * 0.86, 4]}
            />
          </mesh>
        );
      })}

      {/* Shoulder wings: the elevator and stair shafts that stop it being a
          plain cone. Each gets its own little cap. */}
      {[-0.52, 0.52].map((x) => (
        <group key={x}>
          <Block
            style={style}
            position={[x, 2.1, 0]}
            size={[0.2, 2.1, 0.5]}
            color={style.concrete}
          />
          <mesh
            position={[x, 3.24, 0]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow={style.shadows}
            material={mat(style.concrete)}
          >
            <cylinderGeometry args={[0, 0.22, 0.26, 4]} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, bodyTop + 0.4, 0]} castShadow={style.shadows} material={mat(style.metal)}>
        <cylinderGeometry args={[0.018, 0.035, 0.85, 6]} />
      </mesh>
    </group>
  );
}

function Salesforce({ style }: { style: SFStyle }) {
  const mat = useMat();
  const slices = 15;
  const h = 5.0;

  return (
    <group position={[at(PLACE.salesforce)[0], CUBE.landTop, at(PLACE.salesforce)[1]]}>
      {Array.from({ length: slices }, (_, i) => {
        const t0 = i / slices;
        const t1 = (i + 1) / slices;
        const seg = h / slices;
        const r = (t: number) => 0.74 - 0.4 * t * t;
        return (
          <mesh
            key={i}
            position={[0, t0 * h + seg / 2, 0]}
            castShadow={style.shadows}
            material={mat(style.glass)}
          >
            <cylinderGeometry args={[r(t1), r(t0), seg * 0.9, style.rounded ? 22 : 6]} />
          </mesh>
        );
      })}
      {/* Mullions run the full height — the vertical emphasis is the whole
          character of this building. */}
      <Flutes
        count={style.rounded ? 14 : 6}
        radius={0.62}
        height={h * 0.82}
        y={h * 0.38}
        color={style.trim}
        thickness={0.035}
      />
      {/* Perforated crown. */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, h + 0.1 + i * 0.16, 0]}
          castShadow={style.shadows}
          material={mat(style.trim)}
        >
          <cylinderGeometry args={[0.3 - i * 0.08, 0.34 - i * 0.08, 0.1, style.rounded ? 18 : 6]} />
        </mesh>
      ))}
    </group>
  );
}

function CoitTower({ style }: { style: SFStyle }) {
  const mat = useMat();
  const seg = style.rounded ? 20 : 8;
  const shaftH = 2.15;
  // Up on the west hill, which is why a stubby concrete cylinder reads as tall.
  return (
    <group position={[at(PLACE.coit)[0], CUBE.landTop + 1.09, at(PLACE.coit)[1]]}>
      <mesh position={[0, 0.16, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.6, 0.68, 0.32, seg]} />
      </mesh>
      <mesh position={[0, 0.32 + shaftH / 2, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.44, 0.52, shaftH, seg]} />
        {style.outline && <Edges color={style.outline} threshold={28} />}
      </mesh>
      {/* Fluting. Coit is a plain cylinder without it. */}
      <Flutes
        count={style.rounded ? 14 : 8}
        radius={0.465}
        height={shaftH * 0.92}
        y={0.32 + shaftH / 2}
        color={style.trim}
        thickness={0.042}
      />
      {/* Arcade: the open arches under the crown. */}
      <mesh position={[0, 0.32 + shaftH + 0.2, 0]} castShadow={style.shadows} material={mat(style.window)}>
        <cylinderGeometry args={[0.42, 0.42, 0.38, seg]} />
      </mesh>
      <mesh position={[0, 0.32 + shaftH + 0.5, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.5, 0.53, 0.24, seg]} />
      </mesh>
      <mesh position={[0, 0.32 + shaftH + 0.72, 0]} castShadow={style.shadows} material={mat(style.trim)}>
        <cylinderGeometry args={[0.34, 0.46, 0.2, seg]} />
      </mesh>
    </group>
  );
}

function FerryBuilding({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Low, long, arcaded, with the clock tower in the middle. The horizontal
  // counterweight to all those towers.
  return (
    <group position={[at(PLACE.ferry)[0], CUBE.landTop, at(PLACE.ferry)[1]]} rotation={[0, -Math.PI / 4, 0]}>
      <Block style={style} position={[0, 0.46, 0]} size={[3.5, 0.92, 0.9]} color={style.concrete} />
      <Block style={style} position={[0, 0.95, 0]} size={[3.64, 0.1, 1.02]} color={style.trim} sharp />
      {/* Arcade along the front. */}
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          style={style}
          sharp
          position={[-1.5 + i * 0.375, 0.35, 0.47]}
          size={[0.19, 0.46, 0.05]}
          color={style.window}
        />
      ))}
      {/* Clock tower. */}
      <Block style={style} position={[0, 1.65, 0]} size={[0.72, 1.3, 0.72]} color={style.concrete} />
      <FloorBands
        base={1.2}
        top={2.2}
        width={0.72}
        depth={0.72}
        floors={3}
        color={style.trim}
      />
      {[0, 1].map((i) => (
        <Block
          key={i}
          style={style}
          sharp
          position={i ? [0, 2.12, 0.38] : [0.38, 2.12, 0]}
          size={i ? [0.3, 0.3, 0.03] : [0.03, 0.3, 0.3]}
          color={style.window}
        />
      ))}
      <Block style={style} position={[0, 2.38, 0]} size={[0.84, 0.1, 0.84]} color={style.trim} sharp />
      <mesh position={[0, 2.66, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={style.shadows} material={mat(style.trim)}>
        <cylinderGeometry args={[0, 0.5, 0.5, 4]} />
      </mesh>
    </group>
  );
}

/** Filler skyline. Varied crowns so the cluster doesn't read as a bar chart. */
function Skyline({ style }: { style: SFStyle }) {
  const mat = useMat();
  // [u, v] in bridge-space: |u| > TOWER_D keeps them on land, |v| keeps them
  // out of the roadway, and u + |v| < CUBE.half * SQRT2 keeps them on the
  // block. Every row below satisfies all three.


  return (
    <group>
      {TOWERS.map((t, i) => (
        <group key={i} position={[uv(t.u, t.v)[0], CUBE.landTop, uv(t.u, t.v)[1]]} rotation={tilt(style, i + 31)}>
          <Block
            style={style}
            position={[0, t.h / 2, 0]}
            size={[t.w, t.h, t.d]}
            color={style.glass}
          />
          <FloorBands
            base={0.25}
            top={t.h - 0.2}
            width={t.w}
            depth={t.d}
            floors={Math.max(3, Math.round(t.h * 2.2))}
            color={style.trim}
          />
          {t.crown === "step" && (
            <>
              <Block
                style={style}
                position={[0, t.h + 0.17, 0]}
                size={[t.w * 0.7, 0.34, t.d * 0.7]}
                color={style.glass}
              />
              <Block
                style={style}
                position={[0, t.h + 0.44, 0]}
                size={[t.w * 0.42, 0.22, t.d * 0.42]}
                color={style.glass}
              />
            </>
          )}
          {t.crown === "spire" && (
            <mesh position={[0, t.h + 0.4, 0]} castShadow={style.shadows} material={mat(style.metal)}>
              <cylinderGeometry args={[0.012, 0.05, 0.8, 5]} />
            </mesh>
          )}
          {t.crown === "flat" && (
            <Block
              style={style}
              sharp
              position={[0, t.h + 0.05, 0]}
              size={[t.w + 0.07, 0.1, t.d + 0.07]}
              color={style.trim}
            />
          )}
        </group>
      ))}
    </group>
  );
}

// --------------------------------------------------------------- the houses

function PaintedLadies({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Six narrow houses, tight together, stepping up the slope. The row only
  // works if they touch and the colors clearly differ — spaced out, Alamo
  // Square turns into a suburb.
  return (
    <group position={[at(PLACE.ladies)[0], CUBE.landTop, at(PLACE.ladies)[1]]} rotation={[0, -Math.PI / 4, 0]}>
      {style.victorian.slice(0, 5).map((color, i) => {
        const x = (i - 2) * 0.76;
        const lift = i * 0.12;
        const h = 1.85 + (i % 2) * 0.16;
        return (
          <group key={i} position={[x, lift, 0]} rotation={tilt(style, i + 7)}>
            <Block style={style} position={[0, h / 2, 0]} size={[0.72, h, 0.86]} color={color} />
            {/* Cornice. A Victorian without one reads as a shed. */}
            <Block
              style={style}
              sharp
              position={[0, h + 0.03, 0]}
              size={[0.82, 0.09, 0.97]}
              color={style.trim}
            />
            {/* Pitched roof: a four-sided cone turned 45°. */}
            <mesh
              position={[0, h + 0.33, 0]}
              rotation={[0, Math.PI / 4, 0]}
              castShadow={style.shadows}
              material={mat(color)}
            >
              <cylinderGeometry args={[0, 0.6, 0.52, 4]} />
              {style.outline && <Edges color={style.outline} threshold={15} />}
            </mesh>
            <Block
              style={style}
              sharp
              position={[0.28, h + 0.46, -0.2]}
              size={[0.1, 0.34, 0.1]}
              color={style.trim}
            />
            {/* Bay window, with its own little roof — the detail that makes
                these houses San Franciscan rather than generic Victorian. */}
            <Block
              style={style}
              position={[0, h * 0.46, 0.57]}
              size={[0.38, h * 0.52, 0.18]}
              color={color}
            />
            <Block
              style={style}
              sharp
              position={[0, h * 0.46, 0.66]}
              size={[0.28, h * 0.34, 0.03]}
              color={style.window}
            />
            <Block
              style={style}
              sharp
              position={[0, h * 0.74, 0.58]}
              size={[0.44, 0.06, 0.22]}
              color={style.trim}
            />
            {/* Upper windows and the door. */}
            {[-0.22, 0.22].map((wx) => (
              <Block
                key={wx}
                style={style}
                sharp
                position={[wx, h * 0.8, 0.53]}
                size={[0.14, 0.24, 0.03]}
                color={style.window}
              />
            ))}
            <Block
              style={style}
              sharp
              position={[0.3, 0.2, 0.53]}
              size={[0.17, 0.4, 0.03]}
              color={style.window}
            />
            {/* The stoop. Every one of these houses is up a flight of steps. */}
            {[0, 1, 2].map((s) => (
              <Block
                key={s}
                style={style}
                sharp
                position={[0.3, 0.04 + s * 0.045, 0.62 + s * 0.07]}
                size={[0.24, 0.05, 0.08]}
                color={style.trim}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Lombard({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Eight switchbacks with planting between them. It only reads from above,
  // which is the only angle anyone photographs it from anyway.
  const segments = useMemo(() => {
    const out: Array<{ pos: [number, number, number]; rot: number }> = [];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      out.push({
        pos: [i % 2 === 0 ? -0.42 : 0.42, 1.0 - t * 0.95, -1.5 + t * 1.9],
        rot: i % 2 === 0 ? 0.6 : -0.6,
      });
    }
    return out;
  }, []);

  return (
    <group position={[at(PLACE.lombard)[0], CUBE.landTop, at(PLACE.lombard)[1]]}>
      {segments.map((s, i) => (
        <group key={i}>
          <mesh position={s.pos} rotation={[0, s.rot, 0]} material={mat(style.road)}>
            <boxGeometry args={[1.05, 0.05, 0.3]} />
          </mesh>
          <mesh
            position={[s.pos[0], s.pos[1] + 0.07, s.pos[2]]}
            rotation={[0, s.rot, 0]}
            material={mat(style.hill)}
          >
            <boxGeometry args={[0.9, 0.09, 0.1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ------------------------------------------------------------- small things

function Alcatraz({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Out in the bay, deliberately small and deliberately alone.
  return (
    <group position={[at(PLACE.alcatraz)[0], CUBE.landTop, at(PLACE.alcatraz)[1]]} scale={0.75}>
      <mesh position={[0, 0.22, 0]} receiveShadow={style.shadows} material={mat(style.landSide)}>
        <cylinderGeometry args={[0.78, 0.98, 0.52, style.rounded ? 14 : 6]} />
        {style.outline && <Edges color={style.outline} threshold={25} />}
      </mesh>
      {/* Cell block, with the window rows that make it a prison. */}
      <Block style={style} position={[0, 0.74, 0]} size={[1.1, 0.5, 0.52]} color={style.concrete} />
      {[0.62, 0.84].map((y) =>
        Array.from({ length: 5 }, (_, i) => (
          <Block
            key={`${y}-${i}`}
            style={style}
            sharp
            position={[-0.4 + i * 0.2, y, 0.27]}
            size={[0.08, 0.1, 0.02]}
            color={style.window}
          />
        )),
      )}
      <Block style={style} sharp position={[0, 1.01, 0]} size={[1.18, 0.06, 0.6]} color={style.trim} />
      {/* Lighthouse, with a lantern room. */}
      <mesh position={[0.46, 1.32, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.07, 0.1, 0.72, style.rounded ? 10 : 5]} />
      </mesh>
      <Block style={style} sharp position={[0.46, 1.72, 0]} size={[0.13, 0.13, 0.13]} color={style.window} />
      <mesh position={[0.46, 1.84, 0]} castShadow={style.shadows} material={mat(style.metal)}>
        <cylinderGeometry args={[0, 0.1, 0.12, 6]} />
      </mesh>
    </group>
  );
}

function CableCar({ style }: { style: SFStyle }) {
  // One car cresting the hill. Small on purpose — it's the detail you find on
  // the second look, not a landmark.
  return (
    <group position={[at(PLACE.cableCar)[0], CUBE.landTop + 0.5, at(PLACE.cableCar)[1]]} rotation={[0, -Math.PI / 4, 0]}>
      <Block style={style} position={[0, 0.14, 0]} size={[0.58, 0.2, 0.26]} color={style.orange} />
      {[-0.17, 0, 0.17].map((x) => (
        <Block
          key={x}
          style={style}
          sharp
          position={[x, 0.17, 0.135]}
          size={[0.12, 0.11, 0.02]}
          color={style.window}
        />
      ))}
      <Block style={style} sharp position={[0, 0.27, 0]} size={[0.62, 0.05, 0.3]} color={style.trim} />
      <Block style={style} sharp position={[-0.22, 0.07, 0]} size={[0.06, 0.06, 0.28]} color={style.metal} />
    </group>
  );
}

// -------------------------------------------------------------------- scene

export default function SFScene({ style }: { style: SFStyle }) {
  return (
    <MaterialProvider style={style}>
      <Terrain style={style} />
      <Hills style={style} />
      <Streets style={style} />
      <Transamerica style={style} />
      <Salesforce style={style} />
      <Skyline style={style} />
      <FerryBuilding style={style} />
      <CoitTower style={style} />
      <PaintedLadies style={style} />
      <Lombard style={style} />
      <Alcatraz style={style} />
      <CableCar style={style} />
      <GoldenGate style={style} />
    </MaterialProvider>
  );
}
