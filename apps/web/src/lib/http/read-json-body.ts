/**
 * Read a stream to bytes, counting real bytes, and cancel it once it passes
 * maxBytes (returns null). Content-Length can be absent (chunked) or wrong, so
 * callers may use it only as a fast path in front of this.
 */
export async function readCappedStream(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!body) return new Uint8Array(new ArrayBuffer(0));
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export type JsonBodyResult =
  { ok: true; value: unknown } | { ok: false; reason: "invalid" | "too_large" };

/**
 * Read and parse a JSON request body without exceeding the route's byte limit.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<JsonBodyResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    await request.body?.cancel();
    return { ok: false, reason: "too_large" };
  }

  if (!request.body) {
    return { ok: false, reason: "invalid" };
  }

  try {
    const body = await readCappedStream(request.body, maxBytes);
    if (body === null) return { ok: false, reason: "too_large" };
    return { ok: true, value: JSON.parse(new TextDecoder().decode(body)) };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
