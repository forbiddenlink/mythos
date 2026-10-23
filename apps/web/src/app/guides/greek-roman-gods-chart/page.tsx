import type { Metadata } from "next";
import Link from "next/link";
import {
  GuideContents,
  GuideFaq,
  GuideNextSteps,
  GuideSection,
} from "@/components/guides/GuideParts";
import { PageHero } from "@/components/layout/page-hero";
import { GuideJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { guideEntity } from "@/lib/guide-entities";
import {
  getChartRows,
  getNameOnlyRows,
  getRomanWithoutGreek,
} from "@/lib/greek-roman-chart";
import { getGuide } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";
import { citedWork } from "@/lib/seo/cited-works";

const SLUG = "greek-roman-gods-chart";
const guide = getGuide(SLUG)!;
const URL = `/guides/${SLUG}`;

export const metadata: Metadata = generateBaseMetadata({
  title: guide.title,
  description:
    "Greek gods and their Roman names in one chart: Zeus and Jupiter, Ares and Mars, Aphrodite and Venus and the rest, with the domains each pair shares, what Rome changed, and a head-to-head page for every pair.",
  url: URL,
  type: "article",
  image: null,
  keywords: [
    "greek vs roman gods",
    "greek and roman gods chart",
    "roman names of greek gods",
    "greek roman god equivalents",
    "zeus jupiter",
    "greek gods roman names planets",
  ],
  articleSection: "Guides",
});

const linkClass =
  "text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current";

function deityHref(id: string): string {
  return guideEntity("deity", id).href;
}

const listFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

function list(items: readonly string[]): string {
  return listFormat.format(items);
}

const QUESTIONS = [
  {
    question: "Who is the Roman equivalent of Zeus?",
    answer:
      "Jupiter. The atlas treats him as the chief god of the Roman state rather than a renamed Zeus: oaths, treaties and magistrates' offices ran under his name, and he shared the Capitoline temple with Juno and Minerva.",
  },
  {
    question: "Is Apollo a Greek or a Roman god?",
    answer:
      "Both. Rome adopted Apollo under his Greek name instead of giving him a Latin one. The atlas has a separate Roman entry for him because Romans used him differently, in plague rites and in the Palatine temple Augustus built.",
  },
  {
    question: "What is the Roman name for Hades?",
    answer:
      "Pluto. The atlas lists Pluto as an alternate name on the Hades entry and has no separate Roman entry for him.",
  },
  {
    question: "Which Roman god has no Greek twin?",
    answer:
      "Janus, the two-faced god of doors, gates and beginnings. The atlas entry notes that Romans themselves knew he had no Greek equivalent.",
  },
  {
    question: "Which planets are named after Roman gods?",
    answer:
      "Mercury, Venus, Mars, Jupiter, Saturn and Neptune carry the Roman names of Hermes, Aphrodite, Ares, Zeus, Cronus and Poseidon. Uranus is the exception: it keeps the Greek name of the sky god.",
  },
  {
    question: "Are Greek and Roman gods the same?",
    answer:
      "Often the same stories, not the same cults. Romans matched their gods to Greek ones and kept the myths, but many Roman gods grew from older Italian roles: Neptune from freshwater and horses, Mars from a farmer's protector, Bacchus beside the Italian god Liber.",
  },
];

export default function GreekRomanGodsChartGuide() {
  const rows = getChartRows();
  const nameOnly = getNameOnlyRows();
  const unpaired = getRomanWithoutGreek();
  const janus = unpaired.find((d) => d.id === "janus");

  const citations = ["aeneid", "theogony"]
    .map(citedWork)
    .filter((work) => work !== undefined);

  return (
    <>
      <GuideJsonLd
        headline={guide.title}
        description={guide.description}
        url={URL}
        about={rows
          .filter((row) => row.pairSlug !== null)
          .slice(0, 4)
          .map((row) => ({
            name: `${row.greek.name} and ${row.roman.name}`,
            url: `/compare/${row.pairSlug}`,
          }))}
        citations={citations}
      />
      <ItemListJsonLd
        name="Greek gods and their Roman counterparts"
        description="Each Greek god in the atlas beside the Roman god it was matched with."
        url={URL}
        items={rows.map((row, index) => ({
          name: `${row.greek.name} and ${row.roman.name}`,
          url: row.pairSlug ? `/compare/${row.pairSlug}` : URL,
          position: index + 1,
        }))}
      />

      <PageHero
        mark="scales"
        tagline="Guide · Greece and Rome"
        title={guide.title}
        description="Which Roman god matches which Greek god, what the two share, and where Rome made the god its own."
        minHeight="min-h-[42vh]"
      />

      <div className="page-shell pb-20">
        <div className="mt-8 max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
          <p>
            Romans matched their gods to Greek ones and kept most of the Greek
            myths, so the chart below is mostly a list of renamings. The
            interesting part is the last column: what each Roman god did that
            the Greek one did not. Every row links to the full head-to-head
            comparison and to both deity entries.
          </p>
        </div>

        <GuideContents
          items={[
            { id: "chart", label: "The chart" },
            { id: "names", label: "Names without their own entry" },
            { id: "no-twin", label: "No Greek twin" },
            { id: "limits", label: "Why it is not one to one" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <GuideSection
          id="chart"
          title="Greek gods and their Roman names"
          intro={`${rows.length} pairs the atlas documents, in the order of the Greek pantheon's roster. Domains come from each deity's entry.`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <caption className="sr-only">
                Greek gods, their Roman counterparts, the domains they share,
                and what changed in Rome
              </caption>
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Greek",
                    "Roman",
                    "Shared domains",
                    "What changed in Rome",
                    "Compare",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="py-3 pr-4 font-serif text-base font-semibold text-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.greek.id}-${row.roman.id}`}
                    className="border-b border-border/70 align-top font-body text-base"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-4 font-serif text-lg font-normal"
                    >
                      <Link
                        href={deityHref(row.greek.id)}
                        className={linkClass}
                      >
                        {row.greek.name}
                      </Link>
                    </th>
                    <td className="py-3 pr-4 font-serif text-lg">
                      <Link
                        href={deityHref(row.roman.id)}
                        className={linkClass}
                      >
                        {row.roman.name}
                      </Link>
                      {row.planet ? (
                        <span className="block font-body text-sm text-gold-text">
                          Planet {row.planet}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 capitalize text-muted-foreground">
                      {row.sharedDomains.length > 0
                        ? list(row.sharedDomains)
                        : "None listed"}
                    </td>
                    <td className="py-3 pr-4 text-foreground/90">
                      {row.difference ?? row.parallelNote}
                      {row.romanOnlyDomains.length > 0 ? (
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Rome adds: {list(row.romanOnlyDomains)}.
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 text-sm">
                      {row.pairSlug ? (
                        <Link
                          href={`/compare/${row.pairSlug}`}
                          className={linkClass}
                        >
                          {row.greek.name} vs {row.roman.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          No comparison page
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GuideSection>

        <GuideSection
          id="names"
          title="Roman names without their own entry"
          intro="The atlas lists these Roman names on the Greek god's entry and has no separate Roman page for them."
        >
          <ul className="grid max-w-[68ch] gap-x-8 gap-y-2 font-body text-lg sm:grid-cols-2">
            {nameOnly.map(({ greek, roman }) => (
              <li key={greek.id}>
                <Link href={deityHref(greek.id)} className={linkClass}>
                  {greek.name}
                </Link>
                <span className="text-muted-foreground"> is {roman}</span>
                {roman === "Saturn" ? (
                  <span className="text-muted-foreground">
                    {" "}
                    (also the planet Saturn)
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </GuideSection>

        <GuideSection id="no-twin" title="A Roman god with no Greek twin">
          <div className="max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
            {janus ? (
              <p>
                <Link href={deityHref(janus.id)} className={linkClass}>
                  {janus.name}
                </Link>{" "}
                is the god of doors, gates and first things, shown with two
                faces. His entry says he has no Greek twin and that Romans knew
                it. January is named for him, and the doors of his shrine in the
                Forum stood open in war and closed in peace.
              </p>
            ) : null}
          </div>
        </GuideSection>

        <GuideSection
          id="limits"
          title="Why the pairing is not one to one"
          intro="Three patterns in the entries explain most of the differences in the chart."
        >
          <ul className="max-w-[68ch] list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-foreground">
            <li>
              <strong className="font-medium">Older Italian gods.</strong>{" "}
              <Link href={deityHref("neptune")} className={linkClass}>
                Neptune
              </Link>{" "}
              was a god of freshwater and horses before he was matched to
              Poseidon, and{" "}
              <Link href={deityHref("bacchus")} className={linkClass}>
                Bacchus
              </Link>{" "}
              shares an altar with the Italian god Liber.
            </li>
            <li>
              <strong className="font-medium">Ancestors and state gods.</strong>{" "}
              <Link href={deityHref("mars")} className={linkClass}>
                Mars
              </Link>{" "}
              and{" "}
              <Link href={deityHref("venus")} className={linkClass}>
                Venus
              </Link>{" "}
              are ancestors of the Roman people, and{" "}
              <Link href={deityHref("jupiter")} className={linkClass}>
                Jupiter
              </Link>{" "}
              presides over oaths and offices.
            </li>
            <li>
              <strong className="font-medium">A name kept as is.</strong>{" "}
              <Link href={deityHref("apollo-roman")} className={linkClass}>
                Apollo
              </Link>{" "}
              crossed over unrenamed, so the chart row looks like a pair of the
              same name.
            </li>
          </ul>
        </GuideSection>

        <GuideSection id="questions" title="Questions readers ask">
          <GuideFaq questions={QUESTIONS} />
        </GuideSection>

        <GuideSection id="next" title="Keep exploring">
          <GuideNextSteps
            links={[
              {
                href: "/compare/pairs",
                label: "Every deity comparison",
                note: "All head-to-head pages, within and across traditions.",
              },
              {
                href: "/guides/greek-gods-family-tree",
                label: "Greek gods family tree",
                note: "Who is whose parent among the 12 Olympians.",
              },
              {
                href: "/pantheons/roman",
                label: "The Roman pantheon",
                note: "Every Roman deity in the atlas.",
              },
              {
                href: "/pantheons/greek",
                label: "The Greek pantheon",
                note: "Every Greek deity in the atlas.",
              },
              {
                href: "/family-tree",
                label: "Interactive family tree",
                note: "Trace the Greek and Roman houses side by side.",
              },
              {
                href: "/guides",
                label: "All guides",
                note: "Epics, novels and games, read against the myths.",
              },
            ]}
          />
        </GuideSection>
      </div>
    </>
  );
}
