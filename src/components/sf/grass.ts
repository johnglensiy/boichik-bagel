import saved from "./grass.json";
import { GRID_CELLS, type Cell } from "./roads";

/**
 * Lawns — the Marina Green and anything else that wants mowing — painted by
 * hand in the lab page's grass mode, square by square on the same grid the
 * roads use. The saved copy is grass.json, committed with the code like
 * roads.json. Pure data, so the save route can import it too.
 */
export const SAVED_GRASS: Cell[] = saved as Cell[];

const key = ([i, j]: Cell) => `${i},${j}`;

/** Row by row, then column: a stable order, so a saved file diffs cleanly. */
export function sortCells(cells: Cell[]): Cell[] {
  return [...cells].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

export function hasCell(cells: Cell[], c: Cell): boolean {
  return cells.some((d) => d[0] === c[0] && d[1] === c[1]);
}

/** The squares a brush of `size` squares a side covers, centred on c and held to the grid. */
export function brushCells(c: Cell, size: number): Cell[] {
  const lo = -Math.floor((size - 1) / 2);
  const out: Cell[] = [];
  for (let dj = lo; dj < lo + size; dj++) {
    for (let di = lo; di < lo + size; di++) {
      const i = c[0] + di;
      const j = c[1] + dj;
      if (i >= 0 && j >= 0 && i < GRID_CELLS && j < GRID_CELLS) out.push([i, j]);
    }
  }
  return out;
}

/** Lays grass on every one of `squares`, or clears them all. */
export function paintCells(cells: Cell[], squares: Cell[], on: boolean): Cell[] {
  const touched = new Set(squares.map(key));
  const kept = cells.filter((c) => !touched.has(key(c)));
  if (!on) return kept.length === cells.length ? cells : kept;
  const before = new Set(cells.map(key));
  if (squares.every((c) => before.has(key(c)))) return cells;
  return sortCells([...kept, ...[...touched].map((k) => k.split(",").map(Number) as Cell)]);
}

/** Whether a value is a list of distinct real squares; never trust a file write to the client. */
export function isGrass(value: unknown): value is Cell[] {
  if (!Array.isArray(value) || value.length > GRID_CELLS * GRID_CELLS) return false;
  const seen = new Set<string>();
  return value.every((c) => {
    const ok =
      Array.isArray(c) &&
      c.length === 2 &&
      c.every((n) => Number.isInteger(n) && n >= 0 && n < GRID_CELLS) &&
      !seen.has(key(c as Cell));
    if (ok) seen.add(key(c as Cell));
    return ok;
  });
}
