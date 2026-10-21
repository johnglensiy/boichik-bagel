"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CUBE, groundHeight } from "../core/space";
import { CELL, ROAD_WIDTH, cellCentre, onRim, sameCell, type Cell, type Road } from "../roads";
import { ROAD_TINT, makeToonRamp, type SFStyle } from "../styles";
import { CableCarRide } from "./CableCarRide";

/** Kenney's City Kit (Roads), CC0 (kenney.nl). All three share one colormap texture. */
const STRAIGHT = "/models/roads/road-straight.glb";
const CROSSROAD = "/models/roads/road-crossroad.glb";
const END = "/models/roads/road-end-round.glb";

/** Just over the land, so the surface never shows through between a tile's vertices. */
const LIFT = 0.012;
/**
 * Crossroad and end tiles sit this much higher than the runs they join, so
 * where a run meets one at an odd angle and they overlap, the joint draws on
 * top instead of flickering.
 */
const JOINT_LIFT = 0.004;

/** One tile model's mesh as a geometry: position, normal and uv only, at its node transform. */
function tileGeometry(scene: THREE.Object3D): THREE.BufferGeometry {
  scene.updateMatrixWorld(true);
  let found: THREE.BufferGeometry | null = null;
  scene.traverse((o) => {
    if (found || !(o instanceof THREE.Mesh)) return;
    const g = (o.geometry as THREE.BufferGeometry).clone().applyMatrix4(o.matrixWorld);
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
    }
    found = g;
  });
  if (!found) throw new Error("road tile has no mesh");
  return found;
}

/**
 * A tile placed on the land: stretched to `length` along its own x (the way
 * the kit's straight runs and its end piece opens) and a road's width across,
 * turned to `angle` about the vertical, centred on (x, z), then bent to the
 * ground.
 *
 * `mitre` cuts its ends on a slant for a bend: each is how far an end edge
 * moves along x per unit across (+z, the road's left), so its start edge for
 * `start` and its end edge for `end`. The tile is sheared to get there, its
 * other edge left square.
 */
function placeTile(
  tile: THREE.BufferGeometry,
  x: number,
  z: number,
  angle: number,
  length: number,
  lift: number,
  mitre: { start: number; end: number } = { start: 0, end: 0 },
): THREE.BufferGeometry {
  const g = tile.clone();
  g.scale(length, ROAD_WIDTH, ROAD_WIDTH);
  if (mitre.start || mitre.end) {
    const pos = g.attributes.position;
    for (let k = 0; k < pos.count; k++) {
      const px = pos.getX(k);
      const pz = pos.getZ(k);
      const toEnd = (px + length / 2) / length; // 0 at the start edge, 1 at the end
      pos.setX(k, px + pz * (mitre.end * toEnd + mitre.start * (1 - toEnd)));
    }
  }
  g.rotateY(angle);
  g.translate(x, 0, z);
  const pos = g.attributes.position;
  for (let k = 0; k < pos.count; k++) {
    pos.setY(k, pos.getY(k) + CUBE.landTop + groundHeight(pos.getX(k), pos.getZ(k)) + lift);
  }
  g.computeVertexNormals();
  return g;
}

/** The rotation about Y that turns a tile's +x to point along (dx, dz). */
const angleOf = (dx: number, dz: number) => Math.atan2(-dz, dx);

/** Signed angle from direction a to b, positive turning toward a's left (its local +z). */
function turnBetween(a: [number, number], b: [number, number]): number {
  const left = -b[0] * a[1] + b[1] * a[0];
  const ahead = b[0] * a[0] + b[1] * a[1];
  return Math.atan2(left, ahead);
}

/** Past this, a bend is near enough a U-turn that it can't be rounded; it gets a crossroad tile. */
const MAX_BEND = (150 * Math.PI) / 180;
/** Radius of a bend's curve, to the road's centreline: wide enough that its inside kerb stays a gentle arc. */
const BEND_RADIUS = ROAD_WIDTH * 1.4;
/** Below this the curve would pinch its inside kerb; such a tight bend keeps a sharp mitre instead. */
const MIN_BEND_RADIUS = ROAD_WIDTH * 0.6;
/** Degrees of turn per slice of a curve: fine enough that the slices read as one sweep. */
const BEND_STEP = (12 * Math.PI) / 180;
/** Turns smaller than this are a straight carry-on, not a bend worth curving. */
const MIN_CURVE = (2 * Math.PI) / 180;

type Vec = [number, number];
/** Turns a direction by `a` toward its left (+z local), as turnBetween measures. */
const rotate = ([x, z]: Vec, a: number): Vec => [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)];

