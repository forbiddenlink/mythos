import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import {
  EntityRoster,
  GuideContents,
  GuideFaq,
  GuideNextSteps,
  GuideSection,
} from "@/components/guides/GuideParts";
import { GuideJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { guideEntity, routeStop, type RouteStop } from "@/lib/guide-entities";
import { getGuide } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";
import { citedWork } from "@/lib/seo/cited-works";

const SLUG = "odyssey";
const guide = getGuide(SLUG)!;
const URL = `/guides/${SLUG}`;

export const metadata: Metadata = generateBaseMetadata({
  title: guide.title,
  description:
    "Where Odysseus goes, book by book: Troy, the Lotus-Eaters, the Cyclops, Circe, the Underworld, the Sirens, Scylla and Charybdis, Calypso and Ithaca, with a 24-book summary of Homer's Odyssey and its cast of gods and mortals.",
  url: URL,
  type: "article",
  image: null,
  keywords: [
    "Odyssey summary",
    "Odyssey book by book",
    "Odysseus journey map",
    "Odysseus route",
    "The Odyssey characters",
    "Homer Odyssey guide",
    "The Odyssey 2026 film Homer",
  ],
  articleSection: "Guides",
});

/** Stops in the order Odysseus reaches them, with the books that tell them. */
const ROUTE: Array<{ id: string; books: string; note: string }> = [
  {
    id: "troy",
    books: "Book 9; the siege is the Iliad's",
    note: "The fleet sails for home after the ten-year war.",
  },
  {
    id: "cicones-coast",
    books: "Book 9",
    note: "A raid on Ismarus; the crews linger and the Cicones strike back.",
  },
  {
    id: "lotus-eaters-island",
    books: "Book 9",
    note: "Scouts who eat the lotus forget their homecoming.",
  },
  {
    id: "cyclops-cave",
    books: "Book 9",
    note: "Odysseus, calling himself Nobody, blinds Polyphemus and earns Poseidon's anger.",
  },
  {
    id: "aeolus-island",
    books: "Book 10",
    note: "The bag of winds, opened within sight of Ithaca.",
  },
  {
    id: "laestrygonians-harbor",
    books: "Book 10",
    note: "Eleven of the twelve ships are destroyed.",
  },
  {
    id: "circe-island",
    books: "Books 10 and 12",
    note: "The men become pigs; Hermes gives Odysseus moly; a year with Circe.",
  },
  {
    id: "underworld",
    books: "Book 11",
    note: "Tiresias's prophecy, his mother's shade, and the heroes of Troy.",
  },
  {
    id: "sirens-strait",
    books: "Book 12",
    note: "Bound to the mast, he hears the song; the crew row with wax in their ears.",
  },
  {
    id: "scylla-charybdis",
    books: "Book 12",
    note: "He steers past the whirlpool and loses six men to Scylla.",
  },
  {
    id: "thrinacia",
    books: "Book 12",
    note: "The crew kill the Sun's cattle; Zeus wrecks the last ship.",
  },
  {
    id: "calypso-island",
    books: "Books 5, 7 and 12",
    note: "Seven years with Calypso until Hermes brings Zeus's order to release him.",
  },
  {
    id: "phaeacia",
    books: "Books 6 to 13",
    note: "Nausicaa finds him; he tells his story at Alcinous's court.",
  },
  {
    id: "ithaca",
    books: "Books 13 to 24",
    note: "Home in disguise, the bow, the suitors, and Penelope's test.",
  },
];

/** A plain summary of each of Homer's 24 books. */
const BOOKS: Array<{ n: number; title: string; summary: string }> = [
  {
    n: 1,
    title: "The gods in council",
    summary:
      "Odysseus is held on Calypso's island. Athena wins Zeus's agreement to bring him home and, disguised as Mentes, urges his son Telemachus to stand up to the suitors besieging his mother Penelope.",
  },
  {
    n: 2,
    title: "Assembly on Ithaca",
    summary:
      "Telemachus calls an assembly that fails to curb the suitors, and sails secretly with Athena, now disguised as Mentor, to seek news of his father.",
  },
  {
    n: 3,
    title: "Pylos",
    summary:
      "Old Nestor receives Telemachus and tells of the Greeks' scattered homecomings, including Agamemnon's murder, then sends him on to Sparta.",
  },
  {
    n: 4,
    title: "Sparta",
    summary:
      "Menelaus and Helen tell stories of Troy; Menelaus reports that the sea-god Proteus saw Odysseus captive on Calypso's island. On Ithaca the suitors plan an ambush.",
  },
  {
    n: 5,
    title: "Calypso",
    summary:
      "Hermes brings Zeus's command, Calypso lets Odysseus go, and he builds a raft. Poseidon wrecks it; the sea-goddess Ino lends him her veil and he swims ashore on Scheria.",
  },
  {
    n: 6,
    title: "Nausicaa",
    summary:
      "The Phaeacian princess Nausicaa, washing clothes by the river, finds the shipwrecked stranger and tells him how to approach her parents.",
  },
  {
    n: 7,
    title: "The palace of Alcinous",
    summary:
      "Odysseus supplicates Queen Arete and King Alcinous, who promise him passage home.",
  },
  {
    n: 8,
    title: "Games and songs",
    summary:
      "Odysseus proves himself at the Phaeacian games. The bard Demodocus sings of Ares and Aphrodite and of the wooden horse, and Odysseus weeps.",
  },
  {
    n: 9,
    title: "Nobody",
    summary:
      "He reveals his name and begins his tale: the Cicones, the Lotus-Eaters, and the cave of the Cyclops Polyphemus.",
  },
  {
    n: 10,
    title: "Aeolus, the Laestrygonians, Circe",
    summary:
      "The bag of winds, the loss of eleven ships, and a year on Circe's island after she turns his men into pigs.",
  },
  {
    n: 11,
    title: "The dead",
    summary:
      "At the edge of the world he calls up the dead: the prophet Tiresias, his mother Anticlea, and the shades of Agamemnon, Achilles and Ajax.",
  },
  {
    n: 12,
    title: "The Sirens and the Sun's cattle",
    summary:
      "The Sirens, Scylla and Charybdis, and Thrinacia, where the crew eat the cattle of the Sun and are destroyed. Odysseus alone drifts to Calypso's island.",
  },
  {
    n: 13,
    title: "Ithaca at last",
    summary:
      "The Phaeacians carry him home asleep; Poseidon turns their ship to stone. Athena disguises Odysseus as an old beggar.",
  },
  {
    n: 14,
    title: "The swineherd",
    summary:
      "The loyal swineherd Eumaeus shelters the beggar without recognizing his master.",
  },
  {
    n: 15,
    title: "Telemachus returns",
    summary:
      "Warned by Athena, Telemachus sails home from Sparta and avoids the suitors' ambush.",
  },
  {
    n: 16,
    title: "Father and son",
    summary:
      "In Eumaeus's hut Odysseus reveals himself to Telemachus, and they plan the suitors' downfall.",
  },
  {
    n: 17,
    title: "The beggar at the palace",
    summary:
      "Odysseus enters his own hall in disguise. His old dog Argos knows him and dies. The suitors mock and strike him.",
  },
  {
    n: 18,
    title: "Irus",
    summary:
      "He beats the palace beggar Irus in a fight; Penelope appears before the suitors and draws gifts from them.",
  },
  {
    n: 19,
    title: "The scar",
    summary:
      "Penelope questions the stranger by night. The old nurse Eurycleia, washing his feet, recognizes a scar from a boar hunt and is sworn to silence.",
  },
  {
    n: 20,
    title: "Omens",
    summary:
      "Signs of doom gather over the suitors' last feast; the seer Theoclymenus sees the hall running with blood.",
  },
  {
    n: 21,
    title: "The bow",
    summary:
      "Penelope offers to marry whoever can string Odysseus's bow and shoot through twelve axes. No suitor can; the beggar does.",
  },
  {
    n: 22,
    title: "The suitors",
    summary:
      "With Telemachus and two loyal herdsmen, Odysseus kills the suitors and punishes the disloyal servants.",
  },
  {
    n: 23,
    title: "The bed",
    summary:
      "Penelope tests him with their bed, built around a living olive tree, and only then accepts that he is her husband.",
  },
  {
    n: 24,
    title: "Peace",
    summary:
      "The suitors' shades go down to Hades. Odysseus reveals himself to his father Laertes, and Athena ends the feud with the suitors' families.",
  },
];

const QUESTIONS = [
  {
    question: "How long was Odysseus away from Ithaca?",
    answer:
      "Twenty years: ten at the siege of Troy and ten more getting home. Homer says he returns in the twentieth year, and seven of the ten years of wandering are spent on Calypso's island.",
  },
  {
    question: "How many books are in the Odyssey?",
    answer:
      "Twenty-four. Books 1 to 4 follow Telemachus; Books 5 to 12 bring Odysseus from Calypso's island to Phaeacia, where he tells his earlier adventures himself (Books 9 to 12); Books 13 to 24 take place on Ithaca.",
  },
  {
    question: "Where did Odysseus go on his journey home?",
    answer:
      "From Troy to the Cicones at Ismarus, the Lotus-Eaters, the Cyclops's island, Aeolus's floating island, the Laestrygonians, Circe's island of Aeaea, the Underworld, past the Sirens and Scylla and Charybdis to Thrinacia, then to Calypso's Ogygia, Phaeacia (Scheria), and finally Ithaca.",
  },
  {
    question: "Is the Trojan Horse in the Odyssey?",
    answer:
      "Only as a story told after the fact: Menelaus recalls it in Book 4, the bard Demodocus sings of it in Book 8, and the shade of Achilles hears of Neoptolemus inside it in Book 11. The Iliad ends before the horse, and the fullest ancient telling is in Virgil's Aeneid.",
  },
];

const GEOGRAPHY_LABEL: Record<RouteStop["geography"], string> = {
  physical: "Real place",
  identified: "Mythic place, later identified with a real site",
  mythic: "Mythic realm",
};

export default function OdysseyGuide() {
  const stops = ROUTE.map((stop) => ({ ...stop, place: routeStop(stop.id) }));

  const heroes = [
    "odysseus",
    "penelope",
    "helen",
    "agamemnon",
    "achilles",
    "ajax",
  ].map((id) => guideEntity("hero", id));
  const gods = ["athena", "poseidon", "hermes", "zeus", "helios", "atlas"].map(
    (id) => guideEntity("deity", id),
  );
  const cyclops = guideEntity("creature", "cyclops");

  const castNotes: Record<string, string> = {
    [heroes[0].href]: "Protagonist, Books 1-24",
    [heroes[1].href]: "His wife, holding off the suitors",
    [heroes[2].href]: "Hosts Telemachus at Sparta, Book 4",
    [heroes[3].href]: "His shade warns Odysseus, Book 11",
    [heroes[4].href]: "His shade speaks of death, Book 11",
    [heroes[5].href]: "His shade refuses to speak, Book 11",
    [gods[0].href]: "Odysseus's protector throughout",
    [gods[1].href]: "Pursues him for blinding Polyphemus",
    [gods[2].href]: "Brings moly (Book 10) and Zeus's order (Book 5)",
    [gods[3].href]: "Allows the homecoming; wrecks the last ship",
    [gods[4].href]: "Owner of the cattle of Thrinacia",
    [gods[5].href]: "Father of Calypso, Book 1",
    [cyclops.href]: "Polyphemus, son of Poseidon, Book 9",
  };

  const citations = ["odyssey", "iliad", "aeneid"]
    .map(citedWork)
    .filter((work) => work !== undefined);

  return (
    <>
      <GuideJsonLd
        headline={guide.title}
        description={guide.description}
        url={URL}
        about={[
          { name: "Odyssey", url: "/sources/odyssey" },
          ...heroes.slice(0, 2).map((e) => ({ name: e.name, url: e.href })),
        ]}
        citations={citations}
      />
      <ItemListJsonLd
        name="Odysseus's route home"
        description="The places Odysseus reaches in Homer's Odyssey, in order."
        url={URL}
        items={stops.map((stop, index) => ({
          name: stop.place.name,
          url: stop.place.href,
          position: index + 1,
        }))}
      />

      <PageHero
        mark="trident"
        tagline="Guide · Homer"
        title={guide.title}
        description="Twenty years, fourteen landfalls and twenty-four books: where Odysseus goes, what happens in each book, and who he meets on the way."
        minHeight="min-h-[42vh]"
      />

      <div className="page-shell pb-20">
        <Breadcrumbs />

        <div className="mt-8 max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
          <p>
            Christopher Nolan&apos;s <em>The Odyssey</em> (2026) has sent a new
            generation to Homer&apos;s poem. This guide is about the poem
            itself: the route, the story book by book, and the gods and mortals
            in it, each linked to its entry in the atlas. It does not describe
            or review the film; wherever an adaptation departs from Homer, the
            text below is the place to check.
          </p>
        </div>

        <GuideContents
          items={[
            { id: "route", label: "The route" },
            { id: "books", label: "Book by book" },
            { id: "cast", label: "Cast" },
            { id: "screen", label: "Before you watch" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <GuideSection
          id="route"
          title="Odysseus's route home"
          intro={
            <p>
              Homer never gives coordinates, and only Troy, the Cicones&apos;
              Ismarus and Ithaca are places a traveller could plan to reach. The
              others were located by later Greek and Roman readers, mostly
              around Sicily and southern Italy; each entry says which kind of
              place it is. Trace them on the map in the{" "}
              <Link
                href="/journeys/odyssey"
                className="text-gold-text underline-offset-4 hover:underline"
              >
                Odyssey journey
              </Link>
              .
            </p>
          }
        >
          <ol className="space-y-6 border-l border-gold/40 pl-6">
            {stops.map((stop, index) => (
              <li key={stop.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[33px] top-1 flex size-4 items-center justify-center rounded-full border border-gold bg-background text-[10px] text-gold-text"
                />
                <p className="page-eyebrow text-muted-foreground">
                  {index + 1}. {stop.books} ·{" "}
                  {GEOGRAPHY_LABEL[stop.place.geography]}
                </p>
                <Link
                  href={stop.place.href}
                  className="font-serif text-xl text-foreground underline-offset-4 hover:text-gold-text hover:underline"
                >
                  {stop.place.name}
                </Link>
                <p className="mt-1 font-body text-lg text-foreground/90">
                  {stop.note}
                </p>
                <p className="mt-1 font-body text-muted-foreground">
                  {stop.place.description}
                </p>
              </li>
            ))}
          </ol>
        </GuideSection>

        <GuideSection
          id="books"
          title="The Odyssey book by book"
          intro="A plain summary of each of Homer's twenty-four books. The poem opens in the tenth year of the wandering, and Odysseus tells the famous adventures himself, as a flashback, in Books 9 to 12."
        >
          <ol className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {BOOKS.map((book) => (
              <li key={book.n}>
                <p className="font-serif text-lg text-foreground">
                  <span className="text-gold-text">Book {book.n}.</span>{" "}
                  {book.title}
                </p>
                <p className="mt-1 font-body text-muted-foreground">
                  {book.summary}
                </p>
              </li>
            ))}
          </ol>
        </GuideSection>

        <GuideSection
          id="cast"
          title="Cast of characters"
          intro="Figures with their own entries in the atlas. Telemachus, Calypso, Circe, Nausicaa, Tiresias, Eumaeus and Eurycleia appear in the summaries above."
        >
          <EntityRoster
            entities={[...heroes, ...gods, cyclops]}
            notes={castNotes}
          />
        </GuideSection>

        <GuideSection
          id="screen"
          title="Before you watch: what Homer's text does"
          intro="Adaptations compress and reorder. These are features of the poem itself, worth knowing when you compare."
        >
          <ul className="max-w-[68ch] list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-foreground">
            <li>
              The poem begins in the middle: Odysseus is already on
              Calypso&apos;s island, and the first four books belong to his son
              Telemachus.
            </li>
            <li>
              The Cyclops, Circe, the Underworld and the Sirens are told by
              Odysseus himself at the Phaeacian court (Books 9 to 12), so the
              most famous episodes are his own account.
            </li>
            <li>
              Half the poem happens on Ithaca: the disguise, the recognitions,
              the bow and the suitors fill Books 13 to 24.
            </li>
            <li>
              The gods are characters, not symbols. Athena plans and intervenes
              throughout, Poseidon pursues him, and Zeus sends Hermes to free
              him.
            </li>
            <li>
              The wooden horse is only remembered, never shown, and the poem
              ends not with the killing of the suitors but with Athena imposing
              peace on Ithaca.
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
                href: "/journeys/odyssey",
                label: "Map the journey",
                note: "Every landfall on an interactive map.",
              },
              {
                href: "/sources/odyssey",
                label: "The Odyssey as a source",
                note: "Translations, key scenes and the characters it names.",
              },
              {
                href: "/heroes/odysseus",
                label: "Odysseus",
                note: "The man of many ways, from Troy to the Telegony.",
              },
              {
                href: "/stories/trojan-war",
                label: "The Trojan War",
                note: "The war the Odyssey looks back on.",
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
