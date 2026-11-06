import { act, render, screen, waitFor } from "@testing-library/react";
import { useLocale } from "next-intl";
import { describe, expect, it, vi } from "vitest";

// Each locale's messages resolve only when the test releases them, so the
// test controls load order.
const gates = vi.hoisted(() => {
  const make = () => {
    let release!: () => void;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });
    return { promise, release };
  };
  return { es: make(), fr: make() };
});

vi.mock("../../../../messages/es.json", async () => {
  await gates.es.promise;
  return { default: { marker: "es" } };
});
vi.mock("../../../../messages/fr.json", async () => {
  await gates.fr.promise;
  return { default: { marker: "fr" } };
});

import { IntlProvider } from "@/components/i18n/IntlProvider";
import { LOCALE_CHANGE_EVENT } from "@/i18n/client-locale";

function Probe() {
  return <p data-testid="locale">{useLocale()}</p>;
}

function switchTo(locale: string) {
  window.dispatchEvent(
    new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }),
  );
}

describe("IntlProvider", () => {
  it("keeps the newest locale when an earlier load resolves last", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <Probe />
      </IntlProvider>,
    );

    act(() => {
      switchTo("es");
      switchTo("fr");
    });
    // The dynamic import resolves a few ticks after its gate opens.
    gates.fr.release();
    await waitFor(() =>
      expect(screen.getByTestId("locale")).toHaveTextContent("fr"),
    );

    await act(async () => {
      gates.es.release();
      for (let tick = 0; tick < 20; tick++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
    expect(screen.getByTestId("locale")).toHaveTextContent("fr");
  });
});
