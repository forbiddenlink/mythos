import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'
import { WebApplicationJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Family Tree',
  description: 'Explore interactive family trees of gods and goddesses. Discover divine relationships, genealogies, and mythological lineages across Greek, Norse, and Egyptian pantheons.',
  url: '/family-tree',
  keywords: ['family tree', 'deity relationships', 'genealogy', 'god family tree', 'divine lineage', 'mythology visualization'],
})

export default function FamilyTreeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebApplicationJsonLd
        name="Mythology Family Tree Explorer"
        description="Interactive visualization of divine relationships and genealogies across ancient mythological pantheons."
        url="/family-tree"
      />
      {children}
    </>
  )
}
