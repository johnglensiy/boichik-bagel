"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useMat } from "../core/materials";
import { Block } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

/**
 * Outlines traced from the Giants' seating chart, in that image's pixels
 * (1536 wide; home plate near the bottom, centre field at the top, right
 * field on the right). Tracing beats inventing: the park's whole character
 * is its lopsidedness — a deep left-centre gap, the short, angled right-field
 * wall hard against the bay, the upper deck swelling out on the left.
 *
 * Image x maps to model x and image y to model z, so home plate sits toward
 * +z and the outfield opens toward -z, with right field on +x.
 */
const TRACE = {
  field: [[890, 870], [455, 405], [440, 322], [745, 222], [1105, 215], [1165, 345], [1245, 480]],
  grass: [[890, 800], [530, 445], [755, 255], [1092, 252], [1132, 340], [1205, 478]],
  infield: [[890, 805], [975, 720], [890, 635], [805, 720]],
  lower: [
    [440, 322], [380, 450], [430, 650], [540, 800], [700, 960], [890, 1030], [1080, 950],
    [1250, 800], [1310, 700], [1300, 650], [1245, 480], [890, 870], [455, 405],
  ],
  club: [
    [330, 300], [290, 420], [390, 780], [560, 960], [720, 1100], [890, 1140], [1060, 1100],
    [1240, 960], [1370, 740], [1310, 700], [1250, 800], [1080, 950], [890, 1030], [700, 960],
    [540, 800], [430, 650], [380, 450], [440, 322],
  ],
  upper: [
    [235, 190], [45, 520], [170, 890], [420, 1140], [620, 1300], [890, 1385], [1130, 1310],
    [1360, 1150], [1490, 930], [1440, 840], [1370, 740], [1240, 960], [1060, 1100], [890, 1140],
    [720, 1100], [560, 960], [390, 780], [290, 420], [330, 300],
  ],
  bleachers: [[440, 322], [745, 68], [828, 68], [828, 168], [745, 222]],
  centerBleachers: [[965, 65], [1085, 65], [1085, 160], [965, 160]],
  scoreboard: [[830, 65], [962, 65], [962, 215], [830, 215]],
  arcade: [[1100, 185], [1140, 185], [1330, 650], [1290, 665]],
  cove: [[1145, 100], [1500, 100], [1500, 780], [1340, 660]],
} satisfies Record<string, Array<[number, number]>>;

/** Centre of the traced stadium, and model units per traced pixel (~2.3 across). */
const CX = 772;
const CY = 725;
const K = 2.3 / 1455;

/** A traced pixel to model XZ. */
const at = ([px, py]: [number, number]): [number, number] => [(px - CX) * K, (py - CY) * K];

/**
 * One traced outline, extruded upward from y0 by h. The shape is drawn in
 * (x, -z) because standing it up maps the shape's y axis onto -z.
 */
