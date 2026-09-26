"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  type AtlasLayout,
  prettyPantheonName,
  type AtlasNode,
} from "@/lib/atlas-layout";
import { MythosMark } from "@/components/icons/mythos-marks";
import { StageLoading } from "@/components/layout/tool-stage";
import { cn } from "@/lib/utils";

/* ----------------------------- one deity star ---------------------------- */

function Star({
  node,
  isHovered,
  onHover,
  onSelect,
}: {
  node: AtlasNode;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // gentle twinkle, amplified on hover
    const twinkle =
      1 + Math.sin(state.clock.elapsedTime * 1.6 + node.position[0]) * 0.08;
    ref.current.scale.setScalar(isHovered ? twinkle * 1.9 : twinkle);
  });

  return (
    <mesh
      ref={ref}
      position={node.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(node.id);
      }}
      onPointerOut={() => {
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.slug);
      }}
    >
      <sphereGeometry args={[node.size, 12, 12]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={isHovered ? 2.4 : 1.1}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ------------------------------- the scene ------------------------------- */

function Scene({
  layout,
  onSelect,
}: {
  layout: AtlasLayout;
  onSelect: (slug: string) => void;
}) {
  const { nodes, edges, pantheons } = layout;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = hoveredId ? nodes.find((n) => n.id === hoveredId) : undefined;

  return (
    <>
      <color attach="background" args={["#0a0a19"]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#f5e6c8" />

      <Stars
        radius={120}
        depth={60}
        count={1200}
        factor={4}
        saturation={0}
        fade
        speed={0.4}
      />

      {/* relationship + syncretism threads */}
      {edges.map((e) => (
        <Line
          key={e.id}
          points={[e.from, e.to]}
          color={e.type === "syncretism" ? "#d4af37" : "#b28f56"}
          lineWidth={e.type === "syncretism" ? 1.5 : 1}
          transparent
          opacity={e.opacity}
          dashed={e.type === "syncretism"}
        />
      ))}

      {/* deity stars */}
      {nodes.map((n) => (
        <Star
          key={n.id}
          node={n}
          isHovered={hoveredId === n.id}
          onHover={setHoveredId}
          onSelect={onSelect}
        />
      ))}

      {/* pantheon labels floating at each cluster centre */}
      {pantheons.map((p) => (
        <Html
          key={p.id}
          position={[p.center[0], p.center[1] + 6.5, p.center[2]]}
          center
          distanceFactor={40}
        >
          <span
            className="pointer-events-none whitespace-nowrap font-serif text-lg tracking-[0.2em] uppercase"
            style={{ color: p.color, textShadow: "0 0 12px rgba(0,0,0,0.9)" }}
          >
            {p.name}
          </span>
        </Html>
      ))}

      {/* hovered star tooltip */}
      {hovered && (
        <Html
          position={[
            hovered.position[0],
            hovered.position[1] + hovered.size + 0.6,
            hovered.position[2],
          ]}
          center
          distanceFactor={26}
        >
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-gold/40 bg-midnight/95 px-3 py-1.5 text-center shadow-lg">
            <div className="font-serif text-base text-parchment">
              {hovered.name}
            </div>
            <div
              className="text-[0.65rem] uppercase tracking-wider"
              style={{ color: hovered.color }}
            >
              {prettyPantheonName(hovered.pantheonId)}
            </div>
          </div>
        </Html>
      )}

      <OrbitControls
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={90}
        autoRotate={!hoveredId}
        autoRotateSpeed={0.35}
        makeDefault
      />
    </>
  );
}

/* ------------------------------- wrapper --------------------------------- */

type StageState = "pending" | "canvas" | "reduced" | "no-webgl";

const STAGE_HEIGHT = "h-[min(76vh,46rem)] min-h-[28rem]";

/**
 * The 3D star map stage. The server and first paint show a loading frame; the
 * canvas mounts only with WebGL and without a reduced-motion preference. The
 * page lists every deity below the stage (AtlasTraditionGrid), so the canvas is
 * an enhancement, never the only way in.
 */
export function AetherMap({ layout }: { layout: AtlasLayout }) {
  const router = useRouter();
  const [state, setState] = useState<StageState>("pending");

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(
        c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl")
      );
    } catch {
      webgl = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only gate: choose the stage after hydration
    setState(!webgl ? "no-webgl" : reduced ? "reduced" : "canvas");
  }, []);

  if (state === "pending") {
    return (
      <StageLoading
        tone="dark"
        mark="constellation"
        label="Lighting the stars…"
        className={cn(STAGE_HEIGHT, "rounded-lg")}
      />
    );
  }

  if (state !== "canvas") {
    return (
      <div className="dark relative isolate flex flex-col gap-4 overflow-hidden rounded-lg bg-midnight px-6 py-6 text-foreground sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle,color-mix(in_oklch,var(--parchment)_40%,transparent)_1px,transparent_1.5px)] bg-size-[26px_26px] opacity-20"
        />
        <div className="flex items-start gap-4">
          <MythosMark
            id="constellation"
            className="mt-0.5 size-7 shrink-0 text-gold-light"
          />
          <div>
            <p className="font-serif text-lg font-semibold text-parchment">
              {state === "reduced"
                ? "The star map is resting"
                : "The star map needs 3D graphics"}
            </p>
            <p className="mt-1 max-w-2xl type-ui text-parchment/80">
              {state === "reduced"
                ? "Your device asks for reduced motion, so the orbiting 3D map is off. Every figure is listed below by tradition."
                : "This browser cannot draw the 3D map. Every figure is listed below by tradition."}
            </p>
          </div>
        </div>
        {state === "reduced" ? (
          <button
            type="button"
            onClick={() => setState("canvas")}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-gold/50 px-4 type-ui font-medium text-gold-light transition-colors hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Show the star map anyway
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-[#0a0a19] ring-1 ring-border",
        STAGE_HEIGHT,
      )}
      data-interactive
      role="img"
      aria-label="Interactive 3D star map of deities, grouped by tradition. Every figure is also listed below the map."
    >
      <Canvas
        camera={{ position: [0, 30, 42], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <Scene
          layout={layout}
          onSelect={(slug) => router.push(`/deities/${slug}`)}
        />
      </Canvas>

      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0a0a19] to-transparent px-4 pt-10 pb-4 text-center type-meta uppercase tracking-[0.2em] text-parchment/75">
        Drag to orbit · scroll to zoom · click a star
      </p>
    </div>
  );
}
