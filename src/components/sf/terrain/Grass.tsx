"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CUBE, groundHeight } from "../core/space";
import { CELL, cellCentre, type Cell } from "../roads";
import { makeToonRamp, type SFStyle } from "../styles";
import { clampToBlock } from "./Terrain";

/** Over the land, under the road tiles (which sit at 0.012), so roads cross lawns cleanly. */
const LIFT = 0.006;
/** Each square is split this many times a side, so a lawn bends over a hill. */
const SPLITS = 2;
/** Squares per repeat of the texture: two mowing stripes, each two squares wide. */
const TEX_CELLS = 4;
/** Real grass green, pulled toward the style's own hill colour so it sits in the palette. */
const GRASS_GREEN = "#5f9e4a";

/**
 * A mown-field texture, drawn once: alternating light and dark mowing
 * stripes with a speckle of blades over them, in greys so the material's
 * colour does the greening. Deterministic, so every load looks the same.
 */
function grassTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const stripe = size / 2;
  for (let s = 0; s < 2; s++) {
    ctx.fillStyle = s ? "rgb(206,206,206)" : "rgb(240,240,240)";
    ctx.fillRect(0, s * stripe, size, stripe);
  }
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let k = 0; k < 2600; k++) {
    const v = Math.round(150 + rand() * 105);
    ctx.fillStyle = `rgba(${v},${v},${v},0.55)`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 1.5, 2 + rand() * 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Every painted square as one mesh, laid on the land and bent to it. UVs come
 * from the city's own x and z, so the stripes run unbroken from square to
 * square across a whole lawn.
 */
function lawnGeometry(cells: Cell[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const n = SPLITS + 1;
  const texSize = CELL * TEX_CELLS;
  for (const cell of cells) {
    const [cx, cz] = cellCentre(cell);
    const first = positions.length / 3;
    for (let b = 0; b < n; b++) {
      for (let a = 0; a < n; a++) {
        const [x, z] = clampToBlock(
          cx - CELL / 2 + (CELL * a) / SPLITS,
          cz - CELL / 2 + (CELL * b) / SPLITS,
          CUBE.half,
        );
        positions.push(x, CUBE.landTop + groundHeight(x, z) + LIFT, z);
        uvs.push(x / texSize, z / texSize);
      }
    }
    for (let b = 0; b < SPLITS; b++) {
      for (let a = 0; a < SPLITS; a++) {
        const i = first + b * n + a;
        index.push(i, i + n, i + 1, i + 1, i + n, i + n + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** The painted lawns, the Marina Green among them. */
export function Grass({ style, cells }: { style: SFStyle; cells: Cell[] }) {
  const map = useMemo(() => grassTexture(), []);
  const geometry = useMemo(() => lawnGeometry(cells), [cells]);
  const material = useMemo(() => {
    const color = new THREE.Color(style.hill).lerp(new THREE.Color(GRASS_GREEN), 0.55);
    // Laid this close to the land, depth alone can't decide which is on top
    // from far off; the offset settles it for the lawn. Road tiles sit high
    // enough above it to still win where a road crosses.
    const offset = { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 };
    return style.toon
      ? new THREE.MeshToonMaterial({ map, color, gradientMap: makeToonRamp(3), ...offset })
      : new THREE.MeshStandardMaterial({
          map,
          color,
          roughness: 1,
          metalness: 0,
          flatShading: style.flatShading,
          ...offset,
        });
  }, [style, map]);

  useEffect(() => () => map.dispose(), [map]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      if (material instanceof THREE.MeshToonMaterial) material.gradientMap?.dispose();
      material.dispose();
    },
    [material],
  );

  if (!cells.length) return null;
  return <mesh geometry={geometry} material={material} receiveShadow={style.shadows} />;
}
