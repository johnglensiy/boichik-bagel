"use client";

import { Edges } from "@react-three/drei";
import { CUBE } from "../core/space";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";

export function Terrain({ style }: { style: SFStyle }) {
  const mat = useMat();
  const h = CUBE.half;
  const baseH = CUBE.baseTop - CUBE.bottom;
  const landH = CUBE.landTop - CUBE.baseTop;

  return (
    <group>
      {/* The block of rock the whole thing is cut from. */}
      <mesh
        position={[0, CUBE.bottom + baseH / 2, 0]}
        receiveShadow={style.shadows}
        castShadow={style.shadows}
        material={mat(style.landSide)}
      >
        <boxGeometry args={[h * 2, baseH, h * 2]} />
        {style.outline && <Edges color={style.outline} threshold={15} />}
      </mesh>

      {/* Solid ground, corner to corner. */}
      <mesh
        position={[0, CUBE.baseTop + landH / 2, 0]}
        receiveShadow={style.shadows}
        castShadow={style.shadows}
        material={mat(style.land)}
      >
        <boxGeometry args={[h * 2, landH, h * 2]} />
        {style.outline && <Edges color={style.outline} threshold={25} />}
      </mesh>
    </group>
  );
}
