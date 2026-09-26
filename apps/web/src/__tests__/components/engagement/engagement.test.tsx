import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/sharing/ShareButton", () => ({
  ShareButton: ({ url }: { url?: string }) => (
    <a data-testid="share" href={url}>
      Share
    </a>
  ),
}));

import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { TodaysMyth } from "@/components/home/TodaysMyth";
import { pickDailyMyth, type DailyMythPool } from "@/lib/daily-myth";
import { ProgressProvider } from "@/providers/progress-provider";

const pool: DailyMythPool = {
  version: 1,
  myths: [
    {
      id: "myth-a",
      slug: "myth-a",
      title: "Myth A",
      tradition: "Greek",
      summary: "A summary.",
      questions: [0, 1, 2].map((n) => ({
        prompt: `Question ${n}?`,
        options: ["Right", "Wrong 1", "Wrong 2", "Wrong 3"],
        answer: 0,
        explanation: "Because.",
      })),
    },
  ],
};

function withProgress(children: ReactNode) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

describe("NewsletterSignup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requires the consent box before posting", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<NewsletterSignup placement="footer" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "a@b.co" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await screen.findByRole("status")).toHaveTextContent("tick the box");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows 'sign-ups open soon' when the server has no key", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ reason: "not_configured" }), {
        status: 501,
      }),
    );
    render(<NewsletterSignup placement="footer" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "a@b.co" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await screen.findByText(/Sign-ups open soon/)).toBeInTheDocument();
  });

  it("posts consent and placement, then confirms", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
    render(<NewsletterSignup placement="daily_myth" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "a@b.co" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await screen.findByText(/on the list/)).toBeInTheDocument();
    const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      email: "a@b.co",
      consent: true,
      placement: "daily_myth",
    });
  });
});

describe("TodaysMyth", () => {
  beforeEach(() => {
    localStorage.clear();
    // The section loads its pool when it nears the viewport.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(
          private readonly callback: (
            entries: Array<{ isIntersecting: boolean }>,
          ) => void,
        ) {}
        observe() {
          this.callback([{ isIntersecting: true }]);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json(pool),
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("runs three questions, awards the daily challenge and offers a share card", async () => {
    render(withProgress(<TodaysMyth />));
    expect(pickDailyMyth(pool.myths, new Date())?.id).toBe("myth-a");
    const start = await screen.findByRole("button", {
      name: "Answer three questions",
    });
    fireEvent.click(start);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole("button", { name: "Right" }));
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", {
            name: i === 2 ? "See your result" : "Next question",
          }),
        );
      });
    }
    expect(await screen.findByText("Oracle of Delphi")).toBeInTheDocument();
    expect(screen.getByTestId("share")).toHaveAttribute(
      "href",
      "https://mythosatlas.com/quiz/result/daily-3-of-3",
    );
    expect(screen.getByTestId("newsletter-daily_myth")).toBeInTheDocument();
    await waitFor(() => {
      const progress = JSON.parse(
        localStorage.getItem("mythos-atlas-progress") ?? "{}",
      );
      expect(progress.claimedDailyChallenges?.[0]).toMatch(/:todays_myth$/);
    });
  });

  it("shows the stored result when today's myth is already done", async () => {
    const { toLocalDateString } = await import("@/lib/date");
    localStorage.setItem(
      "mythos-atlas-daily-myth",
      JSON.stringify({
        date: toLocalDateString(new Date()),
        mythId: "myth-a",
        score: 1,
      }),
    );
    render(withProgress(<TodaysMyth />));
    expect(await screen.findByText("Mortal Among Gods")).toBeInTheDocument();
  });
});
