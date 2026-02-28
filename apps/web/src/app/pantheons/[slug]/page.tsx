import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import pantheons from '@/data/pantheons.json';
import { generateBaseMetadata } from '@/lib/metadata';
import { PantheonPageClient } from './PantheonPageClient';

interface PantheonData {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all pantheons
export async function generateStaticParams() {
  return pantheons.map((pantheon) => ({
    slug: pantheon.slug,
  }));
}

// Generate metadata for each pantheon page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pantheon = pantheons.find((p) => p.slug === slug) as PantheonData | undefined;

  if (!pantheon) {
    return generateBaseMetadata({
      title: 'Pantheon Not Found',
      description: 'The requested pantheon could not be found.',
    });
  }

  // Create a rich description
  const description = pantheon.description?.slice(0, 160)
    || `Explore the ${pantheon.name} from ${pantheon.culture} mythology. Discover the gods, goddesses, and myths of ${pantheon.region}.`;

  return generateBaseMetadata({
    title: `${pantheon.name} - ${pantheon.culture} Mythology`,
    description: description,
    url: `/pantheons/${pantheon.slug}`,
    image: '/og-image.png',
    type: 'website',
    keywords: [
      pantheon.name,
      pantheon.culture,
      pantheon.region,
      'mythology',
      'pantheon',
      'gods',
      'goddesses',
      'ancient religion',
      'mythology encyclopedia',
    ],
  });
}

export default async function PantheonPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if pantheon exists (for 404)
  const pantheon = pantheons.find((p) => p.slug === slug);
  if (!pantheon) {
    notFound();
  }

  return <PantheonPageClient slug={slug} />;
}
