"use client";

import { useMemo } from "react";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

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
