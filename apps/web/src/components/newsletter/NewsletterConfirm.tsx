"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Status =
  "idle" | "submitting" | "confirmed" | "expired" | "invalid" | "busy" | "error";

const MESSAGES: Partial<Record<Status, string>> = {
  confirmed:
    "You're subscribed. The digest is one email a week, and every email has an unsubscribe link.",
  expired:
    "This link has expired. Sign up again from the footer and we will send a fresh one.",
  invalid:
    "This link is not valid. Sign up again from the footer and we will send a fresh one.",
  busy: "We could not finish this confirmation. Check your inbox, or sign up again from the footer and we will send a fresh link.",
  error: "Something went wrong on our side. Please try again later.",
};

/**
 * The confirm step is a button, not the page load: mail scanners open links
 * automatically, and only a person clicking here should subscribe an address.
 */
export function NewsletterConfirm({ token }: Readonly<{ token: string }>) {
  const [status, setStatus] = useState<Status>(token ? "idle" : "invalid");

  const confirm = async () => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus("confirmed");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { reason?: string };
      if (body.reason === "expired") setStatus("expired");
      else if (res.status === 400) setStatus("invalid");
      else if (res.status === 409 || res.status === 502) setStatus("busy");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const message = MESSAGES[status];
  return (
    <div className="space-y-4">
      {status === "idle" || status === "submitting" ? (
        <Button
          type="button"
          onClick={confirm}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Confirming…" : "Confirm my subscription"}
        </Button>
      ) : null}
      <p role="status" aria-live="polite" className="type-reading">
        {message ?? ""}
      </p>
    </div>
  );
}