/**
 * A bend's curve: an arc of radius `radius` set into the corner, touching
 * the first road `cut` short of the square and the second the same. Its
 * slices are chords of the arc, so each joint between them turns by `step`
 * and the joints onto the roads by half that.
 */
interface Curve {
  /** The road that leaves the square along `dirs[0]`, and the one along `dirs[1]`. */
  runs: [number, number];
  /** How far back from the square each road stops. */
  cut: number;
  /** The arc's points, from the first road's end round to the second's. */
  points: Vec[];
  /** Travelling round it: the direction arriving off the first road, and leaving onto the second. */
  into: Vec;
  out: Vec;
}

/**
 * Lays the roads in kit tiles. Each road is a run of straight tiles turned to
 * its angle, a whole number of them stretched a touch to fit exactly. Where
 * roads meet there's a joint:
 *
 * - two roads: a bend, swept round a curve. Both roads stop short of the
 *   square and an arc of thin tile slices carries one into the other, each
 *   slice mitred to the next so the kerbs run on unbroken. The curve tightens
 *   to fit short roads; a bend too tight for any curve is cut on a plain
 *   mitre, and a straight carry-on just continues;
 * - three or more roads: a crossroad tile, open on every side;
 * - one road: a rounded dead end, unless it's on the block's rim, where the
 *   road runs straight off the edge.
 */
