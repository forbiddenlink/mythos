import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import {
  BookmarksProvider,
  BookmarksContext,
  type BookmarksContextValue,
} from "@/providers/bookmarks-provider";

// Mock framer-motion to avoid animation issues in tests (strip animation props so they are not passed to the DOM)
vi.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      whileTap: _whileTap,
      ...props
    }: {
      children?: ReactNode;
      whileTap?: object;
    }) => <button {...props}>{children}</button>,
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      exit: _exit,
      whileTap: _whileTap2,
      whileHover: _whileHover,
      ...props
    }: {
      children?: ReactNode;
    } & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

function wrapper({ children }: { children: ReactNode }) {
  return <BookmarksProvider>{children}</BookmarksProvider>;
}

// Custom wrapper that allows pre-configured bookmark state
function createMockBookmarksContext(
  overrides: Partial<BookmarksContextValue> = {},
): BookmarksContextValue {
  return {
    bookmarks: [],
    readingProgress: {},
    toggleBookmark: vi.fn(),
    isBookmarked: vi.fn(() => false),
    getBookmarks: vi.fn(() => []),
    getReadingProgress: vi.fn(() => 0),
    setReadingProgress: vi.fn(),
    ...overrides,
  };
}

function MockBookmarksProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: BookmarksContextValue;
}) {
  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

describe("BookmarkButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render unbookmarked state by default", () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("should render bookmarked state when item is bookmarked", () => {
      const mockContext = createMockBookmarksContext({
        isBookmarked: vi.fn(() => true),
      });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="zeus" />
        </MockBookmarksProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("should apply custom className", () => {
      render(
        <BookmarkButton type="deity" id="zeus" className="custom-class" />,
        {
          wrapper,
        },
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Size variants", () => {
    it.each([
      ["sm", "p-1.5"],
      ["md", "p-2"],
      ["lg", "p-2.5"],
    ] as const)("should apply %s size padding", (size, expectedClass) => {
      render(<BookmarkButton type="deity" id="zeus" size={size} />, {
        wrapper,
      });

      const button = screen.getByRole("button");
      expect(button.className).toContain(expectedClass);
    });

    it('should default to "md" size', () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");
      expect(button.className).toContain("p-2");
    });
  });

  describe("Variant styling", () => {
    it("should apply default variant styling", () => {
      render(<BookmarkButton type="deity" id="zeus" variant="default" />, {
        wrapper,
      });

      const button = screen.getByRole("button");
      expect(button.className).toContain("hover:bg-gold/10");
    });

    it("should apply light variant styling", () => {
      render(<BookmarkButton type="deity" id="zeus" variant="light" />, {
        wrapper,
      });

      const button = screen.getByRole("button");
      expect(button.className).toContain("hover:bg-white/10");
    });
  });

  describe("Click behavior", () => {
    it("should call toggleBookmark when clicked", () => {
      const toggleBookmark = vi.fn();
      const mockContext = createMockBookmarksContext({ toggleBookmark });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="zeus" />
        </MockBookmarksProvider>,
      );

      fireEvent.click(screen.getByRole("button"));

      expect(toggleBookmark).toHaveBeenCalledWith("deity", "zeus");
      expect(toggleBookmark).toHaveBeenCalledTimes(1);
    });

    it("should prevent default and stop propagation on click", () => {
      const toggleBookmark = vi.fn();
      const mockContext = createMockBookmarksContext({ toggleBookmark });

      const parentClickHandler = vi.fn();

      render(
        <MockBookmarksProvider value={mockContext}>
          <div onClick={parentClickHandler}>
            <BookmarkButton type="deity" id="zeus" />
          </div>
        </MockBookmarksProvider>,
      );

      fireEvent.click(screen.getByRole("button"));

      // Should not propagate to parent
      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it("should toggle bookmark state when clicked", async () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");

      // Initially not bookmarked
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button).toHaveAttribute("aria-label", "Add deity to bookmarks");

      // Click to bookmark
      await act(async () => {
        fireEvent.click(button);
      });

      // Now bookmarked
      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(button).toHaveAttribute(
        "aria-label",
        "Remove deity from bookmarks",
      );

      // Click to unbookmark
      await act(async () => {
        fireEvent.click(button);
      });

      // Back to unbookmarked
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button).toHaveAttribute("aria-label", "Add deity to bookmarks");
    });
  });

  describe("Integration with bookmark context", () => {
    it("should reflect context state changes", async () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");

      // Start unbookmarked
      expect(button).toHaveAttribute("aria-pressed", "false");

      // Toggle on
      await act(async () => {
        fireEvent.click(button);
      });
      expect(button).toHaveAttribute("aria-pressed", "true");

      // Toggle off
      await act(async () => {
        fireEvent.click(button);
      });
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("should work with multiple bookmark buttons for same item", async () => {
      render(
        <>
          <BookmarkButton type="deity" id="zeus" />
          <BookmarkButton type="deity" id="zeus" />
        </>,
        { wrapper },
      );

      const buttons = screen.getAllByRole("button");
      const button1 = buttons[0];
      const button2 = buttons[1];

      // Both start unbookmarked
      expect(button1).toHaveAttribute("aria-pressed", "false");
      expect(button2).toHaveAttribute("aria-pressed", "false");

      // Click first button
      await act(async () => {
        fireEvent.click(button1);
      });

      // Both should now show bookmarked
      expect(button1).toHaveAttribute("aria-pressed", "true");
      expect(button2).toHaveAttribute("aria-pressed", "true");
    });

    it("should handle different items independently", async () => {
      render(
        <>
          <BookmarkButton type="deity" id="zeus" />
          <BookmarkButton type="deity" id="athena" />
        </>,
        { wrapper },
      );

      const buttons = screen.getAllByRole("button");
      const zeusButton = buttons[0];
      const athenaButton = buttons[1];

      // Bookmark Zeus
      await act(async () => {
        fireEvent.click(zeusButton);
      });

      // Only Zeus should be bookmarked
      expect(zeusButton).toHaveAttribute("aria-pressed", "true");
      expect(athenaButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("Accessibility", () => {
    it("should have correct aria-label when unbookmarked", () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Add deity to bookmarks");
    });

    it("should have correct aria-label when bookmarked", () => {
      const mockContext = createMockBookmarksContext({
        isBookmarked: vi.fn(() => true),
      });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="zeus" />
        </MockBookmarksProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "Remove deity from bookmarks",
      );
    });

    it("should have aria-pressed attribute", () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed");
    });

    it.each([
      ["deity", "Add deity to bookmarks", "Remove deity from bookmarks"],
      ["story", "Add story to bookmarks", "Remove story from bookmarks"],
      [
        "pantheon",
        "Add pantheon to bookmarks",
        "Remove pantheon from bookmarks",
      ],
    ] as const)(
      "should use correct %s type in aria-label",
      (type, unbookmarkedLabel, bookmarkedLabel) => {
        const { rerender } = render(
          <MockBookmarksProvider value={createMockBookmarksContext()}>
            <BookmarkButton type={type} id="test" />
          </MockBookmarksProvider>,
        );

        expect(screen.getByRole("button")).toHaveAttribute(
          "aria-label",
          unbookmarkedLabel,
        );

        // Rerender with bookmarked state
        rerender(
          <MockBookmarksProvider
            value={createMockBookmarksContext({
              isBookmarked: vi.fn(() => true),
            })}
          >
            <BookmarkButton type={type} id="test" />
          </MockBookmarksProvider>,
        );

        expect(screen.getByRole("button")).toHaveAttribute(
          "aria-label",
          bookmarkedLabel,
        );
      },
    );

    it("should have focus-visible ring styles", () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");
      expect(button.className).toContain("focus-visible:ring-2");
      expect(button.className).toContain("focus-visible:ring-ring");
    });

    it("should be keyboard accessible", () => {
      const toggleBookmark = vi.fn();
      const mockContext = createMockBookmarksContext({ toggleBookmark });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="zeus" />
        </MockBookmarksProvider>,
      );

      const button = screen.getByRole("button");

      // Simulate keyboard activation
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.keyUp(button, { key: "Enter" });
      fireEvent.click(button);

      expect(toggleBookmark).toHaveBeenCalled();
    });
  });

  describe("Different item types", () => {
    it.each([
      ["deity", "zeus"],
      ["story", "titanomachy"],
      ["pantheon", "greek"],
    ] as const)("should handle %s type with id %s", (type, id) => {
      const toggleBookmark = vi.fn();
      const mockContext = createMockBookmarksContext({ toggleBookmark });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type={type} id={id} />
        </MockBookmarksProvider>,
      );

      fireEvent.click(screen.getByRole("button"));

      expect(toggleBookmark).toHaveBeenCalledWith(type, id);
    });

    it("should handle special characters in id", () => {
      const toggleBookmark = vi.fn();
      const mockContext = createMockBookmarksContext({ toggleBookmark });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="ah-puch-mayan" />
        </MockBookmarksProvider>,
      );

      fireEvent.click(screen.getByRole("button"));

      expect(toggleBookmark).toHaveBeenCalledWith("deity", "ah-puch-mayan");
    });
  });

  describe("Visual feedback", () => {
    it("should render Heart icon", () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      // The Heart component from lucide-react renders an SVG
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should show glow effect when bookmarked", () => {
      const mockContext = createMockBookmarksContext({
        isBookmarked: vi.fn(() => true),
      });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="zeus" />
        </MockBookmarksProvider>,
      );

      // The glow div should be present when bookmarked
      const button = screen.getByRole("button");
      const glowDiv = button.querySelector("div.bg-gold\\/10");
      expect(glowDiv).toBeInTheDocument();
    });

    it("should not show glow effect when unbookmarked", () => {
      const mockContext = createMockBookmarksContext({
        isBookmarked: vi.fn(() => false),
      });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="zeus" />
        </MockBookmarksProvider>,
      );

      const button = screen.getByRole("button");
      const glowDiv = button.querySelector("div.bg-gold\\/10");
      expect(glowDiv).not.toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle rapid clicks", async () => {
      render(<BookmarkButton type="deity" id="zeus" />, { wrapper });

      const button = screen.getByRole("button");

      // Rapid clicks
      await act(async () => {
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);
      });

      // Odd number of clicks = bookmarked
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("should handle empty string id", () => {
      const toggleBookmark = vi.fn();
      const mockContext = createMockBookmarksContext({ toggleBookmark });

      render(
        <MockBookmarksProvider value={mockContext}>
          <BookmarkButton type="deity" id="" />
        </MockBookmarksProvider>,
      );

      fireEvent.click(screen.getByRole("button"));

      expect(toggleBookmark).toHaveBeenCalledWith("deity", "");
    });
  });
});
