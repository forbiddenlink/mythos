import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import deities from '@/data/deities.json';
import pantheons from '@/data/pantheons.json';
import { generateBaseMetadata } from '@/lib/metadata';
import { DeityPageClient } from './DeityPageClient';

interface DeityData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  domain: string[];
  alternateNames?: string[];
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all deities
export async function generateStaticParams() {
  return deities.map((deity) => ({
    slug: deity.slug,
  }));
}

// Generate metadata for each deity page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deity = deities.find((d) => d.slug === slug) as DeityData | undefined;

  if (!deity) {
    return generateBaseMetadata({
      title: 'Deity Not Found',
      description: 'The requested deity could not be found.',
    });
  }

  const pantheon = pantheons.find((p) => p.id === deity.pantheonId);
  const pantheonName = pantheon?.name || 'Ancient';

  // Create a rich description
  const domains = deity.domain?.slice(0, 3).join(', ') || '';
  const description = deity.description
    || `Explore ${deity.name}, ${pantheonName} deity of ${domains}. Learn about their mythology, symbols, and divine family.`;

  return generateBaseMetadata({
    title: `${deity.name} - ${pantheonName} Deity`,
    description: description.slice(0, 160),
    url: `/deities/${deity.slug}`,
    image: deity.imageUrl || '/og-image.png',
    type: 'article',
    keywords: [
      deity.name,
      ...(deity.alternateNames || []),
      ...(deity.domain || []),
      pantheonName,
      'mythology',
      'deity',
      'god',
      'goddess',
    ],
    articleSection: 'Deities',
    articleTags: deity.domain,
  });
}

export default async function DeityPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if deity exists (for 404)
  const deity = deities.find((d) => d.slug === slug);
  if (!deity) {
    notFound();
  }

  return <DeityPageClient slug={slug} />;
}
