import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Family Tree',
  description: 'Explore interactive family trees of gods and goddesses. Discover divine relationships, genealogies, and mythological lineages.',
  url: '/family-tree',
})

export default function FamilyTreeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
