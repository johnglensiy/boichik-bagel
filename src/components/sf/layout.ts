import saved from "./layout.json";

/**
 * Where each landmark stands, in bridge-space (see core/space). Kept as data,
 * apart from the landmark models, so moving a landmark never means touching
 * its geometry.
 */
export type Layout = Record<string, { u: number; v: number }>;

export const SAVED_LAYOUT: Layout = saved;
