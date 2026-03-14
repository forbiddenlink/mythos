'use client';

import { useEffect, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';

// Particle presets for different deity domains
const particlePresets: Record<string, ISourceOptions> = {
  thunder: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: ['#FFD700', '#FFFFFF', '#87CEEB'] },
      shape: { type: 'star' },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: { enable: true, speed: 2, sync: false },
      },
      size: { value: { min: 1, max: 4 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 5, max: 15 },
        straight: true,
        outModes: { default: 'out' },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    },
  },
  fire: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 50, density: { enable: true } },
      color: { value: ['#FF4500', '#FF6B35', '#FFD700', '#FF8C00'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.2, max: 0.7 },
        animation: { enable: true, speed: 1, sync: false },
      },
      size: {
        value: { min: 2, max: 6 },
        animation: { enable: true, speed: 3, sync: false },
      },
      move: {
        enable: true,
        direction: 'top',
        speed: { min: 1, max: 4 },
        random: true,
        outModes: { default: 'out' },
      },
    },
  },
  water: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 40, density: { enable: true } },
      color: { value: ['#4169E1', '#87CEEB', '#00CED1', '#1E90FF'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 0.5, max: 2 },
        random: true,
        outModes: { default: 'out' },
        warp: true,
      },
    },
  },
  wisdom: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 25, density: { enable: true } },
      color: { value: ['#C0C0C0', '#FFFFFF', '#E6E6FA'] },
      shape: { type: 'star' },
      opacity: {
        value: { min: 0.3, max: 0.7 },
        animation: { enable: true, speed: 0.3, sync: false },
      },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 0.2, max: 0.8 },
        random: true,
        outModes: { default: 'bounce' },
      },
    },
  },
  war: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 35, density: { enable: true } },
      color: { value: ['#DC143C', '#8B0000', '#FF4500', '#B22222'] },
      shape: { type: 'triangle' },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: { enable: true, speed: 1.5, sync: false },
      },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 1, max: 3 },
        random: true,
        outModes: { default: 'bounce' },
      },
    },
  },
  death: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 20, density: { enable: true } },
      color: { value: ['#4B0082', '#2F2F4F', '#483D8B', '#191970'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        animation: { enable: true, speed: 0.2, sync: false },
      },
      size: { value: { min: 3, max: 8 } },
      move: {
        enable: true,
        direction: 'top',
        speed: { min: 0.3, max: 0.8 },
        random: true,
        outModes: { default: 'out' },
      },
    },
  },
  sun: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00'] },
      shape: { type: 'star' },
      opacity: {
        value: { min: 0.4, max: 0.9 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: {
        value: { min: 1, max: 4 },
        animation: { enable: true, speed: 2, sync: false },
      },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 0.3, max: 1 },
        random: true,
        outModes: { default: 'bounce' },
      },
    },
  },
  love: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 25, density: { enable: true } },
      color: { value: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.3, max: 0.7 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 0.3, max: 1 },
        random: true,
        outModes: { default: 'bounce' },
      },
    },
  },
  default: {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: ['#FFD700', '#C0C0C0', '#87CEEB'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: { value: { min: 1, max: 4 } },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 0.2, max: 0.8 },
        random: true,
        outModes: { default: 'bounce' },
      },
    },
  },
};

// Map deity domains to particle types
const domainToParticleType: Record<string, string> = {
  'sky': 'thunder',
  'thunder': 'thunder',
  'lightning': 'thunder',
  'storm': 'thunder',
  'fire': 'fire',
  'forge': 'fire',
  'metalworking': 'fire',
  'sea': 'water',
  'ocean': 'water',
  'water': 'water',
  'rivers': 'water',
  'wisdom': 'wisdom',
  'knowledge': 'wisdom',
  'prophecy': 'wisdom',
  'war': 'war',
  'battle': 'war',
  'strategy': 'war',
  'death': 'death',
  'underworld': 'death',
  'afterlife': 'death',
  'sun': 'sun',
  'light': 'sun',
  'love': 'love',
  'beauty': 'love',
  'fertility': 'love',
};

interface DomainParticlesProps {
  domain?: string;
  domains?: string[];
  className?: string;
}

export function DomainParticles({ domain, domains, className = '' }: DomainParticlesProps) {
  const [init, setInit] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    // Optional: log when particles are loaded
  }, []);

  // Don't render if user prefers reduced motion
  if (reducedMotion) {
    return null;
  }

  // Determine particle type from domain(s)
  const allDomains = domains || (domain ? [domain] : []);
  let particleType = 'default';

  for (const d of allDomains) {
    const normalizedDomain = d.toLowerCase();
    if (domainToParticleType[normalizedDomain]) {
      particleType = domainToParticleType[normalizedDomain];
      break;
    }
  }

  const options = particlePresets[particleType] || particlePresets.default;

  if (!init) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <Particles
        id={`particles-${particleType}`}
        particlesLoaded={particlesLoaded}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}

// Hero section golden dust particles
export function GoldenDustParticles({ className = '' }: { className?: string }) {
  const [init, setInit] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (reducedMotion || !init) {
    return null;
  }

  const options: ISourceOptions = {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 40, density: { enable: true } },
      color: { value: ['#FFD700', '#DAA520', '#B8860B'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        animation: { enable: true, speed: 0.3, sync: false },
      },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 0.1, max: 0.5 },
        random: true,
        outModes: { default: 'bounce' },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'bubble' },
      },
      modes: {
        bubble: { distance: 150, size: 5, duration: 2, opacity: 0.6 },
      },
    },
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <Particles
        id="golden-dust"
        options={options}
        className="w-full h-full"
      />
    </div>
  );
}

export default DomainParticles;
