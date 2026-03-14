# Mythos Atlas - Wow Factor Features Design

**Date:** 2026-03-14
**Status:** Approved
**Goal:** Transform Mythos Atlas from an excellent encyclopedia into an immersive, show-off-able experience

---

## Overview

Add 7 interconnected features that create a "living world" feel:

1. **Interactive 3D Constellation Background** - Celestial starfield with deity symbols
2. **Layered Audio System** - Contextual soundscapes that respond to content
3. **3D Deity Statues** - Rotating marble/bronze figures with particle effects
4. **Scroll-Triggered Story Scenes** - Cinematic storytelling with parallax
5. **AI Mythology Oracle** - Claude-powered chatbot in mystical UI
6. **Cosmic Particles** - Domain-specific particle effects
7. **Custom Cursor & Micro-interactions** - Polish that impresses

**Design Direction:** Hybrid (Celestial + Classical) - Deep space backgrounds meet gold/parchment temple UI

---

## Feature 1: Interactive 3D Constellation Background

### What It Does
- Full-screen Three.js particle system with 2000+ stars at varying depths
- Constellation lines connect stars, slowly auto-rotating
- Deity symbols (planetary glyphs) float at key positions, glow on hover
- Parallax effect - stars move at different speeds on scroll
- Click a constellation → navigates to that deity's page

### Technical Approach
```
Dependencies: @react-three/fiber (exists), @react-three/drei (exists)
```

**Components:**
- `apps/web/src/components/three/ConstellationBackground.tsx` - Main canvas
- `apps/web/src/components/three/Starfield.tsx` - Star particles
- `apps/web/src/components/three/ConstellationLines.tsx` - Line connections
- `apps/web/src/components/three/DeitySymbols.tsx` - Interactive symbols

**Implementation:**
```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'

export function ConstellationBackground() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
      frameloop="demand"
      camera={{ position: [0, 0, 1] }}
      dpr={[1, 1.5]}
    >
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={0.5} />
      <ConstellationLines />
      <DeitySymbols />
      <OrbitControls autoRotate autoRotateSpeed={0.1} enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
```

**Performance:**
- Use `frameloop="demand"` (60-80% GPU savings)
- Reduce to 500 stars on mobile via `useMediaQuery`
- `dpr={[1, 1.5]}` limits pixel ratio
- Only render on homepage + deity index page

### File Structure
```
apps/web/src/components/three/
├── ConstellationBackground.tsx  # Main wrapper
├── Starfield.tsx                # Star particles
├── ConstellationLines.tsx       # Connecting lines
├── DeitySymbols.tsx             # Interactive deity glyphs
└── index.ts                     # Exports
```

---

## Feature 2: Layered Audio System

### What It Does
- **Base layer**: Subtle ambient drone (always on when audio enabled)
- **Pantheon layers**: Crossfade based on current pantheon
  - Greek: Lyre, temple ambiance
  - Norse: Wind, distant thunder
  - Egyptian: Desert winds, ceremonial drums
  - Japanese: Bamboo flute, rain
- **Deity effects**: Triggered on deity pages
  - Zeus/Thor: Thunder rumbles
  - Poseidon: Ocean waves
  - Hephaestus: Forge fire crackles
- **UI sounds**: Subtle feedback on interactions

### Technical Approach
```
Dependencies: howler (exists)
```

**Components:**
- `apps/web/src/providers/audio-provider.tsx` - Audio context
- `apps/web/src/hooks/useAudio.ts` - Audio hook
- `apps/web/src/components/ui/audio-toggle.tsx` - Mute button
- `apps/web/src/lib/audio-sprites.ts` - Sound definitions

**Audio Files:**
```
public/audio/
├── ambient/
│   ├── base-drone.mp3        # 60s loop, ~500KB
│   ├── greek-lyre.mp3        # 30s loop
│   ├── norse-wind.mp3        # 30s loop
│   ├── egyptian-desert.mp3   # 30s loop
│   └── japanese-rain.mp3     # 30s loop
├── effects/
│   ├── thunder.mp3           # 3s, one-shot
│   ├── ocean-wave.mp3        # 5s, one-shot
│   ├── fire-crackle.mp3      # 4s, one-shot
│   └── ...
└── ui/
    ├── click.mp3             # 0.1s
    ├── whoosh.mp3            # 0.3s
    └── chime.mp3             # 0.5s
```

**Provider Pattern:**
```tsx
'use client'
import { Howl, Howler } from 'howler'
import { createContext, useContext, useState, useCallback } from 'react'

interface AudioContextType {
  isEnabled: boolean
  volume: number
  currentPantheon: string | null
  toggle: () => void
  setVolume: (v: number) => void
  setPantheon: (p: string | null) => void
  playEffect: (name: string) => void
}
```

**Accessibility:**
- Default: audio OFF (opt-in)
- Respect `prefers-reduced-motion` → no auto-play
- Clear visual indicator when audio is on
- Keyboard accessible toggle (header)

---

## Feature 3: 3D Deity Statues

