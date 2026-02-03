import { GraphQLClient } from 'graphql-request';

// Get the API URL based on environment
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

// Create a single GraphQLClient instance
export const graphqlClient = new GraphQLClient(getApiUrl(), {
  headers: {
    'Content-Type': 'application/json',
  },
});
