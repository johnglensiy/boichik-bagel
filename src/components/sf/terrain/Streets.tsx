"use client";

import { CUBE, uv } from "../core/space";
import { useMat } from "../core/materials";
import type { SFStyle } from "../styles";

/** A loose street grid. Cheap, and it's what makes the land read as a city. */
export function Streets({ style }: { style: SFStyle }) {
  const mat = useMat();
  const y = CUBE.landTop + 0.04;
  // Run parallel to the shoreline, so the grid reads as following the water.
  // [u, v, length] — each runs across v at constant u, parallel to the deck.
  const strips: Array<[number, number, number]> = [
    [1.3, 0.0, 3.4],
    [2.9, 0.0, 2.8],
    [4.2, 0.0, 1.8],
    [-1.3, 0.0, 3.4],
    [-2.9, 0.0, 2.8],
    [-4.2, 0.0, 1.8],
  ];
  return (
    <group>
      {strips.map(([u, v, len], i) => (
        <mesh
          key={i}
          position={[uv(u, v)[0], y, uv(u, v)[1]]}
          rotation={[0, -Math.PI / 4, 0]}
          material={mat(style.road)}
        >
          <boxGeometry args={[len, 0.05, 0.26]} />
        </mesh>
      ))}
    </group>
  );
}
