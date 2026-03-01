import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import locations from '@/data/locations.json';
import pantheons from '@/data/pantheons.json';
import { generateBaseMetadata } from '@/lib/metadata';
import { LocationPageClient } from './LocationPageClient';

interface LocationData {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all locations
export async function generateStaticParams() {
  return locations.map((location) => ({
    slug: location.id,
  }));
}

// Generate metadata for each location page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = locations.find((l) => l.id === slug) as LocationData | undefined;

  if (!location) {
    return generateBaseMetadata({
      title: 'Location Not Found',
      description: 'The requested location could not be found.',
    });
  }

  const pantheon = pantheons.find((p) => p.id === location.pantheonId);
  const pantheonName = pantheon?.name || 'Ancient';
  const locationType = location.locationType?.replaceAll('_', ' ') || 'location';

  const description = location.description?.slice(0, 160)
    || `Explore ${location.name}, a mythological ${locationType} from ${pantheonName} traditions.`;

  return generateBaseMetadata({
    title: `${location.name} - ${pantheonName} Location`,
    description,
    url: `/locations/${location.id}`,
    image: location.imageUrl || '/og-image.png',
    type: 'article',
    keywords: [
      location.name,
      locationType,
      pantheonName,
      'mythology',
      'mythological location',
      'sacred place',
      'ancient world',
    ],
    articleSection: 'Locations',
    articleTags: [locationType, pantheonName],
  });
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;

  const location = locations.find((l) => l.id === slug);
  if (!location) {
    notFound();
  }

  return <LocationPageClient slug={slug} />;
}
