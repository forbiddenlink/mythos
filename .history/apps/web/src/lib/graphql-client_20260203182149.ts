import { GraphQLClient } from 'graphql-request';

// Lazy client creation to ensure correct URL resolution
let client: GraphQLClient | null = null;

function getApiUrl() {
  // In browser, use relative URL
  if (typeof window !== 'undefined') {
    return '/api/graphql';
  }
  
  // On server (SSR), use full URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/graphql`;
  }
  
  return process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`
    : 'http://localhost:3000/api/graphql';
}

function getClient() {
  if (!client) {
    client = new GraphQLClient(getApiUrl(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  return client;
}

// Export a proxy that calls the client methods
export const graphqlClient = {
  request: <T>(...args: Parameters<GraphQLClient['request']>): Promise<T> => {
    return getClient().request<T>(...args);
  },
};
