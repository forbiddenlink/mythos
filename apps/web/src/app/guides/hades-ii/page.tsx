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
  MythComparison,
} from "@/components/guides/GuideParts";
import { GuideJsonLd } from "@/components/seo/JsonLd";
import { guideEntity } from "@/lib/guide-entities";
import { getGuide } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";
import { citedWork } from "@/lib/seo/cited-works";

const SLUG = "hades-ii";
const guide = getGuide(SLUG)!;
const URL = `/guides/${SLUG}`;
const GAME = "In Hades II";

export const metadata: Metadata = generateBaseMetadata({
  title: guide.title,
  description:
    "Melinoë, Hecate, Chronos, Nemesis, Moros, Thanatos, Hypnos, Nyx and Charon: what the ancient Greek sources say about the characters of Hades II, and where Supergiant's game invents.",
  url: URL,
  type: "article",
  image: null,
  keywords: [
    "Hades II mythology",
    "Hades 2 characters mythology",
    "Melinoe Greek mythology",
    "Melinoe Orphic hymn",
    "Chronos vs Cronus",
    "Hecate Hades II",
    "Nemesis Greek goddess",
    "Moros Greek mythology",
  ],
  articleSection: "Guides",
});

const QUESTIONS = [
  {
    question: "Is Melinoë a real Greek goddess?",
    answer:
      "Yes, but a very obscure one. She is known from a single ancient text, Orphic Hymn 71, which calls her a saffron-veiled daughter of Persephone who sends ghostly apparitions and night terrors to mortals. No myth about her survives, and she has no attested temple or festival.",
  },
  {
    question: "Who are Melinoë's parents in Greek mythology?",
    answer:
      "Orphic Hymn 71 names Persephone as her mother and says Zeus fathered her while taking the form of Plouton, a name for Hades. That phrasing lets modern retellings, including Hades II, treat her as a daughter of Hades and Persephone.",
  },
  {
    question: "Is Chronos in Hades II the same as Cronus?",
    answer:
      "The game merges two figures. Cronus (Kronos) is the Titan who fathered Zeus, Hades and their siblings and was overthrown by Zeus. Chronos is Time personified, a cosmic power in Orphic and early philosophical accounts of creation. Ancient writers already played on the similar names, and Hades II makes them one Titan of Time.",
  },
  {
    question: "Who is Moros in Greek mythology?",
    answer:
      "Moros is Doom, the first child Hesiod lists among the offspring of Night, alongside Death and Sleep. He is a personification with no surviving myths of his own.",
  },
];

