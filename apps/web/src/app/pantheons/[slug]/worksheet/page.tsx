import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/worksheet/PrintButton";
import { buildWorksheet, getWorksheetSlugs } from "@/lib/data/worksheets";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Prerendered for every tradition with enough material; anything else 404s
// from the static not-found page.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getWorksheetSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const worksheet = buildWorksheet(slug);
  if (!worksheet) {
    return generateNotFoundMetadata(
      "Worksheet Not Found",
      "There is no printable worksheet for this tradition.",
    );
  }
  return {
    ...generateBaseMetadata({
      title: `${worksheet.pantheon.name} Printable Worksheet`,
      description: `A printable classroom worksheet on the ${worksheet.pantheon.name}: match figures to their roles, complete family relationships and answer short questions, with an answer key.`,
      url: `/pantheons/${slug}/worksheet`,
    }),
    // A print handout duplicates the pantheon page for search engines.
    robots: { index: false, follow: true },
  };
}

function Blank({ wide = false }: { wide?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block border-b border-[#1b1a17]/60 align-baseline ${wide ? "w-40" : "w-10"}`}
    />
  );
}

export default async function WorksheetPage({ params }: PageProps) {
  const { slug } = await params;
  const worksheet = buildWorksheet(slug);
  if (!worksheet) notFound();
  const { pantheon, matching, roles, family, wordBank, shortAnswers } =
    worksheet;

  return (
    <div
      data-print-page="worksheet"
      className="bg-muted/40 pb-16 print:bg-transparent print:pb-0"
    >
      <div className="border-b border-border/70 bg-background print:hidden">
        <div className="layout-container layout-container-content flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <Link
              href={`/pantheons/${pantheon.slug}`}
              className="inline-flex min-h-11 items-center type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
            >
              ← Back to the {pantheon.name}
            </Link>
            <p className="type-meta text-muted-foreground">
              A4 or US Letter · answer key prints on its own page
            </p>
          </div>
          <PrintButton />
        </div>
      </div>
      <div className="worksheet mx-auto mt-8 max-w-[52rem] bg-white px-6 py-10 font-body text-[#1b1a17] shadow-xl shadow-black/10 ring-1 ring-black/5 sm:px-12 sm:py-14 md:mt-12 print:mt-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0">
        <div className="border-b-2 border-[#1b1a17] pb-4">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#55524a] print:text-black">
            Mythos Atlas · Printable worksheet
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold md:text-4xl">
            {pantheon.name}
          </h1>
          <p className="mt-1 text-sm text-[#55524a] print:text-black">
            {pantheon.culture}
          </p>
          <p className="mt-4 flex flex-wrap gap-x-10 gap-y-2 font-sans text-sm">
            <span>
              Name <Blank wide />
            </span>
            <span>
              Date <Blank wide />
            </span>
          </p>
        </div>

        <section className="worksheet-section mt-8" aria-labelledby="ws-match">
          <h2 id="ws-match" className="font-serif text-xl">
            1. Who&apos;s who
          </h2>
          <p className="mt-1 text-sm">
            Write the letter of each figure&apos;s role next to their name.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-8">
            <ol className="space-y-3">
              {matching.map((m, i) => (
                <li key={m.name} className="flex items-baseline gap-2">
                  <span className="w-5 text-right tabular-nums">{i + 1}.</span>
                  <Blank />
                  <span>{m.name}</span>
                </li>
              ))}
            </ol>
            <ul className="space-y-3">
              {roles.map((r) => (
                <li key={r.letter} className="flex gap-2">
                  <span className="font-semibold">{r.letter}.</span>
                  <span className="capitalize">{r.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {family.length > 0 ? (
          <section
            className="worksheet-section mt-10"
            aria-labelledby="ws-family"
          >
            <h2 id="ws-family" className="font-serif text-xl">
              2. Family and relationships
            </h2>
            <p className="mt-1 text-sm">
              Fill in each blank with a name from the word bank.
            </p>
            <p className="mt-3 border border-[#1b1a17]/40 px-3 py-2 text-sm">
              <span className="font-semibold">Word bank:</span>{" "}
              {wordBank.join(" · ")}
            </p>
            <ol className="mt-4 space-y-3">
              {family.map((f, i) => (
                <li key={f.sentence} className="flex gap-2">
                  <span className="w-5 text-right tabular-nums">{i + 1}.</span>
                  <span>
                    {f.sentence.split("____")[0]}
                    <Blank wide />
                    {f.sentence.split("____")[1]}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="worksheet-section mt-10" aria-labelledby="ws-short">
          <h2 id="ws-short" className="font-serif text-xl">
            {family.length > 0 ? "3" : "2"}. Short answers
          </h2>
          <ol className="mt-4 space-y-6">
            {shortAnswers.map((q, i) => (
              <li key={q.question}>
                <p>
                  {i + 1}. {q.question}
                </p>
                <div className="mt-2 space-y-5" aria-hidden="true">
                  <div className="border-b border-[#1b1a17]/40" />
                  <div className="border-b border-[#1b1a17]/40" />
                  <div className="border-b border-[#1b1a17]/40" />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="worksheet-answer-key mt-16 border-t-2 border-dashed border-[#1b1a17]/50 pt-8 print:mt-0 print:border-0 print:pt-0"
          aria-labelledby="ws-key"
        >
          <h2 id="ws-key" className="font-serif text-2xl">
            Answer key: {pantheon.name}
          </h2>
          <h3 className="mt-6 font-serif text-lg">1. Who&apos;s who</h3>
          <ol className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            {matching.map((m, i) => (
              <li key={m.name}>
                {i + 1}. {m.name}: <strong>{m.letter}</strong>
              </li>
            ))}
          </ol>
          {family.length > 0 ? (
            <>
              <h3 className="mt-6 font-serif text-lg">
                2. Family and relationships
              </h3>
              <ol className="mt-2 space-y-1 text-sm">
                {family.map((f, i) => (
                  <li key={f.sentence}>
                    {i + 1}. <strong>{f.answer}</strong>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
          <h3 className="mt-6 font-serif text-lg">
            {family.length > 0 ? "3" : "2"}. Short answers (guidance)
          </h3>
          <ol className="mt-2 space-y-2 text-sm">
            {shortAnswers.map((q, i) => (
              <li key={q.question}>
                {i + 1}. {q.keyNote}{" "}
                <span className="text-[#55524a] print:text-black">
                  (mythosatlas.com{q.href})
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-xs text-[#55524a] print:text-black">
            Generated from the Mythos Atlas catalog. Traditions vary between
            sources; accept well-supported alternatives.
          </p>
        </section>
      </div>
    </div>
  );
}
