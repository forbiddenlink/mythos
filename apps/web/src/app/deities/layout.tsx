import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'
import { CollectionPageJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Deities',
  description: 'Explore gods and goddesses from Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, and Aztec mythologies. Discover their domains, symbols, stories, and relationships.',
  url: '/deities',
  keywords: ['deities', 'gods', 'goddesses', 'Greek gods', 'Norse gods', 'Egyptian gods', 'Roman gods', 'Hindu deities', 'mythology directory'],
})

export default function DeitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CollectionPageJsonLd
        name="Deities - Gods and Goddesses of World Mythology"
        description="Browse gods and goddesses from Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, and Aztec mythologies."
        url="/deities"
      />
      {children}
    </>
  )
}
