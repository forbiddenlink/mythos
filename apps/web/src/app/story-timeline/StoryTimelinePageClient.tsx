'use client'

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { StoryTimelineView } from '@/components/timeline/StoryTimelineView'

import pantheonsData from '@/data/pantheons.json'
import storiesData from '@/data/stories.json'

interface Pantheon {
  id: string
  name: string
  slug: string
}

interface Story {
  id: string
  pantheonId: string
  title: string
  slug: string
  summary: string
  category?: string
}

export function StoryTimelinePageClient() {
  const pantheons = pantheonsData as unknown as Pantheon[]
  const stories = storiesData as unknown as Story[]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />

        <div className="container relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Story Timeline
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Journey through mythological time - from the primordial chaos before creation,
              through the birth of gods and the golden age, to the heroic sagas and the
              twilight of divine powers.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <div className="mt-8">
          <StoryTimelineView stories={stories} pantheons={pantheons} />
        </div>

        {/* Context Card */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
            Understanding the Mythological Timeline
          </h2>
          <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-medium text-foreground mb-1">Cosmic Eras</h3>
              <p>
                Myths unfold across five cosmic eras: the <strong>Primordial</strong> void before
                existence, the <strong>Creation</strong> of worlds and gods, the{' '}
                <strong>Golden Age</strong> of divine rule, the <strong>Heroic Age</strong> of
                mortal champions, and the <strong>Decline</strong> or twilight of the gods.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Cross-Cultural Patterns</h3>
              <p>
                Every culture tells stories of creation, golden ages, and endings.
                Compare how different pantheons conceptualize the same cosmic moments
                and discover the universal themes of human mythology.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Navigation</h3>
              <p>
                Filter by pantheon to focus on a single tradition. Switch between{' '}
                <strong>Timeline</strong> view for detailed reading or{' '}
                <strong>Visual</strong> mode to see the cosmic flow of events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
