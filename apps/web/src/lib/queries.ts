import { gql } from 'graphql-request';

export const GET_PANTHEONS = gql`
  query GetPantheons {
    pantheons {
      id
      name
      slug
      culture
      region
      description
      timePeriodStart
      timePeriodEnd
    }
  }
`;

export const GET_DEITIES = gql`
  query GetDeities($pantheonId: String) {
    deities(pantheonId: $pantheonId) {
      id
      name
      slug
      gender
      domain
      symbols
      description
      importanceRank
      imageUrl
      alternateNames
    }
  }
`;

export const GET_DEITY = gql`
  query GetDeity($id: String!) {
    deity(id: $id) {
      id
      pantheonId
      name
      slug
      gender
      domain
      symbols
      description
      originStory
      importanceRank
      imageUrl
      alternateNames
    }
  }
`;

export const GET_CREATURES = gql`
  query GetCreatures($pantheonId: String) {
    creatures(pantheonId: $pantheonId) {
      id
      pantheonId
      name
      slug
      habitat
      abilities
      dangerLevel
      description
      imageUrl
    }
  }
`;

export const GET_CREATURE = gql`
  query GetCreature($id: String!) {
    creature(id: $id) {
      id
      pantheonId
      name
      slug
      habitat
      abilities
      dangerLevel
      description
      imageUrl
    }
  }
`;

export const GET_ARTIFACTS = gql`
  query GetArtifacts($pantheonId: String) {
    artifacts(pantheonId: $pantheonId) {
      id
      pantheonId
      name
      slug
      ownerId
      type
      powers
      description
      imageUrl
    }
  }
`;

export const GET_ARTIFACT = gql`
  query GetArtifact($id: String!) {
    artifact(id: $id) {
      id
      pantheonId
      name
      slug
      ownerId
      type
      powers
      description
      originStory
      imageUrl
    }
  }
`;

export const GET_DEITY_RELATIONSHIPS = gql`
  query GetDeityRelationships($deityId: String!) {
    deityRelationships(deityId: $deityId) {
      id
      fromDeityId
      toDeityId
      relationshipType
      description
      storyContext
      confidenceLevel
      isDisputed
    }
  }
`;

export const GET_ALL_RELATIONSHIPS = gql`
  query GetAllRelationships($pantheonId: String) {
    allRelationships(pantheonId: $pantheonId) {
      id
      fromDeityId
      toDeityId
      relationshipType
      description
      storyContext
      confidenceLevel
      isDisputed
    }
  }
`;

export const GET_STORIES = gql`
  query GetStories($pantheonId: String) {
    stories(pantheonId: $pantheonId) {
      id
      pantheonId
      title
      slug
      summary
      fullNarrative
      keyExcerpts
      category
      moralThemes
      culturalSignificance
      externalLinks
      citationSources
      featuredDeities
      featuredLocations
      relatedStories
    }
  }
`;

export const GET_STORY = gql`
  query GetStory($id: String!) {
    story(id: $id) {
      id
      pantheonId
      title
      slug
      summary
      fullNarrative
      keyExcerpts
      category
      moralThemes
      culturalSignificance
      relatedFestivals
      externalLinks
      citationSources
      featuredDeities
      featuredLocations
      relatedStories
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents($storyId: String) {
    events(storyId: $storyId) {
      id
      storyId
      title
      description
      eventType
      sequenceOrder
      mythologicalEra
      citationSources
    }
  }
`;

export const GET_LOCATIONS = gql`
  query GetLocations($pantheonId: String) {
    locations(pantheonId: $pantheonId) {
      id
      name
      locationType
      pantheonId
      description
      latitude
      longitude
    }
  }
`;

export const GET_LOCATION = gql`
  query GetLocation($id: String!) {
    location(id: $id) {
      id
      name
      locationType
      pantheonId
      description
      latitude
      longitude
    }
  }
`;

export const SEARCH = gql`
  query Search($query: String!, $limit: Int) {
    search(query: $query, limit: $limit) {
      deities {
        id
        name
        slug
        domain
        description
        imageUrl
      }
      creatures {
        id
        name
        slug
        habitat
        description
        imageUrl
      }
      artifacts {
        id
        name
        slug
        type
        description
        imageUrl
      }
      pantheons {
        id
        name
        slug
        culture
        description
      }
      stories {
        id
        title
        slug
        summary
      }
    }
  }
`;
