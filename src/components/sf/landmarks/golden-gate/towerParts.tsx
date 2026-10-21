"use client";

import * as THREE from "three";
import { useMat } from "../../core/materials";
import type { SFStyle } from "../../styles";
import { LEG_INNER, LEG_SECTIONS, CAP_CORNICE_H, CAP_HOOD_H } from "./dimensions";

/**
 * One portal strut, seen face-on: a solid panel between the legs whose edges
 * step twice where they meet each leg. The steps under a strut clip the top
 * corners of the opening below it, and the steps on top clip the bottom
 * corners of the opening above, so every opening gets the stepped Art Deco
 * corners the real towers have. Built in the tower's cross-section plane
 * (x across the bridge, y up) with its top edge at y = 0, then extruded along
 * the bridge by `thickness`.
 */
export function portalStrut(
  height: number,
  thickness: number,
  topKnees: boolean,
): THREE.ExtrudeGeometry {
  // Runs a little into each leg so there's no seam at the inner face.
  const W = LEG_INNER + 0.05;
  const knees = [
    { reach: 0.14, rise: 0.04 }, // outer knee, reaching further into the opening
    { reach: 0.07, rise: 0.04 }, // inner knee, tucked against the leg
  ];
  // The right half's outline, walked clockwise from the top of the knees.
  const half: Array<[number, number]> = [];
  let top = 0;
  if (topKnees) {
    for (const k of knees) {
      half.push([LEG_INNER - k.reach, top]);
      top += k.rise;
      half.push([LEG_INNER - k.reach, top]);
    }
  }
  half.push([W, top]);
  let bottom = -height;
  const under: Array<[number, number]> = [];
  for (const k of knees) {
    under.push([LEG_INNER - k.reach, bottom]);
    bottom -= k.rise;
    under.push([LEG_INNER - k.reach, bottom]);
  }
  half.push([W, bottom], ...under.reverse());

  const shape = new THREE.Shape();
  shape.moveTo(-half[0][0], half[0][1]);
  half.forEach(([x, y]) => shape.lineTo(x, y));
  [...half].reverse().forEach(([x, y]) => shape.lineTo(-x, y));
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  return g;
}

/**
 * A rectangular leg piece whose inner face sits on z = 0 and whose body
 * extends toward +z. Its section goes from [across0, along0] at the bottom to
 * [across1, along1] at the top: equal for a straight run, smaller for the
 * sloped ledge at a setback. The far leg uses the same geometry turned half a
 * revolution, which keeps the faces pointing outward (a mirror would not).
 */
export function legPiece(
  [across0, along0]: [number, number],
  [across1, along1]: [number, number],
  height: number,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0.5);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i);
    pos.setXYZ(
      i,
      pos.getX(i) * THREE.MathUtils.lerp(along0, along1, t),
      t * height,
      pos.getZ(i) * THREE.MathUtils.lerp(across0, across1, t),
    );
  }
  g.computeVertexNormals();
  return g;
}

/**
 * The cap on each leg, after the real towers: a cornice slightly proud of the
 * leg, then a rounded saddle hood arching along the bridge (the main cable
 * runs into it over the crown), and a small square turret on top with a
 * railed platform. Sits in the leg's frame (inner face on z = 0, body toward
 * +z).
 */
export function LegCap({ top, style }: { top: number; style: SFStyle }) {
  const mat = useMat();
  const orange = mat(style.orange);
  const [across, along] = LEG_SECTIONS[LEG_SECTIONS.length - 1];
  const cz = across / 2;
  const hoodY = top + CAP_CORNICE_H;
  const turretH = 0.09;
  const turretY = hoodY + CAP_HOOD_H * 0.85;
  return (
    <group position={[0, 0, cz]}>
      <mesh position={[0, top + CAP_CORNICE_H / 2, 0]} castShadow={style.shadows} material={orange}>
        <boxGeometry args={[along + 0.03, CAP_CORNICE_H, across + 0.03]} />
      </mesh>
      {/* Half a cylinder lying across the bridge, squashed into a low arch:
          its curve runs the way the cable does. */}
      <group position={[0, hoodY, 0]} scale={[1, CAP_HOOD_H / (along / 2), 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={style.shadows} material={orange}>
          <cylinderGeometry
            args={[along / 2 + 0.01, along / 2 + 0.01, across + 0.01, style.rounded ? 20 : 8, 1, false, Math.PI / 2, Math.PI]}
          />
        </mesh>
      </group>
      <mesh position={[0, turretY + turretH / 2, 0]} castShadow={style.shadows} material={orange}>
        <boxGeometry args={[along * 0.3, turretH, across * 0.42]} />
      </mesh>
      <mesh position={[0, turretY + turretH + 0.012, 0]} material={orange}>
        <boxGeometry args={[along * 0.42, 0.024, across * 0.56]} />
      </mesh>
    </group>
  );
}
