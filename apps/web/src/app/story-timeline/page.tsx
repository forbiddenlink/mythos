import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'
import { StoryTimelinePageClient } from './StoryTimelinePageClient'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Story Timeline | Mythos Atlas',
  description:
    'Explore mythological stories arranged by cosmic era - from primordial chaos through creation, the golden age of gods, the heroic age, to the twilight of divine powers. Interactive timeline spanning all pantheons.',
  url: '/story-timeline',
})

export default function StoryTimelinePage() {
  return <StoryTimelinePageClient />
}
