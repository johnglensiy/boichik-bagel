"use client";

import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { CUBE, BRIDGE_ROT } from "../../core/space";
import { useMat } from "../../core/materials";
import type { SFStyle } from "../../styles";
import {
  TOWER_D,
  BRIDGE_SCALE,
  DECK_LEN,
  DECK_W,
  LEG_INNER,
  LEG_SECTIONS,
  FOOTING_H,
  FOOTING_RX,
  FOOTING_RZ,
  LEDGE_H,
  CABLE_Z,
  CAP_CORNICE_H,
  CAP_HOOD_H,
  PORTAL_FRACTIONS,
} from "./dimensions";
import { Roadway } from "./Roadway";
import { Traffic } from "./Traffic";
import { LegCap, legPiece, portalStrut } from "./towerParts";

/**
 * The Golden Gate. It is the layout's fixed frame: it runs the block's
 * diagonal and every other landmark is placed relative to it, so unlike them
 * it isn't draggable.
 */
export function GoldenGate({ style }: { style: SFStyle }) {
  const mat = useMat();
  const orange = mat(style.orange);

  const deckY = 1.3;
  const deckTop = deckY + 0.085;
  // The one proportion kept true to life: the real deck is 90 ft wide and the
  // towers rise 500 ft above it. Squash them and it stops reading as this
  // bridge — they are why it's on every postcard.
  const legTop = deckTop + DECK_W * (500 / 90);
  // The cable crests on the saddle, just under the crown of the cap's hood.
  const towerH = legTop + CAP_CORNICE_H + CAP_HOOD_H * 0.8;
  const towerX = useMemo(() => [-TOWER_D, TOWER_D], []);

  // Main cable: tower top, dipping to just above the deck mid-span, back up,
  // then down to an anchorage at each end of the deck. The dip is the
  // silhouette. The ends land on the rail tops at the block's corners, so the
  // cable runs the bridge's full length instead of stopping short.
  const cable = useMemo(() => {
    const anchorY = deckY + 0.2;
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-DECK_LEN / 2, anchorY, 0),
      new THREE.Vector3(towerX[0], towerH, 0),
      new THREE.Vector3(0, deckY + 0.72, 0),
      new THREE.Vector3(towerX[1], towerH, 0),
      new THREE.Vector3(DECK_LEN / 2, anchorY, 0),
    ]);
    c.curveType = "catmullrom";
    c.tension = 0.4;
    return c;
  }, [towerX, towerH]);

  const hangers = useMemo(() => {
    const out: Array<{ x: number; top: number }> = [];
    // Hangers on the side spans too, now the cable runs out over them; only
    // the stretch right beside each tower is left clear.
    for (let i = 0; i <= 52; i++) {
      const pt = cable.getPoint(i / 52);
      if (towerX.some((x) => Math.abs(pt.x - x) < 0.25)) continue;
      if (pt.y - deckY < 0.2) continue;
      out.push({ x: pt.x, top: pt.y });
    }
    return out;
  }, [cable, towerX]);

  // Real towers step back in stages on the way up, each setback just above a
  // strut. Every section is a straight run topped by a sloped ledge into the
  // next, narrower one; the last runs to the leg top.
  const tower = useMemo(() => {
    const strutY = PORTAL_FRACTIONS.map((f) => deckTop + f * (legTop - deckTop));
    const breaks = [CUBE.landTop, strutY[0], strutY[1], strutY[2], legTop];
    const pieces: Array<{ y: number; geometry: THREE.BufferGeometry }> = [];
    const ribs: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [];
    LEG_SECTIONS.forEach((sec, i) => {
      const next = LEG_SECTIONS[i + 1];
      const y0 = breaks[i];
      const runH = breaks[i + 1] - y0 - (next ? LEDGE_H : 0);
      pieces.push({ y: y0, geometry: legPiece(sec, sec, runH) });
      if (next) pieces.push({ y: y0 + runH, geometry: legPiece(sec, next, LEDGE_H) });

      // Fluting: raised ribs on the faces leave channels between them that
      // catch shadow, which is what the real towers' vertical grooves read as
      // from any distance. Two on each face along the bridge, one outboard.
      const [across, along] = sec;
      const ribH = runH - 0.06;
      const ribY = y0 + runH / 2;
      for (const sx of [-1, 1]) {
        for (const f of [0.33, 0.67]) {
          ribs.push({
            pos: [sx * (along / 2 + 0.006), ribY, f * across],
            size: [0.012, ribH, 0.026],
          });
        }
      }
      ribs.push({ pos: [0, ribY, across + 0.006], size: [0.03, ribH, 0.012] });
    });

    const strutDepth = LEG_SECTIONS[LEG_SECTIONS.length - 1][1] * 0.8;
    const struts = strutY.map((y, k) => {
      const isTop = k === strutY.length - 1;
      const height = isTop ? 0.22 : 0.14;
      return { y, height, geometry: portalStrut(height, strutDepth, !isTop) };
    });
    // Below the deck the legs are tied by a single X panel, with a horizontal
    // tie above and below it. Everything sits in the tower's mid-plane, the
    // full width between the legs' inner faces, and stops short of the footing.
    const braceTop = deckY - 0.26; // just under the deck's lower chord
    const braceBottom = CUBE.landTop + FOOTING_H + 0.06;
    const panels = 1;
    const panelH = (braceTop - braceBottom) / panels;
    const span = LEG_INNER * 2;
    const ties = Array.from({ length: panels + 1 }, (_, k) => braceBottom + k * panelH);
    const diagonals = Array.from({ length: panels }, (_, k) => ({
      y: braceBottom + (k + 0.5) * panelH,
      length: Math.hypot(span, panelH),
      angle: Math.atan2(panelH, span),
    }));

    return { pieces, ribs, struts, strutDepth, ties, diagonals };
  }, [deckY, deckTop, legTop]);
  useEffect(
    () => () => {
      tower.pieces.forEach((p) => p.geometry.dispose());
      tower.struts.forEach((st) => st.geometry.dispose());
    },
    [tower],
  );

  return (
    <group rotation={[0, BRIDGE_ROT, 0]} scale={BRIDGE_SCALE}>
      {/* Roadway, corner to corner, with a raised rail down each side. */}
      <mesh position={[0, deckY, 0]} castShadow={style.shadows} material={orange}>
        <boxGeometry args={[DECK_LEN, 0.17, DECK_W]} />
        {style.outline && <Edges color={style.outline} threshold={15} />}
      </mesh>
      <Roadway style={style} deckTop={deckTop} />
      {/* Cars stream in once their models load; the bridge doesn't wait. */}
      <Suspense fallback={null}>
        <Traffic style={style} deckTop={deckTop} />
      </Suspense>
      {[-0.43, 0.43].map((z) => (
        <mesh key={z} position={[0, deckY + 0.15, z]} material={orange} castShadow={false}>
          <boxGeometry args={[DECK_LEN, 0.13, 0.05]} />
        </mesh>
      ))}
      {/* Stiffening trusses down each side, under the cables, which the
          hangers land on. They run straight through the tower legs. */}
      {[-CABLE_Z, CABLE_Z].map((z) => (
        <mesh key={`st${z}`} position={[0, deckY - 0.02, z]} castShadow={style.shadows} material={orange}>
          <boxGeometry args={[DECK_LEN, 0.22, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, deckY - 0.15, 0]} material={orange} castShadow={false}>
        <boxGeometry args={[DECK_LEN, 0.13, 0.48]} />
      </mesh>

      {towerX.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Two legs: the near one as built, the far one turned half a
              revolution so its inner face also lands on the deck edge. */}
          {[0, Math.PI].map((turn) => (
            <group key={turn} rotation={[0, turn, 0]}>
              <group position={[0, 0, LEG_INNER]}>
                {tower.pieces.map((p, k) => (
                  <mesh
                    key={k}
                    position={[0, p.y, 0]}
                    geometry={p.geometry}
                    castShadow={style.shadows}
                    material={orange}
                  />
                ))}
                {tower.ribs.map((r, k) => (
                  <mesh key={`r${k}`} position={r.pos} material={orange}>
                    <boxGeometry args={r.size} />
                  </mesh>
                ))}
                <LegCap top={legTop} style={style} />
              </group>
            </group>
          ))}
          <mesh
            position={[0, CUBE.landTop + FOOTING_H / 2, 0]}
            scale={[FOOTING_RX, 1, FOOTING_RZ]}
            castShadow={style.shadows}
            receiveShadow={style.shadows}
            material={mat(style.concrete)}
          >
            <cylinderGeometry args={[1, 1, FOOTING_H, style.rounded ? 32 : 12]} />
          </mesh>
          {/* Under-deck bracing, as on the real towers: an X between the
              legs from the deck down to the footing. */}
          {tower.ties.map((y, k) => (
            <mesh key={`t${k}`} position={[0, y, 0]} castShadow={style.shadows} material={orange}>
              <boxGeometry args={[tower.strutDepth, 0.07, LEG_INNER * 2]} />
            </mesh>
          ))}
          {tower.diagonals.flatMap((d, k) =>
            [-1, 1].map((dir) => (
              <mesh
                key={`d${k}${dir}`}
                position={[0, d.y, 0]}
                rotation={[dir * d.angle, 0, 0]}
                castShadow={style.shadows}
                material={orange}
              >
                <boxGeometry args={[tower.strutDepth * 0.7, 0.05, d.length]} />
              </mesh>
            )),
          )}
          {/* Portal bracing. The stacked struts are the Art Deco tell that
              separates this bridge from every other suspension bridge. Each is
              a solid panel; a raised lip along its top and bottom edges on
              both faces leaves the middle reading as a recessed panel. */}
          {tower.struts.map((st, k) => (
            <group key={k} position={[0, st.y, 0]}>
              <mesh
                rotation={[0, Math.PI / 2, 0]}
                castShadow={style.shadows}
                geometry={st.geometry}
                material={orange}
              />
              {[-1, 1].flatMap((sx) =>
                [-0.015, -st.height + 0.015].map((dy) => (
                  <mesh
                    key={`${sx}${dy}`}
                    position={[sx * (tower.strutDepth / 2 + 0.006), dy, 0]}
                    material={orange}
                  >
                    <boxGeometry args={[0.012, 0.03, LEG_INNER * 2]} />
                  </mesh>
                )),
              )}
            </group>
          ))}
        </group>
      ))}

      {[-CABLE_Z, CABLE_Z].map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow={style.shadows} material={orange}>
          <tubeGeometry args={[cable, 44, 0.028, style.rounded ? 7 : 4, false]} />
        </mesh>
      ))}

      {hangers.map((hg, i) =>
        [-CABLE_Z, CABLE_Z].map((z) => (
          <mesh key={`${i}-${z}`} position={[hg.x, (hg.top + deckY) / 2, z]} material={orange}>
            <boxGeometry args={[0.016, hg.top - deckY, 0.016]} />
          </mesh>
        )),
      )}
    </group>
  );
}
