"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  computeAtlasLayout,
  prettyPantheonName,
  type AtlasNode,
} from "@/lib/atlas-layout";

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
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "auto";
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

function Scene({ onSelect }: { onSelect: (slug: string) => void }) {
  const { nodes, edges, pantheons } = useMemo(() => computeAtlasLayout(), []);
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

      {/* relationship threads */}
      {edges.map((e) => (
        <Line
          key={e.id}
          points={[e.from, e.to]}
          color="#b28f56"
          lineWidth={1}
          transparent
          opacity={e.opacity}
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

/* --------------------- accessible / no-WebGL fallback -------------------- */

function AtlasFallback() {
  const { pantheons, nodes } = useMemo(() => computeAtlasLayout(), []);
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="mb-8 text-muted-foreground">
        An interactive star map of every deity, grouped by pantheon. (A text
        list is shown here because motion is reduced or 3D is unavailable.)
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {pantheons.map((p) => (
          <section key={p.id}>
            <h2 className="mb-2 font-serif text-lg" style={{ color: p.color }}>
              {p.name}
            </h2>
            <ul className="space-y-1">
              {nodes
                .filter((n) => n.pantheonId === p.id)
                .sort((a, b) => a.importanceRank - b.importanceRank)
                .map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/deities/${n.slug}`}
                      className="text-sm text-foreground/80 hover:text-gold transition-colors"
                    >
                      {n.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- wrapper --------------------------------- */

export function AetherMap() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [useCanvas, setUseCanvas] = useState(false);

  useEffect(() => {
    setReady(true);
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
    setUseCanvas(!reduced && webgl);
  }, []);

  // Server + first paint: render the accessible fallback (also the
  // reduced-motion / no-WebGL experience). Progressive enhancement.
  if (!ready || !useCanvas) return <AtlasFallback />;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <Canvas
        camera={{ position: [0, 6, 46], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <Scene onSelect={(slug) => router.push(`/deities/${slug}`)} />
      </Canvas>

      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 px-4 pt-8 text-center">
        <span className="text-xs uppercase tracking-[0.35em] text-gold/80">
          The Aether Map
        </span>
        <h1 className="font-serif text-3xl text-parchment md:text-4xl">
          Every god, one sky
        </h1>
        <p className="max-w-md text-sm text-parchment/70">
          Stars are deities, sized by importance and coloured by pantheon;
          threads are their relationships.
        </p>
        <span className="mt-1 text-[0.7rem] uppercase tracking-widest text-parchment/50">
          drag to orbit · scroll to zoom · click a star
        </span>
      </div>
    </div>
  );
}

export default AetherMap;
