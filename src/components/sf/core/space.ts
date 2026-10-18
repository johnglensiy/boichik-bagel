/**
 * Shared geometry of the diorama: the cube of city, and the bridge-space the
 * landmarks are placed in. Pure numbers and maths, no React, so the layout
 * route on the server can use the same rules the scene does.
 */

export const CUBE = { half: 4.6, landTop: 0, baseTop: -0.8, bottom: -3.4 };

/**
 * The bridge runs the block's full diagonal and the city is packed around it.
 * Everything is placed in bridge-space rather than world XZ, because the two
 * constraints that matter are naturally expressed there:
 *
 *   u = distance along the shore axis, across the block
 *   v = distance from the bridge's centreline — must clear the roadway
 *
 * In world coordinates those rules are invisible and things end up standing in
 * the deck. Here they are arithmetic you can check. The block is a square, so
 * in bridge-space it is a diamond: |u| + |v| <= APEX.
 */
export const APEX = CUBE.half * Math.SQRT2;

/** Half the roadway's width, plus a little. Nothing may stand inside it. */
export const DECK_HALF = 0.5;

/** The bridge's axis, as a rotation about Y. */
export const BRIDGE_ROT = -Math.PI / 4;
/** Corner to corner, a hair short of poking out of the block. */
export const BRIDGE_LEN = CUBE.half * 2 * Math.SQRT2 - 0.15;

/** Bottom of the cube, in scene space - where the contact shadow sits. */
export const SF_GROUND_Y = CUBE.bottom;

/** Bridge-space (u, v) to the city's local XZ. */
export function uv(u: number, v: number): [number, number] {
  return [(u - v) / Math.SQRT2, (u + v) / Math.SQRT2];
}

/** The city's local XZ back to bridge-space (u, v); the inverse of uv(). */
export function toUV(x: number, z: number): [number, number] {
  return [(x + z) / Math.SQRT2, (z - x) / Math.SQRT2];
}

export interface Spot {
  u: number;
  v: number;
  /** Half-extent perpendicular to the bridge — what has to clear the deck. */
  across: number;
  /** Half-extent along the bridge — what has to stay on the block. */
  along: number;
}

/**
 * The two placement rules: stay out of the roadway, stay on the block. Easy
 * to break by a nudged number or a drag, and on a slowly turning model easy
 * to miss by eye, so they're checked rather than eyeballed.
 */
export function spotProblems(s: Spot): string[] {
  const out: string[] = [];
  if (Math.abs(s.v) - s.across < DECK_HALF) out.push("in the roadway");
  if (Math.abs(s.u) + s.along + Math.abs(s.v) + s.across > APEX) out.push("overhangs the block");
  return out;
}
