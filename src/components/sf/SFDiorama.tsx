"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SFScene, { SF_GROUND_Y, landmarkProblems } from "./SFScene";
import { LANDMARKS } from "./landmarks";
import { SAVED_LAYOUT, type Layout } from "./layout";
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
  /** Where the landmarks stand; the saved layout when not given. */
  layout?: Layout;
  /** Edit mode: landmarks drag across the block and show their footprints. */
  editing?: boolean;
  onMove?: (id: string, at: { u: number; v: number }) => void;
}

export default function SFDiorama({
  styleId,
  className,
  paused = false,
  layout = SAVED_LAYOUT,
  editing = false,
  onMove,
}: SFDioramaProps) {
  const style = SF_STYLES[styleId];
  const spin = useRef<THREE.Group | null>(null);
  const [grabbed, setGrabbed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  // Client-only component (the page loads it with ssr: false), so document is
  // there on first render. iPhone Safari has no element fullscreen; the button
  // just doesn't appear there.
  const [canFullscreen] = useState(() => document.fullscreenEnabled);
  const [fullscreen, setFullscreen] = useState(false);

  // Track the real fullscreen state rather than our own toggle, so Esc and the
  // browser's own exit keep the button in step.
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = () => {
    // Can be refused (an embedding frame without allow="fullscreen", say);
    // the page just stays as it was.
    const done = document.fullscreenElement
      ? document.exitFullscreen()
      : frame.current?.requestFullscreen();
    done?.catch(() => {});
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // A model turning under the cursor can't be arranged, so editing stops it.
  const spinning = !grabbed && !paused && !reduced && !editing;

  return (
    <div
      ref={frame}
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
            <SFScene style={style} layout={layout} editing={editing} onMove={onMove} />
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
          // Shift-drag slides the model around the frame (OrbitControls pans
          // on a modified left drag). Right-drag is left off so a context-menu
          // reflex doesn't throw the city out of view; two-finger touch still
          // pans on phones.
          enablePan
          // Registered as the scene's controls so a landmark drag can pause
          // them; otherwise the camera would orbit under the drag.
          makeDefault
          screenSpacePanning
          mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: undefined }}
          // Scroll to inspect. The camera opens ~22.6 out; the floor stops it
          // short of clipping into the towers, the ceiling before the city
          // shrinks to a postage stamp. Zooming toward the cursor means you can
          // point at a landmark and dive at it rather than at the cube's centre.
          enableZoom
          zoomToCursor
          zoomSpeed={1.4}
          minDistance={6}
          maxDistance={34}
          onStart={() => setGrabbed(true)}
          target={[0, 0, 0]}
          minPolarAngle={Math.PI * 0.14}
          maxPolarAngle={Math.PI * 0.44}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>

      {/* While arranging, name anything standing where it can't: in the
          roadway or hanging off the block. Its footprint shows red too. */}
      {editing && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1,
            maxWidth: 260,
            padding: "7px 10px",
            borderRadius: 9,
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(6px)",
            font: "11px/1.5 ui-monospace, monospace",
            color: "#5d554a",
            pointerEvents: "none",
          }}
        >
          {(() => {
            const bad = LANDMARKS.flatMap((def) =>
              landmarkProblems(def, layout).map((p) => `${def.label}: ${p}`),
            );
            return bad.length ? (
              bad.map((line) => (
                <div key={line} style={{ color: "#b2392f" }}>
                  {line}
                </div>
              ))
            ) : (
              <div>every landmark is clear</div>
            );
          })()}
        </div>
      )}

      {canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit full screen" : "View full screen"}
          title={fullscreen ? "Exit full screen (Esc)" : "View full screen"}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1,
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: 9,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.72)",
            color: "#4a4339",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d={
                fullscreen
                  ? "M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"
                  : "M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"
              }
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

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
