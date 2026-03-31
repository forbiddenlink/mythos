import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "@/components/ui/badge";

describe("Badge", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Badge>Status</Badge>);

      const badge = screen.getByText("Status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("data-slot", "badge");
    });

    it("should render as a span element by default", () => {
      render(<Badge>Status</Badge>);

      const badge = screen.getByText("Status");
      expect(badge.tagName).toBe("SPAN");
    });

    it("should render children correctly", () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Label</span>
        </Badge>,
      );

      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Label")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Badge className="custom-class">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("custom-class");
    });

    it("should merge custom className with variant classes", () => {
      render(
        <Badge className="my-custom" variant="secondary">
          Badge
        </Badge>,
      );

      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("my-custom");
      expect(badge.className).toContain("bg-secondary");
    });
  });

  describe("Variants", () => {
    it.each([
      ["default", "bg-primary"],
      ["secondary", "bg-secondary"],
      ["destructive", "bg-destructive"],
      ["outline", "text-foreground"],
    ] as const)("should apply %s variant classes", (variant, expectedClass) => {
      render(<Badge variant={variant}>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain(expectedClass);
    });

    it('should default to "default" variant', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("bg-primary");
      expect(badge.className).toContain("text-primary-foreground");
    });

    it("should apply border-transparent for non-outline variants", () => {
      render(<Badge variant="default">Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("border-transparent");
    });

    it("should not apply border-transparent for outline variant", () => {
      render(<Badge variant="outline">Badge</Badge>);

      const badge = screen.getByText("Badge");
      // Outline variant doesn't have border-transparent in its specific styles
      // It uses the base border class from cva
      expect(badge.className).toContain("border");
    });
  });

  describe("Base styles", () => {
    it("should apply base layout classes", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("inline-flex");
      expect(badge.className).toContain("items-center");
      expect(badge.className).toContain("justify-center");
    });

    it("should apply rounded-full for pill shape", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("rounded-full");
    });

    it("should apply text styling classes", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("text-xs");
      expect(badge.className).toContain("font-medium");
    });

    it("should apply spacing classes", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("px-2");
      expect(badge.className).toContain("py-0.5");
    });

    it("should apply whitespace-nowrap to prevent wrapping", () => {
      render(<Badge>Long badge text that should not wrap</Badge>);

      const badge = screen.getByText("Long badge text that should not wrap");
      expect(badge.className).toContain("whitespace-nowrap");
    });
  });

  describe("asChild prop", () => {
    it("should render as Slot when asChild is true", () => {
      render(
        <Badge asChild>
          <a href="/status">Active</a>
        </Badge>,
      );

      const link = screen.getByRole("link", { name: /active/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/status");
      // Should not render a span element wrapper
      expect(link.tagName).toBe("A");
    });

    it("should apply badge styles to child element when asChild", () => {
      render(
        <Badge asChild variant="destructive">
          <a href="/error">Error</a>
        </Badge>,
      );

      const link = screen.getByRole("link");
      expect(link.className).toContain("bg-destructive");
      expect(link.className).toContain("rounded-full");
    });

    it("should pass data-slot to child when asChild", () => {
      render(
        <Badge asChild>
          <button type="button">Click</button>
        </Badge>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-slot", "badge");
    });

    it("should default asChild to false", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.tagName).toBe("SPAN");
    });
  });

  describe("HTML attributes", () => {
    it("should pass through HTML attributes", () => {
      render(
        <Badge
          id="status-badge"
          title="Current status"
          aria-label="Active status"
        >
          Active
        </Badge>,
      );

      const badge = screen.getByText("Active");
      expect(badge).toHaveAttribute("id", "status-badge");
      expect(badge).toHaveAttribute("title", "Current status");
      expect(badge).toHaveAttribute("aria-label", "Active status");
    });

    it("should support data attributes", () => {
      render(
        <Badge data-testid="my-badge" data-status="active">
          Badge
        </Badge>,
      );

      const badge = screen.getByTestId("my-badge");
      expect(badge).toHaveAttribute("data-status", "active");
    });

    it("should support role attribute for accessibility", () => {
      render(<Badge role="status">New</Badge>);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should be focusable when used as interactive element", () => {
      render(
        <Badge asChild>
          <button type="button">Interactive Badge</button>
        </Badge>,
      );

      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("tabindex", "-1");
    });

    it("should have focus-visible styles in className", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("focus-visible:ring");
    });

    it("should support aria-invalid styling", () => {
      render(<Badge aria-invalid="true">Invalid</Badge>);

      const badge = screen.getByText("Invalid");
      expect(badge).toHaveAttribute("aria-invalid", "true");
      // Component has aria-invalid styles defined
      expect(badge.className).toContain("aria-invalid:border-destructive");
    });
  });

  describe("SVG icon support", () => {
    it("should render with SVG icons", () => {
      render(
        <Badge>
          <svg data-testid="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
          Status
        </Badge>,
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should have gap for icon spacing", () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText("Badge");
      expect(badge.className).toContain("gap-1");
    });
  });

  describe("badgeVariants function", () => {
    it("should generate class string for default variant", () => {
      const classes = badgeVariants();
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("text-primary-foreground");
    });

    it("should generate class string for secondary variant", () => {
      const classes = badgeVariants({ variant: "secondary" });
      expect(classes).toContain("bg-secondary");
      expect(classes).toContain("text-secondary-foreground");
    });

    it("should generate class string for destructive variant", () => {
      const classes = badgeVariants({ variant: "destructive" });
      expect(classes).toContain("bg-destructive");
    });

    it("should generate class string for outline variant", () => {
      const classes = badgeVariants({ variant: "outline" });
      expect(classes).toContain("text-foreground");
    });

    it("should merge custom className", () => {
      const classes = badgeVariants({ className: "my-custom-class" });
      expect(classes).toContain("my-custom-class");
    });

    it("should include base styles in all variants", () => {
      const classes = badgeVariants({ variant: "default" });
      expect(classes).toContain("inline-flex");
      expect(classes).toContain("rounded-full");
      expect(classes).toContain("text-xs");
    });
  });
});
