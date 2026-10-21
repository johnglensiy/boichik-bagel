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

/**
 * Two hills on opposite corners of the block, the two off the bridge's
 * default line, so the towers' footings stay on the flat. Each peaks exactly
 * on its corner, so the block holds a quarter of it, cut off like the cube was
 * sliced out of a hillside: the sides rise to meet it and show its profile.
 * They rise out of the plain with no edge, to a broad rounded crown rather
 * than a bell's point, which on a corner reads as a spike. In bridge-space,
 * u = 0 along the far diagonal.
 *
 * - Lombard Street's, Russian Hill, the taller.
 * - Coit Tower's, Telegraph Hill.
 */
const APEX = CUBE.half * Math.SQRT2;
const HILLS: Array<{ u: number; v: number; spread: number; height: number }> = [
  { u: 0, v: APEX, spread: 1.6, height: 2.4 },
  { u: 0, v: -APEX, spread: 1.45, height: 2.0 },
];

/**
 * Height of the land above CUBE.landTop at the city's local (x, z). The hills
 * run to the block's edge, where its sides rise to meet them.
 */
export function groundHeight(x: number, z: number): number {
  const [u, v] = toUV(x, z);
  let h = 0;
  for (const hill of HILLS) {
    const d2 = (u - hill.u) ** 2 + (v - hill.v) ** 2;
    // A bell's exponent squared: nearly level for a good way out from the
    // peak, then a steeper shoulder down to the plain.
    const k = d2 / (2 * hill.spread * hill.spread);
    h += hill.height * Math.exp(-k * k);
  }
  return h;
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
