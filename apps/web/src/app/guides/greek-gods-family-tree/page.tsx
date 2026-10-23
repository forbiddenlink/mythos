import type { Metadata } from "next";
import Link from "next/link";
import {
  GuideContents,
  GuideFaq,
  GuideNextSteps,
  GuideSection,
} from "@/components/guides/GuideParts";
import { PageHero } from "@/components/layout/page-hero";
import { GuideJsonLd } from "@/components/seo/JsonLd";
import { guideEntity } from "@/lib/guide-entities";
import {
  childrenOf,
  domainsOf,
  MOTHERS_OUTSIDE_ATLAS,
  OLYMPIAN_IDS,
  parentsOf,
  relationshipById,
  TWELFTH_SEAT_IDS,
} from "@/lib/greek-family";
import { getGuide } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";
import { citedWork } from "@/lib/seo/cited-works";

const SLUG = "greek-gods-family-tree";
const guide = getGuide(SLUG)!;
const URL = `/guides/${SLUG}`;

export const metadata: Metadata = generateBaseMetadata({
  title: guide.title,
  description:
    "Greek gods family tree in plain lists: Gaia and Uranus, the Titans, Zeus and his siblings, and the 12 Olympians with their parents, the Hesiod lines behind each link, and where the sources disagree.",
  url: URL,
  type: "article",
  image: null,
  keywords: [
    "greek gods family tree",
    "greek gods family tree simple",
    "12 olympians",
    "who are the 12 olympian gods",
    "zeus parents",
    "aphrodite parents",
    "hestia or dionysus olympian",
  ],
  articleSection: "Guides",
});

const linkClass =
  "text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current";

function deity(id: string) {
  return guideEntity("deity", id);
}

function DeityLink({ id }: Readonly<{ id: string }>) {
  const entity = deity(id);
  return (
    <Link href={entity.href} className={linkClass}>
      {entity.name}
    </Link>
  );
}

/** "Theogony 453–458" style locator for the table, or a dash when none. */
function cite(locator: string | null): string {
  return locator ?? "Not cited in the atlas";
}

/** Passages for Olympians whose parentage the atlas records only as a variant. */
const VARIANT_PASSAGES: Record<string, string> = {
  aphrodite: "Theogony 188–206; Iliad 5.370–371",
};

interface OlympianRow {
  id: string;
  name: string;
  href: string;
  domains: string;
  father: { id: string; name: string } | null;
  mother: { id: string; name: string } | { name: string } | null;
  locator: string | null;
  note: string | null;
}

function olympianRow(id: string): OlympianRow {
  const entity = deity(id);
  const parents = parentsOf(id);
  const undisputed = parents.filter((p) => !p.disputed);
  const father = undisputed.find((p) => p.gender === "male") ?? null;
  const atlasMother = undisputed.find((p) => p.gender === "female") ?? null;
  const outside = MOTHERS_OUTSIDE_ATLAS[id];
  const disputed = parents.find((p) => p.disputed);
  return {
    id,
    name: entity.name,
    href: entity.href,
    domains: domainsOf(id).slice(0, 3).join(", "),
    father: father ? { id: father.id, name: father.name } : null,
    mother: atlasMother
      ? { id: atlasMother.id, name: atlasMother.name }
      : outside
        ? { name: outside }
        : null,
    locator:
      undisputed[0]?.locator ??
      disputed?.locator ??
      VARIANT_PASSAGES[id] ??
      null,
    note: disputed?.note ?? null,
  };
}

function ParentCell({
  parent,
}: Readonly<{ parent: { id?: string; name: string } | null }>) {
  if (!parent) return <span className="text-muted-foreground">See below</span>;
  if (parent.id) return <DeityLink id={parent.id} />;
  return <span>{parent.name}</span>;
}

const QUESTIONS = [
  {
    question: "Who are Zeus's parents?",
    answer:
      "Cronus and Rhea. Hesiod lists their six children as Hestia, Demeter, Hera, Hades, Poseidon and Zeus, with Zeus the youngest (Theogony 453-491). Cronus swallowed the first five at birth and Zeus later made him bring them up.",
  },
  {
    question: "Who are the 12 Olympian gods?",
    answer:
      "Eleven names are steady: Zeus, Hera, Poseidon, Demeter, Athena, Apollo, Artemis, Ares, Aphrodite, Hephaestus and Hermes. The twelfth seat goes to Hestia in some lists and to Dionysus in others. Hades rules the dead and is usually not counted among the twelve.",
  },
  {
    question: "Was Hestia or Dionysus the twelfth Olympian?",
    answer:
      "Both appear in the twelfth seat, depending on the list. Ancient lists of the twelve vary. The story that Hestia gave her seat to Dionysus is a modern retelling (Robert Graves, The Greek Myths, 1955), not an ancient myth.",
  },
  {
    question: "Who are Aphrodite's parents?",
    answer:
      "The sources give two answers. Hesiod has her born from the foam around the severed genitals of Uranus, so she has no mother or father in the usual sense (Theogony 188-206). Homer calls her the daughter of Zeus and Dione (Iliad 5.370-371).",
  },
  {
    question: "Who is Hephaestus's father?",
    answer:
      "Hesiod says Hera bore Hephaestus without Zeus (Theogony 924-929). Other traditions name Zeus as his father, and the atlas records that link as disputed.",
  },
  {
    question: "Was Hades one of the Olympians?",
    answer:
      "Hades is a son of Cronus and Rhea and a brother of Zeus, so he belongs to the same generation. He lives in the underworld and is normally left out of the twelve who sit on Olympus.",
  },
];

