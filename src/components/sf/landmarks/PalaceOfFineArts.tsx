"use client";

import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

const COLONNADE_R = 0.74;
/** The colonnade's sweep behind the rotunda, in radians from +x toward +z. */
const ARC_FROM = (200 * Math.PI) / 180;
const ARC_TO = (340 * Math.PI) / 180;
const COLONNADE_COLUMNS = 13;

/**
 * The Palace of Fine Arts: an open domed rotunda on its ring of columns,
 * the long curved colonnade sweeping round behind it, and the lagoon in
 * front. The dome and the arc are what make it this building; a rotunda alone
 * is any civic monument. The lagoon sits toward +z, the colonnade toward -z.
 */
function PalaceOfFineArts({ style }: { style: SFStyle }) {
  const mat = useMat();
  const seg = style.rounded ? 24 : 8;
  const stone = style.concrete;
  const dome = style.victorian[0];

  const colonnade = Array.from({ length: COLONNADE_COLUMNS }, (_, i) => {
    const a = ARC_FROM + ((ARC_TO - ARC_FROM) * i) / (COLONNADE_COLUMNS - 1);
    return { a, x: Math.cos(a) * COLONNADE_R, z: Math.sin(a) * COLONNADE_R };
  });
  // Entablature: one beam between each pair of neighbouring columns, so the
  // arc reads as continuous without a curved mesh.
  const beams = colonnade.slice(1).map((c, i) => {
    const p = colonnade[i];
    return {
      x: (p.x + c.x) / 2,
      z: (p.z + c.z) / 2,
      len: Math.hypot(c.x - p.x, c.z - p.z) + 0.02,
      rot: -Math.atan2(c.z - p.z, c.x - p.x),
    };
  });

  return (
    <group>
      {/* Lagoon in front. */}
      <mesh position={[0, 0.006, 0.58]} scale={[0.68, 1, 0.26]} material={mat(style.glass)}>
        <cylinderGeometry args={[1, 1, 0.012, seg]} />
      </mesh>

      {/* Rotunda: plinth, eight columns, entablature, drum and dome. */}
      <mesh position={[0, 0.04, 0]} castShadow={style.shadows} receiveShadow={style.shadows} material={mat(stone)}>
        <cylinderGeometry args={[0.38, 0.4, 0.08, 8]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.3, 0.38, Math.sin(a) * 0.3]}
            castShadow={style.shadows}
            material={mat(style.trim)}
          >
            <cylinderGeometry args={[0.028, 0.032, 0.6, style.rounded ? 10 : 6]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.72, 0]} castShadow={style.shadows} material={mat(stone)}>
        <cylinderGeometry args={[0.36, 0.34, 0.08, 8]} />
      </mesh>
      <mesh position={[0, 0.84, 0]} castShadow={style.shadows} material={mat(stone)}>
        <cylinderGeometry args={[0.27, 0.29, 0.16, seg]} />
      </mesh>
      <mesh position={[0, 0.92, 0]} scale={[1, 0.85, 1]} castShadow={style.shadows} material={mat(dome)}>
        <sphereGeometry args={[0.28, seg, style.rounded ? 14 : 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 1.21, 0]} castShadow={style.shadows} material={mat(stone)}>
        <cylinderGeometry args={[0.035, 0.05, 0.08, 8]} />
      </mesh>

      {/* The colonnade arcing round behind. */}
      {colonnade.map((c, i) => (
        <mesh key={i} position={[c.x, 0.24, c.z]} castShadow={style.shadows} material={mat(style.trim)}>
          <cylinderGeometry args={[0.022, 0.026, 0.48, style.rounded ? 8 : 5]} />
        </mesh>
      ))}
      {beams.map((b, i) => (
        <mesh key={i} position={[b.x, 0.51, b.z]} rotation={[0, b.rot, 0]} castShadow={style.shadows} material={mat(stone)}>
          <boxGeometry args={[b.len, 0.06, 0.08]} />
        </mesh>
      ))}
      {/* The tall planter boxes at the colonnade's ends. */}
      {[colonnade[0], colonnade[colonnade.length - 1]].map((c, i) => (
        <mesh key={i} position={[c.x, 0.32, c.z]} castShadow={style.shadows} material={mat(stone)}>
          <boxGeometry args={[0.1, 0.64, 0.1]} />
        </mesh>
      ))}
    </group>
  );
}

export const palaceOfFineArts: LandmarkDef = {
  id: "palaceOfFineArts",
  label: "Palace of Fine Arts",
  footprint: { across: 0.85, along: 0.85 },
  Model: PalaceOfFineArts,
};
