// Simple GraphQL client using native fetch
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

// Export a simple request function
export const graphqlClient = {
  request: async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
    const url = getApiUrl();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const json = await response.json();
    
    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }

    return json.data;
  },
};
