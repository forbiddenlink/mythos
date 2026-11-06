import { renderToString } from "react-dom/server";
import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHydrated } from "@/hooks/use-hydrated";

function Probe() {
  return <span data-testid="p">{useHydrated() ? "client" : "server"}</span>;
}

describe("useHydrated", () => {
  it("is true on the client", () => {
    const { result } = renderHook(() => useHydrated());
    expect(result.current).toBe(true);
  });

  it("renders the server snapshot (false) during SSR", () => {
    expect(renderToString(<Probe />)).toContain("server");
  });

  it("renders true after a client render", () => {
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("client");
  });
});
