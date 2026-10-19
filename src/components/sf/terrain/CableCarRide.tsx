"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CUBE, groundHeight } from "../core/space";

type Vec = [number, number];

/** Track pieces closer than this at their ends count as joined. */
const JOIN = 0.02;
/** Ride speed, in the city's units a second, at full pace mid-route. */
const SPEED = 0.45;
/** Up off the ground: onto the track's bed, as the car's own base sits at its wheels. */
const RIDE_LIFT = 0.02;
/** Ground sampled this far ahead and behind, for the car's pitch on a hill. */
const PITCH_REACH = 0.18;

/**
 * The longest route through the track: the pieces Roads lays (straight runs,
 * curves) joined end to end where they meet, then the longest chain of them
 * that never uses a piece twice. The road network is small, so a plain
 * depth-first search over it is plenty.
 */
export function longestRoute(pieces: Vec[][]): Vec[] {
  const keyOf = ([x, z]: Vec) => `${Math.round(x / JOIN)},${Math.round(z / JOIN)}`;
  const lengthOf = (pts: Vec[]) =>
    pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const edges = pieces
    .filter((p) => p.length >= 2)
    .map((pts) => ({ pts, a: keyOf(pts[0]), b: keyOf(pts[pts.length - 1]), len: lengthOf(pts) }));
  const at = new Map<string, number[]>();
  edges.forEach((e, i) => {
    for (const k of [e.a, e.b]) at.set(k, [...(at.get(k) ?? []), i]);
  });

  let best: { len: number; path: Array<{ edge: number; forward: boolean }> } = { len: 0, path: [] };
  const used = new Set<number>();
  const path: Array<{ edge: number; forward: boolean }> = [];
  const walk = (node: string, len: number) => {
    if (len > best.len) best = { len, path: [...path] };
    for (const i of at.get(node) ?? []) {
      if (used.has(i)) continue;
      const e = edges[i];
      const forward = e.a === node;
      used.add(i);
      path.push({ edge: i, forward });
      walk(forward ? e.b : e.a, len + e.len);
      path.pop();
      used.delete(i);
    }
  };
  for (const node of at.keys()) walk(node, 0);

  const out: Vec[] = [];
  for (const { edge, forward } of best.path) {
    const pts = forward ? edges[edge].pts : [...edges[edge].pts].reverse();
    out.push(...(out.length ? pts.slice(1) : pts));
  }
  return out;
}

/**
 * Rides a cable car end to end along the track and back, forever. It eases
 * to a stop at each end and sets off the other way — real cable cars are
 * double-ended, so it doesn't turn round. It turns with the track and tilts
 * with the hills. `children` is the car's model, built pointing along +x.
 * Held at the start for viewers who ask for reduced motion.
 */
export function CableCarRide({ tracks, children }: { tracks: Vec[][]; children: ReactNode }) {
  const car = useRef<THREE.Group>(null);
  const route = useMemo(() => {
    const pts = longestRoute(tracks);
    const along = [0];
    for (let i = 1; i < pts.length; i++) {
      along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts, along, length: along[along.length - 1] ?? 0 };
  }, [tracks]);

  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame(({ clock }) => {
    const g = car.current;
    const { pts, along, length } = route;
    if (!g || pts.length < 2 || length < 0.01) return;
    // One leg is end to end; legs alternate direction, each eased in and out.
    const legTime = length / SPEED;
    const t = reduced.current ? 0 : clock.elapsedTime;
    const leg = Math.floor(t / legTime);
    const phase = (t % legTime) / legTime;
    const eased = (1 - Math.cos(Math.PI * phase)) / 2;
    const forward = leg % 2 === 0;
    const s = forward ? eased * length : (1 - eased) * length;

    // The segment the car is on, and where along it.
    let i = 1;
    while (i < along.length - 1 && along[i] < s) i++;
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const seg = along[i] - along[i - 1] || 1;
    const k = (s - along[i - 1]) / seg;
    const x = ax + (bx - ax) * k;
    const z = az + (bz - az) * k;
    const dx = ((bx - ax) / seg) * (forward ? 1 : -1);
    const dz = ((bz - az) / seg) * (forward ? 1 : -1);

    // Nose up a climb, down a descent: the ground's slope along the way it's going.
    const ahead = groundHeight(x + dx * PITCH_REACH, z + dz * PITCH_REACH);
    const behind = groundHeight(x - dx * PITCH_REACH, z - dz * PITCH_REACH);
    const pitch = Math.atan2(ahead - behind, PITCH_REACH * 2);

    g.position.set(x, CUBE.landTop + groundHeight(x, z) + RIDE_LIFT, z);
    g.rotation.set(0, Math.atan2(-dz, dx), pitch, "YZX");
  });

  if (route.pts.length < 2) return null;
  return <group ref={car}>{children}</group>;
}
