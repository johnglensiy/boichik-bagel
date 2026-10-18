import type { ComponentType } from "react";
import type { SFStyle } from "../styles";

/**
 * One movable landmark. The model is built at its own origin, standing on
 * y = 0; where it goes on the block comes from the layout, so moving a
 * landmark never means touching its geometry.
 */
export interface LandmarkDef {
  id: string;
  label: string;
  /**
   * Half-extents in bridge-space: `across` is perpendicular to the bridge
   * (what has to clear the roadway), `along` is parallel to it (what has to
   * stay on the block). The long buildings run along the bridge.
   */
  footprint: { across: number; along: number };
  /** Height above the land — Coit stands on its hill, the cable car on a rise. */
  lift?: number;
  Model: ComponentType<{ style: SFStyle }>;
}
