import { GraphQLClient } from 'graphql-request';

// Create a lazy-initialized client that uses the correct URL based on environment
const createGraphQLClient = () => {
  // In browser, use window.location to build absolute URL
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return new GraphQLClient(`${baseUrl}/api/graphql`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // On server, construct full URL from environment
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

  return new GraphQLClient(`${baseUrl}/api/graphql`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Lazy singleton - created on first use in browser
let _client: GraphQLClient | null = null;

export const graphqlClient = {
  request: async <T>(document: string, variables?: Record<string, unknown>): Promise<T> => {
    if (!_client) {
      _client = createGraphQLClient();
    }
    return _client.request<T>(document, variables);
  },
};
