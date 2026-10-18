"use client";

import { useMat } from "../core/materials";
import { Block, FloorBands } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function FerryBuilding({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Low, long, arcaded, with the clock tower in the middle. The horizontal
  // counterweight to all those towers.
  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      <Block style={style} position={[0, 0.46, 0]} size={[3.5, 0.92, 0.9]} color={style.concrete} />
      <Block style={style} position={[0, 0.95, 0]} size={[3.64, 0.1, 1.02]} color={style.trim} sharp />
      {/* Arcade along the front. */}
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          style={style}
          sharp
          position={[-1.5 + i * 0.375, 0.35, 0.47]}
          size={[0.19, 0.46, 0.05]}
          color={style.window}
        />
      ))}
      {/* Clock tower. */}
      <Block style={style} position={[0, 1.65, 0]} size={[0.72, 1.3, 0.72]} color={style.concrete} />
      <FloorBands
        base={1.2}
        top={2.2}
        width={0.72}
        depth={0.72}
        floors={3}
        color={style.trim}
      />
      {[0, 1].map((i) => (
        <Block
          key={i}
          style={style}
          sharp
          position={i ? [0, 2.12, 0.38] : [0.38, 2.12, 0]}
          size={i ? [0.3, 0.3, 0.03] : [0.03, 0.3, 0.3]}
          color={style.window}
        />
      ))}
      <Block style={style} position={[0, 2.38, 0]} size={[0.84, 0.1, 0.84]} color={style.trim} sharp />
      <mesh position={[0, 2.66, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={style.shadows} material={mat(style.trim)}>
        <cylinderGeometry args={[0, 0.5, 0.5, 4]} />
      </mesh>
    </group>
  );
}

export const ferry: LandmarkDef = {
  id: "ferry",
  label: "Ferry Building",
  footprint: { across: 0.55, along: 1.85 },
  Model: FerryBuilding,
};
