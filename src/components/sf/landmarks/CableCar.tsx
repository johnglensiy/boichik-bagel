"use client";

import { Block } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function CableCar({ style }: { style: SFStyle }) {
  // One car cresting the hill. Small on purpose — it's the detail you find on
  // the second look, not a landmark.
  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      <Block style={style} position={[0, 0.14, 0]} size={[0.58, 0.2, 0.26]} color={style.orange} />
      {[-0.17, 0, 0.17].map((x) => (
        <Block
          key={x}
          style={style}
          sharp
          position={[x, 0.17, 0.135]}
          size={[0.12, 0.11, 0.02]}
          color={style.window}
        />
      ))}
      <Block style={style} sharp position={[0, 0.27, 0]} size={[0.62, 0.05, 0.3]} color={style.trim} />
      <Block style={style} sharp position={[-0.22, 0.07, 0]} size={[0.06, 0.06, 0.28]} color={style.metal} />
    </group>
  );
}

export const cableCar: LandmarkDef = {
  id: "cableCar",
  label: "Cable car",
  footprint: { across: 0.35, along: 0.35 },
  lift: 0.5,
  Model: CableCar,
};
