import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import artifacts from '@/data/artifacts.json';
import pantheons from '@/data/pantheons.json';
import { generateBaseMetadata } from '@/lib/metadata';
import { ArtifactPageClient } from './ArtifactPageClient';

interface ArtifactData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  powers: string[];
  owner?: string;
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all artifacts
export async function generateStaticParams() {
  return artifacts.map((artifact) => ({
    slug: artifact.slug,
  }));
}

// Generate metadata for each artifact page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artifact = artifacts.find((a) => a.slug === slug) as ArtifactData | undefined;

  if (!artifact) {
    return generateBaseMetadata({
      title: 'Artifact Not Found',
      description: 'The requested artifact could not be found.',
    });
  }

  const pantheon = pantheons.find((p) => p.id === artifact.pantheonId);
  const pantheonName = pantheon?.name || 'Ancient';

  // Create a rich description
  const powers = artifact.powers?.slice(0, 3).join(', ') || '';
  const description = artifact.description?.slice(0, 160)
    || `Learn about ${artifact.name}, a legendary ${artifact.type} from ${pantheonName} mythology. Powers: ${powers}.`;

  return generateBaseMetadata({
    title: `${artifact.name} - ${pantheonName} Artifact`,
    description: description,
    url: `/artifacts/${artifact.slug}`,
    image: artifact.imageUrl || '/og-image.png',
    type: 'article',
    keywords: [
      artifact.name,
      artifact.type,
      ...artifact.powers,
      pantheonName,
      'mythology',
      'artifact',
      'relic',
      'legendary weapon',
      'divine item',
    ],
    articleSection: 'Arsenal',
    articleTags: artifact.powers,
  });
}

export default async function ArtifactPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if artifact exists (for 404)
  const artifact = artifacts.find((a) => a.slug === slug);
  if (!artifact) {
    notFound();
  }

  return <ArtifactPageClient slug={slug} />;
}
