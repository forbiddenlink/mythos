/**
 * JSON response that no cache may keep. Used by every route whose answer
 * depends on the caller, the store or a secret.
 */
export function noStoreJson(
  body: Record<string, unknown>,
  status: number,
): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
