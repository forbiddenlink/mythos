import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AttestationTimeline } from "@/components/timeline/AttestationTimeline";
import type { AttestationPoint } from "@/lib/attestation";

const points = [
  { slug: "zeus", name: "Zeus", pantheonId: "greek-pantheon", year: -700, source: "Theogony" },
  { slug: "odin", name: "Odin", pantheonId: "norse-pantheon", year: 1220, source: "Prose Edda" },
] as AttestationPoint[];

describe("AttestationTimeline", () => {
  afterEach(cleanup);

  it("names a dot on keyboard focus, not only on mouse hover", () => {
    render(<AttestationTimeline points={points} total={2} />);
    expect(screen.queryByText("Theogony")).toBeNull();
    const dot = screen.getByRole("link", { name: /^Zeus: / });
    fireEvent.focus(dot);
    expect(screen.getByText("Theogony")).toBeTruthy();
    fireEvent.blur(dot);
    expect(screen.queryByText("Theogony")).toBeNull();
  });

  it("offers every dot as a plain list for touch and small screens", () => {
    render(<AttestationTimeline points={points} total={2} />);
    const list = screen.getByTestId("timeline-list");
    expect(within(list).getByRole("link", { name: /Zeus/ })).toBeTruthy();
    expect(within(list).getByRole("link", { name: /Odin/ })).toBeTruthy();
    expect(within(list).getByText("Greek")).toBeTruthy();
  });
});
