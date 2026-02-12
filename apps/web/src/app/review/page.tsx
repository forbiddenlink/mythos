import { Metadata } from 'next';
import { generateBaseMetadata } from '@/lib/metadata';
import { ReviewPageClient } from './ReviewPageClient';

export const metadata: Metadata = generateBaseMetadata({
  title: 'Daily Review - Spaced Repetition Learning',
  description: 'Strengthen your mythology knowledge with daily spaced repetition flashcards. Review deities, domains, symbols, and stories from ancient civilizations.',
  url: '/review',
  keywords: ['spaced repetition', 'flashcards', 'mythology learning', 'study', 'review', 'memory'],
});

export default function ReviewPage() {
  return <ReviewPageClient />;
}
