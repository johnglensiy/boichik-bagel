"use client";

import { CUBE, spotProblems, uv } from "../core/space";
import { useMat } from "../core/materials";
import { Block, FloorBands, tilt } from "../core/parts";
import type { SFStyle } from "../styles";

// [u, v] in bridge-space. |v| keeps them out of the roadway and
// |u| + |v| < APEX keeps them on the block; every row below satisfies both.
const TOWERS: Array<{
  u: number;
  v: number;
  w: number;
  d: number;
  h: number;
  crown: "flat" | "step" | "spire";
}> = [
  { u: 0.5, v: 1.5, w: 0.62, d: 0.64, h: 2.3, crown: "step" },
  { u: 1.8, v: 1.4, w: 0.58, d: 0.6, h: 1.9, crown: "flat" },
  { u: 3.1, v: 1.3, w: 0.56, d: 0.58, h: 1.6, crown: "spire" },
  { u: 0.7, v: 2.7, w: 0.6, d: 0.62, h: 2.0, crown: "flat" },
  { u: 2.1, v: 2.5, w: 0.56, d: 0.58, h: 1.5, crown: "flat" },
  { u: 3.3, v: 1.9, w: 0.52, d: 0.54, h: 1.3, crown: "flat" },
  { u: -0.6, v: 1.6, w: 0.6, d: 0.62, h: 2.1, crown: "flat" },
  { u: -1.9, v: 1.5, w: 0.58, d: 0.56, h: 1.7, crown: "step" },
  { u: -3.2, v: 1.35, w: 0.54, d: 0.56, h: 1.4, crown: "flat" },
  { u: -0.8, v: 2.8, w: 0.56, d: 0.58, h: 1.6, crown: "flat" },
  { u: -3.4, v: 1.85, w: 0.5, d: 0.52, h: 1.2, crown: "flat" },
  { u: 0.6, v: -1.5, w: 0.62, d: 0.6, h: 2.2, crown: "flat" },
  { u: 1.3, v: -2.7, w: 0.58, d: 0.6, h: 1.8, crown: "step" },
  { u: 3.2, v: -1.3, w: 0.56, d: 0.58, h: 1.5, crown: "flat" },
  { u: 0.9, v: -3.4, w: 0.54, d: 0.56, h: 1.3, crown: "spire" },
  { u: 3.4, v: -1.9, w: 0.52, d: 0.54, h: 1.2, crown: "flat" },
  { u: -0.5, v: -1.6, w: 0.6, d: 0.62, h: 2.0, crown: "flat" },
  { u: -1.3, v: -1.4, w: 0.56, d: 0.58, h: 1.6, crown: "flat" },
  { u: -3.2, v: -1.35, w: 0.54, d: 0.56, h: 1.4, crown: "step" },
  { u: -0.7, v: -3.2, w: 0.56, d: 0.58, h: 1.5, crown: "flat" },
  { u: -3.5, v: -1.8, w: 0.5, d: 0.52, h: 1.1, crown: "flat" },
  { u: 4.4, v: -0.95, w: 0.5, d: 0.52, h: 1.1, crown: "flat" },
  { u: 4.5, v: 1.0, w: 0.5, d: 0.52, h: 1.2, crown: "flat" },
  { u: -4.4, v: -1.0, w: 0.5, d: 0.52, h: 1.2, crown: "flat" },
];

/** Filler towers are fixed; check them once, in development only. */
if (process.env.NODE_ENV !== "production") {
  const problems: string[] = [];
  TOWERS.forEach((t, i) => {
    const r = ((t.w + t.d) / 2) * Math.SQRT1_2;
    for (const p of spotProblems({ u: t.u, v: t.v, across: r, along: r })) {
      problems.push(`tower ${i}: ${p}`);
    }
  });
  if (problems.length) console.warn("[Skyline] layout problems:\n  " + problems.join("\n  "));
}

/** Filler skyline. Varied crowns so the cluster doesn't read as a bar chart. */
export function Skyline({ style }: { style: SFStyle }) {
  const mat = useMat();
  return (
    <group>
      {TOWERS.map((t, i) => (
        <group key={i} position={[uv(t.u, t.v)[0], CUBE.landTop, uv(t.u, t.v)[1]]} rotation={tilt(style, i + 31)}>
          <Block
            style={style}
            position={[0, t.h / 2, 0]}
            size={[t.w, t.h, t.d]}
            color={style.glass}
          />
          <FloorBands
            base={0.25}
            top={t.h - 0.2}
            width={t.w}
            depth={t.d}
            floors={Math.max(3, Math.round(t.h * 2.2))}
            color={style.trim}
          />
          {t.crown === "step" && (
            <>
              <Block
                style={style}
                position={[0, t.h + 0.17, 0]}
                size={[t.w * 0.7, 0.34, t.d * 0.7]}
                color={style.glass}
              />
              <Block
                style={style}
                position={[0, t.h + 0.44, 0]}
                size={[t.w * 0.42, 0.22, t.d * 0.42]}
                color={style.glass}
              />
            </>
          )}
          {t.crown === "spire" && (
            <mesh position={[0, t.h + 0.4, 0]} castShadow={style.shadows} material={mat(style.metal)}>
              <cylinderGeometry args={[0.012, 0.05, 0.8, 5]} />
            </mesh>
          )}
          {t.crown === "flat" && (
            <Block
              style={style}
              sharp
              position={[0, t.h + 0.05, 0]}
              size={[t.w + 0.07, 0.1, t.d + 0.07]}
              color={style.trim}
            />
          )}
        </group>
      ))}
    </group>
  );
}
