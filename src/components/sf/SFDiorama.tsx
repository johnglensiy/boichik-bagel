"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type * as THREE from "three";
import SFScene, { SF_GROUND_Y } from "./SFScene";
import { SF_STYLES, type SFStyleId } from "./styles";

/** The cube spans y −3.4…+5.5, so this drops its centre onto the orbit target. */
const CITY_OFFSET_Y = -1.05;

/**
 * Turntable. Stops the moment the viewer grabs the model and doesn't restart —
 * once someone takes control of a thing, taking it back is rude.
 */
function Turntable({
  enabled,
  target,
}: {
  enabled: boolean;
  target: React.RefObject<THREE.Group | null>;
}) {
  useFrame((_, dt) => {
    // Mutating the object directly is the point of useFrame: driving this
    // through state would re-render React 60 times a second to move a number
    // that React doesn't own. The scene graph is three's, not React's.
    // eslint-disable-next-line react-hooks/immutability
    if (enabled && target.current) target.current.rotation.y += dt * 0.12;
  });
  return null;
}

interface SFDioramaProps {
  styleId: SFStyleId;
  className?: string;
  /** Pauses the turntable without unmounting — for when the hero scrolls away. */
  paused?: boolean;
}

export default function SFDiorama({ styleId, className, paused = false }: SFDioramaProps) {
  const style = SF_STYLES[styleId];
  const spin = useRef<THREE.Group | null>(null);
  const [grabbed, setGrabbed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const spinning = !grabbed && !paused && !reduced;

  return (
    <div
      className={className}
      style={{ background: style.bg, position: "relative", overflow: "hidden" }}
    >
      <Canvas
        shadows={style.shadows}
        dpr={[1, 1.5]}
        camera={{ position: [14, 9.5, 15], fov: 32 }}
        gl={{ antialias: true }}
        onPointerDown={() => setGrabbed(true)}
        style={{ touchAction: "pan-y" }}
      >
        <color attach="background" args={[style.bg]} />
        {style.fog && (
          <fog attach="fog" args={[style.fog.color, style.fog.near, style.fog.far]} />
        )}

        {/* Lights live outside the turntable: inside it they'd orbit with the
            city and the key would swing across the model as it turned. */}
        <ambientLight intensity={style.ambient} />
        <directionalLight
          position={[14, 18, 10]}
          intensity={style.keyIntensity}
          color={style.keyColor}
          castShadow={style.shadows}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0006}
        />
        {/* Bounce off the bay, from low and behind. */}
        <directionalLight position={[-12, 4, -14]} intensity={style.fillIntensity} color="#cfe0e6" />

        <Suspense fallback={null}>
          {/* The bridge runs the block's diagonal, so the opening angle puts
              that diagonal across the frame — a shade off square-on, because
              dead-on is static. Turned the other way it foreshortens into a
              red gantry and stops reading as a bridge at all. */}
          <group ref={spin} position={[0, CITY_OFFSET_Y, 0]} rotation={[0, 1.35, 0]}>
            <SFScene style={style} />
            {style.shadows && (
              <ContactShadows
                position={[0, SF_GROUND_Y - 0.02, 0]}
                opacity={0.32}
                scale={22}
                blur={2.2}
                far={8}
                resolution={512}
                frames={1}
                color="#5d513d"
              />
            )}
          </group>
        </Suspense>

        <Turntable enabled={spinning} target={spin} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          target={[0, 0, 0]}
          minPolarAngle={Math.PI * 0.14}
          maxPolarAngle={Math.PI * 0.44}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>

      {/* Uncoated-stock grain. CSS rather than a post-processing pass — it costs
          nothing and only the riso treatment really leans on it. */}
      {style.grain > 0 && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: style.grain,
            mixBlendMode: "multiply",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
