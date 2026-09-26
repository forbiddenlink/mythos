import { AboutThisPage } from "@/components/layout/about-this-page";
import { PageHeader } from "@/components/layout/page-header";
import { generateBaseMetadata } from "@/lib/metadata";
import sourcesData from "@/data/sources.json";
import { SourcesPageClient, type SourceListItem } from "./SourcesPageClient";

export const metadata = generateBaseMetadata({
  title: "Sources & References",
  description:
    "Academic sources, primary texts, translations, and scholarly references used in compiling the Mythos Atlas mythology encyclopedia.",
  url: "/sources",
  keywords: [
    "mythology sources",
    "academic references",
    "primary texts",
    "Hesiod",
    "Homer",
    "Prose Edda",
    "Book of the Dead",
    "Rigveda",
    "Popol Vuh",
    "Enuma Elish",
    "Kojiki",
  ],
});

interface SourceRecord {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  type: string;
  language?: string;
  description: string;
  characters?: unknown[];
  keyScenes?: unknown[];
}

// Card fields only: passages, translators and scene summaries stay here.
const sources: SourceListItem[] = (sourcesData as SourceRecord[]).map(
  (source) => ({
    id: source.id,
    title: source.title,
    ...(source.author ? { author: source.author } : {}),
    ...(source.year !== undefined ? { year: String(source.year) } : {}),
    type: source.type,
    ...(source.language ? { language: source.language } : {}),
    description: source.description,
    characterCount: source.characters?.length ?? 0,
    sceneCount: source.keyScenes?.length ?? 0,
  }),
);

export default function SourcesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        mark="codex"
        eyebrow="The library"
        title="Sources & References"
        lede="Primary literature, translations and scholarship that ground the atlas."
      />

      <SourcesPageClient sources={sources} />

      <AboutThisPage title="About the sources">
        <p>
          This catalog brings together primary works, translations, and modern
          scholarship used across the atlas. It is a selected reading library,
          not a complete record of every tradition or the earliest surviving
          mention of each figure. Primary canonical works are enriched with
          structured character occurrences, key narrative scenes, recommended
          reading sequences, and dual-language excerpts.
        </p>
        <p>
          Ancient literature survives in recensions, papyrus fragments, and
          variant manuscripts across centuries. When consulting entries, look
          for the &ldquo;Appears In&rdquo; cross-index on deities and heroes to
          compare how Homeric epic differs from Hesiodic theology, or how the
          Vedas differ from later Puranic literature.
        </p>
      </AboutThisPage>
    </div>
  );
}
