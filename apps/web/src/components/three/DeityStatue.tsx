'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Material configurations based on pantheon/culture
const MATERIALS = {
  marble: {
    color: '#F5F5F5',
    roughness: 0.3,
    metalness: 0.1,
    emissive: '#000000',
    emissiveIntensity: 0,
  },
  bronze: {
    color: '#CD7F32',
    roughness: 0.4,
    metalness: 0.8,
    emissive: '#3D2817',
    emissiveIntensity: 0.1,
  },
  gold: {
    color: '#FFD700',
    roughness: 0.2,
    metalness: 0.9,
    emissive: '#8B7500',
    emissiveIntensity: 0.15,
  },
  jade: {
    color: '#00A86B',
    roughness: 0.3,
    metalness: 0.2,
    emissive: '#004D40',
    emissiveIntensity: 0.1,
  },
  obsidian: {
    color: '#1C1C1C',
    roughness: 0.1,
    metalness: 0.5,
    emissive: '#2F1B41',
    emissiveIntensity: 0.2,
  },
  sandstone: {
    color: '#C2B280',
    roughness: 0.7,
    metalness: 0.0,
    emissive: '#000000',
    emissiveIntensity: 0,
  },
};

// Particle configurations for domains
const DOMAIN_PARTICLES = {
  thunder: { color: '#FFD700', count: 50, size: 0.1, speed: 2 },
  fire: { color: '#FF4500', count: 80, size: 0.08, speed: 1.5 },
  water: { color: '#4169E1', count: 60, size: 0.06, speed: 0.8 },
  wisdom: { color: '#E6E6FA', count: 30, size: 0.05, speed: 0.5 },
  war: { color: '#DC143C', count: 40, size: 0.07, speed: 1.2 },
  death: { color: '#4B0082', count: 25, size: 0.1, speed: 0.3 },
  sun: { color: '#FFA500', count: 70, size: 0.08, speed: 1 },
  love: { color: '#FF69B4', count: 45, size: 0.06, speed: 0.7 },
  default: { color: '#C0C0C0', count: 30, size: 0.05, speed: 0.5 },
};

// Map pantheon to material type
function getMaterialForPantheon(pantheon: string): keyof typeof MATERIALS {
  const mapping: Record<string, keyof typeof MATERIALS> = {
    'greek-pantheon': 'marble',
    'roman-pantheon': 'marble',
    'norse-pantheon': 'bronze',
    'egyptian-pantheon': 'gold',
    'hindu-pantheon': 'bronze',
    'japanese-pantheon': 'jade',
    'chinese-pantheon': 'jade',
    'celtic-pantheon': 'bronze',
    'aztec-pantheon': 'obsidian',
    'mesoamerican-pantheon': 'obsidian',
    'mesopotamian-pantheon': 'sandstone',
  };
  return mapping[pantheon] || 'marble';
}

// Map domain to particle type
function getParticleTypeForDomain(domains: string[]): keyof typeof DOMAIN_PARTICLES {
  const domainMap: Record<string, keyof typeof DOMAIN_PARTICLES> = {
    'sky': 'thunder',
    'thunder': 'thunder',
    'lightning': 'thunder',
    'sea': 'water',
    'ocean': 'water',
    'water': 'water',
    'fire': 'fire',
    'forge': 'fire',
    'wisdom': 'wisdom',
    'knowledge': 'wisdom',
    'war': 'war',
    'battle': 'war',
    'death': 'death',
    'underworld': 'death',
    'sun': 'sun',
    'light': 'sun',
    'love': 'love',
    'beauty': 'love',
  };

  for (const domain of domains) {
    const normalized = domain.toLowerCase();
    if (domainMap[normalized]) {
      return domainMap[normalized];
    }
  }
  return 'default';
}

interface StatueBustProps {
  material: keyof typeof MATERIALS;
  autoRotate?: boolean;
}

function StatueBust({ material, autoRotate = true }: StatueBustProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mat = MATERIALS[material];

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Head - Sphere */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial {...mat} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.3, 16]} />
          <meshStandardMaterial {...mat} />
        </mesh>

        {/* Shoulders/Bust base */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.6, 0.5, 0.5, 16]} />
          <meshStandardMaterial {...mat} />
        </mesh>

        {/* Pedestal top */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 0.2, 16]} />
          <meshStandardMaterial {...mat} roughness={mat.roughness + 0.2} />
        </mesh>

        {/* Pedestal base */}
        <mesh position={[0, -0.85, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 0.4, 16]} />
          <meshStandardMaterial {...mat} roughness={mat.roughness + 0.3} />
        </mesh>

        {/* Face features - simplified relief */}
        {/* Eyes */}
        <mesh position={[-0.15, 0.65, 0.4]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#2C2C2C" roughness={0.8} />
        </mesh>
        <mesh position={[0.15, 0.65, 0.4]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#2C2C2C" roughness={0.8} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0.55, 0.45]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      </group>
    </Float>
  );
}

interface DomainSparklesProps {
  domains: string[];
}

function DomainSparkles({ domains }: DomainSparklesProps) {
  const particleType = getParticleTypeForDomain(domains);
  const config = DOMAIN_PARTICLES[particleType];

  return (
    <Sparkles
      count={config.count}
      scale={3}
      size={config.size * 20}
      speed={config.speed}
      color={config.color}
      opacity={0.8}
    />
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#333" wireframe />
    </mesh>
  );
}

interface DeityStatueProps {
  pantheon: string;
  domains?: string[];
  className?: string;
  showParticles?: boolean;
}

export function DeityStatue({
  pantheon,
  domains = [],
  className = '',
  showParticles = true,
}: DeityStatueProps) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch {
      setWebGLSupported(false);
    }

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Don't render on server or if WebGL not supported
  if (!mounted || !webGLSupported) {
    return (
      <div className={`w-full h-80 rounded-xl bg-gradient-to-b from-midnight-light to-midnight flex items-center justify-center ${className}`}>
        <div className="text-gold/50 text-center">
          <div className="text-4xl mb-2">🏛️</div>
          <div className="text-sm">Divine presence</div>
        </div>
      </div>
    );
  }

  const materialType = getMaterialForPantheon(pantheon);

  return (
    <div className={`w-full h-80 rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-gold/20 ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <OrbitControls
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.5}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
          <Environment preset="sunset" />
          <Stage environment="sunset" intensity={0.5}>
            <StatueBust material={materialType} autoRotate={false} />
          </Stage>
          {showParticles && domains.length > 0 && (
            <DomainSparkles domains={domains} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default DeityStatue;
