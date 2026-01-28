import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Stories',
  description: 'Read epic myths and legends from ancient civilizations. Discover creation stories, heroic quests, and tales of divine intervention.',
  url: '/stories',
})

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
