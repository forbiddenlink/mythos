import Link from "next/link";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import type { FamilyAnswer } from "@/lib/deity-faq";

/**
 * Family questions answered from the kinship records, rendered visibly and as
 * FAQPage structured data (the two always carry the same text).
 */
export function DeityFamilyFaq({
  deityName,
  answers,
}: Readonly<{ deityName: string; answers: FamilyAnswer[] }>) {
  if (answers.length === 0) return null;

  return (
    <section aria-labelledby="family-faq-heading" className="max-w-reading">
      <FAQJsonLd
        id="deity-family-faq-jsonld"
        questions={answers.map(({ question, answer }) => ({
          question,
          answer,
        }))}
      />
      <details className="rounded-lg border border-border/70 p-4">
        <summary
          id="family-faq-heading"
          className="cursor-pointer font-serif text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Questions about {deityName}&apos;s family
        </summary>
        <dl className="mt-5 space-y-5">
          {answers.map((entry) => (
            <div key={entry.question}>
              <dt className="font-body text-lg font-semibold text-foreground">
                {entry.question}
              </dt>
              <dd className="mt-1 type-reading text-foreground/85">
                {entry.lead}{" "}
                {entry.kin.map((k, index) => (
                  <span key={k.key}>
                    {index > 0
                      ? index === entry.kin.length - 1
                        ? entry.kin.length > 2
                          ? ", and "
                          : " and "
                        : ", "
                      : null}
                    {k.slug ? (
                      <Link
                        href={`/deities/${k.slug}`}
                        className="text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
                      >
                        {k.name}
                      </Link>
                    ) : (
                      k.name
                    )}
                  </span>
                ))}
                {entry.tail}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
