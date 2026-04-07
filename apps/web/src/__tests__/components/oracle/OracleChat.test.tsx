import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { OracleChat } from "@/components/oracle/OracleChat";
import { ORACLE_GROUNDING_HITS_HEADER } from "@/lib/oracle/constants";
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
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          headers: new Headers({
            [ORACLE_GROUNDING_HITS_HEADER]: "0",
          }),
          json: () => Promise.resolve({}),
          body: {
            getReader: () => {
              let done = false;
              return {
                read: () => {
                  if (done)
                    return Promise.resolve({ done: true, value: undefined });
                  done = true;
                  return Promise.resolve({
                    done: false,
                    value: new TextEncoder().encode("Hello seeker."),
                  });
                },
              };
            },
          },
        } as Response),
      ),
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
});
