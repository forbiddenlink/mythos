import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-slot", "button");
    });

    it("should render children correctly", () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>,
      );

      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    it.each([
      ["default", "bg-primary"],
      ["destructive", "bg-destructive"],
      ["outline", "border"],
      ["secondary", "bg-secondary"],
      ["ghost", "hover:bg-accent"],
      ["link", "underline-offset-4"],
      ["gold", "bg-gold"],
    ] as const)("should apply %s variant classes", (variant, expectedClass) => {
      render(<Button variant={variant}>Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", variant);
      expect(button.className).toContain(expectedClass);
    });

    it('should default to "default" variant', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "default");
    });
  });

  describe("Sizes", () => {
    it.each([
      ["default", "h-10"],
      ["sm", "h-9"],
      ["lg", "h-12"],
      ["icon", "size-10"],
      ["icon-sm", "size-9"],
      ["icon-lg", "size-12"],
    ] as const)("should apply %s size classes", (size, expectedClass) => {
      render(<Button size={size}>Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", size);
      expect(button.className).toContain(expectedClass);
    });

    it('should default to "default" size', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "default");
    });
  });

  describe("Disabled state", () => {
    it("should render as disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have disabled styling classes", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button.className).toContain("disabled:pointer-events-none");
      expect(button.className).toContain("disabled:opacity-50");
    });

    it("should not fire click handler when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Click handling", () => {
    it("should call onClick handler when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should pass event to onClick handler", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
        }),
      );
    });
  });

  describe("asChild prop", () => {
    it("should render as Slot when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      );

      const link = screen.getByRole("link", { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
      // Should not render a button element
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should apply button styles to child element when asChild", () => {
      render(
        <Button asChild variant="gold">
          <a href="/test">Link Button</a>
        </Button>,
      );

      const link = screen.getByRole("link");
      expect(link.className).toContain("bg-gold");
    });
  });

  describe("HTML attributes", () => {
    it("should pass through HTML attributes", () => {
      render(
        <Button type="submit" name="submit-btn" aria-label="Submit form">
          Submit
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("name", "submit-btn");
      expect(button).toHaveAttribute("aria-label", "Submit form");
    });

    it("should support form attribute", () => {
      render(
        <Button type="submit" form="my-form">
          Submit
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("form", "my-form");
    });
  });

  describe("buttonVariants function", () => {
    it("should generate class string for default variant and size", () => {
      const classes = buttonVariants();
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("h-10");
    });

    it("should generate class string for specific variant", () => {
      const classes = buttonVariants({ variant: "destructive" });
      expect(classes).toContain("bg-destructive");
    });

    it("should generate class string for specific size", () => {
      const classes = buttonVariants({ size: "lg" });
      expect(classes).toContain("h-12");
    });

    it("should merge custom className", () => {
      const classes = buttonVariants({ className: "my-custom-class" });
      expect(classes).toContain("my-custom-class");
    });
  });
});
