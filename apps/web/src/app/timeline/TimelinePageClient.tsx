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

import { useState } from 'react'
import { TimelineControls } from '@/components/timeline/TimelineControls'

// ... existing interfaces ...

export function TimelinePageClient() {
  const pantheons = pantheonsData as unknown as Pantheon[]
  const stories = storiesData as unknown as Story[]
  const deities = deitiesData as unknown as Deity[]
  const events = eventsData as unknown as TimelineEvent[]

  const MIN_YEAR = -3500
  const MAX_YEAR = 2025
  const [viewRange, setViewRange] = useState<[number, number]>([MIN_YEAR, MAX_YEAR])

  return (
    <div className="min-h-screen">
      {/* Hero Section ... */}

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <div className="mt-8">
          <TimelineControls
            currentRange={viewRange}
            minYear={MIN_YEAR}
            maxYear={MAX_YEAR}
            onRangeChange={setViewRange}
          />

          <TimelineVisualizationD3
            pantheons={pantheons}
            events={events}
            viewRange={viewRange}
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
