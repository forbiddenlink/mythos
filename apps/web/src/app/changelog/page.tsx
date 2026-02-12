import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { generateBaseMetadata } from '@/lib/metadata';
import { ChangelogEntry, type ChangelogEntryData, type ChangelogType } from '@/components/changelog/ChangelogEntry';
import { ChangelogFilters } from './ChangelogFilters';
import changelogData from '@/data/changelog.json';

export const metadata = generateBaseMetadata({
  title: 'Changelog',
  description: 'Stay up to date with the latest features, fixes, and content updates to Mythos Atlas - your interactive mythology encyclopedia.',
  url: '/changelog',
  keywords: ['changelog', 'updates', 'release notes', 'new features', 'mythology app updates'],
});

interface ChangelogPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const { type } = await searchParams;
  const filterType = type as ChangelogType | undefined;

  const entries = (changelogData as ChangelogEntryData[]).filter(
    (entry) => !filterType || entry.type === filterType
  );

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Changelog
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Track the evolution of Mythos Atlas with every new feature, fix, and content update
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs />

        <div className="mt-8 mb-12">
          <ChangelogFilters activeFilter={filterType} />
        </div>

        {/* Timeline */}
        <div className="relative">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <ChangelogEntry
                key={entry.id}
                entry={entry}
                isLast={index === entries.length - 1}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-parchment/70 text-lg">
                No entries found for this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
