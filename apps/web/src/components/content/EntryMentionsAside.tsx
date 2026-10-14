import { AsideLinks } from "@/components/layout/detail-layout";
import type { EntryMention } from "@/lib/entry-mentions";

/** Aside list of catalog entries named in the entry's own text. */
export function EntryMentionsAside({
  mentions,
}: Readonly<{ mentions: EntryMention[] }>) {
  return (
    <AsideLinks
      title="Mentioned in this entry"
      links={mentions.map((mention) => ({
        href: mention.href,
        label: mention.name,
        meta: mention.meta,
      }))}
    />
  );
}
