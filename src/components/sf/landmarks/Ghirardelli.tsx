"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useMat } from "../core/materials";
import { Block } from "../core/parts";
import type { SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

const SIGN_W = 1.6;
const SIGN_H = 0.24;

/**
 * The rooftop sign's lettering, drawn once into a canvas. A system serif in
 * caps is close enough to the real sign, and it needs no font download —
 * the whole diorama stays self-contained.
 */
function signTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round((1024 * SIGN_H) / SIGN_W);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(canvas.height * 0.82)}px Georgia, "Times New Roman", serif`;
  ctx.fillText("GHIRARDELLI", canvas.width / 2, canvas.height / 2 + 4, canvas.width - 24);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Ghirardelli Square: the old chocolate factory's red-brick blocks round a
 * little plaza, the clock tower with its mansard cap, and — the part everyone
 * knows from the bay — the giant GHIRARDELLI letters on the roof. Built with
 * its long side running along the bridge, facade and sign toward +z before
 * the quarter turn.
 */
function Ghirardelli({ style }: { style: SFStyle }) {
  const mat = useMat();
  const brick = style.victorian[0];

  // The sign is unlit, like the real one lit at night: plain letters in the
  // style's trim colour, readable from either side.
  const sign = useMemo(() => {
    const map = signTexture();
    const material = new THREE.MeshBasicMaterial({
      map,
      color: style.trim,
      transparent: true,
      depthWrite: false,
    });
    return { map, material };
  }, [style.trim]);
  useEffect(
    () => () => {
      sign.map.dispose();
      sign.material.dispose();
    },
    [sign],
  );

  const roof = 0.7;
  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      {/* The long factory block, with rows of arched-window openings. */}
      <Block style={style} position={[0, roof / 2, -0.12]} size={[1.6, roof, 0.56]} color={brick} />
      <Block style={style} sharp position={[0, roof + 0.03, -0.12]} size={[1.66, 0.06, 0.62]} color={style.trim} />
      {[0.22, 0.48].map((y) =>
        Array.from({ length: 8 }, (_, i) => (
          <Block
            key={`${y}-${i}`}
            style={style}
            sharp
            position={[-0.7 + i * 0.2, y, 0.165]}
            size={[0.09, 0.14, 0.02]}
            color={style.window}
          />
        )),
      )}

      {/* The plaza in front, with its fountain. */}
      <mesh position={[0.15, 0.015, 0.4]} receiveShadow={style.shadows} material={mat(style.land)}>
        <boxGeometry args={[1.1, 0.03, 0.42]} />
      </mesh>
      <mesh position={[0.25, 0.05, 0.4]} castShadow={style.shadows} material={mat(style.concrete)}>
        <cylinderGeometry args={[0.1, 0.11, 0.05, style.rounded ? 16 : 8]} />
      </mesh>
      <mesh position={[0.25, 0.08, 0.4]} material={mat(style.glass)}>
        <cylinderGeometry args={[0.08, 0.08, 0.012, style.rounded ? 16 : 8]} />
      </mesh>

      {/* A lower brick wing down the right of the plaza. */}
      <Block style={style} position={[0.62, 0.22, 0.35]} size={[0.36, 0.44, 0.38]} color={brick} />

      {/* Clock tower at the left end: shaft, clock faces, mansard cap and spire. */}
      <group position={[-0.62, 0, 0.32]}>
        <Block style={style} position={[0, 0.55, 0]} size={[0.3, 1.1, 0.3]} color={brick} />
        {[0, 1].map((i) => (
          <Block
            key={i}
            style={style}
            sharp
            position={i ? [0, 0.92, 0.155] : [0.155, 0.92, 0]}
            size={i ? [0.16, 0.16, 0.02] : [0.02, 0.16, 0.16]}
            color={style.trim}
          />
        ))}
        <Block style={style} sharp position={[0, 1.12, 0]} size={[0.36, 0.05, 0.36]} color={style.trim} />
        <mesh position={[0, 1.27, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={style.shadows} material={mat(style.metal)}>
          <cylinderGeometry args={[0.13, 0.24, 0.26, 4]} />
        </mesh>
        <mesh position={[0, 1.47, 0]} castShadow={style.shadows} material={mat(style.metal)}>
          <cylinderGeometry args={[0.005, 0.03, 0.16, 6]} />
        </mesh>
      </group>

      {/* The rooftop sign: a light frame on the roof carrying the letters. */}
      <group position={[0.12, roof + 0.06, -0.12]}>
        {[-0.7, -0.23, 0.23, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]} material={mat(style.metal)}>
            <boxGeometry args={[0.02, 0.2, 0.02]} />
          </mesh>
        ))}
        <mesh position={[0, 0.2 + SIGN_H / 2, 0.012]} material={sign.material}>
          <planeGeometry args={[SIGN_W, SIGN_H]} />
        </mesh>
        <mesh position={[0, 0.2 + SIGN_H / 2, -0.012]} rotation={[0, Math.PI, 0]} material={sign.material}>
          <planeGeometry args={[SIGN_W, SIGN_H]} />
        </mesh>
      </group>
    </group>
  );
}

export const ghirardelli: LandmarkDef = {
  id: "ghirardelli",
  label: "Ghirardelli Square",
  footprint: { across: 0.5, along: 0.9 },
  Model: Ghirardelli,
};
