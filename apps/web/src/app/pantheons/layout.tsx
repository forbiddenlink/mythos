import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Pantheons',
  description: 'Explore the pantheons of ancient civilizations. Discover Greek, Norse, Egyptian, Roman, Hindu, and other mythological traditions.',
  url: '/pantheons',
})

export default function PantheonsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