function layRoads(
  roads: Road[],
  straight: THREE.BufferGeometry,
  crossroad: THREE.BufferGeometry,
  end: THREE.BufferGeometry,
): { tiles: THREE.BufferGeometry | null; tracks: Vec[][] } {
  const runs = roads.filter(([a, b]) => !sameCell(a, b));
  const lengths = runs.map(([a, b]) => {
    const [ax, az] = cellCentre(a);
    const [bx, bz] = cellCentre(b);
    return Math.hypot(bx - ax, bz - az);
  });
  // Every square a road starts or ends on, with the directions leaving it
  // and which road each belongs to.
  const nodes = new Map<string, { cell: Cell; dirs: Array<{ dir: Vec; run: number }> }>();
  const node = (c: Cell) => {
    const key = `${c[0]},${c[1]}`;
    let n = nodes.get(key);
    if (!n) nodes.set(key, (n = { cell: c, dirs: [] }));
    return n;
  };
  runs.forEach(([a, b], run) => {
    const [ax, az] = cellCentre(a);
    const [bx, bz] = cellCentre(b);
    const len = lengths[run];
    node(a).dirs.push({ dir: [(bx - ax) / len, (bz - az) / len], run });
    node(b).dirs.push({ dir: [(ax - bx) / len, (az - bz) / len], run });
  });

  type Joint = "cross" | "bend" | "end" | "rim";
  const jointAt = (c: Cell): Joint => {
    const { dirs } = node(c);
    if (dirs.length === 1) return onRim(c) ? "rim" : "end";
    if (dirs.length === 2) {
      // Arriving along one, leaving along the other: how far it turns.
      const [p, q] = dirs;
      const turn = turnBetween([-p.dir[0], -p.dir[1]], q.dir);
      return Math.abs(turn) <= MAX_BEND ? "bend" : "cross";
    }
    return "cross";
  };
  // At a bend, the other road's direction leaving that square.
  const otherDir = (c: Cell, run: number) => node(c).dirs.find((d) => d.run !== run)!.dir;

  // Each bend's curve, where one fits. Neither road gives up more than half
  // its length, so a road with a curve at both ends still has some left.
  const curves = new Map<string, Curve>();
  for (const [key, { cell, dirs }] of nodes) {
    if (dirs.length !== 2 || jointAt(cell) !== "bend") continue;
    const [p, q] = dirs;
    const into: Vec = [-p.dir[0], -p.dir[1]];
    const turn = turnBetween(into, q.dir);
    if (Math.abs(turn) < MIN_CURVE) continue;
    const half = Math.tan(Math.abs(turn) / 2);
    const room = 0.5 * Math.min(lengths[p.run], lengths[q.run]);
    const radius = Math.min(BEND_RADIUS, room / half);
    if (radius < MIN_BEND_RADIUS) continue;
    const cut = radius * half;
    const [x, z] = cellCentre(cell);
    const start: Vec = [x + p.dir[0] * cut, z + p.dir[1] * cut];
    // The arc's centre, off to the side the road turns toward.
    const side = rotate(into, (Math.sign(turn) * Math.PI) / 2);
    const centre: Vec = [start[0] + side[0] * radius, start[1] + side[1] * radius];
    const slices = Math.max(2, Math.ceil(Math.abs(turn) / BEND_STEP));
    const points = Array.from({ length: slices + 1 }, (_, i) => {
      const r = rotate([start[0] - centre[0], start[1] - centre[1]], (turn * i) / slices);
      return [centre[0] + r[0], centre[1] + r[1]] as Vec;
    });
    curves.set(key, { runs: [p.run, q.run], cut, points, into, out: q.dir });
  }
  const curveAt = (c: Cell) => curves.get(`${c[0]},${c[1]}`);
  // Where road `run` meets a curve: the direction leaving that point into it.
  const intoCurve = (curve: Curve, run: number): Vec => {
    const pts = curve.points;
    const [from, to] = run === curve.runs[0] ? [pts[0], pts[1]] : [pts[pts.length - 1], pts[pts.length - 2]];
    const l = Math.hypot(to[0] - from[0], to[1] - from[1]);
    return [(to[0] - from[0]) / l, (to[1] - from[1]) / l];
  };

  const tiles: THREE.BufferGeometry[] = [];
  // The cable car track's centreline through every road: straight down each
  // run, round each curve, through crossroads to their middle, up to a dead
  // end's square, and off the rim.
  const tracks: Vec[][] = [];
  runs.forEach(([a, b], k) => {
    const [ax, az] = cellCentre(a);
    const len = lengths[k];
    const [bx, bz] = cellCentre(b);
    const d: Vec = [(bx - ax) / len, (bz - az) / len];
    const ja = jointAt(a);
    const jb = jointAt(b);
    const ca = curveAt(a);
    const cb = curveAt(b);
    // Stop short of a curve by its cut and of a joint tile by half a road;
    // run right to a bend's square that has no curve; reach half a square
    // past one on the rim, so the road meets the edge.
    const trim = (j: Joint, c: Curve | undefined) =>
      c ? c.cut : j === "rim" ? -CELL / 2 : j === "bend" ? 0 : ROAD_WIDTH / 2;
    const from = trim(ja, ca);
    const run = len - from - trim(jb, cb);
    const trackTrim = (j: Joint, c: Curve | undefined) => (c ? c.cut : j === "rim" ? -CELL / 2 : 0);
    const t0 = trackTrim(ja, ca);
    const t1 = len - trackTrim(jb, cb);
    if (t1 - t0 > 0.01) {
      tracks.push([
        [ax + d[0] * t0, az + d[1] * t0],
        [ax + d[0] * t1, az + d[1] * t1],
      ]);
    }
    if (run <= 0.01) return;
    // The end edges' slant, from the turn into whatever comes next: half the
    // turn's tangent per unit across, back on the inside and on outside.
    const mitreStart = ca
      ? (() => {
          const i = intoCurve(ca, k);
          return Math.tan(turnBetween([-i[0], -i[1]], d) / 2);
        })()
      : ja === "bend"
        ? (() => {
            const o = otherDir(a, k);
            return Math.tan(turnBetween([-o[0], -o[1]], d) / 2);
          })()
        : 0;
    const mitreEnd = cb
      ? -Math.tan(turnBetween(d, intoCurve(cb, k)) / 2)
      : jb === "bend"
        ? -Math.tan(turnBetween(d, otherDir(b, k)) / 2)
        : 0;
    const count = Math.max(1, Math.round(run / ROAD_WIDTH));
    const each = run / count;
    // A hair's difference per road, so two that cross don't flicker.
    const lift = LIFT + (k % 4) * 0.0006;
    for (let t = 0; t < count; t++) {
      const s = from + (t + 0.5) * each;
      tiles.push(
        placeTile(straight, ax + d[0] * s, az + d[1] * s, angleOf(...d), each, lift, {
          start: t === 0 ? mitreStart : 0,
          end: t === count - 1 ? mitreEnd : 0,
        }),
      );
    }
  });

  // The curves themselves: one slice of straight tile per chord, each
  // mitred into its neighbours so the kerbs sweep round unbroken.
  for (const { runs: [first], points, into, out } of curves.values()) {
    tracks.push(points);
    const chords = points.slice(1).map((q, i) => {
      const p = points[i];
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return { mid: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as Vec, dir: [(q[0] - p[0]) / l, (q[1] - p[1]) / l] as Vec, l };
    });
    const lift = LIFT + (first % 4) * 0.0006;
    chords.forEach((c, i) => {
      const prev = chords[i - 1];
      const next = chords[i + 1];
      tiles.push(
        placeTile(straight, c.mid[0], c.mid[1], angleOf(...c.dir), c.l, lift, {
          // Each joint is cut at half its turn: onto a road, half of half a step; between slices, half a step.
          start: Math.tan(turnBetween(prev ? prev.dir : into, c.dir) / 2),
          end: -Math.tan(turnBetween(c.dir, next ? next.dir : out) / 2),
        }),
      );
    });
  }

  for (const { cell, dirs } of nodes.values()) {
    const joint = jointAt(cell);
    const [x, z] = cellCentre(cell);
    if (joint === "cross") {
      tiles.push(placeTile(crossroad, x, z, angleOf(...dirs[0].dir), ROAD_WIDTH, LIFT + JOINT_LIFT));
    } else if (joint === "end") {
      // The end piece is closed at -x and opens along +x, into its road.
      tiles.push(placeTile(end, x, z, angleOf(...dirs[0].dir), ROAD_WIDTH, LIFT + JOINT_LIFT));
    }
  }

  if (!tiles.length) return { tiles: null, tracks };
  const merged = mergeGeometries(tiles);
  tiles.forEach((g) => g.dispose());
  return { tiles: merged, tracks };
}