function slab(pts: Array<[number, number]>, h: number, y0 = 0): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  pts.forEach((p, i) => {
    const [x, z] = at(p);
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

/**
 * Oracle Park: the field inside three stepped decks of stands that wrap from
 * the left-field line round behind home to right field, the bleachers and
 * scoreboard across centre, and the brick arcade with McCovey Cove beyond it.
 * The Coke bottle and glove stand past left-centre, the clock tower over the
 * home-plate gate.
 */
function OraclePark({ style }: { style: SFStyle }) {
  const mat = useMat();
  const brick = style.victorian[0];

  const geo = useMemo(
    () => ({
      field: slab(TRACE.field, 0.02),
      grass: slab(TRACE.grass, 0.012, 0.02),
      infield: slab(TRACE.infield, 0.008, 0.04),
      lower: slab(TRACE.lower, 0.12),
      club: slab(TRACE.club, 0.24),
      upper: slab(TRACE.upper, 0.36),
      bleachers: slab(TRACE.bleachers, 0.14),
      centerBleachers: slab(TRACE.centerBleachers, 0.12),
      scoreboard: slab(TRACE.scoreboard, 0.44),
      arcade: slab(TRACE.arcade, 0.2),
      cove: slab(TRACE.cove, 0.012),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const shade = { castShadow: style.shadows, receiveShadow: style.shadows };
  const [dirtX, dirtZ] = at([890, 700]);
  const [moundX, moundZ] = at([890, 720]);
  const bases = TRACE.infield.map(at);
  const [bottleX, bottleZ] = at([560, 120]);
  const [gloveX, gloveZ] = at([470, 200]);
  const [clockX, clockZ] = at([890, 1430]);
  const lights = ([[200, 300], [110, 700], [1460, 900], [1330, 1170]] as Array<[number, number]>).map(at);

  return (
    <group>
      {/* Warning track, outfield grass, the dirt arc and the grass infield. */}
      <mesh geometry={geo.field} receiveShadow={style.shadows} material={mat(style.land)} />
      <mesh geometry={geo.grass} receiveShadow={style.shadows} material={mat(style.hill)} />
      <mesh position={[dirtX, 0.036, dirtZ]} material={mat(style.land)}>
        <cylinderGeometry args={[140 * K, 140 * K, 0.008, style.rounded ? 32 : 12]} />
      </mesh>
      <mesh geometry={geo.infield} material={mat(style.hill)} />
      <mesh position={[moundX, 0.05, moundZ]} material={mat(style.land)}>
        <cylinderGeometry args={[0.025, 0.032, 0.016, 10]} />
      </mesh>
      {bases.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.052, z]} rotation={[0, Math.PI / 4, 0]} material={mat(style.trim)}>
          <boxGeometry args={[0.025, 0.01, 0.025]} />
        </mesh>
      ))}

      {/* Three decks stepping up and out: lower box, club level, and the
          brick-faced upper deck that swells out down the left-field line. */}
      <mesh geometry={geo.lower} {...shade} material={mat(style.window)} />
      <mesh geometry={geo.club} {...shade} material={mat(style.window)} />
      <mesh geometry={geo.upper} {...shade} material={mat(brick)} />

      {/* Centre field: the bleachers, the big scoreboard, more bleachers. */}
      <mesh geometry={geo.bleachers} {...shade} material={mat(style.window)} />
      <mesh geometry={geo.centerBleachers} {...shade} material={mat(style.window)} />
      <mesh geometry={geo.scoreboard} {...shade} material={mat(style.window)} />

      {/* The brick arcade along right field, and McCovey Cove beyond it. */}
      <mesh geometry={geo.arcade} {...shade} material={mat(brick)} />
      <mesh geometry={geo.cove} material={mat(style.glass)} />

      {/* Past left-centre: the giant Coca-Cola bottle and the glove. */}
      <group position={[bottleX, 0, bottleZ]}>
        <mesh position={[0, 0.16, 0]} castShadow={style.shadows} material={mat(style.orange)}>
          <cylinderGeometry args={[0.06, 0.07, 0.32, style.rounded ? 14 : 6]} />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow={style.shadows} material={mat(style.orange)}>
          <cylinderGeometry args={[0.025, 0.06, 0.12, style.rounded ? 14 : 6]} />
        </mesh>
        <mesh position={[0, 0.46, 0]} material={mat(style.trim)}>
          <cylinderGeometry args={[0.027, 0.027, 0.03, 8]} />
        </mesh>
      </group>
      <mesh
        position={[gloveX, 0.12, gloveZ]}
        scale={[1, 0.85, 0.55]}
        castShadow={style.shadows}
        material={mat(style.landSide)}
      >
        <sphereGeometry args={[0.13, style.rounded ? 16 : 8, style.rounded ? 12 : 6]} />
      </mesh>

      {/* The brick clock tower over the home-plate gate, with its pyramid
          roof and flagpole. */}
      <group position={[clockX, 0, clockZ]}>
        <Block style={style} position={[0, 0.36, 0]} size={[0.2, 0.72, 0.2]} color={brick} />
        <Block style={style} sharp position={[0, 0.6, 0.103]} size={[0.12, 0.12, 0.01]} color={style.trim} />
        <Block style={style} sharp position={[0, 0.74, 0]} size={[0.24, 0.04, 0.24]} color={style.trim} />
        <mesh position={[0, 0.84, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={style.shadows} material={mat(style.metal)}>
          <cylinderGeometry args={[0, 0.16, 0.16, 4]} />
        </mesh>
        <mesh position={[0, 1.0, 0]} material={mat(style.metal)}>
          <cylinderGeometry args={[0.006, 0.006, 0.22, 4]} />
        </mesh>
      </group>

      {/* Light towers on the rim of the upper deck. */}
      {lights.map(([x, z], i) => (
        <group key={i} position={[x, 0.36, z]}>
          <mesh position={[0, 0.45, 0]} material={mat(style.metal)}>
            <cylinderGeometry args={[0.01, 0.014, 0.9, 5]} />
          </mesh>
          <Block style={style} sharp position={[0, 0.92, 0]} size={[0.12, 0.07, 0.03]} color={style.trim} />
        </group>
      ))}
    </group>
  );
}

export const oraclePark: LandmarkDef = {
  id: "oraclePark",
  label: "Oracle Park",
  // The traced outline is ~2.3 × 2.1; this is its half-size, give or take
  // the bowl's rounded corners.
  footprint: { across: 1.15, along: 1.15 },
  Model: OraclePark,
};
