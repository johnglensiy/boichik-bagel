"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { CUBE, toUV, uv } from "./core/space";
import type { LandmarkDef } from "./landmarks";
import { normalizeScale, normalizeTurn, type Placement } from "./layout";

interface Props {
  def: LandmarkDef;
  at: Placement;
  editing: boolean;
  /** Shows the ring that arms the arrow keys; set by clicking the landmark. */
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, at: Placement) => void;
  children: ReactNode;
}

const UP = new THREE.Vector3(0, 1, 0);
const DEG = 180 / Math.PI;
/** Degrees per left/right press; holding the key repeats it. */
const TURN_STEP = 3;
/** Shift-left/right turns to the next multiple of this. */
const TURN_SNAP = 15;
/**
 * Up/down grow or shrink by this factor per press. A factor rather than a
 * fixed amount, so a press looks like the same change at any size.
 */
const SCALE_STEP = 1.04;
/** Shift-up/down resizes to the next multiple of this. */
const SCALE_SNAP = 0.1;

/**
 * Places a landmark at its layout spot and, in edit mode, lets it be dragged
 * across the land. The drag runs in bridge-space: the pointer's ray is cut
 * against the ground plane, brought into the city's own frame (which the
 * turntable may have turned) and converted to (u, v), so the layout stores
 * exactly what the placement rules check.
 *
 * Clicking it selects it, like a text box, and shows a ring around it.
 * Clicking the ring arms the arrow keys: left and right spin it in place,
 * about the vertical only, so the model stays upright and at its height; up
 * and down resize it evenly from its centre, so its proportions stay the same.
 */
export function DraggableLandmark({
  def,
  at,
  editing,
  selected,
  onSelect,
  onMove,
  children,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const getState = useThree((s) => s.get);
  // The orbit camera would otherwise turn under the drag. Read fresh from the
  // store rather than captured at render: the controls register after mount.
  const setOrbit = (on: boolean) => {
    const controls = getState().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = on;
  };
  const [hovered, setHovered] = useState<"body" | "ring" | null>(null);
  // Pointer moves can outpace frames; only the latest one per frame is sent
  // on, so a drag re-renders the scene at most once a frame.
  const pending = useRef<Placement | null>(null);
  const frame = useRef(0);
  const send = (next: Placement) => {
    pending.current = next;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (pending.current) onMove(def.id, pending.current);
      pending.current = null;
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // A move keeps the grab offset in bridge-space, so the model doesn't jump
  // to the cursor.
  const drag = useRef<{ plane: THREE.Plane; du: number; dv: number } | null>(null);
  const [x, z] = uv(at.u, at.v);
  const turn = at.turn ?? 0;
  const scale = at.scale ?? 1;

  // Clicking the ring arms the arrow keys; pressing the landmark, or Escape,
  // disarms them, and so does selecting another.
  const [keysOn, setKeysOn] = useState(false);
  const armed = editing && selected && keysOn;
  useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setKeysOn(false);
        return;
      }
      let next: Placement;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // Left turns counter-clockwise seen from above, as rotation.y does.
        const dir = e.key === "ArrowLeft" ? 1 : -1;
        const t = e.shiftKey
          ? (dir > 0 ? Math.floor(turn / TURN_SNAP) + 1 : Math.ceil(turn / TURN_SNAP) - 1) * TURN_SNAP
          : turn + dir * TURN_STEP;
        next = { ...at, turn: normalizeTurn(t) };
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const up = e.key === "ArrowUp";
        // A hair of slack, so a size already on a step moves to the next one.
        const s = e.shiftKey
          ? (up
              ? Math.floor(scale / SCALE_SNAP + 1e-6) + 1
              : Math.ceil(scale / SCALE_SNAP - 1e-6) - 1) * SCALE_SNAP
          : up
            ? scale * SCALE_STEP
            : scale / SCALE_STEP;
        next = { ...at, scale: normalizeScale(s) };
      } else {
        return;
      }
      // Arrows would otherwise scroll the page under the model.
      e.preventDefault();
      onMove(def.id, next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed, turn, scale, at, def.id, onMove]);

  // Pointer → (u, v) on the ground, or null if the ray misses the plane.
  const groundUV = (e: ThreeEvent<PointerEvent>, plane: THREE.Plane): [number, number] | null => {
    const city = group.current?.parent;
    const hit = new THREE.Vector3();
    if (!city || !e.ray.intersectPlane(plane, hit)) return null;
    const local = city.worldToLocal(hit);
    return toUV(local.x, local.z);
  };

  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!editing || e.button !== 0) return;
    const city = group.current?.parent;
    if (!city) return;
    e.stopPropagation();
    const ground = city.localToWorld(new THREE.Vector3(0, CUBE.landTop, 0));
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(UP, ground);
    const p = groundUV(e, plane);
    if (!p) return;
    onSelect(def.id);
    setKeysOn(false);
    drag.current = { plane, du: at.u - p[0], dv: at.v - p[1] };
    (e.target as unknown as Element).setPointerCapture(e.pointerId);
    setOrbit(false);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d) return;
    e.stopPropagation();
    const p = groundUV(e, d.plane);
    if (p) send({ ...at, u: p[0] + d.du, v: p[1] + d.dv });
  };

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    e.stopPropagation();
    drag.current = null;
    // Land exactly where the pointer let go, not a frame behind.
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (pending.current) onMove(def.id, pending.current);
    pending.current = null;
    (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
    setOrbit(true);
  };

  // Grab cursor while hovering in edit mode, a pointer over the ring, which
  // is clicked rather than dragged; always handed back.
  useEffect(() => {
    document.body.style.cursor = !editing || !hovered ? "" : hovered === "ring" ? "pointer" : "grab";
    return () => {
      document.body.style.cursor = "";
    };
  }, [editing, hovered]);

  const across = def.footprint.across * scale;
  const along = def.footprint.along * scale;
  const ground = 0.03;
  // Just clear of the footprint's corners, so it never hides under the model
  // and is easy to click.
  const ringR = Math.hypot(across, along) + 0.2;
  return (
    <group
      ref={group}
      position={[x, CUBE.landTop, z]}
      rotation={[0, turn / DEG, 0]}
      // Only while arranging: a landmark with handlers is hit-tested on every
      // pointer move.
      onPointerDown={editing ? startDrag : undefined}
      onPointerMove={editing ? onPointerMove : undefined}
      onPointerUp={editing ? endDrag : undefined}
      onPointerCancel={editing ? endDrag : undefined}
      onPointerOver={
        editing
          ? (e) => {
              e.stopPropagation();
              setHovered((h) => h ?? "body");
            }
          : undefined
      }
      onPointerOut={editing ? () => setHovered(null) : undefined}
    >
      {/* Scaled about the model's own origin, its base, so it stays standing
          on its spot. The ring below stays outside it, at a usable width. */}
      <group scale={scale}>{children}</group>
      {/* The key handle: click it, then turn with left/right and resize with
          up/down. Solid while armed, so it's clear the keys will act. */}
      {selected && (
        <mesh
          position={[0, ground + 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={2}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            setKeysOn(true);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered("ring");
          }}
          onPointerOut={() => setHovered((h) => (h === "ring" ? "body" : h))}
        >
          <ringGeometry args={[ringR, ringR + 0.3, 64]} />
          <meshBasicMaterial
            color="#c47b52"
            transparent
            opacity={armed ? 0.95 : hovered === "ring" ? 0.7 : 0.45}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