export default function GreekGodsFamilyTreeGuide() {
  const olympians = [...OLYMPIAN_IDS, ...TWELFTH_SEAT_IDS].map(olympianRow);

  // Grandchildren of Cronus outside the twelve, taken from the Olympians'
  // own recorded children.
  const olympianSet = new Set<string>([...OLYMPIAN_IDS, ...TWELFTH_SEAT_IDS]);
  const beyond = [...OLYMPIAN_IDS, "hades"]
    .flatMap((id) => childrenOf(id))
    .filter((child) => !olympianSet.has(child.id))
    .filter(
      (child, index, all) => all.findIndex((c) => c.id === child.id) === index,
    );

  const hephaestusDispute = relationshipById("r13");
  const dioscuri = relationshipById("greek-zeus-dioscuri");
  const melinoe = relationshipById("greek-zeus-melinoe");

  const citations = ["theogony", "iliad", "homeric-hymns"]
    .map(citedWork)
    .filter((work) => work !== undefined);

  return (
    <>
      <GuideJsonLd
        headline={guide.title}
        description={guide.description}
        url={URL}
        about={["zeus", "hera", "cronus", "gaia"].map((id) => ({
          name: deity(id).name,
          url: deity(id).href,
        }))}
        citations={citations}
      />

      <PageHero
        mark="tree"
        tagline="Guide · Hesiod"
        title={guide.title}
        description="Who comes from whom among the primordials, Titans and 12 Olympians, as plain lists you can read top to bottom."
        minHeight="min-h-[42vh]"
      />

      <div className="page-shell pb-20">
        <div className="mt-8 max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
          <p>
            The short version: Earth (<DeityLink id="gaia" />) and Sky (
            <DeityLink id="uranus" />) bear the Titans. The Titans{" "}
            <DeityLink id="cronus" /> and <DeityLink id="rhea" /> bear the first
            generation of Olympians. <DeityLink id="zeus" /> and his siblings
            then fill out the twelve with their own children. Every link below
            comes from the atlas&apos;s kinship records, which cite{" "}
            <Link href="/sources/theogony" className={linkClass}>
              Hesiod&apos;s Theogony
            </Link>{" "}
            wherever Hesiod names the parents.
          </p>
          <p>
            For a drag-and-zoom version of the same data, open the{" "}
            <Link href="/family-tree" className={linkClass}>
              interactive family tree
            </Link>
            . This page is the plain-text version of it: no scripts needed, and
            every name links to its entry.
          </p>
        </div>

        <GuideContents
          items={[
            { id: "tree", label: "The tree" },
            { id: "olympians", label: "The 12 Olympians" },
            { id: "twelfth-seat", label: "Hestia or Dionysus" },
            { id: "variants", label: "Where the sources differ" },
            { id: "beyond", label: "Children of the gods" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <GuideSection
          id="tree"
          title="The tree, generation by generation"
          intro="Read each list as parents followed by children. A name in italics is a figure the atlas has no entry for."
        >
          <ul className="max-w-[68ch] space-y-5 font-body text-lg leading-relaxed text-foreground">
            <li>
              <span className="font-serif text-xl">The first beings.</span>{" "}
              Hesiod begins with Chaos, then <DeityLink id="gaia" /> (Earth),
              who bears <DeityLink id="uranus" /> (Sky) and marries him
              (Theogony 116-138). <DeityLink id="nyx" /> (Night) also comes
              early and bears <DeityLink id="nemesis" /> and{" "}
              <DeityLink id="thanatos" /> without a partner (Theogony 211-225).
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-medium">
                    Gaia and Uranus&apos;s children, the Titans:
                  </strong>{" "}
                  <DeityLink id="cronus" />, <DeityLink id="rhea" /> and{" "}
                  <DeityLink id="tethys" />, among others (Theogony 132-138).
                </li>
                <li>
                  <strong className="font-medium">
                    Other Titans&apos; children:
                  </strong>{" "}
                  <DeityLink id="atlas" /> and <DeityLink id="prometheus" />,
                  sons of Iapetus (Theogony 507-511); <DeityLink id="helios" />
                  , <DeityLink id="selene" /> and <DeityLink id="eos" />,
                  children of Hyperion and Theia (Theogony 371-374).
                </li>
              </ul>
            </li>
            <li>
              <span className="font-serif text-xl">
                Cronus and Rhea&apos;s six children.
              </span>{" "}
              <DeityLink id="hestia" />, <DeityLink id="demeter" />,{" "}
              <DeityLink id="hera" />, <DeityLink id="hades" />,{" "}
              <DeityLink id="poseidon" /> and <DeityLink id="zeus" /> (Theogony
              453-458). Zeus marries his sister Hera (Theogony 921-923).
            </li>
            <li>
              <span className="font-serif text-xl">
                Zeus&apos;s children, by mother.
              </span>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  With Hera: <DeityLink id="ares" /> (Theogony 921-923).
                  Hephaestus is Hera&apos;s son in the atlas&apos;s sources, but
                  not always Zeus&apos;s; see below.
                </li>
                <li>
                  With <em>Metis</em>: <DeityLink id="athena" />, born after
                  Zeus swallowed Metis (Theogony 886-900, 924-926).
                </li>
                <li>
                  With <em>Leto</em>: the twins <DeityLink id="apollo" /> and{" "}
                  <DeityLink id="artemis" /> (Theogony 918-920).
                </li>
                <li>
                  With <em>Maia</em>: <DeityLink id="hermes" /> (Theogony
                  938-939).
                </li>
                <li>
                  With <em>Semele</em>, a mortal: <DeityLink id="dionysus" />{" "}
                  (Theogony 940-942).
                </li>
                <li>
                  With <DeityLink id="demeter" />: <DeityLink id="persephone" />{" "}
                  (Theogony 912-914), who marries <DeityLink id="hades" />.
                </li>
                <li>
                  <DeityLink id="aphrodite" /> has two different parentages; see
                  below.
                </li>
              </ul>
            </li>
          </ul>
        </GuideSection>

        <GuideSection
          id="olympians"
          title="The 12 Olympians and their parents"
          intro="The table is generated from the atlas's kinship records. Where Hesiod names a mother the atlas has no entry for, her name is plain text."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">
                The Olympian gods with their domains, parents and the passage
                that names them
              </caption>
              <thead>
                <tr className="border-b border-border">
                  {["Olympian", "Domain", "Father", "Mother", "Passage"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="py-3 pr-4 font-serif text-base font-semibold text-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {olympians.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/70 align-top font-body text-base"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-4 font-serif text-lg font-normal"
                    >
                      <Link href={row.href} className={linkClass}>
                        {row.name}
                      </Link>
                      {row.id === "hestia" || row.id === "dionysus" ? (
                        <span className="block text-sm text-gold-text">
                          Twelfth seat
                        </span>
                      ) : null}
                    </th>
                    <td className="py-3 pr-4 capitalize text-muted-foreground">
                      {row.domains}
                    </td>
                    <td className="py-3 pr-4">
                      <ParentCell parent={row.father} />
                    </td>
                    <td className="py-3 pr-4">
                      <ParentCell parent={row.mother} />
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {cite(row.locator)}
                      {row.note ? (
                        <span className="mt-1 block">Disputed link, below</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-[68ch] font-body text-muted-foreground">
            Aphrodite has no father in the table because the two main sources
            disagree about who he is. Hephaestus shows only Hera for the same
            reason. Both are explained in{" "}
            <a href="#variants" className={linkClass}>
              Where the sources differ
            </a>
            .
          </p>
        </GuideSection>

        <GuideSection
          id="twelfth-seat"
          title="The twelfth seat: Hestia or Dionysus"
        >
          <div className="max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
            <p>
              Eleven of the twelve are stable. The twelfth is{" "}
              <DeityLink id="hestia" /> in some lists and{" "}
              <DeityLink id="dionysus" /> in others, and you will see both in
              printed charts. Hades is the other name people ask about: he is
              Zeus&apos;s brother and a child of Cronus and Rhea, but he rules
              the underworld, so the usual lists leave him out.
            </p>
            <p>
              The story that Hestia gave up her seat to Dionysus is not an
              ancient myth. No ancient source tells it; it comes from Robert
              Graves&apos;s <em>The Greek Myths</em> (1955), and the
              atlas&apos;s Hestia entry repeats it as a retelling. Ancient lists
              of twelve gods vary by place and author, and there is no single
              canonical list. Hesiod does not give one, and the Theogony places
              Hestia first among Rhea&apos;s children (Theogony 453-454).
              Dionysus&apos;s parents (Zeus and the mortal Semele, Theogony
              940-942) are the same whether or not he is counted among the
              twelve.
            </p>
          </div>
        </GuideSection>

        <GuideSection
          id="variants"
          title="Where the sources differ"
          intro="Two Olympians have parents that depend on which ancient author you read. The page shows both rather than picking one."
        >
          <div className="grid max-w-[68ch] gap-10 font-body text-lg leading-relaxed text-foreground">
            <article id="aphrodite">
              <h3 className="font-serif text-2xl">
                <DeityLink id="aphrodite" />
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-medium">Hesiod:</strong> born from the
                  foam (<em>aphros</em>) that gathered around the severed
                  genitals of Uranus after Cronus threw them into the sea. She
                  has no parents in the ordinary sense, and she is born before
                  Zeus&apos;s generation (Theogony 188-206).
                </li>
                <li>
                  <strong className="font-medium">Homer:</strong> she is the
                  daughter of Zeus and the goddess Dione (Iliad 5.370-371).
                </li>
                <li>
                  <strong className="font-medium">The atlas:</strong> her entry
                  follows Hesiod, so the interactive tree shows no parent for
                  her. It records her as the wife of{" "}
                  <DeityLink id="hephaestus" /> and the lover of{" "}
                  <DeityLink id="ares" /> (Theogony 933-937).
                </li>
              </ul>
            </article>
            <article id="hephaestus">
              <h3 className="font-serif text-2xl">
                <DeityLink id="hephaestus" />
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong className="font-medium">Hesiod:</strong> Hera bore him
                  alone, without a union with Zeus (Theogony 924-929).
                </li>
                <li>
                  <strong className="font-medium">Other traditions:</strong>{" "}
                  Zeus is his father. The atlas keeps that link and marks it as
                  disputed
                  {hephaestusDispute?.confidenceLevel
                    ? ` with ${hephaestusDispute.confidenceLevel} confidence`
                    : ""}
                  .
                </li>
              </ul>
            </article>
            <article id="others">
              <h3 className="font-serif text-2xl">Two more disputed links</h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                {dioscuri?.description ? (
                  <li>
                    <Link href={deity("dioscuri").href} className={linkClass}>
                      {deity("dioscuri").name}
                    </Link>
                    : {dioscuri.description}
                  </li>
                ) : null}
                {melinoe?.description ? (
                  <li>
                    <Link href={deity("melinoe").href} className={linkClass}>
                      {deity("melinoe").name}
                    </Link>
                    : {melinoe.description} The undisputed record gives her
                    mother as <DeityLink id="persephone" />.
                  </li>
                ) : null}
              </ul>
            </article>
          </div>
        </GuideSection>

        <GuideSection
          id="beyond"
          title="Children of the gods"
          intro="Figures the atlas records as children of an Olympian or of Hades or Demeter, outside the twelve. Heroes and demigods have their own entries."
        >
          <ul className="grid max-w-[68ch] gap-x-8 gap-y-3 font-body text-lg sm:grid-cols-2">
            {beyond.map((child) => {
              const parentName = deity(child.parentId).name;
              return (
                <li key={child.id}>
                  <Link href={deity(child.id).href} className={linkClass}>
                    {child.name}
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    · child of {parentName}
                    {child.disputed ? " (disputed)" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 max-w-[68ch] font-body text-muted-foreground">
            Looking for heroes such as Heracles and Perseus? Start from{" "}
            <Link href="/heroes" className={linkClass}>
              the heroes index
            </Link>
            , or read how a modern series reuses these families in{" "}
            <Link
              href="/guides/percy-jackson-titans-curse"
              className={linkClass}
            >
              the Percy Jackson guide
            </Link>
            .
          </p>
        </GuideSection>

        <GuideSection id="questions" title="Questions readers ask">
          <GuideFaq questions={QUESTIONS} />
        </GuideSection>

        <GuideSection id="next" title="Keep exploring">
          <GuideNextSteps
            links={[
              {
                href: "/family-tree",
                label: "Interactive family tree",
                note: "Zoom, pan and trace the shortest chain between two gods.",
              },
              {
                href: "/guides/greek-roman-gods-chart",
                label: "Greek and Roman gods chart",
                note: "The Roman name for each Olympian, and what Rome changed.",
              },
              {
                href: "/pantheons/greek",
                label: "The Greek pantheon",
                note: "Every Greek deity in the atlas.",
              },
              {
                href: "/sources/theogony",
                label: "Hesiod's Theogony",
                note: "The poem most of these links come from.",
              },
              {
                href: "/quiz",
                label: "Test yourself",
                note: "Quizzes on the Greek gods and heroes.",
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
