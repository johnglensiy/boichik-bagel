"use client";

import { Edges } from "@react-three/drei";
import { useMat } from "../core/materials";
import { Block, tilt } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

function PaintedLadies({ style }: { style: SFStyle }) {
  const mat = useMat();
  // Six narrow houses, tight together, stepping up the slope. The row only
  // works if they touch and the colors clearly differ — spaced out, Alamo
  // Square turns into a suburb.
  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      {style.victorian.slice(0, 5).map((color, i) => {
        const x = (i - 2) * 0.76;
        const lift = i * 0.12;
        const h = 1.85 + (i % 2) * 0.16;
        return (
          <group key={i} position={[x, lift, 0]} rotation={tilt(style, i + 7)}>
            <Block style={style} position={[0, h / 2, 0]} size={[0.72, h, 0.86]} color={color} />
            {/* Cornice. A Victorian without one reads as a shed. */}
            <Block
              style={style}
              sharp
              position={[0, h + 0.03, 0]}
              size={[0.82, 0.09, 0.97]}
              color={style.trim}
            />
            {/* Pitched roof: a four-sided cone turned 45°. */}
            <mesh
              position={[0, h + 0.33, 0]}
              rotation={[0, Math.PI / 4, 0]}
              castShadow={style.shadows}
              material={mat(color)}
            >
              <cylinderGeometry args={[0, 0.6, 0.52, 4]} />
              {style.outline && <Edges color={style.outline} threshold={15} />}
            </mesh>
            <Block
              style={style}
              sharp
              position={[0.28, h + 0.46, -0.2]}
              size={[0.1, 0.34, 0.1]}
              color={style.trim}
            />
            {/* Bay window, with its own little roof — the detail that makes
                these houses San Franciscan rather than generic Victorian. */}
            <Block
              style={style}
              position={[0, h * 0.46, 0.57]}
              size={[0.38, h * 0.52, 0.18]}
              color={color}
            />
            <Block
              style={style}
              sharp
              position={[0, h * 0.46, 0.66]}
              size={[0.28, h * 0.34, 0.03]}
              color={style.window}
            />
            <Block
              style={style}
              sharp
              position={[0, h * 0.74, 0.58]}
              size={[0.44, 0.06, 0.22]}
              color={style.trim}
            />
            {/* Upper windows and the door. */}
            {[-0.22, 0.22].map((wx) => (
              <Block
                key={wx}
                style={style}
                sharp
                position={[wx, h * 0.8, 0.53]}
                size={[0.14, 0.24, 0.03]}
                color={style.window}
              />
            ))}
            <Block
              style={style}
              sharp
              position={[0.3, 0.2, 0.53]}
              size={[0.17, 0.4, 0.03]}
              color={style.window}
            />
            {/* The stoop. Every one of these houses is up a flight of steps. */}
            {[0, 1, 2].map((s) => (
              <Block
                key={s}
                style={style}
                sharp
                position={[0.3, 0.04 + s * 0.045, 0.62 + s * 0.07]}
                size={[0.24, 0.05, 0.08]}
                color={style.trim}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

export const ladies: LandmarkDef = {
  id: "ladies",
  label: "Painted Ladies",
  footprint: { across: 0.6, along: 1.86 },
  Model: PaintedLadies,
};
