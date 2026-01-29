import { GraphQLClient } from 'graphql-request';

// Use the Next.js API route for GraphQL - works both in development and production
const getApiUrl = () => {
  // In browser, use relative URL
  if (typeof window !== 'undefined') {
    return '/api/graphql';
  }
  // On server, construct full URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';
  return `${baseUrl}/api/graphql`;
};

export const graphqlClient = new GraphQLClient(getApiUrl(), {
  headers: {
    'Content-Type': 'application/json',
  },
});
