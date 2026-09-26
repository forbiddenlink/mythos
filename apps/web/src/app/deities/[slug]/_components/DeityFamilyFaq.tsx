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
    <section aria-labelledby="family-faq-heading" className="max-w-[68ch]">
      <FAQJsonLd
        id="deity-family-faq-jsonld"
        questions={answers.map(({ question, answer }) => ({
          question,
          answer,
        }))}
      />
      <h2
        id="family-faq-heading"
        className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4"
      >
        {deityName}&apos;s family at a glance
      </h2>
      <p className="text-muted-foreground text-sm mb-5 pl-5">
        From the atlas&apos;s kinship records. Ancient sources often disagree on
        divine genealogy; the full tree is below.
      </p>
      <dl className="space-y-5">
        {answers.map((entry) => (
          <div key={entry.question}>
            <dt className="font-serif text-lg text-foreground">
              {entry.question}
            </dt>
            <dd className="mt-1 font-body text-muted-foreground">
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
    </section>
  );
}
