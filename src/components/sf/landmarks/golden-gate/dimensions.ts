/**
 * Every dimension of the Golden Gate, in the bridge's own (unscaled) units.
 * The bridge is built at full size and drawn at BRIDGE_SCALE.
 */
import { BRIDGE_LEN } from "../../core/space";

/** Half the main span. */
export const TOWER_D = 3.9;

/**
 * The whole bridge — towers, cables, deck section — is built at full size and
 * drawn at this scale. Only its length is exempt: DECK_LEN is stretched back
 * out so the roadway still runs corner to corner across the block.
 */
export const BRIDGE_SCALE = 0.7;
export const DECK_LEN = BRIDGE_LEN / BRIDGE_SCALE;

/** Four lanes, two each way, between the rails. */
export const LANE_W = 0.76;
/** Full deck width, rail to rail — the 90 ft that the towers are scaled against. */
export const DECK_W = 0.92;
export const LANE_COUNT = 4;
export const DASH = 0.16;
export const DASH_GAP = 0.2;
/**
 * Tower legs straddle the deck. Their inner faces stand on the deck's edge
 * (±DECK_W / 2) all the way up, and each setback is taken off the outer face,
 * so the openings stay the roadway's width and the lanes always run clear.
 */
export const LEG_INNER = DECK_W / 2;
/**
 * Leg sections, bottom to top: [across, along] — thickness across the bridge
 * and depth along it. The real legs are deeper along the bridge (54 ft) than
 * across (33 ft); these keep that and step in at each strut.
 */
export const LEG_SECTIONS: Array<[number, number]> = [
  [0.24, 0.37],
  [0.22, 0.34],
  [0.19, 0.3],
  [0.17, 0.27],
];
/**
 * The pale stone pier each tower stands on: one oval under both legs, long
 * across the bridge, with a margin of stone showing round the leg bases.
 */
export const FOOTING_H = 0.16;
export const FOOTING_RX = LEG_SECTIONS[0][1] / 2 + 0.1; // along the bridge
export const FOOTING_RZ = LEG_INNER + LEG_SECTIONS[0][0] + 0.1; // across it
/** Height of the sloped ledge where a leg steps in. */
export const LEDGE_H = 0.06;
/**
 * The cables ride right over the middle of each leg top, in the saddle under
 * the cap's hood, as on the real towers. That puts them a little outboard of
 * the deck edge, where a stiffening truss down each side takes the hangers.
 */
export const CABLE_Z = LEG_INNER + LEG_SECTIONS[LEG_SECTIONS.length - 1][0] / 2;
/** Cap proportions: a cornice on the leg top, then the rounded saddle hood. */
export const CAP_CORNICE_H = 0.06;
export const CAP_HOOD_H = 0.13;

/**
 * Heights of the four portal struts' top edges, as fractions of the tower
 * above the deck (0 = roadway, 1 = leg top), lowest first. Read top-down, the
 * two upper gaps are equal and the two lower gaps — between the bottom pair,
 * and from the lowest strut down to the roadway — are equal and taller, so the
 * openings open up toward the traffic.
 */
export const PORTAL_FRACTIONS = (() => {
  const top = 0.96;
  const ratio = 1.3; // lower gap ÷ upper gap
  const upper = top / (2 + 2 * ratio);
  const lower = upper * ratio;
  return [lower, 2 * lower, 2 * lower + upper, top];
})();
