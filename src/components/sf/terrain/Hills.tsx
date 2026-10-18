"use client";

import { CUBE, uv } from "../core/space";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";

export function Hills({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Low domes, a pair per triangle, so neither half is a flat tray.
  // [u, v, radius, height] — bridge-space, same as everything else.
  const hills: Array<[number, number, number, number]> = [
    [-3.0, -1.8, 1.35, 0.95],
    [-1.6, 2.4, 1.1, 0.7],
    [3.0, 1.5, 1.2, 0.8],
    [1.8, -2.5, 1.0, 0.6],
  ];
  return (
    <group>
      {hills.map(([x, z, r, hh], i) => (
        <mesh
          key={i}
          position={[uv(x, z)[0], CUBE.landTop, uv(x, z)[1]]}
          scale={[r, hh, r]}
          castShadow={style.shadows}
          receiveShadow={style.shadows}
          material={mat(style.hill)}
        >
          <sphereGeometry
            args={[1, style.rounded ? 26 : 8, style.rounded ? 15 : 4, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
        </mesh>
      ))}
    </group>
  );
}
