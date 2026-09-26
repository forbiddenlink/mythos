"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Layers, Check } from "lucide-react";
import {
  generateAnkiTsv,
  createDeityFlashcards,
  downloadAnkiDeck,
  toDeityCardData,
  type DeityCardData,
} from "@/lib/anki-export";
import { loadDeityIndex } from "@/lib/catalog-client";

export interface AnkiDeckExportProps {
  pantheons: Array<{ id: string; name: string; slug: string }>;
  /** Deity count per pantheon id. */
  deityCounts: Record<string, number>;
  totalDeities: number;
  /** Preview card per pantheon id, plus "all" for the whole catalog. */
  samples: Record<string, DeityCardData>;
}

/**
 * Flashcard deck exporter. Renders from server-computed counts and preview
 * cards; the deity index is fetched only when the user downloads a deck.
 */
export function AnkiDeckExport({
  pantheons,
  deityCounts,
  totalDeities,
  samples,
}: AnkiDeckExportProps) {
  const [selectedPantheon, setSelectedPantheon] = useState<string>("all");
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the "downloaded" confirmation timer so it cannot fire after unmount.
  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const pantheonName = (id: string) =>
    pantheons.find((p) => p.id === id)?.name.replace(" Pantheon", "") ?? id;
  const selectedCount =
    selectedPantheon === "all"
      ? totalDeities
      : (deityCounts[selectedPantheon] ?? 0);

  const handleDownload = async () => {
    setDownloading(true);
    setFailed(false);
    try {
      const index = await loadDeityIndex();
      const cardDataList: DeityCardData[] = index
        .filter(
          (d) =>
            selectedPantheon === "all" || d.pantheonId === selectedPantheon,
        )
        .map((d) => toDeityCardData(d, pantheonName(d.pantheonId)));
      const flashcards = createDeityFlashcards(cardDataList);
      const tsvContent = generateAnkiTsv(flashcards);
      const filename =
        selectedPantheon === "all"
          ? "MythosAtlas_All_Pantheons_Deities"
          : `MythosAtlas_${pantheonName(selectedPantheon).replace(/\s+/g, "_")}`;
      downloadAnkiDeck(filename, tsvContent);

      setDownloaded(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setDownloaded(false), 2500);
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  };

  const sampleCard = samples[selectedPantheon];

  return (
    <Card className="border-gold/30 bg-card/90 shadow-xl overflow-hidden">
      <div className="border-b border-border/70 bg-muted/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
              <Layers className="size-5" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl text-foreground">
                Spaced Repetition & Anki Deck Exporter
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Export mythology flashcards formatted for Anki, Quizlet,
                RemNote, or Notion.
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            aria-live="polite"
            className="gap-2 bg-gold text-midnight hover:bg-gold-light font-semibold shadow-md shadow-gold/20"
          >
            {downloaded ? (
              <Check className="size-4" />
            ) : (
              <Download className="size-4" />
            )}
            {downloaded
              ? "Deck Downloaded!"
              : failed
                ? "Download failed, try again"
                : `Download ${selectedCount} Cards`}
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          {/* Controls & Options */}
          <div className="space-y-6">
            <div>
              <h3
                id="pantheon-filter-label"
                className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3"
              >
                Select Tradition / Pantheon
              </h3>
              <div
                role="group"
                aria-labelledby="pantheon-filter-label"
                className="flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  aria-pressed={selectedPantheon === "all"}
                  onClick={() => setSelectedPantheon("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedPantheon === "all"
                      ? "border border-gold bg-gold/15 text-gold-text font-semibold"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All {pantheons.length} Pantheons ({totalDeities})
                </button>
                {pantheons.map((p) => {
                  const count = deityCounts[p.id] ?? 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={selectedPantheon === p.id}
                      onClick={() => setSelectedPantheon(p.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedPantheon === p.id
                          ? "border border-gold bg-gold/15 text-gold-text font-semibold"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.name.replace(" Pantheon", "")} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">
                Importing into Anki:
              </strong>
              1. Click <em>Download Cards</em> above to save the{" "}
              <code>.txt</code> file.
              <br />
              2. In Anki, click <em>File → Import</em> and select the downloaded
              file.
              <br />
              3. Ensure <em>Field separator: Tab</em> and{" "}
              <em>Allow HTML in fields</em> are checked.
            </div>
          </div>

          {/* Flashcard Live Preview */}
          {sampleCard && (
            <div className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-wider text-gold-text font-medium mb-2 flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Card Preview
              </span>
              <div className="dark rounded-xl border border-gold/40 bg-midnight p-5 text-parchment shadow-lg">
                <div className="border-b border-gold/20 pb-3 text-center">
                  <span className="font-serif text-lg font-bold text-gold-text">
                    {sampleCard.name}
                  </span>
                  <div className="text-[11px] uppercase tracking-widest text-parchment/75 mt-0.5">
                    {sampleCard.pantheon}
                  </div>
                  {sampleCard.pronunciation?.ipa && (
                    <div className="text-xs text-gold-light mt-1">
                      /{sampleCard.pronunciation.ipa}/
                    </div>
                  )}
                </div>
                <div className="pt-3 text-xs space-y-2">
                  <div>
                    <strong className="text-gold">Domains:</strong>{" "}
                    <span className="text-parchment/90">
                      {sampleCard.domains.join(", ")}
                    </span>
                  </div>
                  {sampleCard.symbols.length > 0 && (
                    <div>
                      <strong className="text-gold">Symbols:</strong>{" "}
                      <span className="text-parchment/90">
                        {sampleCard.symbols.join(", ")}
                      </span>
                    </div>
                  )}
                  <p className="text-parchment/75 line-clamp-3 leading-relaxed pt-1">
                    {sampleCard.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
