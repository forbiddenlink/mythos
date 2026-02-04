'use client'

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { TimelineVisualizationD3 } from '@/components/timeline/TimelineVisualizationD3'

import pantheonsData from '@/data/pantheons.json'
import storiesData from '@/data/stories.json'
import deitiesData from '@/data/deities.json'
import eventsData from '@/data/events.json'

interface Pantheon {
  id: string
  name: string
  slug: string
  culture: string
  region: string
  timePeriodStart: number | null
  timePeriodEnd: number | null
  description: string | null
}

interface Story {
  id: string
  pantheonId: string
  title: string
  slug: string
  summary: string
  category?: string
}

interface Deity {
  id: string
  pantheonId: string
  name: string
  slug: string
  domain: string[]
  importanceRank: number
}

interface TimelineEvent {
  id: string
  title: string
  year: number
  pantheonId: string
  type: 'mythical' | 'historical'
  description: string
}

export function TimelinePageClient() {
  const pantheons = pantheonsData as unknown as Pantheon[]
  const stories = storiesData as unknown as Story[]
  const deities = deitiesData as unknown as Deity[]
  const events = eventsData as unknown as TimelineEvent[]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[45vh] min-h-[360px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pantheons-hero.png"
            alt="Ancient Timeline"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Clock className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Through the Ages
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Mythology Timeline
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Trace the rise and evolution of mythological traditions and major events across five millennia.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <div className="mt-8">
          <TimelineVisualizationD3
            pantheons={pantheons}
            events={events}
          />
        </div>

        {/* Historical Context Card */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
            Using the Interactive Timeline
          </h2>
          <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-medium text-foreground mb-1">Navigation</h3>
              <p>
                Use your mouse wheel to <strong>zoom in</strong> up to 50x magnification.
                Click and drag to <strong>pan</strong> across different eras.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Events & Details</h3>
              <p>
                <strong>Hollow circles</strong> represent key mythical or historical events.
                Hover over them to reveal detailed descriptions and dates.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Pantheons</h3>
              <p>
                Colored bars show the active periods of major civilizations.
                <strong>Click</strong> a bar to highlight that pantheon and dim others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
