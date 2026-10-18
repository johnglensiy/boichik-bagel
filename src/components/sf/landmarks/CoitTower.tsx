"use client";

import { Edges } from "@react-three/drei";
import { useMat } from "../core/materials";
import { Flutes } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function CoitTower({ style }: { style: SFStyle }) {
  const mat = useMat();
  const seg = style.rounded ? 20 : 8;
  const shaftH = 2.15;
  // Up on the west hill, which is why a stubby concrete cylinder reads as tall.
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.6, 0.68, 0.32, seg]} />
      </mesh>
      <mesh position={[0, 0.32 + shaftH / 2, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.44, 0.52, shaftH, seg]} />
        {style.outline && <Edges color={style.outline} threshold={28} />}
      </mesh>
      {/* Fluting. Coit is a plain cylinder without it. */}
      <Flutes
        count={style.rounded ? 14 : 8}
        radius={0.465}
        height={shaftH * 0.92}
        y={0.32 + shaftH / 2}
        color={style.trim}
        thickness={0.042}
      />
      {/* Arcade: the open arches under the crown. */}
      <mesh position={[0, 0.32 + shaftH + 0.2, 0]} castShadow={style.shadows} material={mat(style.window)}>
        <cylinderGeometry args={[0.42, 0.42, 0.38, seg]} />
      </mesh>
      <mesh position={[0, 0.32 + shaftH + 0.5, 0]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.5, 0.53, 0.24, seg]} />
      </mesh>
      <mesh position={[0, 0.32 + shaftH + 0.72, 0]} castShadow={style.shadows} material={mat(style.trim)}>
        <cylinderGeometry args={[0.34, 0.46, 0.2, seg]} />
      </mesh>
    </group>
  );
}

export const coit: LandmarkDef = {
  id: "coit",
  label: "Coit Tower",
  footprint: { across: 0.7, along: 0.7 },
  lift: 1.09,
  Model: CoitTower,
};
