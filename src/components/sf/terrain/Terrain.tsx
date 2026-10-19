"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { CUBE, groundHeight } from "../core/space";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";

/** Grid cells per side of the land surface; enough for the hills to read round. */
const LAND_SEGMENTS = 96;

/**
 * Radius of the block's rounded corners, seen from above. Soft corners make
 * the cube read as a made object — a carved block, a toy — rather than a
 * slice cut out of a map.
 */
export const CORNER_R = 0.9;
/** Points per quarter-round corner, on the sides and on the rock. */
const CORNER_STEPS = 12;

/**
 * The block's outline as one loop of points, walked so that each side's
 * front faces outward: down the +x side toward -z, along -z toward -x, up the
 * -x side, back along +z, with a quarter circle at each corner. Straight runs
 * are sampled as finely as the land grid so the sides' tops meet its edge.
 */
function outline(half: number, step: number): Array<[number, number]> {
  const c = half - CORNER_R;
  const pts: Array<[number, number]> = [];
  const edge = (x0: number, z0: number, x1: number, z1: number) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step));
    for (let i = 0; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n]);
  };
  // A corner centred at (cx, cz), from angle a0 to a1 (angle 0 is +x, π/2 is +z).
  const corner = (cx: number, cz: number, a0: number, a1: number) => {
    for (let i = 0; i < CORNER_STEPS; i++) {
      const a = a0 + ((a1 - a0) * i) / CORNER_STEPS;
      pts.push([cx + Math.cos(a) * CORNER_R, cz + Math.sin(a) * CORNER_R]);
    }
  };
  edge(half, c, half, -c);
  corner(c, -c, 0, -Math.PI / 2);
  edge(c, -half, -c, -half);
  corner(-c, -c, -Math.PI / 2, -Math.PI);
  edge(-half, -c, -half, c);
  corner(-c, c, Math.PI, Math.PI / 2);
  edge(-c, half, c, half);
  corner(c, c, Math.PI / 2, 0);
  pts.push(pts[0]); // close the loop
  return pts;
}

/** The nearest point on or inside the rounded block to (x, z). */
export function clampToBlock(x: number, z: number, half: number): [number, number] {
  const c = half - CORNER_R;
  const ax = Math.abs(x);
  const az = Math.abs(z);
  if (ax <= c || az <= c) {
    return [Math.sign(x) * Math.min(ax, half), Math.sign(z) * Math.min(az, half)];
  }
  // In a corner's square: keep within the corner's circle.
  const dx = ax - c;
  const dz = az - c;
  const d = Math.hypot(dx, dz);
  if (d <= CORNER_R) return [x, z];
  const k = CORNER_R / d;
  return [Math.sign(x) * (c + dx * k), Math.sign(z) * (c + dz * k)];
}

/** The rock: the rounded block's outline extruded from the bottom up to baseTop. */
function rockBlock(half: number): THREE.ExtrudeGeometry {
  const pts = outline(half, half);
  const shape = new THREE.Shape();
  // Drawn in (x, -z): standing the extrusion up maps the shape's y onto -z.
  pts.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: CUBE.baseTop - CUBE.bottom,
    bevelEnabled: false,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, CUBE.bottom, 0);
  return g;
}

/**
 * The block's land-layer sides, from the rock's top up to the ground, as one
 * band round the rounded outline. Its top edge follows groundHeight, so where
 * a hill is cut off by the block the side rises to show its profile, and it
 * meets the surface's edge. The outline's winding keeps every face outward.
 */
function landSides(half: number, segments: number): THREE.BufferGeometry {
  const pts = outline(half, (half * 2) / segments);
  const positions: number[] = [];
  const index: number[] = [];
  for (const [x, z] of pts) {
    positions.push(x, CUBE.baseTop, z, x, CUBE.landTop + groundHeight(x, z), z);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const b0 = i * 2;
    const t0 = b0 + 1;
    const b1 = b0 + 2;
    const t1 = b0 + 3;
    index.push(b0, b1, t0, t0, b1, t1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/**
 * The land's top surface: a fine grid lifted by groundHeight, so the hills
 * rise out of the plain with no seam. Also what the road editor clicks on.
 * Grid points past a rounded corner are pulled onto its curve, so the
 * surface's edge follows the corner instead of overhanging it.
 */
export function landSurface(): THREE.BufferGeometry {
  const h = CUBE.half;
  const g = new THREE.PlaneGeometry(h * 2, h * 2, LAND_SEGMENTS, LAND_SEGMENTS);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const [x, z] = clampToBlock(pos.getX(i), pos.getZ(i), h);
    pos.setXYZ(i, x, CUBE.landTop + groundHeight(x, z), z);
  }
  g.computeVertexNormals();
  return g;
}

export function Terrain({ style }: { style: SFStyle }) {
  const mat = useMat();
  const h = CUBE.half;

  const surface = useMemo(() => landSurface(), []);
  const sides = useMemo(() => landSides(h, LAND_SEGMENTS), [h]);
  const rock = useMemo(() => rockBlock(h), [h]);
  useEffect(
    () => () => {
      surface.dispose();
      sides.dispose();
      rock.dispose();
    },
    [surface, sides, rock],
  );

  return (
    <group>
      {/* The block of rock the whole thing is cut from. */}
      <mesh
        geometry={rock}
        receiveShadow={style.shadows}
        castShadow={style.shadows}
        material={mat(style.landSide)}
      >
        {style.outline && <Edges color={style.outline} threshold={15} />}
      </mesh>

      {/* The land layer's sides, rising wherever a hill is cut off. */}
      <mesh geometry={sides} receiveShadow={style.shadows} castShadow={style.shadows} material={mat(style.land)}>
        {style.outline && <Edges color={style.outline} threshold={25} />}
      </mesh>

      {/* Its top, with the hills in it. */}
      <mesh
        geometry={surface}
        receiveShadow={style.shadows}
        castShadow={style.shadows}
        material={mat(style.land)}
      />
    </group>
  );
}
