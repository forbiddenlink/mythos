"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportButton } from "@/components/support/SupportButton";
import { trackEvent } from "@/lib/analytics/events";
import {
  dismissSupportNudge,
  markSupportNudgeShown,
  recordValueMoment,
  shouldShowSupportNudge,
  type ValueMoment,
} from "@/lib/support-nudge";

/**
 * Asks for support at the moment the atlas has just done something useful, and
 * only once the visitor has had that experience several times. Renders nothing
 * the rest of the time.
 */
export function SupportNudge({
  moment,
  placement,
  headline = "Enjoying the atlas?",
  body = "Mythos Atlas is one person researching, writing and building it. A one-time $5 keeps the sources checked and the hosting paid.",
}: {
  moment: ValueMoment;
  placement: string;
  headline?: string;
  body?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    recordValueMoment(moment);

    if (!shouldShowSupportNudge()) return;

    markSupportNudgeShown();
    setVisible(true);
    trackEvent("support_page_viewed", { from: placement });
  }, [moment, placement]);

  if (!visible) return null;

  return (
    <aside
      aria-labelledby="support-nudge-heading"
      className="rounded-lg border border-gold/30 bg-gold/5 p-5 text-center"
    >
      <h2
        id="support-nudge-heading"
        className="font-display text-lg text-foreground"
      >
        {headline}
      </h2>
      <p className="mx-auto mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <SupportButton
          placement={placement}
          label="Chip in $5"
          size="sm"
          variant="gold"
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            dismissSupportNudge();
            setVisible(false);
          }}
        >
          Not now
        </Button>
      </div>
    </aside>
  );
}
