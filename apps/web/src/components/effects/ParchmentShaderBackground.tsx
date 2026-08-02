"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const STATIC_BG =
  "radial-gradient(900px 500px at 50% -5%, rgba(212,175,55,0.16), transparent 60%), linear-gradient(to bottom, #0b0c14, #0b0c14)";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Value-noise fbm parchment with a warm candlelight pool near the top.
const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uFlicker;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float fibers = fbm(uv * vec2(6.0, 48.0) + vec2(uTime * 0.015, 0.0));
    float grain = fbm(uv * 180.0);
    vec3 base = vec3(0.043, 0.047, 0.078);
    vec3 warm = vec3(0.24, 0.18, 0.09);
    float glow = smoothstep(0.95, 0.15, distance(uv, vec2(0.5, 0.12)));
    float flicker = 0.92 + 0.08 * sin(uTime * 1.7) * uFlicker;
    vec3 col = base + warm * (0.16 * fibers + 0.05 * grain) * glow * flicker;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function ParchmentPlane({ animate }: { animate: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uFlicker: { value: animate ? 1 : 0 } }),
    [animate],
  );

  useFrame((state) => {
    if (animate && material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/**
 * A GLSL parchment/candlelight background for the Oracle sanctuary. Heavily
 * gated: reduced-motion, touch/small screens, and WebGL-less environments get
 * a matching static CSS gradient — the shader is pure enhancement, never a
 * requirement for the page to look right.
 */
export function ParchmentShaderBackground() {
  const [enabled, setEnabled] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    let hasWebGL = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebGL = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      hasWebGL = false;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability detection (WebGL / motion / viewport) only known after mount
    setAnimate(!reduce);
    setEnabled(hasWebGL && !small && !touch);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ background: STATIC_BG }}
    >
      {enabled && (
        <Canvas
          gl={{ antialias: false, powerPreference: "low-power" }}
          camera={{ position: [0, 0, 1] }}
          className="h-full w-full"
          frameloop={animate ? "always" : "demand"}
        >
          <ParchmentPlane animate={animate} />
        </Canvas>
      )}
    </div>
  );
}

export default ParchmentShaderBackground;
