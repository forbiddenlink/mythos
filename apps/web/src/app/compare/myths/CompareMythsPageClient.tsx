"use client";

import { MythComparisonView } from "@/components/compare/MythComparisonView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type MythComparison,
  PRESET_MYTH_COMPARISONS,
  type Story,
  compareMythVersions,
  getAvailableCategories,
} from "@/lib/myth-comparison";
import { Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

interface CompareMythsPageClientProps {
  pantheonsData: Pantheon[];
  storiesData: Story[];
}

export function CompareMythsPageClient({
  pantheonsData,
  storiesData,
}: Readonly<CompareMythsPageClientProps>) {
  const t = useTranslations("pages.compareMyths");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPantheon, setSelectedPantheon] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cast stories data
  const allStories = storiesData as Story[];

  const pantheons = pantheonsData as Pantheon[];

  // Create pantheon map for display
  const pantheonMap = useMemo(() => {
    const map = new Map<string, string>();
    pantheons.forEach((p) => {
      map.set(p.id, p.name.replace(" Pantheon", ""));
    });
    return map;
  }, [pantheons]);

  // Create story map for quick lookup
  const storyMap = useMemo(() => {
    const map = new Map<string, Story>();
    allStories.forEach((s) => {
      map.set(s.id, s);
      map.set(s.slug, s);
    });
    return map;
  }, [allStories]);

  // Get available categories
  const categories = useMemo(
    () => getAvailableCategories(allStories),
    [allStories],
  );

  // Compute comparison result
  const comparison = useMemo<MythComparison | null>(() => {
    if (selectedStories.length < 2) return null;
    return compareMythVersions(
      selectedStories.map((s) => s.id),
      allStories,
    );
  }, [selectedStories, allStories]);

  // Filter stories for dropdown
  const filteredStories = useMemo(() => {
    const selectedIds = new Set(selectedStories.map((s) => s.id));

    return allStories.filter((story) => {
      // Exclude selected
      if (selectedIds.has(story.id)) return false;

      // Filter by category
      if (selectedCategory && story.category !== selectedCategory) return false;

      // Filter by pantheon
      if (selectedPantheon && story.pantheonId !== selectedPantheon)
        return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = story.title.toLowerCase().includes(query);
        const matchesTheme = story.moralThemes.some((t) =>
          t.toLowerCase().includes(query),
        );
        const matchesSummary = story.summary.toLowerCase().includes(query);
        return matchesTitle || matchesTheme || matchesSummary;
      }

      return true;
    });
  }, [
    allStories,
    selectedStories,
    selectedCategory,
    selectedPantheon,
    searchQuery,
  ]);

  // Initialize from URL params
  useEffect(() => {
    const storiesParam = searchParams.get("stories");
    if (storiesParam && allStories.length > 0) {
      const storyIds = storiesParam.split(",").map((s) => s.trim());
      const foundStories = storyIds
        .map((id) => storyMap.get(id))
        .filter((s): s is Story => s !== undefined)
        .slice(0, 3);

      if (foundStories.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating selection from URL params on mount
        setSelectedStories(foundStories);
      }
    }
  }, [searchParams, allStories, storyMap]);

  // Update URL when selection changes
  const updateUrl = useCallback(
    (stories: Story[]) => {
      if (stories.length > 0) {
        const params = new URLSearchParams();
        params.set("stories", stories.map((s) => s.slug).join(","));
        router.replace(`/compare/myths?${params.toString()}`, {
          scroll: false,
        });
      } else {
        router.replace("/compare/myths", { scroll: false });
      }
    },
    [router],
  );

  const handleSelect = useCallback(
    (story: Story) => {
      setSelectedStories((prev) => {
        if (prev.length >= 3) return prev;
        if (prev.some((s) => s.id === story.id)) return prev;
        const newStories = [...prev, story];
        updateUrl(newStories);
        return newStories;
      });
      setSearchQuery("");
      setIsDropdownOpen(false);
    },
    [updateUrl],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setSelectedStories((prev) => {
        const newStories = prev.filter((s) => s.id !== id);
        updateUrl(newStories);
        return newStories;
      });
    },
    [updateUrl],
  );

  const handlePresetComparison = useCallback(
    (storyIds: string[]) => {
      const foundStories = storyIds
        .map((id) => storyMap.get(id))
        .filter((s): s is Story => s !== undefined)
        .slice(0, 3);

      if (foundStories.length > 0) {
        setSelectedStories(foundStories);
        updateUrl(foundStories);
      }
    },
    [storyMap, updateUrl],
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

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedPantheon !== null ||
    searchQuery.trim() !== "";

  let shareLabel = t("shareComparison");
  if (shareStatus === "success") {
    shareLabel = t("copied");
  } else if (shareStatus === "error") {
    shareLabel = t("copyFailed");
  }

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPantheon(null);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const formatPantheonName = (pantheonId: string) => {
    return (
      pantheonMap.get(pantheonId) ||
      pantheonId
        .replace("-pantheon", "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3 empty:hidden">
        {selectedStories.length > 0 && (
          <span className="type-meta text-muted-foreground">
            {t("selectedCount", { count: selectedStories.length, max: 3 })}
          </span>
        )}
        {selectedStories.length > 0 && (
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

      {/* Story Selector */}
      <div className="mb-12">
        <h2 className="page-section-title mb-6 text-foreground">
          {t("selectMyths")}
        </h2>

        {/* Selected Stories Chips */}
        {selectedStories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedStories.map((story) => (
              <Badge
                key={story.id}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 border-primary/20"
              >
                {story.title}
                <button
                  onClick={() => handleRemove(story.id)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Remove ${story.title}`}
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </Badge>
            ))}
            {selectedStories.length < 3 && (
              <span className="text-sm text-muted-foreground self-center">
                {t("selectUpToMore", { count: 3 - selectedStories.length })}
              </span>
            )}
          </div>
        )}

        {/* Filters */}
        {selectedStories.length < 3 && (
          <div className="space-y-4">
            {/* Category and Pantheon Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                {t("allCategories")}
              </Button>
              {categories.slice(0, 8).map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPantheon === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPantheon(null)}
              >
                {t("allCultures")}
              </Button>
              {pantheons.map((pantheon) => (
                <Button
                  key={pantheon.id}
                  variant={
                    selectedPantheon === pantheon.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPantheon(pantheon.id)}
                >
                  {pantheon.name.replace(" Pantheon", "")}
                </Button>
              ))}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t("clearFilters")}
                </Button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <label htmlFor="compare-myth-search" className="sr-only">
                Search myths by title, theme, or summary
              </label>
              <Input
                id="compare-myth-search"
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-4"
              />
            </div>

            {/* Dropdown Results */}
            {isDropdownOpen &&
              (searchQuery || selectedCategory || selectedPantheon) && (
                <div className="border rounded-lg bg-card shadow-lg max-h-80 overflow-y-auto">
                  {filteredStories.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {t("noMythsFound")}
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {filteredStories.slice(0, 15).map((story) => (
                        <li key={story.id}>
                          <button
                            onClick={() => handleSelect(story)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">
                                  {story.title}
                                </span>
                                <span className="text-muted-foreground text-sm ml-2">
                                  ({formatPantheonName(story.pantheonId)})
                                </span>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {story.summary}
                                </p>
                                <div className="flex gap-1 mt-1.5">
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {story.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Predefined Comparisons */}
      {selectedStories.length === 0 && (
        <div className="mb-12">
          <h2 className="page-section-title mb-6 text-foreground">
            {t("suggestedComparisons")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRESET_MYTH_COMPARISONS.map((preset) => {
              // Check how many stories are available
              const availableStories = preset.storyIds.filter((id) =>
                storyMap.has(id),
              );
              if (availableStories.length < 2) return null;

              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetComparison(availableStories)}
                  className="group flex h-full flex-col rounded-lg border border-border/70 bg-card p-5 text-left transition-colors hover:border-gold/50 hover:bg-gold/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold-text">
                    {preset.name}
                  </h3>
                  <p className="mt-1 flex-1 type-ui text-muted-foreground">
                    {preset.description}
                  </p>
                  <p className="mt-3 border-t border-border/70 pt-3 type-meta text-muted-foreground">
                    {availableStories
                      .slice(0, 3)
                      .map((id) => storyMap.get(id)?.title || id)
                      .join(", ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {selectedStories.length > 0 ? (
        <MythComparisonView
          stories={selectedStories}
          comparison={comparison}
          onRemove={handleRemove}
          pantheonMap={pantheonMap}
        />
      ) : null}

      {selectedStories.length >= 2 && (
        <div className="mt-10 border-t border-border/70 pt-6">
          <p className="type-ui text-muted-foreground mb-3">
            {t("nextStepHint")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/stories">{t("nextStepStories")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/sources">{t("nextStepSources")}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