export default function HadesIIGuide() {
  const melinoe = guideEntity("deity", "melinoe");
  const persephone = guideEntity("deity", "persephone");
  const hades = guideEntity("deity", "hades");
  const hecate = guideEntity("deity", "hecate");
  const cronus = guideEntity("deity", "cronus");
  const zeus = guideEntity("deity", "zeus");
  const nyx = guideEntity("deity", "nyx");
  const nemesis = guideEntity("deity", "nemesis");
  const thanatos = guideEntity("deity", "thanatos");
  const selene = guideEntity("deity", "selene");
  const odysseus = guideEntity("hero", "odysseus");
  const cerberus = guideEntity("creature", "cerberus");
  const underworld = guideEntity("location", "underworld");
  const tartarus = guideEntity("location", "tartarus");
  const styx = guideEntity("location", "river-styx");
  const olympians = [
    "zeus",
    "hera",
    "poseidon",
    "demeter",
    "apollo",
    "aphrodite",
    "hephaestus",
    "hestia",
    "hermes",
    "artemis",
    "ares",
    "athena",
    "dionysus",
  ].map((id) => guideEntity("deity", id));

  const theogony = "/sources/theogony";
  const citations = [
    "orphic-hymns",
    "theogony",
    "homeric-hymns",
    "iliad",
    "odyssey",
    "works-and-days",
    "argonautica",
    "plutarch-isis-osiris",
  ]
    .map(citedWork)
    .filter((work) => work !== undefined);

  return (
    <>
      <GuideJsonLd
        headline={guide.title}
        description={guide.description}
        url={URL}
        about={[melinoe, hecate, cronus, nemesis, thanatos, nyx].map((e) => ({
          name: e.name,
          url: e.href,
        }))}
        citations={citations}
      />

      <PageHero
        mark="torch"
        tagline="Guide · Hades II"
        title={guide.title}
        description="Supergiant's sequel builds its cast from some of the most obscure figures in Greek religion. Here is what the ancient sources actually say about them, and where the game invents."
        minHeight="min-h-[42vh]"
      />

      <div className="page-shell pb-20">
        <Breadcrumbs />

        <div className="mt-8 max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
          <p>
            Hades II casts Melinoë, princess of the Underworld, against Chronos,
            the Titan of Time, with Hecate as her mentor and a crowd of gods,
            shades and personified powers around them. Some are major deities;
            others survive in a single line of ancient poetry. Each section
            below sets the game beside the sources and links to the full entry.
          </p>
          <p>
            Descriptions of the game are brief and avoid plot details. This is
            an independent guide, not affiliated with Supergiant Games.
          </p>
        </div>

        <GuideContents
          items={[
            { id: "melinoe", label: "Melinoë" },
            { id: "hecate", label: "Hecate" },
            { id: "chronos", label: "Chronos & Cronus" },
            { id: "night", label: "Nyx and her children" },
            { id: "nemesis", label: "Nemesis" },
            { id: "odysseus", label: "Odysseus" },
            { id: "charon", label: "Charon" },
            { id: "olympians", label: "The Olympians" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <GuideSection
          id="game-vs-myth"
          title="The game beside the myths"
          intro="Left: the character's role in the game, in a sentence. Right: the ancient evidence, with the passages to read."
        >
          <MythComparison
            id="melinoe"
            title="Melinoë"
            retellingLabel={GAME}
            retelling={
              <p>
                The playable protagonist: a daughter of Hades and Persephone,
                raised in secret and trained in witchcraft by Hecate to fight
                Chronos.
              </p>
            }
            myth={
              <p>
                Known from one text, Orphic Hymn 71, of the Roman imperial
                period. It calls her saffron-veiled, born by the river Cocytus
                to Persephone, who lay with Zeus while he wore the form of
                Plouton (Hades); she sends airy phantoms and night terrors to
                mortals. No story about her survives. Her personality, her
                training and her war are the game&apos;s invention.
              </p>
            }
            citations={[
              { label: "Orphic Hymn 71", href: "/sources/orphic-hymns" },
            ]}
            entities={[melinoe, persephone, hades]}
          />

          <MythComparison
            id="hecate"
            title="Hecate"
            retellingLabel={GAME}
            retelling={
              <p>
                Melinoë&apos;s mentor and guardian, the witch who commands her
                training ground at the Crossroads.
              </p>
            }
            myth={
              <p>
                Hesiod praises Hecate at length as a goddess Zeus honoured with
                a share of earth, sea and sky. In the Homeric Hymn to Demeter
                she hears Persephone&apos;s cry and joins the search with a
                torch. Later tradition narrows her into the goddess of
                crossroads, ghosts and witchcraft whom Medea serves in
                Apollonius of Rhodes; the game&apos;s Hecate is that later
                figure. Melinoë&apos;s hymn uses language close to
                Hecate&apos;s, which may be why the two are paired.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 411-452", href: theogony },
              {
                label: "Homeric Hymn to Demeter",
                href: "/sources/homeric-hymns",
              },
              {
                label: "Apollonius of Rhodes, Argonautica 3",
                href: "/sources/argonautica",
              },
            ]}
            entities={[hecate]}
          />

          <MythComparison
            id="chronos"
            title="Chronos and Cronus"
            retellingLabel={GAME}
            retelling={
              <p>
                Chronos, the Titan of Time and father of Hades, has returned
                from Tartarus and seized the Underworld. He is the main enemy.
              </p>
            }
            myth={
              <p>
                Two different figures share almost the same name. Cronus is the
                Titan who fathered Hades, Zeus and their siblings, swallowed his
                children, and was overthrown and sent below. Chronos is Time
                personified, a primordial power in Orphic and early
                philosophical accounts of creation. Ancient writers already
                punned on the names (Plutarch notes that the Greeks allegorized
                Cronus as time); the game fuses them into one Titan.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 453-506", href: theogony },
              {
                label: "Plutarch, On Isis and Osiris",
                href: "/sources/plutarch-isis-osiris",
              },
            ]}
            entities={[cronus, zeus, tartarus]}
          />

          <MythComparison
            id="night"
            title="Nyx and her children: Moros, Thanatos, Hypnos"
            retellingLabel={GAME}
            retelling={
              <p>
                Several of Night&apos;s children appear as characters,
                continuing the first game&apos;s family of the Underworld. Moros
                (Doom) comes to Melinoë&apos;s base at the Crossroads as an
                emissary of the Fates; Thanatos (Death) returns from the first
                game.
              </p>
            }
            myth={
              <p>
                Hesiod lists the children Night bore without a partner, and the
                first three are Moros, black Ker and Thanatos, followed by
                Hypnos and the Dreams. Sleep and Death live in Night&apos;s
                house beside Tartarus; in the Iliad the twins carry the fallen
                Sarpedon home, and Sleep recalls how Night once saved him from
                Zeus. Moros has no myths of his own.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 211-225 and 758-766", href: theogony },
              { label: "Homer, Iliad 14 and 16", href: "/sources/iliad" },
            ]}
            entities={[nyx, thanatos]}
          />

          <MythComparison
            id="nemesis"
            title="Nemesis"
            retellingLabel={GAME}
            retelling={
              <p>
                A proud, combative daughter of Night, posted as a sentry at the
                Crossroads, who turns up during Melinoë&apos;s journeys to
                challenge her as a rival or to trade.
              </p>
            }
            myth={
              <p>
                Another child of Night in Hesiod, &lsquo;a pain to mortal
                men&rsquo;: the indignation that answers excess. In Works and
                Days she and Shame abandon the earth at the end of the iron age.
                She had a temple at Rhamnous in Attica, and a lost epic made her
                the mother of Helen.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 223-224", href: theogony },
              {
                label: "Hesiod, Works and Days 197-201",
                href: "/sources/works-and-days",
              },
            ]}
            entities={[nemesis]}
          />

          <MythComparison
            id="odysseus"
            title="Odysseus"
            retellingLabel={GAME}
            retelling={
              <p>
                A strategist at Melinoë&apos;s base who advises her on the fight
                against Chronos.
              </p>
            }
            myth={
              <p>
                Homer&apos;s man of many ways is a living hero, not a shade, but
                he does visit the dead: in Odyssey 11 he calls up the ghosts at
                the edge of the world to consult the prophet Tiresias. His
                cunning, not his strength, is his defining trait in Homer, which
                the game keeps.
              </p>
            }
            citations={[
              { label: "Homer, Odyssey 11", href: "/sources/odyssey" },
            ]}
            entities={[odysseus]}
          />

          <MythComparison
            id="charon"
            title="Charon"
            retellingLabel={GAME}
            retelling={
              <p>
                The ferryman of the dead, who also keeps a shop for Melinoë.
              </p>
            }
            myth={
              <p>
                Charon is absent from Homer and Hesiod. He appears in later
                archaic poetry and becomes familiar from Athenian funerary vase
                painting and drama, ferrying the dead across the marsh of
                Acheron for a coin. The shopkeeping is the game&apos;s joke.
              </p>
            }
            citations={[]}
            entities={[underworld, styx]}
          />
        </GuideSection>

        <GuideSection
          id="olympians"
          title="The Olympians and other powers"
          intro="The Olympians who appear in the game are the standard family of Homer and Hesiod, and their entries describe them as the ancient sources do. Selene, the Moon, and Cerberus, the hound of Hades, are also part of the cast."
        >
          <EntityRoster entities={[...olympians, selene, cerberus]} />
        </GuideSection>

        <GuideSection id="questions" title="Questions players ask">
          <GuideFaq questions={QUESTIONS} />
        </GuideSection>

        <GuideSection id="next" title="Keep exploring">
          <GuideNextSteps
            links={[
              {
                href: "/family-tree",
                label: "The family tree",
                note: "Night's children, the Titans and the Olympians.",
              },
              {
                href: "/stories/abduction-of-persephone",
                label: "The abduction of Persephone",
                note: "How the queen of the Underworld came to rule it.",
              },
              {
                href: "/locations/underworld",
                label: "The Underworld",
                note: "Its rivers, judges and realms, as the Greeks imagined them.",
              },
              {
                href: "/guides/odyssey",
                label: "Homer's Odyssey",
                note: "Odysseus's own visit to the dead, book by book.",
              },
              {
                href: "/quiz",
                label: "Test yourself",
                note: "Quizzes on the Greek gods.",
              },
              {
                href: "/guides",
                label: "All guides",
                note: "Epics, novels and games, read against the myths.",
              },
            ]}
          />
          <p className="mt-8 text-sm text-muted-foreground">
            Hades II is a trademark of Supergiant Games. Mythos Atlas is an
            independent reference; the character summaries above describe roles,
            not game text. See{" "}
            <Link
              href="/sources"
              className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
            >
              Sources
            </Link>{" "}
            for the ancient texts cited here.
          </p>
        </GuideSection>
      </div>
    </>
  );
}
