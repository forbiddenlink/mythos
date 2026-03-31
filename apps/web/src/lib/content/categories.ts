/**
 * Category content fetchers
 * Provides functions for fetching and organizing content categories
 */

import { getPantheons } from "../hygraph/content";
import { fetchAllDomains } from "./characters";
import { fetchLocationTypes } from "./locations";
import { fetchStoryCategories } from "./stories";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  type: "story" | "domain" | "location" | "pantheon";
}

export interface CategoryGroup {
  title: string;
  type: Category["type"];
  categories: Category[];
}

/**
 * Fetch all story categories with counts
 */
export async function fetchStoryCategoriesWithCounts(): Promise<Category[]> {
  const categories = await fetchStoryCategories();

  // For now, we return categories without counts
  // Counts would require additional queries per category
  return categories.map((cat) => ({
    id: cat.toLowerCase().replace(/\s+/g, "-"),
    name: cat,
    slug: cat.toLowerCase().replace(/\s+/g, "-"),
    type: "story" as const,
  }));
}

/**
 * Fetch all character domains as categories
 */
export async function fetchDomainCategories(): Promise<Category[]> {
  const domains = await fetchAllDomains();

  return domains.map((domain) => ({
    id: domain.toLowerCase().replace(/\s+/g, "-"),
    name: domain,
    slug: domain.toLowerCase().replace(/\s+/g, "-"),
    type: "domain" as const,
  }));
}

/**
 * Fetch all location types as categories
 */
export async function fetchLocationTypeCategories(): Promise<Category[]> {
  const types = await fetchLocationTypes();

  return types.map((type) => ({
    id: type.toLowerCase().replace(/\s+/g, "-"),
    name: type,
    slug: type.toLowerCase().replace(/\s+/g, "-"),
    type: "location" as const,
  }));
}

/**
 * Fetch all pantheons as categories
 */
export async function fetchPantheonCategories(): Promise<Category[]> {
  const pantheons = await getPantheons();

  return pantheons.map((pantheon) => ({
    id: pantheon.id,
    name: pantheon.name,
    slug: pantheon.slug,
    description: pantheon.description,
    type: "pantheon" as const,
  }));
}

/**
 * Fetch all categories grouped by type
 */
export async function fetchAllCategoriesGrouped(): Promise<CategoryGroup[]> {
  const [
    storyCategories,
    domainCategories,
    locationCategories,
    pantheonCategories,
  ] = await Promise.all([
    fetchStoryCategoriesWithCounts(),
    fetchDomainCategories(),
    fetchLocationTypeCategories(),
    fetchPantheonCategories(),
  ]);

  return [
    {
      title: "Pantheons",
      type: "pantheon",
      categories: pantheonCategories,
    },
    {
      title: "Story Types",
      type: "story",
      categories: storyCategories,
    },
    {
      title: "Divine Domains",
      type: "domain",
      categories: domainCategories,
    },
    {
      title: "Location Types",
      type: "location",
      categories: locationCategories,
    },
  ];
}

/**
 * Get category by slug and type
 */
export async function getCategoryBySlug(
  slug: string,
  type: Category["type"],
): Promise<Category | null> {
  let categories: Category[];

  switch (type) {
    case "story":
      categories = await fetchStoryCategoriesWithCounts();
      break;
    case "domain":
      categories = await fetchDomainCategories();
      break;
    case "location":
      categories = await fetchLocationTypeCategories();
      break;
    case "pantheon":
      categories = await fetchPantheonCategories();
      break;
    default:
      return null;
  }

  return categories.find((c) => c.slug === slug) ?? null;
}

/**
 * Get popular/featured categories
 * Returns a mix of categories from different types
 */
export async function getFeaturedCategories(limit = 8): Promise<Category[]> {
  const [pantheons, storyCategories, domains] = await Promise.all([
    fetchPantheonCategories(),
    fetchStoryCategoriesWithCounts(),
    fetchDomainCategories(),
  ]);

  // Mix categories from different types
  const featured: Category[] = [];

  // Add top pantheons
  featured.push(...pantheons.slice(0, 3));

  // Add top story categories
  featured.push(...storyCategories.slice(0, 2));

  // Add top domains
  featured.push(...domains.slice(0, 3));

  return featured.slice(0, limit);
}

/**
 * Search across all category types
 */
export async function searchCategories(
  query: string,
  options?: { types?: Category["type"][]; limit?: number },
): Promise<Category[]> {
  const typesToSearch = options?.types ?? [
    "story",
    "domain",
    "location",
    "pantheon",
  ];
  const searchTerm = query.toLowerCase();

  const allCategories: Category[] = [];

  if (typesToSearch.includes("pantheon")) {
    const pantheons = await fetchPantheonCategories();
    allCategories.push(...pantheons);
  }
  if (typesToSearch.includes("story")) {
    const stories = await fetchStoryCategoriesWithCounts();
    allCategories.push(...stories);
  }
  if (typesToSearch.includes("domain")) {
    const domains = await fetchDomainCategories();
    allCategories.push(...domains);
  }
  if (typesToSearch.includes("location")) {
    const locations = await fetchLocationTypeCategories();
    allCategories.push(...locations);
  }

  return allCategories
    .filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.description?.toLowerCase().includes(searchTerm),
    )
    .slice(0, options?.limit ?? 20);
}
