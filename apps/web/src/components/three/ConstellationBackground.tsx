"use client";

import { createContext, useContext, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Line, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { rafThrottle } from "@/lib/rafThrottle";

const ActiveCtx = createContext(true);

const constellations = [
  {
    name: "Zeus",
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
}: {
  position: [number, number, number];
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
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
}: {
  position: [number, number, number];
  symbol: string;
  name: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const active = useContext(ActiveCtx);

  return (
    <Float
      speed={active ? 2 : 0}
      rotationIntensity={active ? 0.2 : 0}
      floatIntensity={active ? 0.3 : 0}
    >
      <group
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
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
            opacity={hovered ? 0.3 : 0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Constellations() {
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

function Scene() {
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
      <Constellations />
      <ScrollParallax />
      <ambientLight intensity={0.5} />
    </>
  );
}

export function ConstellationBackground({
  active = true,
  contained = false,
  className,
}: {
  /** When false, Canvas uses frameloop="never" and animation loops no-op. */
  active?: boolean;
  /** Scope to parent (absolute inset-0) instead of fixed full-page. */
  contained?: boolean;
  className?: string;
}) {
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

  if (!mounted || reducedMotion || !webGLSupported) {
    return null;
  }

  const shellClass =
    className ??
    (contained
      ? "absolute inset-0 -z-10 pointer-events-none"
      : "fixed inset-0 -z-10 pointer-events-none");

  return (
    <div className={shellClass} aria-hidden="true">
      <ActiveCtx.Provider value={active}>
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
          <Scene />
        </Canvas>
      </ActiveCtx.Provider>
    </div>
  );
}

export default ConstellationBackground;
