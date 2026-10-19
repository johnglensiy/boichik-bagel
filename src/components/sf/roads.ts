import saved from "./roads.json";
import { CUBE } from "./core/space";

/**
 * The streets, drawn by hand in the lab page's road mode. Roads are placed on
 * a grid of GRID_CELLS squares a side, finer than a road is wide, so their
 * ends can go just where they're wanted; a road is a straight run between
 * two squares, at whatever angle they make. The saved copy is roads.json,
 * committed with the code like layout.json. Pure data, so the save route can
 * import it too.
 */
export const GRID_CELLS = 56;
/** One grid square's side, in the city's units. */
export const CELL = (CUBE.half * 2) / GRID_CELLS;
/** A road's width, kerbs included: one road tile, at 28 to the block. */
export const ROAD_WIDTH = (CUBE.half * 2) / 28;

/** A grid square, [column, row]: column along x, row along z. */
export type Cell = [number, number];
/** A road, from one square to another. */
export type Road = [Cell, Cell];

export const SAVED_ROADS: Road[] = saved as Road[];

/** Most roads a saved file may hold; far beyond what fits on the block. */
export const MAX_ROADS = 400;

/** A square's centre in the city's local XZ. */
export function cellCentre([i, j]: Cell): [number, number] {
  return [-CUBE.half + (i + 0.5) * CELL, -CUBE.half + (j + 0.5) * CELL];
}

/** The square under a point of the city's local XZ, held to the block. */
export function cellAt(x: number, z: number): Cell {
  const at = (n: number) =>
    Math.min(GRID_CELLS - 1, Math.max(0, Math.floor((n + CUBE.half) / CELL)));
  return [at(x), at(z)];
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/** True for squares on the block's rim, where a road runs off the edge. */
export function onRim([i, j]: Cell): boolean {
  return i === 0 || j === 0 || i === GRID_CELLS - 1 || j === GRID_CELLS - 1;
}

/** Whether a value is a list of roads between real squares; never trust a file write to the client. */
export function isRoads(value: unknown): value is Road[] {
  const isCell = (c: unknown) =>
    Array.isArray(c) &&
    c.length === 2 &&
    c.every((n) => Number.isInteger(n) && n >= 0 && n < GRID_CELLS);
  return (
    Array.isArray(value) &&
    value.length <= MAX_ROADS &&
    value.every((r) => Array.isArray(r) && r.length === 2 && isCell(r[0]) && isCell(r[1]))
  );
}
