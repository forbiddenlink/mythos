/**
 * Content fetchers index
 * Re-exports all content fetching functions for convenient imports
 */

// Stories
export {
  fetchStories,
  fetchStoryBySlug,
  fetchStoriesByPantheon,
  fetchStoriesByCategory,
  fetchRelatedStories,
  fetchStoryCategories,
  fetchStoryPreview,
  type StoryFilters,
  type StoriesResult,
} from "./stories";

// Characters (Deities)
export {
  fetchCharacters,
  fetchCharacterBySlug,
  fetchCharactersByPantheon,
  fetchCharacterRelationships,
  fetchCharactersByDomain,
  fetchAllDomains,
  fetchFeaturedCharacters,
  searchCharacters,
  fetchCharacterPreview,
  type CharacterFilters,
  type CharactersResult,
} from "./characters";

// Locations
export {
  fetchLocations,
  fetchLocationBySlug,
  fetchLocationsByPantheon,
  fetchLocationsByType,
  fetchLocationTypes,
  fetchMappableLocations,
  fetchNearbyLocations,
  searchLocations,
  fetchLocationPreview,
  type LocationFilters,
  type LocationsResult,
} from "./locations";

// Categories
export {
  fetchStoryCategoriesWithCounts,
  fetchDomainCategories,
  fetchLocationTypeCategories,
  fetchPantheonCategories,
  fetchAllCategoriesGrouped,
  getCategoryBySlug,
  getFeaturedCategories,
  searchCategories,
  type Category,
  type CategoryGroup,
} from "./categories";

// Re-export Hygraph core functions for direct access
export {
  getPantheons,
  getPantheonBySlug,
  getCreatures,
  getCreatureBySlug,
  getArtifacts,
  getArtifactBySlug,
  searchContent,
} from "../hygraph/content";

// Re-export types
export type {
  HygraphDeity,
  HygraphStory,
  HygraphLocation,
  HygraphPantheon,
  HygraphCreature,
  HygraphArtifact,
  HygraphDeityRelationship,
} from "../hygraph/types";
