"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useMat } from "../../core/materials";
import type { SFStyle } from "../../styles";
import { DECK_LEN, LANE_W, LANE_COUNT, DASH, DASH_GAP } from "./dimensions";

/**
 * Asphalt and lane paint laid on top of the deck. The dashes are one instanced
 * mesh: four lines of them run the full corner-to-corner span, which is ~140
 * boxes that would otherwise each be a draw call.
 */
export function Roadway({ style, deckTop }: { style: SFStyle; deckTop: number }) {
  const mat = useMat();
  const dashes = useRef<THREE.InstancedMesh>(null);
  const paintY = deckTop + 0.024;

  const lane = LANE_W / LANE_COUNT;
  // Dividers between lanes, skipping the centreline, which is drawn solid.
  const dashedZ = [-2, -1, 1, 2].map((k) => k * lane);
  const perLine = Math.floor(DECK_LEN / (DASH + DASH_GAP));

  useLayoutEffect(() => {
    const m = dashes.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    for (const z of dashedZ) {
      for (let k = 0; k < perLine; k++) {
        o.position.set(-DECK_LEN / 2 + (k + 0.5) * (DASH + DASH_GAP), paintY, z);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <mesh position={[0, deckTop + 0.01, 0]} receiveShadow={style.shadows} material={mat(style.asphalt)}>
        <boxGeometry args={[DECK_LEN - 0.02, 0.02, LANE_W]} />
      </mesh>
      {/* Centre divider: two thin lines, so it reads as the median at a glance. */}
      {[-0.012, 0.012].map((z) => (
        <mesh key={z} position={[0, paintY, z]} material={mat(style.trim)}>
          <boxGeometry args={[DECK_LEN - 0.02, 0.006, 0.01]} />
        </mesh>
      ))}
      <instancedMesh
        ref={dashes}
        args={[undefined, mat(style.trim), dashedZ.length * perLine]}
      >
        <boxGeometry args={[DASH, 0.006, 0.012]} />
      </instancedMesh>
    </>
  );
}