### What It Does
- Rotating 3D statues on deity detail pages
- Material varies by culture:
  - Greek: White marble with gold accents
  - Egyptian: Gold and lapis lazuli
  - Norse: Weathered bronze
  - Japanese: Polished jade
- Particle effects for divine domains (lightning, fire, water)
- Smooth fade-in animation on page load

### Technical Approach
```
Dependencies: @react-three/fiber (exists), @react-three/drei (exists)
```

**Start with 5 key deities (procedural geometry):**
1. **Zeus** - Bearded head, lightning bolt, marble
2. **Odin** - One-eyed face, ravens, bronze
3. **Ra** - Falcon head, sun disk, gold
4. **Athena** - Helmeted head, owl, marble
5. **Thor** - Hammer, helmet, bronze

**Component:**
```tsx
// apps/web/src/components/three/DeityStatue.tsx
interface DeityStatueProps {
  deity: string
  material: 'marble' | 'bronze' | 'gold' | 'jade'
  domain?: 'thunder' | 'fire' | 'water' | 'wisdom' | 'war'
}

export function DeityStatue({ deity, material, domain }: DeityStatueProps) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
      <OrbitControls autoRotate enableZoom={false} />
      <Environment preset="sunset" />
      <Stage intensity={0.5}>
        <Float speed={1.5} floatIntensity={0.3}>
          <StatueModel deity={deity} material={material} />
        </Float>
        {domain && <DomainParticles type={domain} />}
      </Stage>
    </Canvas>
  )
}
```

**Fallback:** Static illustrated image if WebGL unavailable

---

## Feature 4: Scroll-Triggered Story Scenes

### What It Does
- Stories unfold cinematically as user scrolls
- Scene-by-scene panels with parallax layers
- Text reveals with subtle animation
- Background shifts (day→night, calm→storm)
- Choice points pin scroll until decision

### Technical Approach
```
Dependencies: gsap (NEW), @gsap/react (NEW), lenis (NEW)
```

**Install:**
```bash
pnpm add gsap @gsap/react lenis
```

**Components:**
- `apps/web/src/components/stories/CinematicStory.tsx` - Main wrapper
- `apps/web/src/components/stories/StoryScene.tsx` - Individual scene
- `apps/web/src/components/stories/ParallaxLayer.tsx` - Depth layers
- `apps/web/src/providers/smooth-scroll-provider.tsx` - Lenis setup

**Pattern:**
```tsx
'use client'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CinematicStory({ scenes }: { scenes: StoryScene[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    scenes.forEach((scene, i) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: `#scene-${i}`,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        }
      })
      .from(`#scene-${i} .text`, { opacity: 0, y: 50 })
      .from(`#scene-${i} .image`, { scale: 1.2, opacity: 0 }, '<')
    })
  }, { scope: containerRef })

  return <div ref={containerRef}>...</div>
}
```

**Mobile:** Simplified vertical flow with tap-to-advance

---

## Feature 5: AI Mythology Oracle

### What It Does
- Floating "Ask the Oracle" button (mystical eye icon)
- Opens modal with temple/oracle aesthetic
- Claude answers mythology questions in character
- Suggests related content from database
- Maintains conversation context

### Technical Approach
```
Dependencies: ai (Vercel AI SDK - NEW)
```

**Install:**
```bash
pnpm add ai @ai-sdk/anthropic
```

**API Route:**
```typescript
// apps/web/src/app/api/oracle/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import deities from '@/data/deities.json'
import stories from '@/data/stories.json'

const SYSTEM_PROMPT = `You are the Oracle of Delphi, keeper of ancient wisdom.
You speak in a mystical but helpful manner, weaving knowledge of mythology
from all cultures. When asked about specific deities or stories, you draw
from your vast knowledge. Keep responses concise (2-3 paragraphs max).
Reference specific deities and stories when relevant.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  // RAG: Find relevant context from our data
  const context = findRelevantContext(messages, deities, stories)

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: SYSTEM_PROMPT + `\n\nRelevant context:\n${context}`,
    messages,
  })

  return result.toDataStreamResponse()
}
```

**UI Component:**
```tsx
// apps/web/src/components/oracle/OracleChat.tsx
'use client'
import { useChat } from 'ai/react'

export function OracleChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/oracle',
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14">
          <Eye className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="oracle-modal">
        {/* Chat UI with mystical styling */}
      </DialogContent>
    </Dialog>
  )
}
```

**Rate Limiting:** 10 requests per user per hour (localStorage tracking)

---

## Feature 6: Cosmic Particles

### What It Does
- Domain-specific particles on deity pages
- Floating golden dust on hero section
- Particles react to cursor movement
- Achievement unlock: celebratory burst

### Technical Approach
```
Dependencies: @tsparticles/react (NEW), tsparticles (NEW)
```

**Install:**
```bash
pnpm add @tsparticles/react tsparticles @tsparticles/slim
```

