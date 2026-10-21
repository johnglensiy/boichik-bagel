"use client";

import { createContext, useContext } from "react";

/**
 * Height of the land under a point of a landmark's model, given in the
 * model's own units and frame: (x, z) on the model, measured from the base it
 * stands on. Lets a model lie along the ground, as Lombard's switchbacks do
 * down their hill, wherever it's been dragged, turned or resized to.
 */
export type GroundUnder = (x: number, z: number) => number;

/** Flat ground, for a model shown outside the diorama. */
const flat: GroundUnder = () => 0;

export const GroundUnderContext = createContext<GroundUnder>(flat);

export function useGroundUnder(): GroundUnder {
  return useContext(GroundUnderContext);
}
