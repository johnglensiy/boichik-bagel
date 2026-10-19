import type { LandmarkDef } from "./types";
import { alcatraz } from "./Alcatraz";
import { cableCar } from "./CableCar";
import { coit } from "./CoitTower";
import { ferry } from "./FerryBuilding";
import { frisbeePlayers } from "./FrisbeePlayers";
import { goldenGate } from "./golden-gate/GoldenGate";
import { lombard } from "./Lombard";
import { ladies } from "./PaintedLadies";
import { salesforce } from "./Salesforce";
import { transamerica } from "./Transamerica";

/**
 * Every draggable landmark, the bridge included. To add one: build its model
 * at the origin in its own file, export a LandmarkDef, list it here and give
 * it a spot in layout.json. The terrain is fixed and lives outside this list.
 */
export const LANDMARKS: LandmarkDef[] = [
  transamerica,
  salesforce,
  ferry,
  coit,
  ladies,
  frisbeePlayers,
  lombard,
  alcatraz,
  cableCar,
  goldenGate,
];

export { goldenGate };

export type { LandmarkDef } from "./types";
