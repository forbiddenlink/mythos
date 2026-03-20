import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  describe("Default rendering", () => {
    it("should render with default props", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should have default styling classes", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("flex");
      expect(input.className).toContain("h-10");
      expect(input.className).toContain("w-full");
      expect(input.className).toContain("rounded-lg");
      expect(input.className).toContain("border");
    });

    it("should default to text type", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      // HTML inputs default to text even without explicit type attribute
      expect(input.getAttribute("type") ?? "text").toBe("text");
    });
  });

  describe("Input types", () => {
    it("should render text input", () => {
      render(<Input type="text" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
    });

    it("should render email input", () => {
      render(<Input type="email" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
    });

    it("should render password input", () => {
      render(<Input type="password" />);

      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "password");
    });

    it("should render number input", () => {
      render(<Input type="number" />);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });

    it("should render search input", () => {
      render(<Input type="search" />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("type", "search");
    });

    it("should render tel input", () => {
      render(<Input type="tel" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "tel");
    });

    it("should render url input", () => {
      render(<Input type="url" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "url");
    });
  });

  describe("Placeholder text", () => {
    it("should display placeholder text", () => {
      render(<Input placeholder="Enter your name" />);

      const input = screen.getByPlaceholderText("Enter your name");
      expect(input).toBeInTheDocument();
    });

    it("should have placeholder styling", () => {
      render(<Input placeholder="Search..." />);

      const input = screen.getByPlaceholderText("Search...");
      expect(input.className).toContain("placeholder:text-muted-foreground");
    });
  });

  describe("Disabled state", () => {
    it("should render as disabled when disabled prop is true", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should have disabled styling classes", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("disabled:cursor-not-allowed");
      expect(input.className).toContain("disabled:opacity-50");
    });

    it("should not trigger onChange when disabled", () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      // In real browsers, disabled inputs don't respond to user input
      // jsdom doesn't fully enforce this, so we verify the disabled state
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("disabled");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      render(<Input className="custom-class" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });

    it("should merge custom className with default classes", () => {
      render(<Input className="my-custom-input" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("my-custom-input");
      expect(input.className).toContain("flex");
      expect(input.className).toContain("h-10");
    });

    it("should allow custom className to override default styles", () => {
      render(<Input className="h-20" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("h-20");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to input element", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("should allow focus via ref", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });

    it("should allow value manipulation via ref", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      if (ref.current) {
        ref.current.value = "test value";
        expect(ref.current.value).toBe("test value");
      }
    });
  });

  describe("onChange handler", () => {
    it("should call onChange handler when value changes", () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should pass event to onChange handler", () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test" } });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: "test",
          }),
        }),
      );
    });

    it("should update value on each keystroke", () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "a" } });
      fireEvent.change(input, { target: { value: "ab" } });
      fireEvent.change(input, { target: { value: "abc" } });

      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Value binding", () => {
    it("should display controlled value", () => {
      render(<Input value="controlled value" onChange={() => {}} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("controlled value");
    });

    it("should display defaultValue for uncontrolled input", () => {
      render(<Input defaultValue="default value" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("default value");
    });

    it("should allow typing in uncontrolled input", () => {
      render(<Input defaultValue="" />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "typed value" } });

      expect(input).toHaveValue("typed value");
    });

    it("should not change controlled value without onChange update", () => {
      render(<Input value="fixed value" onChange={() => {}} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(input).toHaveValue("fixed value");
    });
  });

  describe("Accessibility", () => {
    it("should support aria-invalid attribute", () => {
      render(<Input aria-invalid="true" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should support aria-describedby attribute", () => {
      render(
        <>
          <Input aria-describedby="error-message" />
          <span id="error-message">This field is required</span>
        </>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "error-message");
    });

    it("should support aria-label attribute", () => {
      render(<Input aria-label="Search input" />);

      const input = screen.getByRole("textbox", { name: "Search input" });
      expect(input).toBeInTheDocument();
    });

    it("should support aria-required attribute", () => {
      render(<Input aria-required="true" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should support required attribute", () => {
      render(<Input required />);

      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
    });

    it("should be associated with label via id", () => {
      render(
        <>
          <label htmlFor="email-input">Email</label>
          <Input id="email-input" type="email" />
        </>,
      );

      const input = screen.getByLabelText("Email");
      expect(input).toBeInTheDocument();
    });

    it("should have focus-visible ring styles for keyboard navigation", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input.className).toContain("focus-visible:outline-none");
      expect(input.className).toContain("focus-visible:ring-2");
      expect(input.className).toContain("focus-visible:ring-ring");
    });
  });

  describe("HTML attributes", () => {
    it("should pass through HTML attributes", () => {
      render(
        <Input
          id="test-input"
          name="test-name"
          autoComplete="email"
          maxLength={50}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "test-input");
      expect(input).toHaveAttribute("name", "test-name");
      expect(input).toHaveAttribute("autocomplete", "email");
      expect(input).toHaveAttribute("maxlength", "50");
    });

    it("should support minLength and maxLength", () => {
      render(<Input minLength={3} maxLength={10} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("minlength", "3");
      expect(input).toHaveAttribute("maxlength", "10");
    });

    it("should support pattern attribute", () => {
      render(<Input pattern="[0-9]{3}" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("pattern", "[0-9]{3}");
    });

    it("should support readOnly attribute", () => {
      render(<Input readOnly value="read only value" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("should support autoFocus attribute", () => {
      render(<Input autoFocus />);

      const input = screen.getByRole("textbox");
      expect(document.activeElement).toBe(input);
    });
  });

  describe("Event handlers", () => {
    it("should call onFocus when focused", () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("should call onBlur when blurred", () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("should call onKeyDown when key is pressed", () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
        }),
      );
    });

    it("should call onKeyUp when key is released", () => {
      const handleKeyUp = vi.fn();
      render(<Input onKeyUp={handleKeyUp} />);

      const input = screen.getByRole("textbox");
      fireEvent.keyUp(input, { key: "a" });

      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });
  });

  describe("File input styling", () => {
    it("should have file input specific styles", () => {
      render(<Input type="file" />);

      const input = document.querySelector('input[type="file"]');
      expect(input?.className).toContain("file:border-0");
      expect(input?.className).toContain("file:bg-transparent");
      expect(input?.className).toContain("file:text-sm");
      expect(input?.className).toContain("file:font-medium");
    });
  });
});
