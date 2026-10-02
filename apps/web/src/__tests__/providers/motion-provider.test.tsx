import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import { m } from "framer-motion";
import { describe, expect, it } from "vitest";
import { MotionProvider } from "@/providers/motion-provider";

// The full `motion` component bundles every animation feature (drag, layout
// projection) into the first-load JS. The components rendered on every page
// use the slim `m` component, with features loaded after hydration by
// MotionProvider.
describe("MotionProvider", () => {
  it("renders m.* children with their content before and after features load", async () => {
    render(
      <MotionProvider>
        <m.div
          data-testid="box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          hello
        </m.div>
      </MotionProvider>,
    );
    expect(screen.getByTestId("box").textContent).toBe("hello");
    // Let the async feature import settle; the content must still be there.
    await waitFor(() =>
      expect(screen.getByTestId("box").textContent).toBe("hello"),
    );
  });

  it("renders m.* children without a provider (as in isolated component tests)", () => {
    render(<m.p>plain</m.p>);
    expect(screen.getByText("plain")).toBeTruthy();
  });

  it.each([
    "src/components/layout/mega-menu.tsx",
    "src/components/layout/quick-actions.tsx",
    "src/components/ui/bookmark-button.tsx",
    "src/components/home/DidYouKnow.tsx",
  ])("%s uses the slim m component, not the full motion bundle", (file) => {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    expect(source).not.toMatch(
      /import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*["']framer-motion["']/,
    );
    expect(source).not.toMatch(/<motion\./);
  });
});
