import Link from "next/link";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import {
  getLinkedMentionsForDeity,
  type LinkedMention,
  type MentionKind,
} from "@/lib/linked-mentions";

const KIND_META: Record<
  MentionKind,
  { label: string; singular: string; mark: MythosMarkId; emptyHint: string }
> = {
  story: {
    label: "Stories",
    singular: "story",
    mark: "scroll",
    emptyHint: "No stories linked yet",
  },
  artifact: {
    label: "Artifacts",
    singular: "artifact",
    mark: "relic",
    emptyHint: "No artifacts linked yet",
  },
  journey: {
    label: "Journeys",
    singular: "journey",
    mark: "compass",
    emptyHint: "No journeys linked yet",
  },
  parallel: {
    label: "Parallels",
    singular: "parallel",
    mark: "scales",
    emptyHint: "No cross-pantheon parallels",
  },
};

// Parallels have their own section on the deity page, so they are not repeated here.
const KIND_ORDER: MentionKind[] = ["story", "artifact", "journey"];

function groupMentions(mentions: LinkedMention[]) {
  const groups = new Map<MentionKind, LinkedMention[]>();
  for (const kind of KIND_ORDER) groups.set(kind, []);
  for (const m of mentions) {
    groups.get(m.kind)?.push(m);
  }
  return groups;
}

/** Whether a deity has stories, artifacts or journeys that mention it. */
export function hasLinkedMentions(deityId: string): boolean {
  return getLinkedMentionsForDeity(deityId).some((m) =>
    KIND_ORDER.includes(m.kind),
  );
}

/** Reverse links: the stories, artifacts and journeys that mention a deity. */
export function LinkedMentions({
  deityId,
  deityName,
}: {
  deityId: string;
  deityName: string;
}) {
  const mentions = getLinkedMentionsForDeity(deityId).filter((m) =>
    KIND_ORDER.includes(m.kind),
  );
  if (mentions.length === 0) return null;

  const groups = groupMentions(mentions);

  return (
    <section aria-label={`Linked mentions for ${deityName}`}>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {KIND_ORDER.map((kind) => {
          const items = groups.get(kind) ?? [];
          if (items.length === 0) return null;
          const meta = KIND_META[kind];
          return (
            <div key={kind}>
              <h3 className="mb-2 flex items-center gap-2 type-h3 text-foreground">
                <MythosMark id={meta.mark} className="h-4 w-4 text-gold-text" />
                {meta.label}
              </h3>
              <ul className="space-y-1.5">
                {items.slice(0, 6).map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="group flex min-h-11 items-center justify-between gap-3 border-b border-border/70 py-2 text-[0.9375rem] hover:border-gold/50"
                    >
                      <span className="text-foreground group-hover:text-gold">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="shrink-0 text-[0.8125rem] capitalize text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              {items.length > 6 && (
                <p className="mt-2 text-[0.8125rem] text-muted-foreground">
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