**Presets per domain:**
```typescript
// apps/web/src/lib/particle-presets.ts
export const particlePresets = {
  thunder: {
    particles: {
      color: { value: '#FFD700' },
      shape: { type: 'star' },
      move: { direction: 'bottom', speed: 8 },
      // Lightning effect
    }
  },
  fire: {
    particles: {
      color: { value: ['#FF4500', '#FF6B35', '#FFD700'] },
      move: { direction: 'top', speed: 3 },
      // Rising embers
    }
  },
  water: {
    particles: {
      color: { value: ['#4169E1', '#87CEEB'] },
      move: { direction: 'bottom', speed: 1 },
      // Gentle rain/bubbles
    }
  },
  // ... more presets
}
```

**Component:**
```tsx
// apps/web/src/components/effects/DomainParticles.tsx
'use client'
import Particles from '@tsparticles/react'
import { particlePresets } from '@/lib/particle-presets'

export function DomainParticles({ domain }: { domain: string }) {
  const preset = particlePresets[domain] || particlePresets.default

  return (
    <Particles
      className="absolute inset-0 pointer-events-none"
      options={preset}
    />
  )
}
```

---

## Feature 7: Custom Cursor & Micro-interactions

### What It Does
- Custom cursor: Golden compass that rotates toward interactive elements
- Hover states: Elements glow, slight scale up
- Click feedback: Ripple effect from click point
- Enhanced page transitions

### Technical Approach
```
Dependencies: None new (Framer Motion exists)
```

**Custom Cursor:**
```tsx
// apps/web/src/components/ui/custom-cursor.tsx
'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 700 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16)
      cursorY.set(e.clientY - 16)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  return (
    <motion.div
      className="fixed w-8 h-8 pointer-events-none z-[9999] mix-blend-difference"
      style={{ x, y }}
    >
      <Compass className="w-full h-full text-gold" />
    </motion.div>
  )
}
```

**Enhanced Interactions:**
- Buttons: `active:scale-95` + subtle shadow lift
- Cards: Glow border on hover
- Links: Underline animation
- Page transitions: Existing View Transitions API + sound

---

## Implementation Phases

### Phase 7A: Visual Atmosphere (2-3 days)
**Goal:** Immediate visual impact

1. [ ] Install tsparticles
2. [ ] Create ConstellationBackground component
3. [ ] Add to homepage layout
4. [ ] Create DomainParticles component
5. [ ] Add golden dust to hero section
6. [ ] Implement custom cursor
7. [ ] Add cursor to root layout
8. [ ] Test performance on mobile

### Phase 7B: Audio System (1-2 days)
**Goal:** Immersive soundscape

1. [ ] Source/create audio files (royalty-free)
2. [ ] Create AudioProvider
3. [ ] Add audio toggle to header
4. [ ] Implement pantheon crossfades
5. [ ] Add deity-specific effects
6. [ ] Add UI sounds
7. [ ] Test accessibility (mute states)

### Phase 7C: 3D Deity Statues (2-3 days)
**Goal:** Impressive deity pages

1. [ ] Design 5 procedural statue geometries
2. [ ] Create DeityStatue component
3. [ ] Add material variants (marble, bronze, gold, jade)
4. [ ] Integrate DomainParticles with statues
5. [ ] Add to deity detail pages
6. [ ] Implement WebGL fallback
7. [ ] Test loading states

### Phase 7D: Scroll-Triggered Stories (3-4 days)
**Goal:** Cinematic storytelling

1. [ ] Install GSAP + Lenis
2. [ ] Create SmoothScrollProvider
3. [ ] Build CinematicStory component
4. [ ] Create 3 pilot stories with scenes
5. [ ] Implement parallax layers
6. [ ] Add choice point interactions
7. [ ] Mobile optimization
8. [ ] Create story scene illustrations

### Phase 7E: AI Oracle (2-3 days)
**Goal:** Interactive AI guide

1. [ ] Install Vercel AI SDK
2. [ ] Create /api/oracle route
3. [ ] Implement RAG with deity/story data
4. [ ] Build OracleChat UI component
5. [ ] Add mystical styling
6. [ ] Implement rate limiting
7. [ ] Add suggested questions
8. [ ] Test conversation flow

---

## New Dependencies Summary

```bash
# Phase 7A
pnpm add @tsparticles/react tsparticles @tsparticles/slim

# Phase 7D
pnpm add gsap @gsap/react lenis

# Phase 7E
pnpm add ai @ai-sdk/anthropic
```

---

## Success Criteria

- [ ] Lighthouse performance score remains >90
- [ ] All features respect prefers-reduced-motion
- [ ] Mobile experience is smooth (no jank)
- [ ] Audio is opt-in, not intrusive
- [ ] 3D elements have graceful fallbacks
- [ ] AI Oracle responses are helpful and in-character
- [ ] All existing 333 tests still pass
- [ ] Build succeeds without errors

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Three.js bundle size | Dynamic import, code split |
| Audio annoys users | Default OFF, clear controls |
| AI costs | Rate limiting, caching common queries |
| GSAP license | Free for non-commercial, check terms |
| Mobile performance | Reduced particles, simpler 3D |
