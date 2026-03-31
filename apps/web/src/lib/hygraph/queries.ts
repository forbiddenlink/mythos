import { gql } from "graphql-request";

// ============================================================================
// Deity Queries
// ============================================================================

export const HYGRAPH_GET_DEITIES = gql`
  query GetDeities($first: Int, $skip: Int, $where: DeityWhereInput) {
    deities(
      first: $first
      skip: $skip
      where: $where
      orderBy: importanceRank_ASC
    ) {
      id
      name
      slug
      gender
      domain
      symbols
      description
      importanceRank
      alternateNames
      imageUrl
      pantheon {
        id
        slug
        name
      }
    }
    deitiesConnection(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const HYGRAPH_GET_DEITY_BY_SLUG = gql`
  query GetDeityBySlug($slug: String!) {
    deity(where: { slug: $slug }) {
      id
      name
      slug
      gender
      domain
      symbols
      description
      detailedBio
      originStory
      importanceRank
      alternateNames
      imageUrl
      pronunciation {
        ipa
        phonetic
        audioUrl
      }
      crossPantheonParallels {
        pantheonId
        deityId
        note
      }
      primarySources {
        text
        source
        date
      }
      worship {
        temples
        festivals
        practices
      }
      pantheon {
        id
        slug
        name
        culture
      }
    }
  }
`;

export const HYGRAPH_GET_DEITIES_BY_PANTHEON = gql`
  query GetDeitiesByPantheon($pantheonSlug: String!, $first: Int, $skip: Int) {
    deities(
      where: { pantheon: { slug: $pantheonSlug } }
      first: $first
      skip: $skip
      orderBy: importanceRank_ASC
    ) {
      id
      name
      slug
      gender
      domain
      symbols
      description
      importanceRank
      alternateNames
      imageUrl
    }
  }
`;

// ============================================================================
// Pantheon Queries
// ============================================================================

export const HYGRAPH_GET_PANTHEONS = gql`
  query GetPantheons {
    pantheons(orderBy: name_ASC) {
      id
      name
      slug
      culture
      region
      description
      timePeriodStart
      timePeriodEnd
      imageUrl
    }
  }
`;

export const HYGRAPH_GET_PANTHEON_BY_SLUG = gql`
  query GetPantheonBySlug($slug: String!) {
    pantheon(where: { slug: $slug }) {
      id
      name
      slug
      culture
      region
      description
      timePeriodStart
      timePeriodEnd
      imageUrl
      deities(first: 100) {
        id
        name
        slug
        domain
        importanceRank
        imageUrl
      }
    }
  }
`;

// ============================================================================
// Story Queries
// ============================================================================

export const HYGRAPH_GET_STORIES = gql`
  query GetStories($first: Int, $skip: Int, $where: StoryWhereInput) {
    stories(first: $first, skip: $skip, where: $where, orderBy: title_ASC) {
      id
      title
      slug
      summary
      category
      moralThemes
      culturalSignificance
      imageUrl
      pantheon {
        id
        slug
        name
      }
    }
    storiesConnection(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const HYGRAPH_GET_STORY_BY_SLUG = gql`
  query GetStoryBySlug($slug: String!) {
    story(where: { slug: $slug }) {
      id
      title
      slug
      summary
      fullNarrative
      keyExcerpts
      category
      moralThemes
      culturalSignificance
      imageUrl
      citationSources {
        title
        author
        lines
        book
        chapters
        type
      }
      featuredDeities {
        id
        name
        slug
      }
      featuredLocations {
        id
        name
        slug
      }
      relatedStories {
        id
        title
        slug
      }
      variants {
        source
        date
        difference
        note
      }
      pantheon {
        id
        slug
        name
      }
    }
  }
`;

// ============================================================================
// Creature Queries
// ============================================================================

export const HYGRAPH_GET_CREATURES = gql`
  query GetCreatures($first: Int, $skip: Int, $where: CreatureWhereInput) {
    creatures(first: $first, skip: $skip, where: $where, orderBy: name_ASC) {
      id
      name
      slug
      habitat
      abilities
      dangerLevel
      description
      imageUrl
      pantheon {
        id
        slug
        name
      }
    }
    creaturesConnection(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const HYGRAPH_GET_CREATURE_BY_SLUG = gql`
  query GetCreatureBySlug($slug: String!) {
    creature(where: { slug: $slug }) {
      id
      name
      slug
      habitat
      abilities
      dangerLevel
      description
      imageUrl
      pantheon {
        id
        slug
        name
      }
    }
  }
`;

// ============================================================================
// Artifact Queries
// ============================================================================

export const HYGRAPH_GET_ARTIFACTS = gql`
  query GetArtifacts($first: Int, $skip: Int, $where: ArtifactWhereInput) {
    artifacts(first: $first, skip: $skip, where: $where, orderBy: name_ASC) {
      id
      name
      slug
      type
      powers
      description
      imageUrl
      owner {
        id
        name
        slug
      }
      pantheon {
        id
        slug
        name
      }
    }
    artifactsConnection(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const HYGRAPH_GET_ARTIFACT_BY_SLUG = gql`
  query GetArtifactBySlug($slug: String!) {
    artifact(where: { slug: $slug }) {
      id
      name
      slug
      type
      powers
      description
      originStory
      imageUrl
      owner {
        id
        name
        slug
      }
      pantheon {
        id
        slug
        name
      }
    }
  }
`;

// ============================================================================
// Location Queries
// ============================================================================

export const HYGRAPH_GET_LOCATIONS = gql`
  query GetLocations($first: Int, $skip: Int, $where: LocationWhereInput) {
    locations(first: $first, skip: $skip, where: $where, orderBy: name_ASC) {
      id
      name
      slug
      locationType
      description
      latitude
      longitude
      imageUrl
      pantheon {
        id
        slug
        name
      }
    }
    locationsConnection(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const HYGRAPH_GET_LOCATION_BY_SLUG = gql`
  query GetLocationBySlug($slug: String!) {
    location(where: { slug: $slug }) {
      id
      name
      slug
      locationType
      description
      latitude
      longitude
      imageUrl
      pantheon {
        id
        slug
        name
      }
    }
  }
`;

// ============================================================================
// Relationship Queries
// ============================================================================

export const HYGRAPH_GET_DEITY_RELATIONSHIPS = gql`
  query GetDeityRelationships($deityId: ID!) {
    deityRelationships(
      where: {
        OR: [{ fromDeity: { id: $deityId } }, { toDeity: { id: $deityId } }]
      }
    ) {
      id
      relationshipType
      description
      storyContext
      confidenceLevel
      isDisputed
      fromDeity {
        id
        name
        slug
      }
      toDeity {
        id
        name
        slug
      }
    }
  }
`;

// ============================================================================
// Search Query
// ============================================================================

export const HYGRAPH_SEARCH = gql`
  query Search($query: String!, $limit: Int = 10) {
    deities(where: { _search: $query }, first: $limit) {
      id
      name
      slug
      domain
      description
      imageUrl
    }
    creatures(where: { _search: $query }, first: $limit) {
      id
      name
      slug
      habitat
      description
      imageUrl
    }
    artifacts(where: { _search: $query }, first: $limit) {
      id
      name
      slug
      type
      description
      imageUrl
    }
    pantheons(where: { _search: $query }, first: $limit) {
      id
      name
      slug
      culture
      description
    }
    stories(where: { _search: $query }, first: $limit) {
      id
      title
      slug
      summary
    }
  }
`;
