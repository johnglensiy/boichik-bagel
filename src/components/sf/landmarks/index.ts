import type { LandmarkDef } from "./types";
import { alcatraz } from "./Alcatraz";
import { cableCar } from "./CableCar";
import { coit } from "./CoitTower";
import { ferry } from "./FerryBuilding";
import { lombard } from "./Lombard";
import { ladies } from "./PaintedLadies";
import { salesforce } from "./Salesforce";
import { transamerica } from "./Transamerica";

/**
 * Every draggable landmark. To add one: build its model at the origin in its
 * own file, export a LandmarkDef, list it here and give it a spot in
 * layout.json. The bridge and terrain are fixed and live outside this list.
 */
export const LANDMARKS: LandmarkDef[] = [
  transamerica,
  salesforce,
  ferry,
  coit,
  ladies,
  lombard,
  alcatraz,
  cableCar,
];

export type { LandmarkDef } from "./types";
