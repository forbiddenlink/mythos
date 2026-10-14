"use client";

import { useEffect, useRef, useState } from "react";
import { SupportNudge } from "@/components/support/SupportNudge";

/**
 * Marks the end of a reading. Once the reader scrolls the closing mark into
 * view, the story counts as finished (a support value moment) and the nudge
 * gets its chance to appear. Each story counts once, however often it is read. Nothing renders before that, and without
 * IntersectionObserver nothing ever does.
 */
export function StoryEndNudge({ storySlug }: { storySlug: string }) {
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
    <div ref={sentinel} className="mt-10 w-full max-w-reading">
      {finished ? (
        <SupportNudge
          moment="story_finished"
          momentKey={storySlug}
          placement="story_read_end"
        />
      ) : null}
    </div>
  );
}
