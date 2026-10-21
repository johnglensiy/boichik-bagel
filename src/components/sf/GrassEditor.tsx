"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { CUBE, groundHeight } from "./core/space";
import { brushCells, hasCell, paintCells } from "./grass";
import { CELL, cellAt, cellCentre, sameCell, type Cell } from "./roads";
import { landSurface } from "./terrain/Terrain";

interface Props {
  grass: Cell[];
  onChange: (grass: Cell[]) => void;
}

const GREEN = "#4f9a5c";
const RED = "#d0453a";
/** Over the land, the lawns and the road tiles, so the marks always show. */
const MARK_LIFT = 0.05;
/** Brush sizes, in squares a side; [ and ] step through them. */
const BRUSH_SIZES = [1, 2, 3, 5];

/** A flat square marking the brush's squares, laid at the ground's height. */
function BrushMark({ cells, erase }: { cells: Cell[]; erase: boolean }) {
  return (
    <group>
      {cells.map((c) => {
        const [x, z] = cellCentre(c);
        return (
          <mesh
            key={`${c[0]},${c[1]}`}
            position={[x, CUBE.landTop + groundHeight(x, z) + MARK_LIFT, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={6}
          >
            <planeGeometry args={[CELL * 0.96, CELL * 0.96]} />
            <meshBasicMaterial
              color={erase ? RED : GREEN}
              transparent
              opacity={0.4}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Every square on the straight run from a to b, so a fast stroke leaves no gaps. */
function cellsBetween(a: Cell, b: Cell): Cell[] {
  const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  return Array.from({ length: steps + 1 }, (_, k) => [
    Math.round(a[0] + ((b[0] - a[0]) * k) / steps),
    Math.round(a[1] + ((b[1] - a[1]) * k) / steps),
  ]);
}

/**
 * Grass painting, on the roads' grid, as a brush: press on the land and drag
 * to lay grass on every square the brush passes over. A stroke that starts
 * on grass erases instead, so the same brush cleans up an edge. [ and ] change
 * the brush's size. The camera holds still while a stroke is down; shift-drag
 * still pans and a drag off the land still orbits. The land is hit rather
 * than a flat plane, so on a hill the square under the pointer is the one
 * painted.
 */
export function GrassEditor({ grass, onChange }: Props) {
  const [hover, setHover] = useState<Cell | null>(null);
  const [size, setSize] = useState(BRUSH_SIZES[1]);
  const [erasing, setErasing] = useState(false);
  const [stroking, setStroking] = useState(false);
  const surface = useMemo(() => landSurface(), []);
  useEffect(() => () => surface.dispose(), [surface]);
  const getState = useThree((s) => s.get);

  // The stroke in progress: whether it paints or erases, and the last square
  // it reached. Kept off React state: it changes on every pointer move.
  const stroke = useRef<{ on: boolean; last: Cell } | null>(null);
  // The latest lawn, for the handlers between renders of a fast stroke.
  const latest = useRef(grass);
  useEffect(() => {
    latest.current = grass;
  }, [grass]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "[" && e.key !== "]") return;
      setSize((s) => {
        const i = BRUSH_SIZES.indexOf(s) + (e.key === "]" ? 1 : -1);
        return BRUSH_SIZES[Math.min(BRUSH_SIZES.length - 1, Math.max(0, i))];
      });
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

  // The orbit camera would otherwise turn under the stroke. Read fresh from
  // the store rather than captured at render: the controls register after mount.
  const setOrbit = (on: boolean) => {
    const controls = getState().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = on;
  };

  // The square under the pointer, in the city's frame (the turntable may
  // have turned it).
  const cellOf = (e: ThreeEvent<PointerEvent>): Cell => {
    const local = e.object.worldToLocal(e.point.clone());
    return cellAt(local.x, local.z);
  };

  const paintAlong = (from: Cell, to: Cell, on: boolean) => {
    const squares = cellsBetween(from, to).flatMap((c) => brushCells(c, size));
    const next = paintCells(latest.current, squares, on);
    latest.current = next;
    onChange(next);
  };

  const endStroke = (e: ThreeEvent<PointerEvent>) => {
    if (!stroke.current) return;
    e.stopPropagation();
    stroke.current = null;
    setStroking(false);
    setErasing(false);
    (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
    setOrbit(true);
  };

  return (
    <group>
      {/* The land again, unseen, to be painted: hits land where the eye does. */}
      <mesh
        geometry={surface}
        onPointerDown={(e) => {
          if (e.button !== 0 || e.shiftKey) return;
          e.stopPropagation();
          const c = cellOf(e);
          const on = !hasCell(latest.current, c);
          stroke.current = { on, last: c };
          setStroking(true);
          setErasing(!on);
          (e.target as unknown as Element).setPointerCapture(e.pointerId);
          setOrbit(false);
          paintAlong(c, c, on);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          const c = cellOf(e);
          setHover((h) => (h && sameCell(h, c) ? h : c));
          const s = stroke.current;
          if (s && !sameCell(s.last, c)) {
            paintAlong(s.last, c, s.on);
            s.last = c;
          }
        }}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerOut={() => setHover(null)}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {hover && (
        <BrushMark
          cells={brushCells(hover, size)}
          erase={stroking ? erasing : hasCell(grass, hover)}
        />
      )}
    </group>
  );
}
