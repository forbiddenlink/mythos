import { describe, expect, it, vi } from "vitest";
import {
  handleWeeklyDigestRequest,
  runWeeklyDigest,
  type BroadcastClient,
  type DigestEnv,
} from "@/lib/newsletter-broadcast";
import { DEFAULT_RESEND_SEGMENT_ID } from "@/lib/newsletter";
import type { DigestStory } from "@/lib/newsletter-digest";

const NOW = new Date("2026-10-12T13:00:00Z"); // 2026-W42
const NAME = "Weekly myth 2026-W42";

const STORIES: DigestStory[] = [
  {
    slug: "titanomachy",
    title: "The Titanomachy",
    summary: "A ten-year war.",
    keyExcerpts: "The Olympians fought the Titans.",
    moralThemes: ["justice"],
    pantheonId: "greek-pantheon",
    citationSources: [{ title: "Theogony", author: "Hesiod" }],
  },
];

const ENV: DigestEnv = {
  CRON_SECRET: "s3cret",
  RESEND_API_KEY: "re_test",
  NEWSLETTER_FROM: "Mythos Atlas <digest@example.com>",
};

function fakeClient(
  existing: Array<{ id: string; name: string; status: string }> = [],
) {
  const client = {
    broadcasts: {
      list: vi.fn(async () => ({
        data: { data: existing, has_more: false },
        error: null,
      })),
      create: vi.fn(async () => ({ data: { id: "bc_new" }, error: null })),
      send: vi.fn(async (id: string) => ({ data: { id }, error: null })),
    },
  } satisfies BroadcastClient;
  return client;
}

function req(authorization?: string): Request {
  return new Request("http://localhost/api/cron/weekly-digest", {
    headers: authorization ? { authorization } : {},
  });
}

function handle(
  request: Request,
  client: BroadcastClient,
  env: DigestEnv = ENV,
) {
  const createClient = vi.fn(() => client);
  return {
    createClient,
    response: handleWeeklyDigestRequest(request, {
      env,
      stories: STORIES,
      journeys: [],
      now: NOW,
      createClient,
    }),
  };
}

describe("weekly digest cron auth and config", () => {
  it("answers 401 without the bearer secret and never builds a client", async () => {
    const client = fakeClient();
    for (const header of [undefined, "Bearer wrong", "s3cret"]) {
      const { response, createClient } = handle(req(header), client);
      expect((await response).status).toBe(401);
      expect(createClient).not.toHaveBeenCalled();
    }
    expect(client.broadcasts.create).not.toHaveBeenCalled();
  });

  it.each(["CRON_SECRET", "RESEND_API_KEY", "NEWSLETTER_FROM"])(
    "answers 501 when %s is unset",
    async (name) => {
      const env = { ...ENV, [name]: undefined };
      const client = fakeClient();
      const { response } = handle(req("Bearer s3cret"), client, env);
      expect((await response).status).toBe(501);
      expect(client.broadcasts.create).not.toHaveBeenCalled();
    },
  );
});

