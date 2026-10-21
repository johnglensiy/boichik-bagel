"use client";

import { useMat } from "../core/materials";
import { Flutes } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function Salesforce({ style }: { style: SFStyle }) {
  const mat = useMat();
  const slices = 15;
  const h = 5.0;

  return (
    <group>
      {Array.from({ length: slices }, (_, i) => {
        const t0 = i / slices;
        const t1 = (i + 1) / slices;
        const seg = h / slices;
        const r = (t: number) => 0.74 - 0.4 * t * t;
        return (
          <mesh
            key={i}
            position={[0, t0 * h + seg / 2, 0]}
            castShadow={style.shadows}
            material={mat(style.glass)}
          >
            <cylinderGeometry args={[r(t1), r(t0), seg * 0.9, style.rounded ? 22 : 6]} />
          </mesh>
        );
      })}
      {/* Mullions run the full height — the vertical emphasis is the whole
          character of this building. */}
      <Flutes
        count={style.rounded ? 14 : 6}
        radius={0.62}
        height={h * 0.82}
        y={h * 0.38}
        color={style.trim}
        thickness={0.035}
      />
      {/* Perforated crown. */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, h + 0.1 + i * 0.16, 0]}
          castShadow={style.shadows}
          material={mat(style.trim)}
        >
          <cylinderGeometry args={[0.3 - i * 0.08, 0.34 - i * 0.08, 0.1, style.rounded ? 18 : 6]} />
        </mesh>
      ))}
    </group>
  );
}

export const salesforce: LandmarkDef = {
  id: "salesforce",
  label: "Salesforce Tower",
  footprint: { across: 0.78, along: 0.78 },
  Model: Salesforce,
};