/**
 * SF's cable car track, as it sits in the street: a pale concrete bed down
 * the middle of the road, two steel rails set in it, and between them the
 * narrow dark slot the cable runs under. Sizes are fractions of a road's
 * width; [offset from the centreline, width].
 */
const TRACK = {
  bed: [[0, 0.42]],
  rails: [
    [-0.14, 0.035],
    [0.14, 0.035],
  ],
  slot: [[0, 0.025]],
} as const;
const TRACK_COLORS = { bed: "#a9a398", rails: "#a2a5a9", slot: "#1f1c19" } as const;
/** Over the road tiles (their highest joint sits ~0.018 up), the rails and slot a touch over the bed. */
const BED_LIFT = 0.02;
const RAIL_LIFT = 0.022;
/** Sample spacing along a track, so it follows the hills as the tiles do. */
const TRACK_STEP = 0.08;

/** A path with extra points every TRACK_STEP, so ribbons along it can hug the ground. */
function densify(path: Vec[]): Vec[] {
  const out: Vec[] = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const [px, pz] = path[i - 1];
    const [qx, qz] = path[i];
    const n = Math.max(1, Math.ceil(Math.hypot(qx - px, qz - pz) / TRACK_STEP));
    for (let k = 1; k <= n; k++) out.push([px + ((qx - px) * k) / n, pz + ((qz - pz) * k) / n]);
  }
  return out;
}

/**
 * Flat ribbons laid along paths, one per lane: each `[offset, width]` across
 * the path in road widths, left (+z local) positive. Joints are mitred, so a
 * ribbon keeps its width round a bend, and each point sits on the ground.
 */
