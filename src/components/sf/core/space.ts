/**
 * Shared geometry of the diorama: the cube of city, and the bridge-space the
 * landmarks are placed in. Pure numbers and maths, no React, so the layout
 * route on the server can use the same rules the scene does.
 */

export const CUBE = { half: 4.6, landTop: 0, baseTop: -0.8, bottom: -3.4 };

/*
 * The bridge's default spot runs the block's full diagonal and the city is
 * packed around it. Everything is placed in bridge-space rather than world XZ:
 *
 *   u = distance along the block's diagonal, the bridge's default axis
 *   v = distance across it, from that centreline
 *
 * In world coordinates the roadway rule is invisible and things end up
 * standing in the deck. Here it is arithmetic you can check.
 */

/** Half the roadway's width, plus a little. Nothing may stand inside it. */
export const DECK_HALF = 0.5;

/** The bridge's axis, as a rotation about Y. */
export const BRIDGE_ROT = -Math.PI / 4;
/** Corner to corner, a hair short of poking out of the block. */
export const BRIDGE_LEN = CUBE.half * 2 * Math.SQRT2 - 0.15;

/**
 * The bridge's footprint, unturned and unscaled: the roadway it keeps clear.
 * Laid along u at its default spot, where it runs the block's diagonal.
 */
export const BRIDGE_FOOTPRINT = { across: DECK_HALF, along: BRIDGE_LEN / 2 };

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
  /** Half-extent across the block's diagonal (v), before any turn. */
  across: number;
  /** Half-extent along the block's diagonal (u), before any turn. */
  along: number;
  /** Degrees about the vertical, as in the layout. */
  turn?: number;
}

/** Where the bridge stands: a layout placement, with its defaults filled in. */
export interface BridgeSpot {
  u: number;
  v: number;
  turn: number;
  scale: number;
}

/**
 * A footprint turned by `turn` degrees about the vertical, as the bridge-space
 * box that contains it. Conservative off the axes (a 45° turn checks the
 * square around the diamond), which errs on the side of clearing the deck.
 */
export function turnedFootprint(
  f: { across: number; along: number },
  turn = 0,
): { across: number; along: number } {
  const t = (turn * Math.PI) / 180;
  const c = Math.abs(Math.cos(t));
  const s = Math.abs(Math.sin(t));
  return { across: c * f.across + s * f.along, along: s * f.across + c * f.along };
}

/**
 * The placement rule: stay out of the roadway. Easy to break by a drag, and
 * on a slowly turning model easy to miss by eye, so it's checked rather than
 * eyeballed. Hanging over the block's edge is allowed.
 *
 * The bridge can be moved, turned and resized too, so the roadway check is
 * made in the bridge's own frame: the spot is brought into it, and its
 * footprint turned by the difference between the two turns.
 */
export function spotProblems(s: Spot, bridge: BridgeSpot): string[] {
  const out: string[] = [];
  const t = (bridge.turn * Math.PI) / 180;
  const du = s.u - bridge.u;
  const dv = s.v - bridge.v;
  const alongDeck = du * Math.cos(t) - dv * Math.sin(t);
  const acrossDeck = du * Math.sin(t) + dv * Math.cos(t);
  const inDeck = turnedFootprint(s, (s.turn ?? 0) - bridge.turn);
  if (
    Math.abs(acrossDeck) - inDeck.across < BRIDGE_FOOTPRINT.across * bridge.scale &&
    Math.abs(alongDeck) - inDeck.along < BRIDGE_FOOTPRINT.along * bridge.scale
  ) {
    out.push("in the roadway");
  }
  return out;
}