describe("weekly digest run", () => {
  it("creates a draft and does not send by default", async () => {
    const client = fakeClient();
    const { response } = handle(req("Bearer s3cret"), client);
    const res = await response;
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "drafted", id: "bc_new" });
    expect(client.broadcasts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: NAME,
        segmentId: DEFAULT_RESEND_SEGMENT_ID,
        from: ENV.NEWSLETTER_FROM,
        html: expect.stringContaining("{{{RESEND_UNSUBSCRIBE_URL}}}"),
        text: expect.stringContaining("{{{RESEND_UNSUBSCRIBE_URL}}}"),
      }),
    );
    // A draft: the create payload must not ask Resend to send.
    expect(client.broadcasts.create.mock.calls[0][0]).not.toHaveProperty(
      "send",
    );
    expect(client.broadcasts.send).not.toHaveBeenCalled();
  });

  it("uses RESEND_SEGMENT_ID when set", async () => {
    const client = fakeClient();
    await handle(req("Bearer s3cret"), client, {
      ...ENV,
      RESEND_SEGMENT_ID: "seg_custom",
    }).response;
    expect(client.broadcasts.create).toHaveBeenCalledWith(
      expect.objectContaining({ segmentId: "seg_custom" }),
    );
  });

  it("sends only when NEWSLETTER_DIGEST_SEND is exactly 'true'", async () => {
    for (const value of ["1", "TRUE", "yes", ""]) {
      const client = fakeClient();
      await handle(req("Bearer s3cret"), client, {
        ...ENV,
        NEWSLETTER_DIGEST_SEND: value,
      }).response;
      expect(client.broadcasts.send).not.toHaveBeenCalled();
    }
    const client = fakeClient();
    const res = await handle(req("Bearer s3cret"), client, {
      ...ENV,
      NEWSLETTER_DIGEST_SEND: "true",
    }).response;
    expect(await res.json()).toMatchObject({ status: "sent", id: "bc_new" });
    expect(client.broadcasts.send).toHaveBeenCalledWith("bc_new");
  });

  it("is idempotent: a broadcast already named for the week is not recreated", async () => {
    const client = fakeClient([{ id: "bc_old", name: NAME, status: "sent" }]);
    const res = await handle(req("Bearer s3cret"), client, {
      ...ENV,
      NEWSLETTER_DIGEST_SEND: "true",
    }).response;
    expect(await res.json()).toMatchObject({ status: "exists", id: "bc_old" });
    expect(client.broadcasts.create).not.toHaveBeenCalled();
    expect(client.broadcasts.send).not.toHaveBeenCalled();
  });

  it("sends an existing draft when sending is on, leaves it when off", async () => {
    const drafts = [{ id: "bc_draft", name: NAME, status: "draft" }];
    const off = fakeClient(drafts);
    await runWeeklyDigest({
      client: off,
      stories: STORIES,
      journeys: [],
      now: NOW,
      segmentId: "seg",
      from: "a@b.co",
      send: false,
    });
    expect(off.broadcasts.send).not.toHaveBeenCalled();
    expect(off.broadcasts.create).not.toHaveBeenCalled();

    const on = fakeClient(drafts);
    const result = await runWeeklyDigest({
      client: on,
      stories: STORIES,
      journeys: [],
      now: NOW,
      segmentId: "seg",
      from: "a@b.co",
      send: true,
    });
    expect(result).toMatchObject({ status: "sent", id: "bc_draft" });
    expect(on.broadcasts.create).not.toHaveBeenCalled();
  });

  it("pages through the broadcast list before deciding the week is new", async () => {
    const client = fakeClient();
    client.broadcasts.list
      .mockResolvedValueOnce({
        data: {
          data: [{ id: "p1", name: "other", status: "sent" }],
          has_more: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ id: "p2", name: NAME, status: "draft" }],
          has_more: false,
        },
        error: null,
      });
    const res = await handle(req("Bearer s3cret"), client).response;
    expect(await res.json()).toMatchObject({ status: "exists", id: "p2" });
    expect(client.broadcasts.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ after: "p1" }),
    );
  });

  it("reports upstream failures as 502 without sending", async () => {
    const client = fakeClient();
    client.broadcasts.create.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    } as never);
    const res = await handle(req("Bearer s3cret"), client, {
      ...ENV,
      NEWSLETTER_DIGEST_SEND: "true",
    }).response;
    expect(res.status).toBe(502);
    expect(client.broadcasts.send).not.toHaveBeenCalled();
  });

  it("skips quietly when the catalog has no eligible story", async () => {
    const client = fakeClient();
    const result = await runWeeklyDigest({
      client,
      stories: [],
      journeys: [],
      now: NOW,
      segmentId: "seg",
      from: "a@b.co",
      send: true,
    });
    expect(result).toEqual({ status: "no_story" });
    expect(client.broadcasts.list).not.toHaveBeenCalled();
  });
});
