import { FAQJsonLd } from "@/components/seo/JsonLd";
import type { EntryFaqItem } from "@/lib/entry-faq";

/**
 * Quick answers drawn from the entry's own fields, rendered visibly and as
 * FAQPage structured data (the two always carry the same text).
 */
export function EntryFaq({
  id,
  items,
}: Readonly<{ id: string; items: EntryFaqItem[] }>) {
  if (items.length === 0) return null;

  return (
    <>
      <FAQJsonLd id={`${id}-jsonld`} questions={items} />
      <dl className="space-y-5">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-body text-lg font-semibold text-foreground">
              {item.question}
            </dt>
            <dd className="mt-1 type-reading text-foreground/85">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
