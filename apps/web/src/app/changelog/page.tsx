import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { generateBaseMetadata } from "@/lib/metadata";
import {
  ChangelogEntry,
  type ChangelogEntryData,
  type ChangelogType,
} from "@/components/changelog/ChangelogEntry";
import { ChangelogFilters } from "./ChangelogFilters";
import changelogData from "@/data/changelog.json";

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

  const all = changelogData as ChangelogEntryData[];
  const counts = {
    all: all.length,
    feature: all.filter((entry) => entry.type === "feature").length,
    fix: all.filter((entry) => entry.type === "fix").length,
    content: all.filter((entry) => entry.type === "content").length,
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Release notes"
        mark="chronos"
        title="Changelog"
        lede="Every new feature, fix and content update to Mythos Atlas, newest first."
        count={`${all.length} releases`}
      />

      <Container className="section-space-sm">
        <ChangelogFilters activeFilter={filterType} counts={counts} />

        <div className="mt-10 md:mt-12">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <ChangelogEntry
                key={entry.id}
                entry={entry}
                isLast={index === entries.length - 1}
              />
            ))
          ) : (
            <p className="py-12 type-reading text-muted-foreground">
              No entries found for this filter.
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
