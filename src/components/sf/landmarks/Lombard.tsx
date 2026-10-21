"use client";

import { useMemo } from "react";
import { useGroundUnder } from "../core/ground";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function Lombard({ style }: { style: SFStyle }) {
  const mat = useMat();
  const groundUnder = useGroundUnder();
  // Eight switchbacks with planting between them. It only reads from above,
  // which is the only angle anyone photographs it from anyway. Each one lies
  // on the land under it, so on its hill they step down the slope: the model
  // runs downhill toward +z.
  const segments = useMemo(() => {
    const out: Array<{ pos: [number, number, number]; rot: number }> = [];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const x = i % 2 === 0 ? -0.42 : 0.42;
      const z = -1.5 + t * 1.9;
      out.push({
        pos: [x, groundUnder(x, z) + 0.03, z],
        rot: i % 2 === 0 ? 0.6 : -0.6,
      });
    }
    return out;
  }, [groundUnder]);

  return (
    <group>
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

export const lombard: LandmarkDef = {
  id: "lombard",
  label: "Lombard Street",
  footprint: { across: 0.7, along: 1.1 },
  Model: Lombard,
};
