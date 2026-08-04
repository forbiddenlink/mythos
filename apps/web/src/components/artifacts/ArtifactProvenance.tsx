"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { MythosMark } from "@/components/icons/mythos-marks";
import { getPantheonColor } from "@/lib/pantheon-colors";

export interface ArtifactProvenanceProps {
  pantheonId: string;
  type: string;
  owner?: { name: string; slug: string } | null;
  currentLocation?: string | null;
  origin?: string | null;
  relatedStories?: Array<{ id: string; slug: string; title: string }>;
}

function prettyPantheon(pantheonId: string): string {
  return pantheonId
    .replace(/-pantheon$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Museum-style provenance rail — culture, type, wielder, mythic findspot, associated myths.
 */
export function ArtifactProvenance({
  pantheonId,
  type,
  owner,
  currentLocation,
  origin,
  relatedStories = [],
}: ArtifactProvenanceProps) {
  const rows: Array<{ label: string; value: ReactNode }> = [
    {
      label: "Culture",
      value: (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: getPantheonColor(pantheonId) }}
            aria-hidden
          />
          {prettyPantheon(pantheonId)}
        </span>
      ),
    },
    { label: "Classification", value: type },
  ];

  if (owner) {
    rows.push({
      label: "Associated deity",
      value: (
        <Link
          href={`/deities/${owner.slug}`}
          className="text-gold hover:underline"
        >
          {owner.name}
        </Link>
      ),
    });
  }

  if (currentLocation) {
    rows.push({ label: "Mythic location", value: currentLocation });
  }

  if (origin) {
    rows.push({
      label: "Origin",
      value: <span className="italic text-muted-foreground">{origin}</span>,
    });
  }

  return (
    <aside
      className="border border-bronze/30 bg-midnight/40 p-5"
      aria-label="Artifact provenance"
    >
      <div className="mb-4 flex items-center gap-2">
        <MythosMark id="relic" className="h-4 w-4 text-bronze" />
        <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-parchment/70">
          Provenance
        </h2>
      </div>

      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[7.5rem_1fr] gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0"
          >
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {row.label}
            </dt>
            <dd className="text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {relatedStories.length > 0 && (
        <div className="mt-5 border-t border-border/30 pt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Associated myths
          </p>
          <ul className="space-y-1.5">
            {relatedStories.map((story) => (
              <li key={story.id}>
                <Link
                  href={`/stories/${story.slug}`}
                  className="text-sm text-gold hover:underline"
                >
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
