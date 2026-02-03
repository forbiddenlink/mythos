import { GraphQLClient } from 'graphql-request';

// Create a lazy-initialized client that uses the correct URL based on environment
const createGraphQLClient = () => {
  // In browser, use window.location to build absolute URL
  if (globalThis.window !== undefined) {
    const baseUrl = globalThis.window.location.origin;
    return new GraphQLClient(`${baseUrl}/api/graphql`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // On server, construct full URL from environment
  // Vercel sets VERCEL_URL without protocol, so we add https://
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return new GraphQLClient(`${baseUrl}/api/graphql`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Create client on each request to ensure fresh URL resolution
export const graphqlClient = {
  request: async <T>(document: string, variables?: Record<string, unknown>): Promise<T> => {
    const client = createGraphQLClient();
    return client.request<T>(document, variables);
  },
};
