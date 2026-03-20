import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  cardVariants,
} from "@/components/ui/card";

describe("Card", () => {
  describe("Card component", () => {
    it("should render with default props", () => {
      render(<Card data-testid="card">Content</Card>);

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
    });

    it("should render children correctly", () => {
      render(
        <Card>
          <span>Child 1</span>
          <span>Child 2</span>
        </Card>,
      );

      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("custom-class");
    });

    it("should pass through HTML attributes", () => {
      render(
        <Card data-testid="card" id="my-card" aria-label="My card">
          Content
        </Card>,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("id", "my-card");
      expect(card).toHaveAttribute("aria-label", "My card");
    });
  });

  describe("Card variants", () => {
    it.each([
      ["default", ""],
      ["glass", "glass-card"],
      ["elevated", "card-elevated"],
    ] as const)("should apply %s variant", (variant, expectedClass) => {
      render(
        <Card variant={variant} data-testid="card">
          Content
        </Card>,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("data-variant", variant);
      if (expectedClass) {
        expect(card).toHaveClass(expectedClass);
      }
    });

    it("should not have data-variant when variant prop is not provided", () => {
      render(<Card data-testid="card">Content</Card>);

      const card = screen.getByTestId("card");
      // When variant is undefined, data-variant attribute is not set
      expect(card).not.toHaveAttribute("data-variant");
    });
  });

  describe("Card asArticle prop", () => {
    it("should not have role attribute by default", () => {
      render(<Card data-testid="card">Content</Card>);

      const card = screen.getByTestId("card");
      expect(card).not.toHaveAttribute("role");
    });

    it('should have role="article" when asArticle is true', () => {
      render(
        <Card asArticle data-testid="card">
          Content
        </Card>,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("role", "article");
    });

    it("should not have role when asArticle is false", () => {
      render(
        <Card asArticle={false} data-testid="card">
          Content
        </Card>,
      );

      const card = screen.getByTestId("card");
      expect(card).not.toHaveAttribute("role");
    });
  });

  describe("CardHeader", () => {
    it("should render with correct data-slot", () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);

      const header = screen.getByTestId("header");
      expect(header).toHaveAttribute("data-slot", "card-header");
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <CardHeader className="custom-header" data-testid="header">
          Content
        </CardHeader>,
      );

      const header = screen.getByTestId("header");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("should render with correct data-slot", () => {
      render(<CardTitle data-testid="title">Title text</CardTitle>);

      const title = screen.getByTestId("title");
      expect(title).toHaveAttribute("data-slot", "card-title");
      expect(screen.getByText("Title text")).toBeInTheDocument();
    });

    it("should have font styling classes", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);

      const title = screen.getByTestId("title");
      expect(title).toHaveClass("font-serif");
      expect(title).toHaveClass("font-semibold");
    });

    it("should apply custom className", () => {
      render(
        <CardTitle className="custom-title" data-testid="title">
          Title
        </CardTitle>,
      );

      const title = screen.getByTestId("title");
      expect(title).toHaveClass("custom-title");
    });
  });

  describe("CardDescription", () => {
    it("should render with correct data-slot", () => {
      render(
        <CardDescription data-testid="desc">Description text</CardDescription>,
      );

      const desc = screen.getByTestId("desc");
      expect(desc).toHaveAttribute("data-slot", "card-description");
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("should have muted foreground class", () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);

      const desc = screen.getByTestId("desc");
      expect(desc).toHaveClass("text-muted-foreground");
    });

    it("should apply custom className", () => {
      render(
        <CardDescription className="custom-desc" data-testid="desc">
          Description
        </CardDescription>,
      );

      const desc = screen.getByTestId("desc");
      expect(desc).toHaveClass("custom-desc");
    });
  });

  describe("CardContent", () => {
    it("should render with correct data-slot", () => {
      render(<CardContent data-testid="content">Main content</CardContent>);

      const content = screen.getByTestId("content");
      expect(content).toHaveAttribute("data-slot", "card-content");
      expect(screen.getByText("Main content")).toBeInTheDocument();
    });

    it("should have padding class", () => {
      render(<CardContent data-testid="content">Content</CardContent>);

      const content = screen.getByTestId("content");
      expect(content).toHaveClass("px-6");
    });

    it("should apply custom className", () => {
      render(
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>,
      );

      const content = screen.getByTestId("content");
      expect(content).toHaveClass("custom-content");
    });
  });

  describe("CardFooter", () => {
    it("should render with correct data-slot", () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);

      const footer = screen.getByTestId("footer");
      expect(footer).toHaveAttribute("data-slot", "card-footer");
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("should have flex styling", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);

      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
    });

    it("should apply custom className", () => {
      render(
        <CardFooter className="custom-footer" data-testid="footer">
          Footer
        </CardFooter>,
      );

      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("custom-footer");
    });
  });

  describe("CardAction", () => {
    it("should render with correct data-slot", () => {
      render(<CardAction data-testid="action">Action content</CardAction>);

      const action = screen.getByTestId("action");
      expect(action).toHaveAttribute("data-slot", "card-action");
      expect(screen.getByText("Action content")).toBeInTheDocument();
    });

    it("should have grid positioning classes", () => {
      render(<CardAction data-testid="action">Action</CardAction>);

      const action = screen.getByTestId("action");
      expect(action).toHaveClass("col-start-2");
      expect(action).toHaveClass("row-span-2");
    });

    it("should apply custom className", () => {
      render(
        <CardAction className="custom-action" data-testid="action">
          Action
        </CardAction>,
      );

      const action = screen.getByTestId("action");
      expect(action).toHaveClass("custom-action");
    });
  });

  describe("Full card composition", () => {
    it("should render a complete card with all subcomponents", () => {
      render(
        <Card asArticle data-testid="card">
          <CardHeader>
            <CardTitle>Zeus</CardTitle>
            <CardDescription>King of the Gods</CardDescription>
            <CardAction>
              <button>Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Zeus is the sky and thunder god in ancient Greek religion.</p>
          </CardContent>
          <CardFooter>
            <span>Greek Pantheon</span>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByRole("article")).toBeInTheDocument();
      expect(screen.getByText("Zeus")).toBeInTheDocument();
      expect(screen.getByText("King of the Gods")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      expect(
        screen.getByText(
          "Zeus is the sky and thunder god in ancient Greek religion.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Greek Pantheon")).toBeInTheDocument();
    });
  });

  describe("cardVariants function", () => {
    it("should generate class string for default variant", () => {
      const classes = cardVariants();
      expect(classes).toContain("bg-card");
      expect(classes).toContain("rounded-xl");
    });

    it("should generate class string for glass variant", () => {
      const classes = cardVariants({ variant: "glass" });
      expect(classes).toContain("glass-card");
    });

    it("should generate class string for elevated variant", () => {
      const classes = cardVariants({ variant: "elevated" });
      expect(classes).toContain("card-elevated");
    });
  });
});
