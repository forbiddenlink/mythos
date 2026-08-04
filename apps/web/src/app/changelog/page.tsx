import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { generateBaseMetadata } from "@/lib/metadata";
import {
  ChangelogEntry,
  type ChangelogEntryData,
  type ChangelogType,
} from "@/components/changelog/ChangelogEntry";
import { ChangelogFilters } from "./ChangelogFilters";
import changelogData from "@/data/changelog.json";
import { RouteHero } from "@/components/layout/route-hero";
import {
  pageLedeOnDarkClass,
  pageTitleOnDarkClass,
} from "@/components/layout/page-typography";
import { cn } from "@/lib/utils";

interface ChangelogPageProps {
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ searchParams }: ChangelogPageProps) {
  const { type } = await searchParams;
  const suffix =
    type === "feature"
      ? "Feature Updates"
      : type === "fix"
        ? "Fixes"
        : type === "content"
          ? "Content Updates"
          : "Release Notes";

  return generateBaseMetadata({
    title: `Mythos Atlas Changelog: ${suffix}`,
    description:
      type === "feature"
        ? "Follow Mythos Atlas feature releases with new tools, product improvements, and major updates across the mythology encyclopedia."
        : type === "fix"
          ? "Review Mythos Atlas fixes, stability work, and quality improvements across the mythology encyclopedia and learning tools."
          : type === "content"
            ? "Track new Mythos Atlas content releases including deities, stories, locations, and expanded mythology reference material."
            : "Follow Mythos Atlas releases with new features, content updates, bug fixes, release notes, product improvements, and reference-library expansions.",
    url: type ? `/changelog?type=${type}` : "/changelog",
    keywords: [
      "changelog",
      "updates",
      "release notes",
      "new features",
      "mythology app updates",
    ],
  });
}

export default async function ChangelogPage({
  searchParams,
}: ChangelogPageProps) {
  const { type } = await searchParams;
  const filterType = type as ChangelogType | undefined;

  const entries = (changelogData as ChangelogEntryData[]).filter(
    (entry) => !filterType || entry.type === filterType,
  );

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <RouteHero heightClassName="min-h-[35vh]">
        <h1 className={cn(pageTitleOnDarkClass, "mb-6")}>Changelog</h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
        </div>
        <p className={pageLedeOnDarkClass}>
          Track the evolution of Mythos Atlas with every new feature, fix, and
          content update
        </p>
      </RouteHero>

      {/* Content Section */}
      <div className="page-shell max-w-4xl">
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
