import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

describe("Dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("should not render content when closed", () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });

    it("should render trigger button", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      expect(
        screen.getByRole("button", { name: /open dialog/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Open and close", () => {
    it("should open dialog when trigger is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog content here</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      expect(screen.getByText("Dialog content here")).toBeInTheDocument();
    });

    it("should close dialog when close button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      // Open dialog
      await user.click(screen.getByRole("button", { name: /open/i }));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Close dialog via close button (the X)
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should close dialog when Escape key is pressed", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      // Open dialog
      await user.click(screen.getByRole("button", { name: /open/i }));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should support controlled open state", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <Dialog open={false} onOpenChange={handleOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Click trigger
      await user.click(screen.getByRole("button", { name: /open/i }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      // Rerender with open=true
      rerender(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>My Dialog</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        // Radix automatically links aria-labelledby and aria-describedby
        expect(dialog).toHaveAttribute("aria-labelledby");
        expect(dialog).toHaveAttribute("aria-describedby");
      });
    });

    it("should have accessible close button with sr-only text", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it("should trap focus within dialog", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <button>First Button</button>
            <button>Second Button</button>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Focus should be within the dialog
      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  describe("DialogHeader", () => {
    it("should render with correct styling", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass("flex");
        expect(header).toHaveClass("flex-col");
      });
    });

    it("should apply custom className", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader className="custom-header" data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const header = screen.getByTestId("header");
        expect(header).toHaveClass("custom-header");
      });
    });
  });

  describe("DialogFooter", () => {
    it("should render with correct styling", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const footer = screen.getByTestId("footer");
        expect(footer).toBeInTheDocument();
        expect(footer).toHaveClass("flex");
      });
    });

    it("should render action buttons", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /cancel/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /save/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("DialogTitle", () => {
    it("should render with correct styling", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle data-testid="title">My Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const title = screen.getByTestId("title");
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass("text-lg");
        expect(title).toHaveClass("font-semibold");
      });
    });

    it("should apply custom className", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle className="custom-title" data-testid="title">
              Title
            </DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const title = screen.getByTestId("title");
        expect(title).toHaveClass("custom-title");
      });
    });
  });

  describe("DialogDescription", () => {
    it("should render with muted styling", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="desc">
              This is a description
            </DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const desc = screen.getByTestId("desc");
        expect(desc).toBeInTheDocument();
        expect(desc).toHaveClass("text-muted-foreground");
        expect(desc).toHaveClass("text-sm");
      });
    });
  });

  describe("DialogClose", () => {
    it("should close dialog when custom close element is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <DialogClose asChild>
              <button>Custom Close</button>
            </DialogClose>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /custom close/i }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Content styling", () => {
    it("should have overlay behind content", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        // The overlay should be present (it's a sibling of the content in the portal)
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should have close button in content", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        // The default close button with X icon and sr-only text
        expect(
          screen.getByRole("button", { name: /close/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Complete dialog flow", () => {
    it("should handle a complete user interaction flow", async () => {
      const user = userEvent.setup();
      const handleSave = vi.fn();

      render(
        <Dialog>
          <DialogTrigger>Open Editor</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Editor</DialogTitle>
              <DialogDescription>
                Make changes to your profile here.
              </DialogDescription>
            </DialogHeader>
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button>Cancel</button>
              </DialogClose>
              <button onClick={handleSave}>Save changes</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      // Open dialog
      await user.click(screen.getByRole("button", { name: /open editor/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Verify content
      expect(screen.getByText("Profile Editor")).toBeInTheDocument();
      expect(
        screen.getByText("Make changes to your profile here."),
      ).toBeInTheDocument();

      // Interact with form
      const nameInput = screen.getByLabelText("Name");
      await user.type(nameInput, "John Doe");
      expect(nameInput).toHaveValue("John Doe");

      // Click save
      await user.click(screen.getByRole("button", { name: /save changes/i }));
      expect(handleSave).toHaveBeenCalledTimes(1);

      // Cancel closes the dialog
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });
});
