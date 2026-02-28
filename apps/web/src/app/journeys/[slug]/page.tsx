import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import journeys from '@/data/journeys.json';
import pantheons from '@/data/pantheons.json';
import { generateBaseMetadata } from '@/lib/metadata';
import { JourneyPageClient } from './JourneyPageClient';

interface JourneyData {
  id: string;
  heroId: string;
  heroName: string;
  title: string;
  slug: string;
  description: string;
  pantheonId: string;
  duration: string;
  imageUrl?: string;
  source: string;
  waypoints: Array<{ id: string; name: string }>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all journeys
export async function generateStaticParams() {
  return journeys.map((journey) => ({
    slug: journey.slug,
  }));
}

// Generate metadata for each journey page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = journeys.find((j) => j.slug === slug) as JourneyData | undefined;

  if (!journey) {
    return generateBaseMetadata({
      title: 'Journey Not Found',
      description: 'The requested journey could not be found.',
    });
  }

  const pantheon = pantheons.find((p) => p.id === journey.pantheonId);
  const pantheonName = pantheon?.name || 'Ancient';

  // Create a rich description
  const waypointCount = journey.waypoints?.length || 0;
  const description = journey.description?.slice(0, 160)
    || `Follow ${journey.heroName}'s epic ${journey.duration} journey through ${waypointCount} legendary locations in ${pantheonName} mythology.`;

  return generateBaseMetadata({
    title: `${journey.title} - ${journey.heroName}'s Journey`,
    description: description,
    url: `/journeys/${journey.slug}`,
    image: journey.imageUrl || '/og-image.png',
    type: 'article',
    keywords: [
      journey.title,
      journey.heroName,
      pantheonName,
      'mythology',
      'epic journey',
      'hero quest',
      'adventure',
      'ancient voyage',
      journey.source.split(',')[0], // e.g., "Homer"
    ],
    articleSection: 'Journeys',
    articleTags: journey.waypoints?.slice(0, 5).map(w => w.name),
  });
}

export default async function JourneyPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if journey exists (for 404)
  const journey = journeys.find((j) => j.slug === slug);
  if (!journey) {
    notFound();
  }

  return <JourneyPageClient slug={slug} />;
}
