"use client";

import type { Deity } from "@/components/compare/ComparisonCard";
import { ComparisonSelector } from "@/components/compare/ComparisonSelector";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { graphqlClient } from "@/lib/graphql-client";
import { GET_PANTHEONS } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Check,
  Loader2,
  Scale,
  Share2,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
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

export default function ComparePage() {
  const t = useTranslations("pages.compare");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDeities, setSelectedDeities] = useState<Deity[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Fetch deities
  const {
    data: deitiesData,
    isLoading: deitiesLoading,
    error: deitiesError,
  } = useQuery<{ deities: Deity[] }>({
    queryKey: ["deities-compare"],
    queryFn: async () => {
      const query = `
        query GetDeitiesForCompare {
          deities {
            id
            name
            slug
            pantheonId
            gender
            domain
            symbols
            description
            importanceRank
            imageUrl
            alternateNames
            crossPantheonParallels {
              pantheonId
              deityId
              note
            }
          }
        }
      `;
      return graphqlClient.request(query);
    },
  });

  // Fetch pantheons
  const { data: pantheonsData } = useQuery<{ pantheons: Pantheon[] }>({
    queryKey: ["pantheons"],
    queryFn: async () => graphqlClient.request(GET_PANTHEONS),
  });

  const allDeities = useMemo(
    () => deitiesData?.deities ?? [],
    [deitiesData?.deities],
  );
  const pantheons = useMemo(
    () => pantheonsData?.pantheons ?? [],
    [pantheonsData?.pantheons],
  );

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

  if (deitiesLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (deitiesError) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            {t("errorLoadingDeities")}
          </h2>
          <p className="text-muted-foreground mt-2">
            {deitiesError instanceof Error
              ? deitiesError.message
              : t("errorOccurred")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-80 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/deities-list-hero.png"
            alt="Compare Deities"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-gold/10 to-transparent" />
              <Scale
                className="relative h-10 w-10 text-gold"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            {t("heroTagline")}
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            {t("title")}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16 bg-mythic">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Breadcrumbs />
            <Link href="/compare/myths">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t("compareMyths")}
              </Button>
            </Link>
            {selectedDeities.length > 0 && (
              <span className="text-xs text-muted-foreground rounded-full border border-border px-2 py-1">
                {t("selectedCount", { count: selectedDeities.length, max: 4 })}
              </span>
            )}
          </div>
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

        <div className="mb-8 rounded-lg border border-border/60 bg-card/60 p-4">
          <p className="text-sm text-muted-foreground">{t("modeHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="default">
              <Link href="/compare">{t("primaryModeCta")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/compare/myths">{t("switchModeCta")}</Link>
            </Button>
          </div>
        </div>

        {/* Deity Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-serif font-semibold mb-4">
            {t("selectDeities")}
          </h2>
          <ComparisonSelector
            deities={allDeities}
            selectedDeities={selectedDeities}
            onSelect={handleSelect}
            onRemove={handleRemove}
            maxSelection={4}
            pantheons={pantheons}
          />
        </div>

        {/* Predefined Comparisons */}
        {selectedDeities.length === 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-serif font-semibold mb-4">
              {t("suggestedComparisons")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PREDEFINED_COMPARISONS.map((comparison) => {
                // Check if all deities exist
                const availableDeities = comparison.deities.filter((id) =>
                  deityMap.has(id),
                );
                if (availableDeities.length < 2) return null;

                return (
                  <button
                    key={comparison.name}
                    onClick={() => handlePredefinedComparison(availableDeities)}
                    className="p-4 rounded-lg border border-border/60 bg-card hover:border-gold/50 hover:bg-gold/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-gold" />
                      <h3 className="font-serif font-semibold group-hover:text-gold transition-colors">
                        {comparison.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {comparison.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {availableDeities
                        .map((id) => deityMap.get(id)?.name || id)
                        .join(", ")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <ComparisonTable
          deities={selectedDeities}
          onRemove={handleRemove}
          pantheons={pantheons}
        />

        {selectedDeities.length >= 2 && (
          <div className="mt-8 rounded-lg border border-border/60 bg-card/60 p-4">
            <p className="text-sm text-muted-foreground mb-3">
              {t("nextStepHint")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/stories">{t("nextStepStories")}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/quiz">{t("nextStepQuiz")}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
