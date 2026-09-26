"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics/events";
import type { NewsletterPlacement } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

type Status =
  | "idle"
  | "submitting"
  | "subscribed"
  | "unavailable"
  | "rate_limited"
  | "invalid"
  | "error";

const MESSAGES: Partial<Record<Status, string>> = {
  subscribed: "You're on the list. The next digest arrives this week.",
  unavailable:
    "Sign-ups open soon. Thank you for your interest; nothing was stored.",
  rate_limited: "Too many attempts from this connection. Try again later.",
  invalid: "Enter a valid email address and tick the box to subscribe.",
  error: "Something went wrong on our side. Please try again later.",
};

interface NewsletterSignupProps {
  placement: NewsletterPlacement;
  className?: string;
  /** Heading level-free title shown above the form. */
  title?: string;
  description?: string;
}

/**
 * Weekly myth digest sign-up. Posts to /api/newsletter; a 501 from an
 * unconfigured deployment shows a graceful "sign-ups open soon" state.
 */
export function NewsletterSignup({
  placement,
  className,
  title = "The weekly myth",
  description = "One myth, its sources and a question to think about, each week by email.",
}: Readonly<NewsletterSignupProps>) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent || !email.trim()) {
      setStatus("invalid");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, consent: true, placement, website }),
      });
      if (res.ok) {
        setStatus("subscribed");
        trackEvent("newsletter_signup", { placement });
        return;
      }
      if (res.status === 501 || res.status === 503) setStatus("unavailable");
      else if (res.status === 429) setStatus("rate_limited");
      else if (res.status === 400) setStatus("invalid");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const message = MESSAGES[status];
  const done = status === "subscribed" || status === "unavailable";

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("max-w-lg", className)}
      data-testid={`newsletter-${placement}`}
    >
      <h2
        id={`${id}-title`}
        className="font-serif text-sm font-semibold tracking-wide text-foreground"
      >
        {title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {done ? null : (
        <form onSubmit={onSubmit} className="mt-3 space-y-3" noValidate>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <Input
              id={`${id}-email`}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="gold"
              className="min-h-11 shrink-0"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Subscribing…" : "Subscribe"}
            </Button>
          </div>
          {/* Honeypot for bots; hidden from people and assistive tech. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <input
              id={`${id}-consent`}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
              required
            />
            <label htmlFor={`${id}-consent`}>
              Email me the weekly myth digest. Your address is stored with our
              email provider, Resend, and you can unsubscribe from any email.
              See the{" "}
              <Link href="/privacy#newsletter" className="underline">
                privacy policy
              </Link>
              .
            </label>
          </div>
        </form>
      )}
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "mt-2 text-sm",
          status === "subscribed" || status === "unavailable"
            ? "text-foreground"
            : "text-destructive",
        )}
      >
        {message ?? ""}
      </p>
    </section>
  );
}
