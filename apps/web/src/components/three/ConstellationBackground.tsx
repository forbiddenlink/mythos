"use client";

import { createContext, useContext, useRef, useEffect, useState } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { Stars, Line, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { rafThrottle } from "@/lib/rafThrottle";

const ActiveCtx = createContext(true);
const NavigateCtx = createContext<((slug: string) => void) | null>(null);

const constellations = [
  {
    name: "Zeus",
    slug: "zeus",
    symbol: "♃",
    points: [
      [-2, 2, 0],
      [-1.5, 1.5, 0],
      [-1, 2.5, 0],
      [-0.5, 1.8, 0],
      [0, 2.2, 0],
    ] as [number, number, number][],
    color: "#FFD700",
  },
  {
    name: "Odin",
    slug: "odin",
    symbol: "⚡",
    points: [
      [3, 1, 0],
      [2.5, 1.8, 0],
      [3.2, 2.5, 0],
      [2.8, 0.5, 0],
    ] as [number, number, number][],
    color: "#87CEEB",
  },
  {
    name: "Ra",
    slug: "ra",
    symbol: "☀",
    points: [
      [-3, -1, 0],
      [-2.5, -0.5, 0],
      [-2, -1.2, 0],
      [-2.5, -1.8, 0],
      [-3, -1, 0],
    ] as [number, number, number][],
    color: "#FFA500",
  },
  {
    name: "Athena",
    slug: "athena",
    symbol: "⚔",
    points: [
      [1, -2, 0],
      [1.5, -1.5, 0],
      [2, -2.2, 0],
      [1.2, -2.8, 0],
    ] as [number, number, number][],
    color: "#C0C0C0",
  },
  {
    name: "Thor",
    slug: "thor",
    symbol: "⚡",
    points: [
      [-1, -2.5, 0],
      [-0.5, -2, 0],
      [0, -2.8, 0],
      [0.5, -2.2, 0],
    ] as [number, number, number][],
    color: "#4169E1",
  },
];

function ConstellationLine({
  points,
  color,
}: {
  points: [number, number, number][];
  color: string;
}) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
}

function ConstellationStar({
  position,
  color,
  slug,
}: {
  position: [number, number, number];
  color: string;
  /** When set, the star is a navigation target for the deity. */
  slug?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const navigate = useContext(NavigateCtx);
  const interactive = !!slug && !!navigate;

  const enter = () => {
    setHovered(true);
    if (interactive) document.body.style.cursor = "pointer";
  };
  const leave = () => {
    setHovered(false);
    if (interactive) document.body.style.cursor = "";
  };

  return (
    <mesh
      position={position}
      onPointerOver={enter}
      onPointerOut={leave}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!interactive) return;
        e.stopPropagation();
        navigate?.(slug!);
      }}
      scale={hovered ? 1.5 : 1}
    >
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color={hovered ? "#FFFFFF" : color} />
    </mesh>
  );
}

function DeitySymbol({
  position,
  symbol,
  name,
  color,
  slug,
}: {
  position: [number, number, number];
  symbol: string;
  name: string;
  color: string;
  /** When set, the symbol navigates to the deity page on click. */
  slug?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const active = useContext(ActiveCtx);
  const navigate = useContext(NavigateCtx);
  const interactive = !!slug && !!navigate;

  const enter = () => {
    setHovered(true);
    if (interactive) document.body.style.cursor = "pointer";
  };
  const leave = () => {
    setHovered(false);
    if (interactive) document.body.style.cursor = "";
  };

  return (
    <Float
      speed={active ? 2 : 0}
      rotationIntensity={active ? 0.2 : 0}
      floatIntensity={active ? 0.3 : 0}
    >
      <group
        position={position}
        onPointerOver={enter}
        onPointerOut={leave}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (!interactive) return;
          e.stopPropagation();
          navigate?.(slug!);
        }}
      >
        <Text
          fontSize={0.3}
          color={hovered ? "#FFFFFF" : color}
          anchorX="center"
          anchorY="middle"
        >
          {symbol}
        </Text>
        {hovered && (
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            {name}
          </Text>
        )}
        <mesh>
          <circleGeometry args={[0.25, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? (interactive ? 0.45 : 0.3) : 0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Constellations({ navigable = false }: { navigable?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const active = useContext(ActiveCtx);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    invalidate();
  });

  return (
    <group ref={groupRef}>
      {constellations.map((constellation) => (
        <group key={constellation.name}>
          <ConstellationLine
            points={constellation.points}
            color={constellation.color}
          />
          {constellation.points.map((point, i) => (
            <ConstellationStar
              key={i}
              position={point}
              color={constellation.color}
              slug={navigable ? constellation.slug : undefined}
            />
          ))}
          <DeitySymbol
            position={[
              constellation.points[0][0],
              constellation.points[0][1] + 0.5,
              constellation.points[0][2],
            ]}
            symbol={constellation.symbol}
            name={constellation.name}
            color={constellation.color}
            slug={navigable ? constellation.slug : undefined}
          />
        </group>
      ))}
    </group>
  );
}

function ScrollParallax() {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const active = useContext(ActiveCtx);

  useEffect(() => {
    if (!active) return;
    const update = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      // eslint-disable-next-line react-hooks/immutability -- three.js camera mutation
      camera.position.y = -scrollProgress * 2;
      invalidate();
    };

    const onScroll = rafThrottle(update);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      onScroll.cancel();
    };
  }, [camera, invalidate, active]);

  return null;
}

