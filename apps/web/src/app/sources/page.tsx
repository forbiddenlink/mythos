import { PageHeader } from "@/components/layout/page-header";
import { generateBaseMetadata } from "@/lib/metadata";
import { SourcesPageClient } from "./SourcesPageClient";

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

export default function SourcesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Library"
        mark="codex"
        title="Sources & References"
        lede="Primary historical literature, translations and scholarly references grounding the atlas."
      />

      {/* Interactive Sources Codex */}
      <SourcesPageClient />
    </div>
  );
}
