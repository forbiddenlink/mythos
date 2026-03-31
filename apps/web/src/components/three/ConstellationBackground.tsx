"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Line, Text, Float } from "@react-three/drei";
import * as THREE from "three";

// Constellation data - deity symbols connected by stars
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
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle twinkle effect
      const scale =
        1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      meshRef.current.scale.setScalar(hovered ? scale * 1.5 : scale);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
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

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
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
        {/* Glow effect */}
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

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow rotation
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
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
  const { camera } = useThree();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / maxScroll;

      // Parallax effect on camera position
      camera.position.y = -scrollProgress * 2;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [camera]);

  return null;
}

function Scene() {
  return (
    <>
      {/* Background stars - using drei's optimized Stars component */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Constellation overlays */}
      <Constellations />

      {/* Scroll-based parallax */}
      <ScrollParallax />

      {/* Ambient lighting for symbols */}
      <ambientLight intensity={0.5} />
    </>
  );
}

export function ConstellationBackground() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: detect client-side mount
    setMounted(true);
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    // Check WebGL support
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

  // Don't render on server, if user prefers reduced motion, or WebGL not supported
  if (!mounted || reducedMotion || !webGLSupported) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Canvas
        frameloop="demand"
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
    </div>
  );
}

export default ConstellationBackground;
