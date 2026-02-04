import { POST, GET } from '@/app/api/graphql/route';
import { NextRequest } from 'next/server';

const { describe, it, expect } = await import('vitest');

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GraphQL API route', () => {
  describe('GET handler', () => {
    it('should return API description', async () => {
      const response = await GET();
      const json = await response.json();

      expect(json.message).toBe('Mythos Atlas GraphQL API');
      expect(json.endpoints).toBeDefined();
      expect(json.endpoints.pantheons).toBeDefined();
      expect(json.endpoints.deities).toBeDefined();
      expect(json.endpoints.stories).toBeDefined();
    });
  });

  describe('POST handler - Pantheons', () => {
    it('should return all pantheons with GetPantheons query', async () => {
      const request = createPostRequest({
        query: 'query GetPantheons { pantheons { id name slug } }',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.pantheons).toBeDefined();
      expect(Array.isArray(json.data.pantheons)).toBe(true);
      expect(json.data.pantheons.length).toBeGreaterThan(0);

      const first = json.data.pantheons[0];
      expect(first.id).toBeDefined();
      expect(first.name).toBeDefined();
      expect(first.slug).toBeDefined();
    });
  });

  describe('POST handler - Deities', () => {
    it('should return all deities with GetDeities query', async () => {
      const request = createPostRequest({
        query: 'query GetDeities { deities { id name slug } }',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.deities).toBeDefined();
      expect(Array.isArray(json.data.deities)).toBe(true);
      expect(json.data.deities.length).toBeGreaterThan(0);
    });

    it('should filter deities by pantheonId', async () => {
      const request = createPostRequest({
        query: 'query GetDeities { deities(pantheonId: $pantheonId) { id name } }',
        variables: { pantheonId: 'norse-pantheon' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.deities).toBeDefined();
      expect(json.data.deities.length).toBeGreaterThan(0);
      for (const deity of json.data.deities) {
        expect(deity.pantheonId).toBe('norse-pantheon');
      }
    });

    it('should return a single deity by id with GetDeity query', async () => {
      const request = createPostRequest({
        query: 'query GetDeity { deity(id: $id) { id name } }',
        variables: { id: 'zeus' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.deity).toBeDefined();
      expect(json.data.deity.id).toBe('zeus');
      expect(json.data.deity.name).toBe('Zeus');
    });
  });

  describe('POST handler - Stories', () => {
    it('should return all stories with GetStories query', async () => {
      const request = createPostRequest({
        query: 'query GetStories { stories { id title slug } }',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.stories).toBeDefined();
      expect(Array.isArray(json.data.stories)).toBe(true);
      expect(json.data.stories.length).toBeGreaterThan(0);
    });

    it('should filter stories by pantheonId', async () => {
      const request = createPostRequest({
        query: 'query GetStories { stories(pantheonId: $pantheonId) { id title } }',
        variables: { pantheonId: 'egyptian-pantheon' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.stories).toBeDefined();
      expect(json.data.stories.length).toBeGreaterThan(0);
      for (const story of json.data.stories) {
        expect(story.pantheonId).toBe('egyptian-pantheon');
      }
    });

    it('should return a single story by id with GetStory query', async () => {
      const request = createPostRequest({
        query: 'query GetStory { story(id: $id) { id title } }',
        variables: { id: 'ragnarok' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.story).toBeDefined();
      expect(json.data.story.id).toBe('ragnarok');
      expect(json.data.story.title).toContain('Ragnarok');
    });
  });

  describe('POST handler - Relationships', () => {
    it('should return relationships for a specific deity', async () => {
      const request = createPostRequest({
        query: 'query GetDeityRelationships { deityRelationships(deityId: $deityId) { id fromDeityId toDeityId } }',
        variables: { deityId: 'zeus' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.deityRelationships).toBeDefined();
      expect(Array.isArray(json.data.deityRelationships)).toBe(true);
      expect(json.data.deityRelationships.length).toBeGreaterThan(0);

      for (const rel of json.data.deityRelationships) {
        expect(rel.fromDeityId === 'zeus' || rel.toDeityId === 'zeus').toBe(true);
      }
    });

    it('should return all relationships with GetAllRelationships query', async () => {
      const request = createPostRequest({
        query: 'query GetAllRelationships { allRelationships(pantheonId: $pantheonId) { id } }',
        variables: { pantheonId: 'greek-pantheon' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.allRelationships).toBeDefined();
      expect(Array.isArray(json.data.allRelationships)).toBe(true);
      expect(json.data.allRelationships.length).toBeGreaterThan(0);
    });
  });

  describe('POST handler - Search', () => {
    it('should return search results for a query', async () => {
      const request = createPostRequest({
        query: 'query Search { search(query: $query) { deities { id name } pantheons { id name } stories { id title } } }',
        variables: { query: 'thunder' },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.data.search).toBeDefined();
      expect(json.data.search.deities).toBeDefined();
      expect(json.data.search.pantheons).toBeDefined();
      expect(json.data.search.stories).toBeDefined();
      // "thunder" should match at least Zeus or Thor
      expect(json.data.search.deities.length).toBeGreaterThan(0);
    });
  });

  describe('POST handler - Error handling', () => {
    it('should return 500 on invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json{{{',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const json = await response.json();
      expect(json.errors).toBeDefined();
      expect(json.errors[0].message).toBe('Internal server error');
    });
  });
});
