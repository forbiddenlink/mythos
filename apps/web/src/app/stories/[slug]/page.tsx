import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import stories from '@/data/stories.json';
import pantheons from '@/data/pantheons.json';
import { generateBaseMetadata } from '@/lib/metadata';
import { StoryPageClient } from './StoryPageClient';

interface StoryData {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  moralThemes?: string[];
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all stories
export async function generateStaticParams() {
  return stories.map((story) => ({
    slug: story.slug,
  }));
}

// Generate metadata for each story page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug) as StoryData | undefined;

  if (!story) {
    return generateBaseMetadata({
      title: 'Story Not Found',
      description: 'The requested story could not be found.',
    });
  }

  const pantheon = pantheons.find((p) => p.id === story.pantheonId);
  const pantheonName = pantheon?.name || 'Ancient';

  // Create a rich description
  const themes = story.moralThemes?.slice(0, 3).join(', ') || '';
  const description = story.summary?.slice(0, 160)
    || `Read ${story.title}, a ${story.category} from ${pantheonName} mythology. Themes: ${themes}.`;

  return generateBaseMetadata({
    title: `${story.title} - ${pantheonName} Mythology`,
    description: description,
    url: `/stories/${story.slug}`,
    image: story.imageUrl || '/og-image.png',
    type: 'article',
    keywords: [
      story.title,
      story.category,
      ...(story.moralThemes || []),
      pantheonName,
      'mythology',
      'myth',
      'legend',
      'ancient story',
    ],
    articleSection: 'Stories',
    articleTags: story.moralThemes,
  });
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if story exists (for 404)
  const story = stories.find((s) => s.slug === slug);
  if (!story) {
    notFound();
  }

  return <StoryPageClient slug={slug} />;
}