function Scene({
  navigable = false,
  parallax = true,
}: {
  navigable?: boolean;
  parallax?: boolean;
}) {
  return (
    <>
      <Stars
        radius={100}
        depth={50}
        count={1500}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      <Constellations navigable={navigable} />
      {parallax && <ScrollParallax />}
      <ambientLight intensity={0.5} />
    </>
  );
}

export function ConstellationBackground({
  active = true,
  contained = false,
  navigable = false,
  className,
}: {
  /** When false, Canvas uses frameloop="never" and animation loops no-op. */
  active?: boolean;
  /** Scope to parent (absolute inset-0) instead of fixed full-page. */
  contained?: boolean;
  /**
   * Turn the decorative star-map into navigation: deity stars/symbols become
   * clickable (route to /deities/<slug>) and a keyboard-accessible link list is
   * rendered alongside the canvas. Reduced-motion / no-WebGL falls back to the
   * link list only, so navigation never depends on the 3D scene.
   */
  navigable?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebGLSupported(!!gl);
    } catch {
      setWebGLSupported(false);
    }

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const canvasShown = mounted && !reducedMotion && webGLSupported;

  // Accessible link list — always present in navigable mode so keyboard users
  // and reduced-motion / no-WebGL visitors can reach every deity.
  const deityLinks = navigable ? (
    <nav
      aria-label="Featured deities"
      className={
        canvasShown
          ? "sr-only"
          : "flex flex-wrap items-center justify-center gap-3"
      }
    >
      <ul className={canvasShown ? "" : "flex flex-wrap justify-center gap-3"}>
        {constellations.map((c) => (
          <li key={c.slug}>
            <a
              href={`/deities/${c.slug}`}
              className={
                canvasShown
                  ? ""
                  : "inline-flex items-center gap-2 rounded-full border border-gold/30 bg-midnight/40 px-4 py-2 font-serif text-gold transition-colors hover:border-gold/60 hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              }
            >
              <span aria-hidden="true">{c.symbol}</span>
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ) : null;

  // Decorative-only mode with no canvas available: render nothing (unchanged).
  if (!navigable && !canvasShown) {
    return null;
  }

  const shellClass =
    className ??
    (contained
      ? navigable
        ? "absolute inset-0 -z-10"
        : "absolute inset-0 -z-10 pointer-events-none"
      : navigable
        ? "absolute inset-0 -z-10"
        : "fixed inset-0 -z-10 pointer-events-none");

  return (
    <div className={shellClass} aria-hidden={navigable ? undefined : "true"}>
      {deityLinks}
      {canvasShown && (
        <ActiveCtx.Provider value={active}>
          <NavigateCtx.Provider
            value={navigable ? (slug) => router.push(`/deities/${slug}`) : null}
          >
            <Canvas
              frameloop={active ? "demand" : "never"}
              camera={{ position: [0, 0, 5], fov: 60 }}
              dpr={[1, 1.5]}
              gl={{
                antialias: false,
                alpha: true,
                powerPreference: "low-power",
              }}
            >
              <Scene navigable={navigable} parallax={!navigable} />
            </Canvas>
          </NavigateCtx.Provider>
        </ActiveCtx.Provider>
      )}
    </div>
  );
}

export default ConstellationBackground;
