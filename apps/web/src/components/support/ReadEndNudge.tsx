"use client";

import { useEffect, useRef, useState } from "react";
import { SupportNudge } from "@/components/support/SupportNudge";
import type { ValueMoment } from "@/lib/support-nudge";

/**
 * Marks the end of a reading. Once the reader scrolls this mark into view, the
 * reading counts as a support value moment (once per `momentKey`) and the nudge
 * gets its chance to appear. Nothing renders before that, and without
 * IntersectionObserver nothing ever does.
 */
export function ReadEndNudge({
  moment,
  momentKey,
  placement,
  className,
}: {
  moment: ValueMoment;
  momentKey: string;
  placement: string;
  className?: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setFinished(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinel} className={className}>
      {finished ? (
        <SupportNudge
          moment={moment}
          momentKey={momentKey}
          placement={placement}
        />
      ) : null}
    </div>
  );
}
