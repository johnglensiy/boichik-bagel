"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { makeToonRamp, type SFStyle } from "../styles";

type Palette = (color: string) => THREE.Material;

const MaterialContext = createContext<Palette | null>(null);

export function useMat(): Palette {
  const mat = useContext(MaterialContext);
  if (!mat) throw new Error("useMat must be used inside <MaterialProvider>");
  return mat;
}

/**
 * One material per palette entry for the whole scene.
 *
 * This is a provider rather than a hook each mesh calls, because the palette is
 * shared: built per-component it would be rebuilt per component *instance*, and
 * at this level of detail that's a few thousand redundant materials instead of
 * seventeen.
 */
export function MaterialProvider({
  style,
  children,
}: {
  style: SFStyle;
  children: ReactNode;
}) {
  const built = useMemo(() => {
    const ramp = style.toon ? makeToonRamp(3) : undefined;
    const make = (color: string): THREE.Material =>
      style.toon
        ? new THREE.MeshToonMaterial({ color, gradientMap: ramp })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: style.roughness,
            metalness: style.metalness,
            flatShading: style.flatShading,
          });

    const colors = [
      style.land,
      style.landSide,
      style.hill,
      style.concrete,
      style.glass,
      style.orange,
      style.road,
      style.asphalt,
      style.window,
      style.trim,
      style.metal,
      ...style.victorian,
    ];
    const byColor = new Map(colors.map((c) => [c, make(c)]));
    const get: Palette = (c) => byColor.get(c) ?? byColor.get(style.concrete)!;
    return { ramp, byColor, get };
  }, [style]);

  useEffect(() => {
    const { ramp, byColor } = built;
    return () => {
      byColor.forEach((m) => m.dispose());
      ramp?.dispose();
    };
  }, [built]);

  return (
    <MaterialContext.Provider value={built.get}>{children}</MaterialContext.Provider>
  );
}
