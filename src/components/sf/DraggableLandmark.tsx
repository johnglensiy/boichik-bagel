"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { CUBE, toUV, uv } from "./core/space";
import type { LandmarkDef } from "./landmarks";

interface Props {
  def: LandmarkDef;
  at: { u: number; v: number };
  editing: boolean;
  /** Placement problems for this spot; the footprint turns red when there are any. */
  problems: string[];
  onMove: (id: string, at: { u: number; v: number }) => void;
  children: ReactNode;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Places a landmark at its layout spot and, in edit mode, lets it be dragged
 * across the land. The drag runs in bridge-space: the pointer's ray is cut
 * against the ground plane, brought into the city's own frame (which the
 * turntable may have turned) and converted to (u, v), so the layout stores
 * exactly what the placement rules check.
 */
export function DraggableLandmark({ def, at, editing, problems, onMove, children }: Props) {
  const group = useRef<THREE.Group>(null);
  const getState = useThree((s) => s.get);
  // The orbit camera would otherwise turn under the drag. Read fresh from the
  // store rather than captured at render: the controls register after mount.
  const setOrbit = (on: boolean) => {
    const controls = getState().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = on;
  };
  const [hovered, setHovered] = useState(false);
  // Grab offset in bridge-space, so the model doesn't jump to the cursor.
  const drag = useRef<{ plane: THREE.Plane; du: number; dv: number } | null>(null);
  const [x, z] = uv(at.u, at.v);

  // Pointer → (u, v) on the ground, or null if the ray misses the plane.
  const groundUV = (e: ThreeEvent<PointerEvent>, plane: THREE.Plane): [number, number] | null => {
    const city = group.current?.parent;
    const hit = new THREE.Vector3();
    if (!city || !e.ray.intersectPlane(plane, hit)) return null;
    const local = city.worldToLocal(hit);
    return toUV(local.x, local.z);
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!editing || e.button !== 0) return;
    const city = group.current?.parent;
    if (!city) return;
    e.stopPropagation();
    const ground = city.localToWorld(new THREE.Vector3(0, CUBE.landTop, 0));
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(UP, ground);
    const p = groundUV(e, plane);
    if (!p) return;
    drag.current = { plane, du: at.u - p[0], dv: at.v - p[1] };
    (e.target as unknown as Element).setPointerCapture(e.pointerId);
    setOrbit(false);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d) return;
    e.stopPropagation();
    const p = groundUV(e, d.plane);
    if (p) onMove(def.id, { u: p[0] + d.du, v: p[1] + d.dv });
  };

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    e.stopPropagation();
    drag.current = null;
    (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
    setOrbit(true);
  };

  // Grab cursor while hovering in edit mode; always handed back.
  useEffect(() => {
    document.body.style.cursor = editing && hovered ? "grab" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [editing, hovered]);

  const { across, along } = def.footprint;
  return (
    <group
      ref={group}
      position={[x, CUBE.landTop + (def.lift ?? 0), z]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerOver={(e) => {
        if (!editing) return;
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      {/* The footprint the placement rules check, laid on the ground while
          editing: green where it may stand, red in the roadway or off the
          block. Turned to bridge-space so `along` runs with the deck. */}
      {editing && (
        <mesh
          position={[0, 0.03 - (def.lift ?? 0), 0]}
          rotation={[0, -Math.PI / 4, 0]}
          renderOrder={1}
        >
          <boxGeometry args={[along * 2, 0.02, across * 2]} />
          <meshBasicMaterial
            color={problems.length ? "#d0453a" : "#4f9a5c"}
            transparent
            opacity={hovered ? 0.55 : 0.35}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
