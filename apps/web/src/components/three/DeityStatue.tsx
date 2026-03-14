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

// Determine statue variant based on domains
type StatueVariant = 'standard' | 'crowned' | 'helmeted' | 'winged' | 'radiant' | 'horned' | 'veiled';

function getStatueVariant(domains: string[]): StatueVariant {
  const normalizedDomains = domains.map(d => d.toLowerCase());

  // Check for specific domain patterns
  if (normalizedDomains.some(d => ['war', 'battle', 'combat', 'warriors'].includes(d))) {
    return 'helmeted';
  }
  if (normalizedDomains.some(d => ['sky', 'thunder', 'lightning', 'king', 'rulership'].includes(d))) {
    return 'crowned';
  }
  if (normalizedDomains.some(d => ['messenger', 'travel', 'wind', 'speed'].includes(d))) {
    return 'winged';
  }
  if (normalizedDomains.some(d => ['sun', 'light', 'dawn', 'radiance'].includes(d))) {
    return 'radiant';
  }
  if (normalizedDomains.some(d => ['nature', 'hunt', 'forest', 'animals', 'wild'].includes(d))) {
    return 'horned';
  }
  if (normalizedDomains.some(d => ['death', 'underworld', 'mystery', 'secrets'].includes(d))) {
    return 'veiled';
  }
  return 'standard';
}

interface StatueBustProps {
  material: keyof typeof MATERIALS;
  variant?: StatueVariant;
  autoRotate?: boolean;
}

// Crown component for sky/king gods
function Crown({ mat }: { mat: typeof MATERIALS.marble }) {
  return (
    <group position={[0, 1.15, 0]}>
      {/* Crown base ring */}
      <mesh>
        <torusGeometry args={[0.35, 0.05, 8, 32]} />
        <meshStandardMaterial {...mat} color="#FFD700" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Crown spikes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.sin(i * Math.PI * 0.4) * 0.3, 0.15, Math.cos(i * Math.PI * 0.4) * 0.3]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.04, 0.2, 4]} />
          <meshStandardMaterial {...mat} color="#FFD700" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Helmet component for war gods
function Helmet({ mat }: { mat: typeof MATERIALS.marble }) {
  return (
    <group position={[0, 0.85, 0]}>
      {/* Helmet dome */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...mat} color="#8B4513" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Crest/Plume */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.6]} />
        <meshStandardMaterial color="#DC143C" roughness={0.6} />
      </mesh>
      {/* Face guard */}
      <mesh position={[0, -0.1, 0.35]}>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshStandardMaterial {...mat} color="#8B4513" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Wings component for messenger gods
function Wings({ mat }: { mat: typeof MATERIALS.marble }) {
  return (
    <group>
      {/* Left wing */}
      <group position={[-0.6, 0.2, -0.2]} rotation={[0, -0.3, 0.2]}>
        <mesh>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial {...mat} color="#E8E8E8" metalness={0.1} roughness={0.4} />
        </mesh>
        {/* Wing feathers */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.15 - i * 0.1, -0.2 - i * 0.15, 0]}>
            <boxGeometry args={[0.25, 0.3, 0.03]} />
            <meshStandardMaterial {...mat} color="#E8E8E8" metalness={0.1} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* Right wing */}
      <group position={[0.6, 0.2, -0.2]} rotation={[0, 0.3, -0.2]}>
        <mesh>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial {...mat} color="#E8E8E8" metalness={0.1} roughness={0.4} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.15 + i * 0.1, -0.2 - i * 0.15, 0]}>
            <boxGeometry args={[0.25, 0.3, 0.03]} />
            <meshStandardMaterial {...mat} color="#E8E8E8" metalness={0.1} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Sun rays component for sun gods
function SunRays() {
  return (
    <group position={[0, 0.6, -0.2]}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[Math.sin(i * Math.PI * 0.25) * 0.7, Math.cos(i * Math.PI * 0.25) * 0.7, 0]} rotation={[0, 0, -i * Math.PI * 0.25]}>
          <coneGeometry args={[0.03, 0.4, 4]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Horns component for nature/hunt gods
function Horns({ mat }: { mat: typeof MATERIALS.marble }) {
  return (
    <group>
      {/* Left horn */}
      <group position={[-0.3, 1.0, 0]} rotation={[0.2, 0, -0.4]}>
        <mesh>
          <coneGeometry args={[0.08, 0.5, 8]} />
          <meshStandardMaterial {...mat} color="#8B7355" roughness={0.5} />
        </mesh>
      </group>
      {/* Right horn */}
      <group position={[0.3, 1.0, 0]} rotation={[0.2, 0, 0.4]}>
        <mesh>
          <coneGeometry args={[0.08, 0.5, 8]} />
          <meshStandardMaterial {...mat} color="#8B7355" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// Veil component for underworld/mystery gods
function Veil({ mat }: { mat: typeof MATERIALS.marble }) {
  return (
    <group position={[0, 0.9, 0]}>
      {/* Hood/veil draped over head */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...mat} color="#1a1a2e" roughness={0.8} transparent opacity={0.9} />
      </mesh>
      {/* Veil sides */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.5, 16, 1, true]} />
        <meshStandardMaterial {...mat} color="#1a1a2e" roughness={0.8} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function StatueBust({ material, variant = 'standard', autoRotate = true }: StatueBustProps) {
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
        {/* Variant-specific accessories */}
        {variant === 'crowned' && <Crown mat={mat} />}
        {variant === 'helmeted' && <Helmet mat={mat} />}
        {variant === 'winged' && <Wings mat={mat} />}
        {variant === 'radiant' && <SunRays />}
        {variant === 'horned' && <Horns mat={mat} />}
        {variant === 'veiled' && <Veil mat={mat} />}

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

        {/* Face features - hidden if veiled */}
        {variant !== 'veiled' && (
          <>
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
          </>
        )}
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
  const statueVariant = getStatueVariant(domains);

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
            <StatueBust material={materialType} variant={statueVariant} autoRotate={false} />
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
