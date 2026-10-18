"use client";

import { Edges } from "@react-three/drei";
import { useMat } from "../core/materials";
import { Block } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function Alcatraz({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Out in the bay, deliberately small and deliberately alone.
  return (
    <group scale={0.75}>
      <mesh position={[0, 0.22, 0]} receiveShadow={style.shadows} material={mat(style.landSide)}>
        <cylinderGeometry args={[0.78, 0.98, 0.52, style.rounded ? 14 : 6]} />
        {style.outline && <Edges color={style.outline} threshold={25} />}
      </mesh>
      {/* Cell block, with the window rows that make it a prison. */}
      <Block style={style} position={[0, 0.74, 0]} size={[1.1, 0.5, 0.52]} color={style.concrete} />
      {[0.62, 0.84].map((y) =>
        Array.from({ length: 5 }, (_, i) => (
          <Block
            key={`${y}-${i}`}
            style={style}
            sharp
            position={[-0.4 + i * 0.2, y, 0.27]}
            size={[0.08, 0.1, 0.02]}
            color={style.window}
          />
        )),
      )}
      <Block style={style} sharp position={[0, 1.01, 0]} size={[1.18, 0.06, 0.6]} color={style.trim} />
      {/* Lighthouse, with a lantern room. */}
      <mesh position={[0.46, 1.32, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.07, 0.1, 0.72, style.rounded ? 10 : 5]} />
      </mesh>
      <Block style={style} sharp position={[0.46, 1.72, 0]} size={[0.13, 0.13, 0.13]} color={style.window} />
      <mesh position={[0.46, 1.84, 0]} castShadow={style.shadows} material={mat(style.metal)}>
        <cylinderGeometry args={[0, 0.1, 0.12, 6]} />
      </mesh>
    </group>
  );
}

export const alcatraz: LandmarkDef = {
  id: "alcatraz",
  label: "Alcatraz",
  footprint: { across: 0.74, along: 0.74 },
  Model: Alcatraz,
};
