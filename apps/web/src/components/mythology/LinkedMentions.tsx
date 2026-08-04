"use client";

import Link from "next/link";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import {
  getLinkedMentionsForDeity,
  type LinkedMention,
  type MentionKind,
} from "@/lib/linked-mentions";

const KIND_META: Record<
  MentionKind,
  { label: string; mark: MythosMarkId; emptyHint: string }
> = {
  story: {
    label: "Stories",
    mark: "scroll",
    emptyHint: "No stories linked yet",
  },
  artifact: {
    label: "Artifacts",
    mark: "relic",
    emptyHint: "No artifacts linked yet",
  },
  journey: {
    label: "Journeys",
    mark: "compass",
    emptyHint: "No journeys linked yet",
  },
  parallel: {
    label: "Parallels",
    mark: "scales",
    emptyHint: "No cross-pantheon parallels",
  },
};

const KIND_ORDER: MentionKind[] = ["story", "artifact", "journey", "parallel"];

function groupMentions(mentions: LinkedMention[]) {
  const groups = new Map<MentionKind, LinkedMention[]>();
  for (const kind of KIND_ORDER) groups.set(kind, []);
  for (const m of mentions) {
    groups.get(m.kind)?.push(m);
  }
  return groups;
}

/**
 * Above-the-fold reverse links — Met museum lesson: related content dies if buried.
 */
export function LinkedMentions({
  deityId,
  deityName,
}: {
  deityId: string;
  deityName: string;
}) {
  const mentions = getLinkedMentionsForDeity(deityId);
  if (mentions.length === 0) return null;

  const groups = groupMentions(mentions);
  const counts = KIND_ORDER.map((k) => ({
    kind: k,
    count: groups.get(k)?.length ?? 0,
  })).filter((c) => c.count > 0);

  return (
    <section
      className="mb-10 border border-gold/25 bg-card/50 p-5"
      aria-label={`Linked mentions for ${deityName}`}
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold/80">
            In the atlas
          </p>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Referenced across Mythos
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {counts
            .map((c) => `${c.count} ${KIND_META[c.kind].label.toLowerCase()}`)
            .join(" · ")}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {KIND_ORDER.map((kind) => {
          const items = groups.get(kind) ?? [];
          if (items.length === 0) return null;
          const meta = KIND_META[kind];
          return (
            <div key={kind}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <MythosMark id={meta.mark} className="h-4 w-4 text-gold" />
                {meta.label}
              </div>
              <ul className="space-y-1.5">
                {items.slice(0, 6).map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between gap-2 border-b border-border/40 py-1.5 text-sm hover:border-gold/40"
                    >
                      <span className="text-foreground group-hover:text-gold">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="shrink-0 text-xs capitalize text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              {items.length > 6 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  +{items.length - 6} more
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
