/**
 * GraphQL Queries Index
 *
 * This file re-exports all GraphQL queries from the hygraph module.
 * The actual queries are defined in src/lib/hygraph/queries.ts using gql template literals.
 *
 * For reference, raw .graphql files are available in this directory for:
 * - IDE tooling and syntax highlighting
 * - GraphQL schema validation
 * - Code generation with tools like GraphQL Code Generator
 *
 * Usage:
 *   import { HYGRAPH_GET_STORIES, HYGRAPH_GET_DEITY_BY_SLUG } from '@/graphql/queries';
 */

export {
  // Deity queries
  HYGRAPH_GET_DEITIES,
  HYGRAPH_GET_DEITY_BY_SLUG,
  HYGRAPH_GET_DEITIES_BY_PANTHEON,
  HYGRAPH_GET_DEITY_RELATIONSHIPS,

  // Pantheon queries
  HYGRAPH_GET_PANTHEONS,
  HYGRAPH_GET_PANTHEON_BY_SLUG,

  // Story queries
  HYGRAPH_GET_STORIES,
  HYGRAPH_GET_STORY_BY_SLUG,

  // Creature queries
  HYGRAPH_GET_CREATURES,
  HYGRAPH_GET_CREATURE_BY_SLUG,

  // Artifact queries
  HYGRAPH_GET_ARTIFACTS,
  HYGRAPH_GET_ARTIFACT_BY_SLUG,

  // Location queries
  HYGRAPH_GET_LOCATIONS,
  HYGRAPH_GET_LOCATION_BY_SLUG,

  // Search
  HYGRAPH_SEARCH,
} from "@/lib/hygraph/queries";
