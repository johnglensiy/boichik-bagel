"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { CUBE, groundHeight } from "./core/space";
import { CELL, ROAD_WIDTH, cellAt, cellCentre, sameCell, type Cell, type Road } from "./roads";
import { landSurface } from "./terrain/Terrain";

interface Props {
  roads: Road[];
  onChange: (roads: Road[]) => void;
  /** Eraser: press and drag to delete every road the brush touches. */
  erasing?: boolean;
}

const ORANGE = "#c47b52";
const RED = "#d0453a";
/** Eraser sizes, in squares across; [ and ] step through them, as the grass brush's do. */
const ERASER_SIZES = [1, 2, 3, 5];

/** Distance from point p to the segment ab, in the city's XZ. */
function toSegment(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len2 = dx * dx + dz * dz;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dz * t));
}

/** The roads an eraser of `size` squares, centred on a square, touches. */
function touchedBy(roads: Road[], at: Cell, size: number): Set<number> {
  const p = cellCentre(at);
  const reach = (size * CELL) / 2 + ROAD_WIDTH / 2;
  const out = new Set<number>();
  roads.forEach(([a, b], i) => {
    if (toSegment(p, cellCentre(a), cellCentre(b)) <= reach) out.add(i);
  });
  return out;
}

/** The eraser's footprint: a flat square at the ground's height. */
function EraserMark({ cell, size }: { cell: Cell; size: number }) {
  const [x, z] = cellCentre(cell);
  return (
    <mesh position={[x, CUBE.landTop + groundHeight(x, z) + MARK_LIFT, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
      <planeGeometry args={[CELL * size, CELL * size]} />
      <meshBasicMaterial color={RED} transparent opacity={0.4} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
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
export function RoadEditor({ roads, onChange, erasing = false }: Props) {
  const [from, setFrom] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [size, setSize] = useState(ERASER_SIZES[1]);
  const getState = useThree((s) => s.get);
  // Whether an eraser stroke is down. Off React state: it's read on every move.
  const rubbing = useRef(false);
  // The latest roads, for the handlers between renders of a fast stroke.
  const latest = useRef(roads);
  useEffect(() => {
    latest.current = roads;
  }, [roads]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "[" && e.key !== "]") return;
      setSize((s) => {
        const i = ERASER_SIZES.indexOf(s) + (e.key === "]" ? 1 : -1);
        return ERASER_SIZES[Math.min(ERASER_SIZES.length - 1, Math.max(0, i))];
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The orbit camera would otherwise turn under an eraser stroke. Read fresh
  // from the store: the controls register after mount.
  const setOrbit = (on: boolean) => {
    const controls = getState().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = on;
  };

  const rubOut = (c: Cell) => {
    const hit = touchedBy(latest.current, c, size);
    if (!hit.size) return;
    const next = latest.current.filter((_, i) => !hit.has(i));
    latest.current = next;
    onChange(next);
  };

  const endRub = (e: ThreeEvent<PointerEvent>) => {
    if (!rubbing.current) return;
    e.stopPropagation();
    rubbing.current = false;
    (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
    setOrbit(true);
  };
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
        onPointerDown={(e) => {
          if (!erasing || e.button !== 0 || e.shiftKey) return;
          e.stopPropagation();
          rubbing.current = true;
          (e.target as unknown as Element).setPointerCapture(e.pointerId);
          setOrbit(false);
          rubOut(cellOf(e));
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          const c = cellOf(e);
          setHover((h) => (h && sameCell(h, c) ? h : c));
          if (rubbing.current) rubOut(c);
        }}
        onPointerUp={endRub}
        onPointerCancel={endRub}
        onPointerOut={() => setHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          if (erasing) return;
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
      {hover && (erasing ? <EraserMark cell={hover} size={size} /> : <CellMark cell={hover} strong={false} />)}
      {!erasing && from && <CellMark cell={from} strong />}
      {preview && <Line points={preview} color={ORANGE} lineWidth={3} depthTest={false} renderOrder={7} />}
    </group>
  );
}
