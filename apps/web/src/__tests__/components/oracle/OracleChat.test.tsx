import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { OracleChat } from "@/components/oracle/OracleChat";
import enMessages from "../../../../messages/en.json";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: ReactNode;
    } & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

const GROUNDED_EVENTS = [
  { type: "start" },
  {
    type: "data-oracle-sources",
    data: {
      hitCount: 1,
      entities: [
        { type: "deity", slug: "zeus", title: "Zeus", path: "/deities/zeus" },
      ],
      primarySources: [{ title: "Hesiod, Theogony", locator: "71–73" }],
    },
  },
  { type: "text-start", id: "a" },
  {
    type: "text-delta",
    id: "a",
    delta: "Hello seeker. [Zeus](/deities/zeus) reigns.",
  },
  { type: "text-end", id: "a" },
  { type: "finish" },
];

function sseResponse(events: unknown[]): Response {
  const raw =
    events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") +
    "data: [DONE]\n\n";
  return new Response(raw, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("OracleChat", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(sseResponse(GROUNDED_EVENTS))),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the floating opener with translated label", () => {
    render(
      <Providers>
        <OracleChat />
      </Providers>,
    );
    expect(
      screen.getByRole("button", { name: /ask the oracle/i }),
    ).toBeInTheDocument();
  });

  it("opens the dialog and closes on Escape", async () => {
    render(
      <Providers>
        <OracleChat />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: /ask the oracle/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /oracle of delphi/i }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("sends a suggested question when clicked", async () => {
    const fetchMock = vi.mocked(fetch);
    render(
      <Providers>
        <OracleChat />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: /ask the oracle/i }));

    const firstSuggestion = enMessages.oracle.suggestedQuestions[0];
    fireEvent.click(screen.getByRole("button", { name: firstSuggestion }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/oracle",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string) as {
      messages: { role: string; content: string }[];
      locale: string;
    };
    expect(body.messages.some((m) => m.content === firstSuggestion)).toBe(true);
    expect(body.locale).toBe("en");
  });

  it("renders inline Atlas links, entity pages and primary sources under the answer", async () => {
    render(
      <Providers>
        <OracleChat />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: /ask the oracle/i }));
    fireEvent.click(
      screen.getByRole("button", {
        name: enMessages.oracle.suggestedQuestions[0],
      }),
    );

    const links = await screen.findAllByRole("link", { name: "Zeus" });
    expect(links.every((a) => a.getAttribute("href") === "/deities/zeus")).toBe(
      true,
    );
    expect(links.length).toBeGreaterThanOrEqual(2); // inline + sources list
    expect(screen.getByText("Hesiod, Theogony 71–73")).toBeInTheDocument();
    expect(screen.queryByTestId("oracle-not-in-sources")).toBeNull();
  });

  it("shows the not-in-our-sources state", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse([
        {
          type: "data-oracle-sources",
          data: { hitCount: 0, entities: [], primarySources: [] },
        },
        { type: "text-start", id: "a" },
        {
          type: "text-delta",
          id: "a",
          delta: "Our sources don't cover that. Ask about a myth.",
        },
        { type: "text-end", id: "a" },
      ]),
    );
    render(
      <Providers>
        <OracleChat />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: /ask the oracle/i }));
    fireEvent.click(
      screen.getByRole("button", {
        name: enMessages.oracle.suggestedQuestions[0],
      }),
    );

    expect(
      await screen.findByTestId("oracle-not-in-sources"),
    ).toHaveTextContent(enMessages.oracle.notInSourcesTitle);
  });
});
