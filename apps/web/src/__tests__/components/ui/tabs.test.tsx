import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("should render tabs with triggers and content", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Tab 1" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Tab 2" })).toBeInTheDocument();
    });

    it("should render default selected tab content", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
    });

    it("should render multiple tabs in the list", () => {
      render(
        <Tabs defaultValue="first">
          <TabsList>
            <TabsTrigger value="first">First</TabsTrigger>
            <TabsTrigger value="second">Second</TabsTrigger>
            <TabsTrigger value="third">Third</TabsTrigger>
          </TabsList>
          <TabsContent value="first">First content</TabsContent>
          <TabsContent value="second">Second content</TabsContent>
          <TabsContent value="third">Third content</TabsContent>
        </Tabs>,
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });
  });

  describe("Default tab selection", () => {
    it("should select tab specified by defaultValue", () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
    });

    it("should show first tab if defaultValue matches first tab", () => {
      render(
        <Tabs defaultValue="first">
          <TabsList>
            <TabsTrigger value="first">First Tab</TabsTrigger>
            <TabsTrigger value="second">Second Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="first">First content</TabsContent>
          <TabsContent value="second">Second content</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tab", { name: "First Tab" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("Tab switching behavior", () => {
    it("should switch tabs when clicking a different tab trigger", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      // Initially Tab 1 is selected
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");

      // Click Tab 2
      await user.click(screen.getByRole("tab", { name: "Tab 2" }));

      await waitFor(() => {
        expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
      });

      expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should allow switching between multiple tabs", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Switch to Tab 3
      await user.click(screen.getByRole("tab", { name: "Tab 3" }));
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 3");

      // Switch to Tab 2
      await user.click(screen.getByRole("tab", { name: "Tab 2" }));
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");

      // Switch back to Tab 1
      await user.click(screen.getByRole("tab", { name: "Tab 1" }));
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
    });

    it("should not change when clicking already selected tab", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: "Tab 1" }));

      // Should still show Tab 1 content
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
      // onValueChange should not be called when clicking same tab
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard navigation", () => {
    it("should navigate between tabs with arrow keys", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Focus on first tab
      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      tab1.focus();
      expect(document.activeElement).toBe(tab1);

      // Press ArrowRight to move to Tab 2
      await user.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 2" }),
      );

      // Press ArrowRight to move to Tab 3
      await user.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 3" }),
      );
    });

    it("should navigate backwards with ArrowLeft", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab3">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Focus on Tab 3
      const tab3 = screen.getByRole("tab", { name: "Tab 3" });
      tab3.focus();

      // Press ArrowLeft to move to Tab 2
      await user.keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 2" }),
      );

      // Press ArrowLeft to move to Tab 1
      await user.keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 1" }),
      );
    });

    it("should wrap around when navigating past last tab", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab3">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Focus on Tab 3
      const tab3 = screen.getByRole("tab", { name: "Tab 3" });
      tab3.focus();

      // Press ArrowRight to wrap to Tab 1
      await user.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 1" }),
      );
    });

    it("should wrap around when navigating before first tab", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Focus on Tab 1
      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      tab1.focus();

      // Press ArrowLeft to wrap to Tab 3
      await user.keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 3" }),
      );
    });

    it("should activate tab with Enter or Space key", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      // Focus on Tab 1
      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      tab1.focus();

      // Navigate to Tab 2 and activate with Enter
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{Enter}");

      expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("should navigate with Home and End keys", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Focus on Tab 2
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });
      tab2.focus();

      // Press Home to go to first tab
      await user.keyboard("{Home}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 1" }),
      );

      // Press End to go to last tab
      await user.keyboard("{End}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 3" }),
      );
    });
  });

  describe("Custom className application", () => {
    it("should apply custom className to TabsList", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list-class" data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId("tabs-list");
      expect(tabsList).toHaveClass("custom-list-class");
      // Should also have default classes
      expect(tabsList).toHaveClass("inline-flex");
    });

    it("should apply custom className to TabsTrigger", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger-class">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      const trigger = screen.getByRole("tab", { name: "Tab 1" });
      expect(trigger).toHaveClass("custom-trigger-class");
      // Should also have default classes
      expect(trigger).toHaveClass("inline-flex");
    });

    it("should apply custom className to TabsContent", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent
            value="tab1"
            className="custom-content-class"
            data-testid="tab-content"
          >
            Content 1
          </TabsContent>
        </Tabs>,
      );

      const content = screen.getByTestId("tab-content");
      expect(content).toHaveClass("custom-content-class");
      // Should also have default classes
      expect(content).toHaveClass("mt-2");
    });

    it("should merge multiple custom classes", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="class-one class-two" data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId("tabs-list");
      expect(tabsList).toHaveClass("class-one");
      expect(tabsList).toHaveClass("class-two");
    });
  });

  describe("Controlled vs uncontrolled mode", () => {
    it("should work in uncontrolled mode with defaultValue", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");

      await user.click(screen.getByRole("tab", { name: "Tab 2" }));

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
    });

    it("should work in controlled mode with value and onValueChange", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      const { rerender } = render(
        <Tabs value="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");

      // Click Tab 2
      await user.click(screen.getByRole("tab", { name: "Tab 2" }));
      expect(handleValueChange).toHaveBeenCalledWith("tab2");

      // Content shouldn't change until we rerender with new value
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");

      // Rerender with new value
      rerender(
        <Tabs value="tab2" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
    });

    it("should call onValueChange with correct value", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      await user.click(screen.getByRole("tab", { name: "Tab 2" }));
      expect(handleValueChange).toHaveBeenCalledWith("tab2");

      await user.click(screen.getByRole("tab", { name: "Tab 3" }));
      expect(handleValueChange).toHaveBeenCalledWith("tab3");

      expect(handleValueChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("Accessibility", () => {
    it("should have proper tablist role on TabsList", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should have proper tab role on TabsTrigger", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
    });

    it("should have proper tabpanel role on TabsContent", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    });

    it("should have aria-selected=true on active tab", () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("should have aria-controls linking tab to panel", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      const panel = screen.getByRole("tabpanel");

      // Tab should have aria-controls pointing to panel's id
      const ariaControls = tab.getAttribute("aria-controls");
      expect(ariaControls).toBeTruthy();
      expect(panel.getAttribute("id")).toBe(ariaControls);
    });

    it("should have aria-labelledby linking panel to tab", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      const panel = screen.getByRole("tabpanel");

      // Panel should have aria-labelledby pointing to tab's id
      const ariaLabelledBy = panel.getAttribute("aria-labelledby");
      expect(ariaLabelledBy).toBeTruthy();
      expect(tab.getAttribute("id")).toBe(ariaLabelledBy);
    });

    it("should update aria-selected when tab changes", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });

      // Initially Tab 1 is selected
      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab2).toHaveAttribute("aria-selected", "false");

      // Click Tab 2
      await user.click(tab2);

      // Now Tab 2 is selected
      expect(tab1).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Disabled tabs", () => {
    it("should not allow clicking disabled tab", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const disabledTab = screen.getByRole("tab", { name: "Tab 2" });
      await user.click(disabledTab);

      expect(handleValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
    });

    it("should have disabled styling on disabled tab", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const disabledTab = screen.getByRole("tab", { name: "Tab 2" });
      expect(disabledTab).toBeDisabled();
    });

    it("should skip disabled tabs during keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>,
      );

      // Focus on Tab 1
      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      tab1.focus();

      // Press ArrowRight - should skip Tab 2 and go to Tab 3
      await user.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Tab 3" }),
      );
    });
  });

  describe("Orientation", () => {
    it("should support horizontal orientation by default", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId("tabs-list");
      // Default orientation is horizontal
      expect(tabsList).not.toHaveAttribute("aria-orientation", "vertical");
    });

    it("should support vertical orientation", () => {
      render(
        <Tabs defaultValue="tab1" orientation="vertical">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      const tabsList = screen.getByTestId("tabs-list");
      expect(tabsList).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  describe("Refs", () => {
    it("should forward ref to TabsList", () => {
      const ref = vi.fn();

      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it("should forward ref to TabsTrigger", () => {
      const ref = vi.fn();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>,
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });

    it("should forward ref to TabsContent", () => {
      const ref = vi.fn();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>
            Content 1
          </TabsContent>
        </Tabs>,
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    });
  });

  describe("Complete user flow", () => {
    it("should handle a complete navigation scenario", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <Tabs defaultValue="overview" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <h2>Overview Panel</h2>
            <p>This is the overview content.</p>
          </TabsContent>
          <TabsContent value="details">
            <h2>Details Panel</h2>
            <p>This is the details content.</p>
          </TabsContent>
          <TabsContent value="settings">
            <h2>Settings Panel</h2>
            <p>This is the settings content.</p>
          </TabsContent>
        </Tabs>,
      );

      // Verify initial state
      expect(screen.getByText("Overview Panel")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true",
      );

      // Click to navigate to Details
      await user.click(screen.getByRole("tab", { name: "Details" }));
      expect(handleValueChange).toHaveBeenCalledWith("details");
      expect(screen.getByText("Details Panel")).toBeInTheDocument();

      // Use keyboard to navigate to Settings
      const detailsTab = screen.getByRole("tab", { name: "Details" });
      detailsTab.focus();
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{Enter}");

      expect(handleValueChange).toHaveBeenCalledWith("settings");
      expect(screen.getByText("Settings Panel")).toBeInTheDocument();

      // Navigate back to Overview using Home key
      await user.keyboard("{Home}");
      await user.keyboard("{Enter}");

      expect(handleValueChange).toHaveBeenCalledWith("overview");
      expect(screen.getByText("Overview Panel")).toBeInTheDocument();
    });
  });
});
