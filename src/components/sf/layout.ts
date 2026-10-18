import saved from "./layout.json";

/**
 * Where each landmark stands, in bridge-space (see core/space). The saved
 * copy is layout.json, committed with the code: rearranging the city in the
 * lab page's edit mode and saving rewrites that file, so the new layout ships
 * like any other change. Pure data, so the save route can import it too.
 */
export type Layout = Record<string, { u: number; v: number }>;

export const SAVED_LAYOUT: Layout = saved;

/** The landmarks a layout must place — exactly the saved file's keys. */
export const LAYOUT_IDS = Object.keys(saved);

/** Drag precision is far finer than anyone can see; keep the file readable. */
export function roundLayout(layout: Layout): Layout {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return Object.fromEntries(
    Object.entries(layout).map(([id, { u, v }]) => [id, { u: r(u), v: r(v) }]),
  );
}
