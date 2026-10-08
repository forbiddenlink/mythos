"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  type AtlasLayout,
  prettyPantheonName,
  type AtlasNode,
} from "@/lib/atlas-layout";
import {
  declutterLabels,
  hiddenSetsDiffer,
  type LabelBox,
} from "@/lib/atlas-label-declutter";

/** Re-run the screen-space collision check at most this often, not per frame. */
const LABEL_DECLUTTER_INTERVAL_MS = 120;

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

/**
 * Watches every pantheon label's on-screen position and size (via
 * `getBoundingClientRect`, which already accounts for drei's distance-based
 * CSS scaling) and reports which ids should be hidden to avoid an unreadable
 * overlap. Runs inside the R3F render loop but is throttled to
 * `LABEL_DECLUTTER_INTERVAL_MS` and reuses its own refs, so it does no
 * allocation on the frames it skips and only a small, bounded allocation
 * (one box per pantheon) on the frames it runs.
 */
function useLabelDeclutter({
  labelRefs,
  priorityByPantheon,
  hoveredPantheonId,
}: {
  labelRefs: React.RefObject<Map<string, HTMLSpanElement>>;
  priorityByPantheon: ReadonlyMap<string, number>;
  hoveredPantheonId: string | null;
}) {
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const elapsedSinceCheck = useRef(0);

  useFrame((_state, delta) => {
    elapsedSinceCheck.current += delta * 1000;
    if (elapsedSinceCheck.current < LABEL_DECLUTTER_INTERVAL_MS) return;
    elapsedSinceCheck.current = 0;

    const boxes: LabelBox[] = [];
    for (const [id, el] of labelRefs.current) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue; // not laid out yet
      const priority =
        id === hoveredPantheonId
          ? Number.POSITIVE_INFINITY
          : (priorityByPantheon.get(id) ?? 0);
      boxes.push({
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        priority,
      });
    }

    const next = declutterLabels(boxes);
    // Functional update so this frame-loop callback never reads component
    // state directly (only React may do that, outside of render/effects).
    setHiddenIds((prev) => (hiddenSetsDiffer(next, prev) ? next : prev));
  });

  return hiddenIds;
}

/* ------------------------------- the scene ------------------------------- */

function Scene({
  layout,
  onSelect,
  reducedMotion,
}: {
  layout: AtlasLayout;
  onSelect: (slug: string) => void;
  reducedMotion: boolean;
}) {
  const { nodes, edges, pantheons } = layout;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = hoveredId ? nodes.find((n) => n.id === hoveredId) : undefined;
  const hoveredPantheonId = hovered?.pantheonId ?? null;

  // Bigger clusters (more figures) win a label collision by default; the
  // hovered star's own tradition always wins regardless of size.
  const priorityByPantheon = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      counts.set(n.pantheonId, (counts.get(n.pantheonId) ?? 0) + 1);
    }
    return counts;
  }, [nodes]);

  const labelRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const hiddenLabelIds = useLabelDeclutter({
    labelRefs,
    priorityByPantheon,
    hoveredPantheonId,
  });

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

      {/* pantheon labels floating at each cluster centre. Two clusters can
          project close enough on screen to overlap; useLabelDeclutter hides
          the lower-priority one rather than let text collide. Every
          tradition stays reachable by hovering one of its stars (the
          tooltip below) or in AtlasTraditionGrid under the map. */}
      {pantheons.map((p) => {
        const isHidden = hiddenLabelIds.has(p.id);
        return (
          <Html
            key={p.id}
            position={[p.center[0], p.center[1] + 6.5, p.center[2]]}
            center
            distanceFactor={40}
          >
            <span
              ref={(el) => {
                if (el) labelRefs.current.set(p.id, el);
                else labelRefs.current.delete(p.id);
              }}
              aria-hidden="true"
              className="pointer-events-none block whitespace-nowrap font-serif text-lg tracking-[0.2em] uppercase"
              style={{
                color: p.color,
                textShadow: "0 0 12px rgba(0,0,0,0.9)",
                opacity: isHidden ? 0 : 1,
                transition: reducedMotion ? "none" : "opacity 200ms ease",
              }}
            >
              {p.name}
            </span>
          </Html>
        );
      })}

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

export default function AetherScene({
  layout,
  onSelect,
  reducedMotion,
}: {
  layout: AtlasLayout;
  onSelect: (slug: string) => void;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 30, 42], fov: 52 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power" }}
    >
      <Scene
        layout={layout}
        onSelect={onSelect}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
