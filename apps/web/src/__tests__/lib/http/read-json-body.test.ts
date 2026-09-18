import { describe, expect, it } from "vitest";
import { readJsonBody } from "@/lib/http/read-json-body";

describe("readJsonBody", () => {
  it("parses a JSON body within the configured limit", async () => {
    const request = new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ query: "Athena" }),
    });

    await expect(readJsonBody(request, 1024)).resolves.toEqual({
      ok: true,
      value: { query: "Athena" },
    });
  });

  it("rejects an oversized declared request body before parsing", async () => {
    const request = new Request("https://example.test", {
      method: "POST",
      headers: { "content-length": "4097" },
      body: "{}",
    });

    await expect(readJsonBody(request, 4096)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("enforces the byte limit when Content-Length is absent", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"query":"Athena"}'));
        controller.close();
      },
    });
    const request = new Request("https://example.test", {
      method: "POST",
      body,
      // Request's stream body support requires this in Node's fetch runtime.
      duplex: "half",
    } as RequestInit);

    await expect(readJsonBody(request, 8)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("accepts valid multibyte JSON within the byte limit", async () => {
    const request = new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ message: "神".repeat(80_000) }),
    });

    const result = await readJsonBody(request, 384 * 1024);

    expect(result.ok).toBe(true);
  });
});
