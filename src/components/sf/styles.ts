import * as THREE from "three";

export type SFStyleId = "clay" | "paper" | "fog" | "riso";

export interface SFStyle {
  id: SFStyleId;
  name: string;
  // Shown under the style switcher — what this treatment is actually claiming.
  note: string;
  bg: string;
  fog: { color: string; near: number; far: number } | null;

  // Palette. Every landmark pulls its color from here so a style swap is a
  // palette swap, not a rewrite of the geometry.
  land: string;
  landSide: string;
  hill: string;
  concrete: string; // Transamerica, Coit — the white-stucco family
  glass: string; // Salesforce's curtain wall
  orange: string; // Golden Gate. The one color SF doesn't let you reinterpret.
  road: string;
  asphalt: string; // the bridge roadway — grey even where the city's streets are sand
  window: string; // glazing, doorways, the dark holes that give a facade scale
  trim: string; // cornices, roof edges, railings
  metal: string; // lamp posts, the cable car's pole, the lighthouse cap
  victorian: string[]; // Painted Ladies, left to right

  // Form. Rounded mass reads as a toy; square mass reads as cut card.
  rounded: boolean;
  flatShading: boolean;
  toon: boolean;
  outline: string | null; // edge color, or null for no drawn edges
  // Paper is cut and glued by hand, so nothing is perfectly square.
  jitter: number;

  roughness: number;
  metalness: number;

  ambient: number;
  keyIntensity: number;
  keyColor: string;
  fillIntensity: number;
  shadows: boolean;
  // CSS grain laid over the canvas — the only non-geometric effect in here.
  grain: number;
}

export const SF_STYLES: Record<SFStyleId, SFStyle> = {
  // Vinyl-toy city. The most legible caricature: everything rounded, scale
  // pushed, colors at souvenir saturation.
  clay: {
    id: "clay",
    name: "Clay",
    note: "Matte vinyl toy. Rounded mass, pushed vertical scale, soft shadow.",
    bg: "#f7f3ec",
    fog: null,
    land: "#d8c7a4",
    landSide: "#bda87f",
    hill: "#b4c296",
    concrete: "#f4eee2",
    glass: "#9fb4c2",
    orange: "#c8502f",
    road: "#cfc3ad",
    asphalt: "#8d8b86",
    window: "#6e7b85",
    trim: "#efe7d7",
    metal: "#8e8375",
    victorian: [
      "#e3ab94",
      "#c7d2c2",
      "#e6d49c",
      "#cfb2c4",
      "#b3c4d1",
      "#e8c6a1",
    ],
    rounded: true,
    flatShading: false,
    toon: false,
    outline: null,
    jitter: 0,
    roughness: 0.95,
    metalness: 0,
    ambient: 0.75,
    keyIntensity: 2.1,
    keyColor: "#fff4e2",
    fillIntensity: 0.5,
    shadows: true,
    grain: 0,
  },

  // Pop-up book. Flat cut cardstock, drawn edges, nothing quite square —
  // the treatment that rhymes hardest with the site's paper palette.
  paper: {
    id: "paper",
    name: "Paper-craft",
    note: "Cut cardstock. Flat planes, drawn folds, hand-glued tilt.",
    bg: "#f2ede3",
    fog: null,
    land: "#e6dcc8",
    landSide: "#d2c4a9",
    hill: "#c6d2ae",
    concrete: "#f7f1e4",
    glass: "#b9c8d2",
    orange: "#cc5c36",
    road: "#d4c7ab",
    asphalt: "#a19e97",
    window: "#93a1a9",
    trim: "#fbf6ea",
    metal: "#a2957f",
    victorian: [
      "#e8ae95",
      "#c3d1bd",
      "#ebd49b",
      "#d2b4c6",
      "#b2c6d4",
      "#eccba3",
    ],
    rounded: false,
    flatShading: true,
    toon: false,
    outline: "#6e6350",
    jitter: 0.05,
    roughness: 1,
    metalness: 0,
    ambient: 0.9,
    keyIntensity: 1.5,
    keyColor: "#fffaf0",
    fillIntensity: 0.45,
    shadows: true,
    grain: 0.05,
  },

  // Karl. The city's actual default condition: massing drops to near-white and
  // only the landmarks hold color, so recognition does all the work.
  fog: {
    id: "fog",
    name: "Fogbank",
    note: "Near-white massing in fog. Only the landmarks keep their color.",
    bg: "#e9e7e2",
    fog: { color: "#e9e7e2", near: 22, far: 62 },
    land: "#e4e1da",
    landSide: "#d2cec5",
    hill: "#e0ded6",
    concrete: "#f6f4ef",
    glass: "#dfe2e3",
    orange: "#c2451f",
    road: "#d8d4cb",
    asphalt: "#aeb0b1",
    window: "#c6cacc",
    trim: "#f5f2ec",
    metal: "#bfbab1",
    victorian: [
      "#e6d2c8",
      "#dde2db",
      "#eadfc6",
      "#e0d2da",
      "#d4dde4",
      "#ebdbc8",
    ],
    rounded: true,
    flatShading: false,
    toon: false,
    outline: null,
    jitter: 0,
    roughness: 0.92,
    metalness: 0,
    ambient: 0.95,
    keyIntensity: 1.45,
    keyColor: "#ffffff",
    fillIntensity: 0.6,
    shadows: true,
    grain: 0.03,
  },

  // Three inks on uncoated stock. Hard banded shading, no gradients, grain —
  // a print object rather than a render.
  riso: {
    id: "riso",
    name: "Risograph",
    note: "Three inks, banded shading, no gradients. A print, not a render.",
    bg: "#f4efe4",
    fog: null,
    land: "#e8dcc2",
    landSide: "#d9c9a6",
    hill: "#c9d3ae",
    concrete: "#fbf7ee",
    glass: "#8fa9bc",
    orange: "#d1532c",
    road: "#ddd0b6",
    asphalt: "#868d96",
    window: "#5d7f99",
    trim: "#fbf7ee",
    metal: "#8fa9bc",
    victorian: [
      "#d1532c",
      "#8fa9bc",
      "#e8c64f",
      "#d1532c",
      "#8fa9bc",
      "#e8c64f",
    ],
    rounded: false,
    flatShading: true,
    toon: true,
    outline: null,
    jitter: 0.02,
    roughness: 1,
    metalness: 0,
    ambient: 0.85,
    keyIntensity: 1.8,
    keyColor: "#ffffff",
    fillIntensity: 0.3,
    shadows: false,
    grain: 0.2,
  },
};

export const SF_STYLE_ORDER: SFStyleId[] = ["clay", "paper", "fog", "riso"];

// Three-step ramp for the riso treatment. MeshToonMaterial samples this to
// decide where light falls off, so a 3px texture is what turns smooth shading
// into flat ink bands.
export function makeToonRamp(steps = 3): THREE.DataTexture {
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) {
    data[i] = Math.round((i / (steps - 1)) * 255);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}
