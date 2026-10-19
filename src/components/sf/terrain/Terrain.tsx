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
 * The block's four land-layer sides, from the rock's top up to the ground, as
 * one geometry. Each side's top edge follows groundHeight, so where a hill
 * is cut off by the block the side rises to show its profile, and it meets the
 * surface's edge exactly (same sample points). Each side runs so its front
 * faces outward: along up × outward normal.
 */
function landSides(half: number, segments: number): THREE.BufferGeometry {
  const sides: Array<{ start: [number, number]; dir: [number, number] }> = [
    { start: [half, half], dir: [0, -1] }, // +x
    { start: [-half, -half], dir: [0, 1] }, // -x
    { start: [-half, half], dir: [1, 0] }, // +z
    { start: [half, -half], dir: [-1, 0] }, // -z
  ];
  const positions: number[] = [];
  const index: number[] = [];
  for (const { start, dir } of sides) {
    const first = positions.length / 3;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * half * 2;
      const x = start[0] + dir[0] * t;
      const z = start[1] + dir[1] * t;
      positions.push(x, CUBE.baseTop, z, x, CUBE.landTop + groundHeight(x, z), z);
    }
    for (let i = 0; i < segments; i++) {
      const b0 = first + i * 2;
      const t0 = b0 + 1;
      const b1 = b0 + 2;
      const t1 = b0 + 3;
      index.push(b0, b1, t0, t0, b1, t1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/**
 * The land's top surface: a fine grid lifted by groundHeight, so the hills
 * rise out of the plain with no seam.
 */
export function landSurface(): THREE.BufferGeometry {
  const h = CUBE.half;
  const g = new THREE.PlaneGeometry(h * 2, h * 2, LAND_SEGMENTS, LAND_SEGMENTS);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, CUBE.landTop + groundHeight(pos.getX(i), pos.getZ(i)));
  }
  g.computeVertexNormals();
  return g;
}

export function Terrain({ style }: { style: SFStyle }) {
  const mat = useMat();
  const h = CUBE.half;
  const baseH = CUBE.baseTop - CUBE.bottom;

  const surface = useMemo(() => landSurface(), []);
  const sides = useMemo(() => landSides(h, LAND_SEGMENTS), [h]);
  useEffect(
    () => () => {
      surface.dispose();
      sides.dispose();
    },
    [surface, sides],
  );

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
