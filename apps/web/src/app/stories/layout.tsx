import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'
import { CollectionPageJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Stories',
  description: 'Read epic myths and legends from ancient civilizations. Discover creation stories, heroic quests, tales of divine intervention, and epic battles from Greek, Norse, and Egyptian mythology.',
  url: '/stories',
  keywords: ['mythology stories', 'myths', 'legends', 'epic tales', 'creation myths', 'Ragnarok', 'Titanomachy', 'Osiris myth'],
})

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CollectionPageJsonLd
        name="Mythological Stories - Epic Tales and Legends"
        description="Read epic myths and legends from ancient civilizations including Greek, Norse, and Egyptian mythology."
        url="/stories"
      />
      {children}
    </>
  )
}
