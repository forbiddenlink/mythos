"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/events";

export const SUPPORT_CHECKOUT_URL =
  "https://buy.stripe.com/dRmbJ0b641kOblE3xm0Ny01";

/**
 * Every route to checkout goes through this button so the funnel has exactly
 * one conversion event, tagged with where the visitor clicked from.
 */
export function SupportButton({
  placement,
  label = "Support through Stripe",
  size = "lg",
  variant = "gold",
  href = SUPPORT_CHECKOUT_URL,
}: {
  placement: string;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "gold" | "outline" | "default";
  /** Checkout link; defaults to the one-time payment link. */
  href?: string;
}) {
  return (
    <Button asChild variant={variant} size={size}>
      <a href={href} onClick={() => trackEvent("support_click", { placement })}>
        {label} <ArrowUpRight aria-hidden="true" className="size-4" />
      </a>
    </Button>
  );
}
