import { GraphQLClient } from "graphql-request";

// Hygraph Content API endpoints
const HYGRAPH_CONTENT_API =
  process.env.HYGRAPH_CONTENT_API_URL ||
  process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API_URL;

const HYGRAPH_CONTENT_API_TOKEN = process.env.HYGRAPH_CONTENT_API_TOKEN;

// High performance endpoint for production
const HYGRAPH_HIGH_PERFORMANCE_API =
  process.env.HYGRAPH_HIGH_PERFORMANCE_API_URL;

if (!HYGRAPH_CONTENT_API) {
  console.warn(
    "HYGRAPH_CONTENT_API_URL is not set. Hygraph CMS features will be disabled.",
  );
}

/**
 * Standard Hygraph client for content API requests
 * Use for server-side data fetching
 */
export const hygraphClient = HYGRAPH_CONTENT_API
  ? new GraphQLClient(HYGRAPH_CONTENT_API, {
      headers: HYGRAPH_CONTENT_API_TOKEN
        ? { Authorization: `Bearer ${HYGRAPH_CONTENT_API_TOKEN}` }
        : {},
    })
  : null;

/**
 * High-performance Hygraph client for production
 * Uses edge caching and is optimized for read operations
 */
export const hygraphHighPerfClient = HYGRAPH_HIGH_PERFORMANCE_API
  ? new GraphQLClient(HYGRAPH_HIGH_PERFORMANCE_API, {
      headers: HYGRAPH_CONTENT_API_TOKEN
        ? { Authorization: `Bearer ${HYGRAPH_CONTENT_API_TOKEN}` }
        : {},
    })
  : hygraphClient;

/**
 * Draft content client for preview mode
 * Includes draft content that hasn't been published
 */
export function createDraftClient(previewToken?: string) {
  if (!HYGRAPH_CONTENT_API) return null;

  return new GraphQLClient(HYGRAPH_CONTENT_API, {
    headers: {
      ...(HYGRAPH_CONTENT_API_TOKEN && {
        Authorization: `Bearer ${HYGRAPH_CONTENT_API_TOKEN}`,
      }),
      ...(previewToken && { "gcms-stage": "DRAFT" }),
    },
  });
}

/**
 * Check if Hygraph is configured
 */
export function isHygraphConfigured(): boolean {
  return Boolean(HYGRAPH_CONTENT_API);
}

/**
 * Request wrapper with error handling and caching hints
 */
export async function hygraphRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: {
    draft?: boolean;
    previewToken?: string;
    useHighPerf?: boolean;
  },
): Promise<T | null> {
  const client = options?.draft
    ? createDraftClient(options.previewToken)
    : options?.useHighPerf
      ? hygraphHighPerfClient
      : hygraphClient;

  if (!client) {
    console.warn("Hygraph client not configured, returning null");
    return null;
  }

  try {
    return await client.request<T>(query, variables);
  } catch (error) {
    console.error("Hygraph request failed:", error);
    throw error;
  }
}
