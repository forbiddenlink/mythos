import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'
import { TimelinePageClient } from './TimelinePageClient'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Mythology Timeline | Mythos Atlas',
  description:
    'Explore the rise and fall of ancient mythological traditions across a visual timeline spanning 3500 BCE to 1600 CE. Compare Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, Aztec, and Chinese pantheons.',
  url: '/timeline',
})

export default function TimelinePage() {
  return <TimelinePageClient />
}
