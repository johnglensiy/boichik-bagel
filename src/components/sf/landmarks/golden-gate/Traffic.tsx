"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makeToonRamp, type SFStyle } from "../../styles";
import { DECK_LEN, LANE_W, LANE_COUNT } from "./dimensions";

const CARS_PER_LANE = 11;
/**
 * Car width in the bridge's own units: most of a lane, with a sliver of
 * road showing either side. Length follows from each model's proportions.
 */
const CAR_W = (LANE_W / LANE_COUNT) * 0.85;
/** Kenney's Car Kit (CC0, kenney.nl). All five share one colormap texture. */
const CAR_MODELS = ["sedan", "taxi", "suv", "van", "truck"].map(
  (name) => `/models/cars/${name}.glb`,
);

/**
 * Flattens one car model into a single geometry: body and wheels merged with
 * their node transforms, sitting on y = 0, centred, nose toward +x and scaled
 * to CAR_W. One geometry per model is what lets each model be a single
 * instanced mesh, however many of it are on the road.
 */
function carGeometry(scene: THREE.Object3D): THREE.BufferGeometry {
  scene.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  scene.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const g = (o.geometry as THREE.BufferGeometry).clone().applyMatrix4(o.matrixWorld);
    // Keep only what the shared material reads, so every part merges.
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
    }
    parts.push(g.index ? g.toNonIndexed() : g);
  });
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  if (!merged) throw new Error("car model has no mergeable meshes");

  merged.computeBoundingBox();
  const box = merged.boundingBox!;
  merged.translate(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  const k = CAR_W / (box.max.x - box.min.x);
  merged.scale(k, k, k);
  merged.rotateY(Math.PI / 2); // the models face +z; the deck runs along x
  return merged;
}

/**
 * Cars streaming across the deck, two lanes each way. Each of the five
 * models is one instanced mesh, so the whole stream is five draw calls and
 * each frame only rewrites matrices. Spacing, speed and model mix vary per
 * lane so it reads as traffic rather than a conveyor belt. Held still for
 * viewers who ask for reduced motion.
 */
export function Traffic({ style, deckTop }: { style: SFStyle; deckTop: number }) {
  const gltfs = useGLTF(CAR_MODELS);
  const meshes = useRef<Array<THREE.InstancedMesh | null>>([]);

  const geometries = useMemo(() => gltfs.map((g) => carGeometry(g.scene)), [gltfs]);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  // The kit's own colormap, read off the first model. It belongs to the
  // loader's cache, so only the material made here is ours to dispose.
  const map = useMemo(() => {
    let found: THREE.Texture | null = null;
    gltfs[0].scene.traverse((o) => {
      if (!found && o instanceof THREE.Mesh) {
        found = (o.material as THREE.MeshStandardMaterial).map ?? null;
      }
    });
    return found as THREE.Texture | null;
  }, [gltfs]);

  // Same material treatment as the rest of the city, so the cars pick up
  // each style's shading.
  const material = useMemo(
    () =>
      style.toon
        ? new THREE.MeshToonMaterial({ map, gradientMap: makeToonRamp(3), side: THREE.DoubleSide })
        : new THREE.MeshStandardMaterial({
            map,
            // The kit's material is double-sided and some faces rely on it.
            side: THREE.DoubleSide,
            roughness: style.roughness,
            metalness: style.metalness,
            flatShading: style.flatShading,
          }),
    [style, map],
  );
  useEffect(
    () => () => {
      if (material instanceof THREE.MeshToonMaterial) material.gradientMap?.dispose();
      material.dispose();
    },
    [material],
  );

  const { cars, byModel } = useMemo(() => {
    const lane = LANE_W / LANE_COUNT;
    // Deterministic jitter, so the stream looks the same on every load.
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const cars: Array<{ z: number; dir: 1 | -1; speed: number; offset: number }> = [];
    const byModel: number[][] = CAR_MODELS.map(() => []);
    for (let k = 0; k < LANE_COUNT; k++) {
      // Right-hand traffic: the near lanes run toward +x.
      const dir = k < LANE_COUNT / 2 ? 1 : -1;
      const z = -LANE_W / 2 + (k + 0.5) * lane;
      const speed = 0.55 + rand() * 0.35;
      const gap = DECK_LEN / CARS_PER_LANE;
      for (let c = 0; c < CARS_PER_LANE; c++) {
        byModel[Math.floor(rand() * CAR_MODELS.length)].push(cars.length);
        cars.push({ z, dir, speed, offset: c * gap + rand() * gap * 0.6 });
      }
    }
    return { cars, byModel };
  }, []);

  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const o = useMemo(() => new THREE.Object3D(), []);
  const roadY = deckTop + 0.02;
  useFrame(({ clock }) => {
    const t = reduced.current ? 0 : clock.elapsedTime;
    byModel.forEach((ids, m) => {
      const mesh = meshes.current[m];
      if (!mesh) return;
      ids.forEach((id, j) => {
        const car = cars[id];
        const run = (car.offset + car.dir * car.speed * t) % DECK_LEN;
        o.position.set(((run + DECK_LEN) % DECK_LEN) - DECK_LEN / 2, roadY, car.z);
        o.rotation.set(0, car.dir > 0 ? 0 : Math.PI, 0);
        o.updateMatrix();
        mesh.setMatrixAt(j, o.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <>
      {geometries.map((g, m) => (
        <instancedMesh
          key={m}
          ref={(el) => {
            meshes.current[m] = el;
          }}
          args={[g, material, byModel[m].length]}
          // The instances move every frame; a bounding sphere computed once
          // would cull cars that have driven out of it.
          frustumCulled={false}
        />
      ))}
    </>
  );
}

useGLTF.preload(CAR_MODELS);
