"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import { useMat } from "./materials";
import type { SFStyle } from "../styles";

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
export function Block({ position, size, color, style, rotation, sharp }: BlockProps) {
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
export function FloorBands({
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
export function Flutes({
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
export function tilt(style: SFStyle, seed: number): [number, number, number] {
  if (!style.jitter) return [0, 0, 0];
  const a = Math.sin(seed * 12.9898) * 43758.5453;
  const b = Math.sin(seed * 78.233) * 12345.6789;
  const f = (n: number) => (n - Math.floor(n) - 0.5) * style.jitter;
  return [f(a) * 0.6, f(b) * 2.2, f(a + b) * 0.6];
}
