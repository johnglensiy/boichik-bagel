"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useGroundUnder } from "../core/ground";
import { useMat } from "../core/materials";
import { makeToonRamp, type SFStyle } from "../styles";
import type { LandmarkDef } from "./types";

/** Kenney's Mini Characters, CC0 (kenney.nl). Both share one colormap texture. */
const PLAYER_A = "/models/people/character-female-b.glb";
const PLAYER_B = "/models/people/character-male-e.glb";

/** The kit's characters stand 0.72 tall; this brings them to ~0.28, people-sized beside the houses. */
const PERSON_SCALE = 0.39;
/** Half the gap between the two players, along the model's x. */
const APART = 0.5;
/** Seconds for one throw, end to end; a full back-and-forth is twice this. */
const FLIGHT = 1.3;
/** How high the frisbee rises over the line between the two hands. */
const ARC = 0.12;
/** The grass's own lift off the land, so feet stand on the lawn, not in it. */
const GRASS = 0.006;
/** How far along a throw the catcher starts reaching for it. */
const REACH_AT = 0.7;
const FRISBEE = "#f3cf3f";
/**
 * The right hand's tip in the kit's `arm-right` bone, in the characters' own
 * units: the arm hangs straight out sideways in the rest pose, so the tip is
 * this far along it from the shoulder.
 */
const HAND_IN_ARM = new THREE.Vector3(-0.27, -0.04, 0.045);

/**
 * One of the kit's characters, cloned with its own skeleton (the loader's
 * copy can only live in one scene), wearing the city's shading over the
 * kit's colormap, and animated: it idles, swings to throw, reaches to catch.
 */
function useCharacter(url: string, style: SFStyle) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const s = cloneSkinned(gltf.scene);
    s.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const map = (o.material as THREE.MeshStandardMaterial).map ?? null;
        o.material = style.toon
          ? new THREE.MeshToonMaterial({ map, gradientMap: makeToonRamp(3) })
          : new THREE.MeshStandardMaterial({
              map,
              roughness: style.roughness,
              metalness: style.metalness,
              flatShading: style.flatShading,
            });
        o.castShadow = style.shadows;
      }
    });
    return s;
  }, [gltf, style]);
  useEffect(
    () => () =>
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material as THREE.Material & { gradientMap?: THREE.Texture | null };
          m.gradientMap?.dispose();
          m.dispose();
        }
      }),
    [scene],
  );
  const { ref, actions } = useAnimations(gltf.animations);
  const hand = useMemo(() => scene.getObjectByName("arm-right") ?? null, [scene]);
  return { scene, ref, actions, hand };
}

/** Plays a one-off move over the idle, fading back to idle when it ends. */
function playOnce(action: THREE.AnimationAction | null | undefined) {
  if (!action) return;
  action.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.08).play();
  action.clampWhenFinished = false;
}

function Players({ style }: { style: SFStyle }) {
  const mat = useMat();
  const groundUnder = useGroundUnder();
  const { scene: sceneA, ref: rigA, actions: movesA, hand: armA } = useCharacter(PLAYER_A, style);
  const { scene: sceneB, ref: rigB, actions: movesB, hand: armB } = useCharacter(PLAYER_B, style);
  const root = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Group>(null);
  const still = useRef(false);
  // Which throw is in the air, and whether its catcher has started reaching.
  const throwState = useRef({ throwIndex: -1, reached: false });
  const handA = useMemo(() => new THREE.Vector3(), []);
  const handB = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const moves of [movesA, movesB]) moves[still.current ? "static" : "idle"]?.reset().play();
  }, [movesA, movesB]);

  useFrame(({ clock }) => {
    const elapsed = still.current ? FLIGHT / 2 : clock.elapsedTime;
    const throwIndex = Math.floor(elapsed / FLIGHT);
    const p = (elapsed % FLIGHT) / FLIGHT; // 0 at the throw, 1 at the catch
    const fromA = throwIndex % 2 === 0;
    const [thrower, catcher] = fromA ? [movesA, movesB] : [movesB, movesA];
    const st = throwState.current;
    if (!still.current && throwIndex !== st.throwIndex) {
      st.throwIndex = throwIndex;
      st.reached = false;
      playOnce(thrower["attack-melee-right"]);
    }
    if (!still.current && !st.reached && p >= REACH_AT) {
      st.reached = true;
      playOnce(catcher["interact-right"]);
    }

    // The frisbee rides from the thrower's hand to the catcher's, wherever
    // their animated arms have put them, on a shallow arc.
    const r = root.current;
    const d = disc.current;
    if (!r || !d || !armA || !armB) return;
    r.updateWorldMatrix(true, true);
    const toLocal = (bone: THREE.Object3D, out: THREE.Vector3) =>
      r.worldToLocal(bone.localToWorld(out.copy(HAND_IN_ARM)));
    toLocal(armA, handA);
    toLocal(armB, handB);
    const [from, to] = fromA ? [handA, handB] : [handB, handA];
    d.position.lerpVectors(from, to, p);
    d.position.y += ARC * Math.sin(Math.PI * p);
    // A thrown disc drifts sideways a little as it goes, and spins.
    d.position.z += 0.05 * Math.sin(Math.PI * p) * (fromA ? 1 : -1);
    d.rotation.set(0.25 * (fromA ? 1 : -1), elapsed * 18, 0);
  });

  return (
    <group ref={root}>
      {/* A faces +x, B faces -x: the kit's characters face +z. */}
      <group position={[-APART, groundUnder(-APART, 0) + GRASS, 0]} rotation={[0, Math.PI / 2, 0]} scale={PERSON_SCALE}>
        <group ref={rigA}>
          <primitive object={sceneA} />
        </group>
      </group>
      <group position={[APART, groundUnder(APART, 0) + GRASS, 0]} rotation={[0, -Math.PI / 2, 0]} scale={PERSON_SCALE}>
        <group ref={rigB}>
          <primitive object={sceneB} />
        </group>
      </group>
      <group ref={disc}>
        <mesh material={mat(FRISBEE)} castShadow={style.shadows}>
          <cylinderGeometry args={[0.034, 0.03, 0.008, 18]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Two people on the lawn throwing a frisbee back and forth, from Kenney's
 * Mini Characters: each idles, swings to throw, and reaches out as the disc
 * comes in, while it floats across on a shallow arc between their hands,
 * spinning and tipped a little. They stand on the ground wherever they're
 * put. Held mid-throw for viewers who ask for reduced motion. The characters
 * stream in once loaded; the rest of the city doesn't wait for them.
 */
function FrisbeePlayers({ style }: { style: SFStyle }) {
  return (
    <Suspense fallback={null}>
      <Players style={style} />
    </Suspense>
  );
}

useGLTF.preload([PLAYER_A, PLAYER_B]);

export const frisbeePlayers: LandmarkDef = {
  id: "frisbee",
  label: "Frisbee players",
  footprint: { across: 0.45, along: 0.45 },
  Model: FrisbeePlayers,
};
