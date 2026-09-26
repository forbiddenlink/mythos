"use client";

import type { Deity } from "@/components/compare/ComparisonCard";
import { ComparisonSelector } from "@/components/compare/ComparisonSelector";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { Button } from "@/components/ui/button";
import { Check, Share2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

// Predefined comparison suggestions
const PREDEFINED_COMPARISONS = [
  {
    name: "Sky Gods",
    description: "Supreme rulers of their pantheons",
    deities: ["zeus", "jupiter", "odin", "indra"],
  },
  {
    name: "Death Gods",
    description: "Rulers of the underworld",
    deities: ["hades", "hel", "osiris"],
  },
  {
    name: "Love Deities",
    description: "Gods and goddesses of love and beauty",
    deities: ["aphrodite", "venus", "freyja"],
  },
  {
    name: "War Gods",
    description: "Divine warriors and battle masters",
    deities: ["ares", "mars", "tyr"],
  },
  {
    name: "Sun Gods",
    description: "Deities of light and the sun",
    deities: ["apollo", "ra", "amaterasu"],
  },
  {
    name: "Creator Gods",
    description: "Divine creators of the cosmos",
    deities: ["brahma", "ra", "odin"],
  },
];

interface ComparePageClientProps {
  deitiesData: Deity[];
  pantheonsData: Pantheon[];
}

export function ComparePageClient({
  deitiesData,
  pantheonsData,
}: Readonly<ComparePageClientProps>) {
  const t = useTranslations("pages.compare");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDeities, setSelectedDeities] = useState<Deity[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const allDeities = deitiesData as Deity[];
  const pantheons = pantheonsData as Pantheon[];

  // Create a map for quick deity lookup
  const deityMap = useMemo(() => {
    const map = new Map<string, Deity>();
    allDeities.forEach((d) => {
      map.set(d.id, d);
      map.set(d.slug, d);
    });
    return map;
  }, [allDeities]);

  // Initialize from URL params
  useEffect(() => {
    const deityParams = searchParams.get("deities");
    if (deityParams && allDeities.length > 0) {
      const deityIds = deityParams
        .split(",")
        .map((s) => s.trim().toLowerCase());
      const foundDeities = deityIds
        .map((id) => deityMap.get(id))
        .filter((d): d is Deity => d !== undefined)
        .slice(0, 4);

      if (foundDeities.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating selection from URL params on mount
        setSelectedDeities(foundDeities);
      }
    }
  }, [searchParams, allDeities, deityMap]);

  // Update URL when selection changes
  const updateUrl = useCallback(
    (deities: Deity[]) => {
      if (deities.length > 0) {
        const params = new URLSearchParams();
        params.set("deities", deities.map((d) => d.slug).join(","));
        router.replace(`/compare?${params.toString()}`, { scroll: false });
      } else {
        router.replace("/compare", { scroll: false });
      }
    },
    [router],
  );

  const handleSelect = useCallback(
    (deity: Deity) => {
      setSelectedDeities((prev) => {
        if (prev.length >= 4) return prev;
        if (prev.some((d) => d.id === deity.id)) return prev;
        const newDeities = [...prev, deity];
        updateUrl(newDeities);
        return newDeities;
      });
    },
    [updateUrl],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setSelectedDeities((prev) => {
        const newDeities = prev.filter((d) => d.id !== id);
        updateUrl(newDeities);
        return newDeities;
      });
    },
    [updateUrl],
  );

  const handlePredefinedComparison = useCallback(
    (deityIds: string[]) => {
      const foundDeities = deityIds
        .map((id) => deityMap.get(id))
        .filter((d): d is Deity => d !== undefined)
        .slice(0, 4);

      if (foundDeities.length > 0) {
        setSelectedDeities(foundDeities);
        updateUrl(foundDeities);
      }
    },
    [deityMap, updateUrl],
  );

  const handleShare = useCallback(async () => {
    const url = globalThis.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("success");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  }, []);

  let shareLabel = t("shareComparison");
  if (shareStatus === "success") {
    shareLabel = t("copied");
  } else if (shareStatus === "error") {
    shareLabel = t("copyFailed");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="page-section-title text-foreground">
          {t("selectDeities")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {selectedDeities.length > 0 && (
            <span className="type-meta text-muted-foreground">
              {t("selectedCount", { count: selectedDeities.length, max: 4 })}
            </span>
          )}
          {selectedDeities.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              {shareStatus === "success" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {shareLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ComparisonSelector
          deities={allDeities}
          selectedDeities={selectedDeities}
          onSelect={handleSelect}
          onRemove={handleRemove}
          maxSelection={4}
          pantheons={pantheons}
        />
      </div>

      {selectedDeities.length === 0 ? (
        <section aria-labelledby="suggested-comparisons" className="mt-14">
          <h2
            id="suggested-comparisons"
            className="page-section-title text-foreground"
          >
            {t("suggestedComparisons")}
          </h2>
          <p className="type-lede mt-2 text-muted-foreground">
            Start from a classic pairing, or pick up to four figures above.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREDEFINED_COMPARISONS.map((comparison) => {
              const available = comparison.deities
                .map((id) => deityMap.get(id))
                .filter((d): d is Deity => d !== undefined);
              if (available.length < 2) return null;

              return (
                <li key={comparison.name}>
                  <button
                    type="button"
                    onClick={() =>
                      handlePredefinedComparison(available.map((d) => d.id))
                    }
                    className="group flex h-full w-full items-center gap-5 rounded-lg border border-border/70 bg-card p-4 text-left transition-colors hover:border-gold/50 hover:bg-gold/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <span
                      className="flex shrink-0 -space-x-4"
                      aria-hidden="true"
                    >
                      {available.slice(0, 3).map((deity) => (
                        <span
                          key={deity.id}
                          className="relative block size-14 overflow-hidden rounded-full bg-muted ring-2 ring-card"
                        >
                          {deity.imageUrl ? (
                            <Image
                              src={deity.imageUrl}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center font-serif text-lg font-semibold text-gold-text">
                              {deity.name.charAt(0)}
                            </span>
                          )}
                        </span>
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-lg font-semibold text-foreground group-hover:text-gold-text">
                        {comparison.name}
                      </span>
                      <span className="block type-ui text-muted-foreground">
                        {available.map((d) => d.name).join(", ")}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <div className="mt-10">
          <ComparisonTable
            deities={selectedDeities}
            onRemove={handleRemove}
            pantheons={pantheons}
          />
        </div>
      )}

      {selectedDeities.length >= 2 && (
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/70 pt-6">
          <p className="type-ui text-muted-foreground">{t("nextStepHint")}</p>
          <Link
            href="/stories"
            className="type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
          >
            {t("nextStepStories")}
          </Link>
          <Link
            href="/quiz"
            className="type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
          >
            {t("nextStepQuiz")}
          </Link>
        </div>
      )}
    </div>
  );
}
