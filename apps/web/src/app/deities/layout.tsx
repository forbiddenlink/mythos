import type { Metadata } from 'next'
import { generateBaseMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateBaseMetadata({
  title: 'Deities',
  description: 'Explore gods and goddesses from ancient mythologies around the world. Discover their domains, symbols, stories, and relationships.',
  url: '/deities',
})

export default function DeitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