function ribbons(paths: Vec[][], lanes: ReadonlyArray<readonly [number, number]>, lift: number) {
  const positions: number[] = [];
  const index: number[] = [];
  for (const raw of paths) {
    const pts = densify(raw);
    if (pts.length < 2) continue;
    // Each segment's left, and at each point the mitre between its two.
    const lefts = pts.slice(1).map(([qx, qz], i) => {
      const [px, pz] = pts[i];
      const l = Math.hypot(qx - px, qz - pz) || 1;
      return [-(qz - pz) / l, (qx - px) / l] as Vec;
    });
    const mitres = pts.map((_, i) => {
      const a = lefts[Math.max(0, i - 1)];
      const b = lefts[Math.min(lefts.length - 1, i)];
      const m: Vec = [a[0] + b[0], a[1] + b[1]];
      const ml = Math.hypot(m[0], m[1]) || 1;
      // Lengthened by 1/cos(half the turn), so the ribbon's width holds round it.
      const k = 1 / Math.max(0.5, (m[0] * b[0] + m[1] * b[1]) / ml);
      return [(m[0] / ml) * k, (m[1] / ml) * k] as Vec;
    });
    for (const [offset, width] of lanes) {
      const first = positions.length / 3;
      pts.forEach(([x, z], i) => {
        for (const side of [1, -1]) {
          const o = (offset + (side * width) / 2) * ROAD_WIDTH;
          const px = x + mitres[i][0] * o;
          const pz = z + mitres[i][1] * o;
          positions.push(px, CUBE.landTop + groundHeight(px, pz) + lift, pz);
        }
      });
      for (let i = 0; i < pts.length - 1; i++) {
        const l0 = first + i * 2;
        const r0 = l0 + 1;
        const l1 = l0 + 2;
        const r1 = l0 + 3;
        index.push(l0, l1, r0, r0, l1, r1);
      }
    }
  }
  if (!positions.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/**
 * The hand-drawn roads in Kenney's road tiles, each bent to the ground under
 * it so the streets climb and drop with the hills, with a cable car track
 * down every one. The tiles are merged into one mesh and each part of the
 * track into one more: four draw calls however many roads.
 */
export function Roads({
  style,
  roads,
  car,
}: {
  style: SFStyle;
  roads: Road[];
  /** A cable car model to ride the track end to end, or nothing. */
  car?: ReactNode;
}) {
  const [straightModel, crossModel, endModel] = useGLTF([STRAIGHT, CROSSROAD, END]);
  const pieces = useMemo(
    () => ({
      straight: tileGeometry(straightModel.scene),
      cross: tileGeometry(crossModel.scene),
      end: tileGeometry(endModel.scene),
    }),
    [straightModel, crossModel, endModel],
  );
  useEffect(
    () => () => Object.values(pieces).forEach((g) => g.dispose()),
    [pieces],
  );

  const laid = useMemo(
    () => layRoads(roads, pieces.straight, pieces.cross, pieces.end),
    [roads, pieces],
  );
  const geometry = laid.tiles;
  useEffect(() => () => geometry?.dispose(), [geometry]);

  // The cable car track down every road: bed, rails, slot.
  const track = useMemo(
    () => ({
      bed: ribbons(laid.tracks, TRACK.bed, BED_LIFT),
      rails: ribbons(laid.tracks, TRACK.rails, RAIL_LIFT),
      slot: ribbons(laid.tracks, TRACK.slot, RAIL_LIFT),
    }),
    [laid],
  );
  useEffect(() => () => Object.values(track).forEach((g) => g?.dispose()), [track]);
  // Plain colours in the city's shading. Pulled toward the camera a little,
  // so where a tile's flat face cuts under the curve of a hill the track
  // still shows over it.
  const trackMaterials = useMemo(() => {
    const make = (color: string, steel = false) => {
      const offset = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
      return style.toon
        ? new THREE.MeshToonMaterial({ color, gradientMap: makeToonRamp(3), ...offset })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: steel ? 0.35 : style.roughness,
            metalness: steel ? 0.6 : style.metalness,
            flatShading: style.flatShading,
            ...offset,
          });
    };
    return {
      bed: make(TRACK_COLORS.bed),
      rails: make(TRACK_COLORS.rails, true),
      slot: make(TRACK_COLORS.slot),
    };
  }, [style]);
  useEffect(
    () => () =>
      Object.values(trackMaterials).forEach((m) => {
        if (m instanceof THREE.MeshToonMaterial) m.gradientMap?.dispose();
        m.dispose();
      }),
    [trackMaterials],
  );

  // The kit's colormap, read off a tile. It belongs to the loader's cache, so
  // only the material made here is ours to dispose.
  const map = useMemo(() => {
    let found: THREE.Texture | null = null;
    straightModel.scene.traverse((o) => {
      if (!found && o instanceof THREE.Mesh) {
        found = (o.material as THREE.MeshStandardMaterial).map ?? null;
      }
    });
    return found as THREE.Texture | null;
  }, [straightModel]);

  // Same material treatment as the rest of the city, so the roads pick up
  // each style's shading.
  const material = useMemo(
    () =>
      style.toon
        ? new THREE.MeshToonMaterial({ map, color: ROAD_TINT, gradientMap: makeToonRamp(3) })
        : new THREE.MeshStandardMaterial({
            map,
            // Warms the kit's blue-cast texture: brownish asphalt, kerbs that match the land.
            color: ROAD_TINT,
            roughness: style.roughness,
            metalness: style.metalness,
            flatShading: style.flatShading,
          }),
    [style, map],
  );
  useEffect(
    () => () => {
      if (material instanceof THREE.MeshToonMaterial) material.gradientMap?.dispose();
      material.dispose();
    },
    [material],
  );

  if (!geometry) return null;
  return (
    <group>
      <mesh geometry={geometry} material={material} receiveShadow={style.shadows} />
      {car && <CableCarRide tracks={laid.tracks}>{car}</CableCarRide>}
      {(["bed", "rails", "slot"] as const).map(
        (part) =>
          track[part] && (
            <mesh
              key={part}
              geometry={track[part]}
              material={trackMaterials[part]}
              receiveShadow={style.shadows}
            />
          ),
      )}
    </group>
  );
}

useGLTF.preload([STRAIGHT, CROSSROAD, END]);
