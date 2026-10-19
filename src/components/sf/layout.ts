import saved from "./layout.json";

/**
 * Where each landmark stands, in bridge-space (see core/space). The saved
 * copy is layout.json, committed with the code: rearranging the city in the
 * lab page's edit mode and saving rewrites that file, so the new layout ships
 * like any other change. Pure data, so the save route can import it too.
 */
export interface Placement {
  u: number;
  v: number;
  /**
   * Degrees about the vertical, counter-clockwise seen from above. Only ever
   * a spin in place: models stay upright and at their height. Left out when 0.
   */
  turn?: number;
  /**
   * Even scale about the model's base: proportions kept. At least MIN_SCALE;
   * left out when 1.
   */
  scale?: number;
}

/** How far a landmark may shrink; it can grow without limit. */
export const MIN_SCALE = 0.3;

/** Held to MIN_SCALE, to a hundredth. */
export function normalizeScale(s: number): number {
  return Math.round(Math.max(MIN_SCALE, s) * 100) / 100;
}

export type Layout = Record<string, Placement>;

export const SAVED_LAYOUT: Layout = saved;

/** The landmarks a layout must place — exactly the saved file's keys. */
export const LAYOUT_IDS = Object.keys(saved);

/** Drag precision is far finer than anyone can see; keep the file readable. */
export function roundLayout(layout: Layout): Layout {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return Object.fromEntries(
    Object.entries(layout).map(([id, { u, v, turn, scale }]) => {
      const out: Placement = { u: r(u), v: r(v) };
      const t = normalizeTurn(turn ?? 0);
      const s = normalizeScale(scale ?? 1);
      if (t) out.turn = t;
      if (s !== 1) out.scale = s;
      return [id, out];
    }),
  );
}

/** Into (-180, 180], to a tenth of a degree. */
export function normalizeTurn(deg: number): number {
  const t = Math.round((((deg % 360) + 540) % 360 - 180) * 10) / 10;
  return t === -180 ? 180 : t || 0;
}
