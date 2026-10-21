"use client";

import { useMat } from "../core/materials";
import { Block } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function Transamerica({ style }: { style: SFStyle }) {
  const mat = useMat();
  const slices = 13;
  const baseR = 0.78;
  const bodyBase = 1.1;
  const bodyTop = 4.3;

  return (
    <group>
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

export const transamerica: LandmarkDef = {
  id: "transamerica",
  label: "Transamerica Pyramid",
  footprint: { across: 0.9, along: 0.9 },
  Model: Transamerica,
};
