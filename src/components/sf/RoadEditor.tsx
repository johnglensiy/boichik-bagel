"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { CUBE, groundHeight } from "./core/space";
import { CELL, cellAt, cellCentre, sameCell, type Cell, type Road } from "./roads";
import { landSurface } from "./terrain/Terrain";

interface Props {
  roads: Road[];
  onChange: (roads: Road[]) => void;
}

const ORANGE = "#c47b52";
/** Over the land and the road tiles, so the marks always show. */
const MARK_LIFT = 0.05;

/** A flat square marking a grid square, laid at the ground's height there. */
function CellMark({ cell, strong }: { cell: Cell; strong: boolean }) {
  const [x, z] = cellCentre(cell);
  return (
    <mesh position={[x, CUBE.landTop + groundHeight(x, z) + MARK_LIFT, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
      <planeGeometry args={[CELL * 0.9, CELL * 0.9]} />
      <meshBasicMaterial color={ORANGE} transparent opacity={strong ? 0.9 : 0.45} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * Road drawing: click a square, then another, and a road runs straight
 * between them at whatever angle they make. Drawing carries on from the
 * square just reached, so a route is a run of clicks; click the same square
 * again, or press Escape, to stop. The land is clicked rather than a flat
 * plane, so on a hill the square under the pointer is the one picked.
 * Dragging still orbits: only a click (no drag) lays a road.
 */
export function RoadEditor({ roads, onChange }: Props) {
  const [from, setFrom] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const surface = useMemo(() => landSurface(), []);
  useEffect(() => () => surface.dispose(), [surface]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFrom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.cursor = hover ? "crosshair" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  // The square under the pointer, in the city's frame (the turntable may
  // have turned it).
  const cellOf = (e: ThreeEvent<PointerEvent | MouseEvent>): Cell => {
    const local = e.object.worldToLocal(e.point.clone());
    return cellAt(local.x, local.z);
  };

  // The road being drawn, laid over the land like the road will be.
  const preview = useMemo(() => {
    if (!from || !hover || sameCell(from, hover)) return null;
    const [ax, az] = cellCentre(from);
    const [bx, bz] = cellCentre(hover);
    const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.1));
    return Array.from({ length: steps + 1 }, (_, k) => {
      const x = ax + ((bx - ax) * k) / steps;
      const z = az + ((bz - az) * k) / steps;
      return new THREE.Vector3(x, CUBE.landTop + groundHeight(x, z) + MARK_LIFT, z);
    });
  }, [from, hover]);

  return (
    <group>
      {/* The land again, unseen, to be clicked: hits land where the eye does. */}
      <mesh
        geometry={surface}
        onPointerMove={(e) => {
          e.stopPropagation();
          const c = cellOf(e);
          setHover((h) => (h && sameCell(h, c) ? h : c));
        }}
        onPointerOut={() => setHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          const c = cellOf(e);
          if (!from) setFrom(c);
          else if (sameCell(from, c)) setFrom(null);
          else {
            onChange([...roads, [from, c]]);
            setFrom(c);
          }
        }}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {hover && <CellMark cell={hover} strong={false} />}
      {from && <CellMark cell={from} strong />}
      {preview && <Line points={preview} color={ORANGE} lineWidth={3} depthTest={false} renderOrder={7} />}
    </group>
  );
}
