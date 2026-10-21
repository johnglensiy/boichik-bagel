"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

type V3 = [number, number, number];

/** Where the three legs stand, pinch in and splay back out, bottom to top. */
const LEVELS = [
  { y: 0, r: 0.34 },
  { y: 1.55, r: 0.07 },
  { y: 2.55, r: 0.2 },
];
/** Above the top level each leg carries on straight up as an antenna mast. */
const MAST_TOP = 3.2;
/** Paint bands per leg section — the red-and-white is half of its identity. */
const BANDS = 7;
/** Platforms tying the legs together. */
const DECKS = [0.75, 1.55, 2.1, 2.55];

const UP = new THREE.Vector3(0, 1, 0);

/** Leg i of three at a level, 120° apart. */
function legAt(i: number, y: number, r: number): V3 {
  const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}

/** Radius of the legs at height y, read off LEVELS. */
function radiusAt(y: number): number {
  for (let k = 1; k < LEVELS.length; k++) {
    const lo = LEVELS[k - 1];
    const hi = LEVELS[k];
    if (y <= hi.y) return THREE.MathUtils.lerp(lo.r, hi.r, (y - lo.y) / (hi.y - lo.y));
  }
  return LEVELS[LEVELS.length - 1].r;
}

/** A straight member from a to b: position, length and the turn that aims +y along it. */
function beam(a: V3, b: V3) {
  const va = new THREE.Vector3(...a);
  const d = new THREE.Vector3(...b).sub(va);
  const len = d.length();
  return {
    pos: va.addScaledVector(d, 0.5).toArray() as V3,
    len,
    quat: new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()),
  };
}

/**
 * Sutro Tower: three legs that pinch in to a waist and splay out again into
 * the trident of masts, painted in red and white bands. The silhouette —
 * a giant three-pronged fork on the skyline — is the whole read, so the legs
 * are true members between real points rather than one tapered mesh.
 */
function SutroTower({ style }: { style: SFStyle }) {
  const mat = useMat();
  const sides = style.rounded ? 8 : 4;

  const members = useMemo(() => {
    const legs: Array<ReturnType<typeof beam> & { color: "red" | "white" }> = [];
    for (let i = 0; i < 3; i++) {
      // Each section between levels, cut into alternating paint bands.
      for (let k = 1; k < LEVELS.length; k++) {
        const lo = LEVELS[k - 1];
        const hi = LEVELS[k];
        for (let b = 0; b < BANDS; b++) {
          const y0 = lo.y + ((hi.y - lo.y) * b) / BANDS;
          const y1 = lo.y + ((hi.y - lo.y) * (b + 1)) / BANDS;
          legs.push({
            ...beam(legAt(i, y0, radiusAt(y0)), legAt(i, y1, radiusAt(y1))),
            color: (b + k) % 2 ? "red" : "white",
          });
        }
      }
    }
    const masts = [0, 1, 2].map((i) => {
      const r = LEVELS[LEVELS.length - 1].r;
      return beam(legAt(i, LEVELS[LEVELS.length - 1].y, r), legAt(i, MAST_TOP, r));
    });
    const decks = DECKS.flatMap((y) =>
      [0, 1, 2].map((i) => beam(legAt(i, y, radiusAt(y)), legAt((i + 1) % 3, y, radiusAt(y)))),
    );
    return { legs, masts, decks };
  }, []);

  const color = (c: "red" | "white") => mat(c === "red" ? style.orange : style.trim);

  return (
    <group>
      {members.legs.map((m, i) => (
        <mesh key={`l${i}`} position={m.pos} quaternion={m.quat} castShadow={style.shadows} material={color(m.color)}>
          <cylinderGeometry args={[0.032, 0.036, m.len + 0.01, sides]} />
        </mesh>
      ))}
      {members.masts.map((m, i) => (
        <mesh key={`m${i}`} position={m.pos} quaternion={m.quat} castShadow={style.shadows} material={color(i % 2 ? "white" : "red")}>
          <cylinderGeometry args={[0.012, 0.024, m.len, sides]} />
        </mesh>
      ))}
      {members.decks.map((m, i) => (
        <mesh key={`d${i}`} position={m.pos} quaternion={m.quat} material={mat(style.trim)}>
          <cylinderGeometry args={[0.014, 0.014, m.len, 4]} />
        </mesh>
      ))}
      {/* Footings under each leg. */}
      {[0, 1, 2].map((i) => {
        const [x, , z] = legAt(i, 0, LEVELS[0].r);
        return (
          <mesh key={`f${i}`} position={[x, 0.03, z]} receiveShadow={style.shadows} material={mat(style.concrete)}>
            <boxGeometry args={[0.1, 0.06, 0.1]} />
          </mesh>
        );
      })}
    </group>
  );
}

export const sutroTower: LandmarkDef = {
  id: "sutroTower",
  label: "Sutro Tower",
  footprint: { across: 0.4, along: 0.4 },
  Model: SutroTower,
};
