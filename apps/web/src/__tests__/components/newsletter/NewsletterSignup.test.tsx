import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

afterEach(() => vi.unstubAllGlobals());

function setup() {
  render(<NewsletterSignup placement="footer" />);
  return {
    email: screen.getByLabelText("Email address"),
    consent: screen.getByRole("checkbox"),
    submit: screen.getByRole("button", { name: "Subscribe" }),
  };
}

describe("NewsletterSignup validation", () => {
  it("flags and focuses an empty email, and describes it with the error", () => {
    const { email, consent, submit } = setup();
    fireEvent.click(consent);
    fireEvent.click(submit);
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(consent).not.toHaveAttribute("aria-invalid");
    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription(/valid email address/);
  });

  it("rejects a malformed email before posting", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { email, consent, submit } = setup();
    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.click(consent);
    fireEvent.click(submit);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(email).toHaveAttribute("aria-invalid", "true");
  });

  it("flags and focuses the unticked consent box", () => {
    const { email, consent, submit } = setup();
    fireEvent.change(email, { target: { value: "reader@example.com" } });
    fireEvent.click(submit);
    expect(consent).toHaveAttribute("aria-invalid", "true");
    expect(email).not.toHaveAttribute("aria-invalid");
    expect(consent).toHaveFocus();
    expect(consent).toHaveAccessibleDescription(/tick the box/i);
  });

  it("clears the flag once the field is corrected", () => {
    const { email, consent, submit } = setup();
    fireEvent.click(consent);
    fireEvent.click(submit);
    fireEvent.change(email, { target: { value: "reader@example.com" } });
    expect(email).not.toHaveAttribute("aria-invalid");
  });

  it("flags the email when the server rejects it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 400 })),
    );
    const { email, consent, submit } = setup();
    fireEvent.change(email, { target: { value: "reader@example.com" } });
    fireEvent.click(consent);
    fireEvent.click(submit);
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveFocus();
  });
});
