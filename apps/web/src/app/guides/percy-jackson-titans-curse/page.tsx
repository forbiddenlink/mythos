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

const SLUG = "percy-jackson-titans-curse";
const guide = getGuide(SLUG)!;
const URL = `/guides/${SLUG}`;
const BOOK = "In The Titan's Curse";

export const metadata: Metadata = generateBaseMetadata({
  title: guide.title,
  description:
    "Artemis and her Hunters, Atlas holding the sky, Zoë Nightshade and the Hesperides, the Nemean Lion, Ladon, the Ophiotaurus, Mount Othrys and Kronos, each set beside the ancient Greek sources, with what Riordan invented.",
  url: URL,
  type: "article",
  image: null,
  keywords: [
    "Percy Jackson Titan's Curse mythology",
    "Titan's Curse Greek myths",
    "Percy Jackson season 3",
    "Zoë Nightshade Hesperides",
    "Hunters of Artemis",
    "Ophiotaurus myth",
    "Atlas holding the sky",
    "Mount Othrys",
    "Nemean Lion",
    "Ladon dragon",
  ],
  articleSection: "Guides",
});

const QUESTIONS = [
  {
    question: "Is Zoë Nightshade from Greek mythology?",
    answer:
      "No. Zoë Nightshade is Rick Riordan's character. She is written as one of the Hesperides, the nymphs who tend the golden apples, and ancient writers do name individual Hesperides (Apollodorus lists Aegle, Erythia, Hesperia and Arethusa), but none is called Zoë and no ancient source has a Hesperid help Heracles.",
  },
  {
    question: "Is the Ophiotaurus a real Greek myth?",
    answer:
      "Barely. The creature comes from a short passage in Ovid's Fasti (book 3) about a monster that was a bull in front and a serpent behind, and a prophecy that whoever burned its entrails would overcome the gods. That passage is essentially its only ancient witness; Riordan keeps Ovid's premise.",
  },
  {
    question: "Who holds up the sky in Greek mythology?",
    answer:
      "Atlas. Hesiod says Zeus set him at the western edge of the world, before the Hesperides, to hold up the wide sky. In Apollodorus's account of the golden apples, Heracles takes the sky onto his own shoulders while Atlas fetches the apples, then tricks him into taking it back.",
  },
  {
    question: "Where is Mount Othrys?",
    answer:
      "Mount Othrys is a real mountain range in central Greece, south of the Thessalian plain. Hesiod says the Titans fought the ten-year war against the Olympians from Othrys. Placing it on Mount Tamalpais in California is Riordan's invention.",
  },
];

export default function PercyJacksonTitansCurseGuide() {
  const artemis = guideEntity("deity", "artemis");
  const apollo = guideEntity("deity", "apollo");
  const helios = guideEntity("deity", "helios");
  const atlas = guideEntity("deity", "atlas");
  const cronus = guideEntity("deity", "cronus");
  const zeus = guideEntity("deity", "zeus");
  const dionysus = guideEntity("deity", "dionysus");
  const nyx = guideEntity("deity", "nyx");
  const heracles = guideEntity("hero", "heracles");
  const nemeanLion = guideEntity("creature", "nemean-lion");
  const ladon = guideEntity("creature", "ladon");
  const garden = guideEntity("location", "garden-of-hesperides");
  const othrys = guideEntity("location", "mount-othrys");
  const olympus = guideEntity("location", "mount-olympus");
  const nemea = guideEntity("location", "nemea");

  const theogony = "/sources/theogony";
  const apollodorus = "/sources/library-apollodorus";

  const citations = [
    "theogony",
    "library-apollodorus",
    "homeric-hymns",
    "metamorphoses",
    "argonautica",
    "fasti",
    "odyssey",
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
        about={[artemis, atlas, cronus, nemeanLion, ladon, garden, othrys].map(
          (e) => ({ name: e.name, url: e.href }),
        )}
        citations={citations}
      />

      <PageHero
        mark="constellation"
        tagline="Guide · Percy Jackson"
        title={guide.title}
        description="Every god, monster and place in Rick Riordan's third novel has an ancient source behind it, and Riordan changes nearly all of them. Here is what the Greek texts actually say."
        minHeight="min-h-[42vh]"
      />

      <div className="page-shell pb-20">
        <Breadcrumbs />

        <div className="mt-8 max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
          <p>
            <em>The Titan&apos;s Curse</em> (2007) is the third Percy Jackson
            and the Olympians novel and the basis for the third season of the
            Disney+ series, which premieres on November 20, 2026. Its quest runs
            through some of the oldest material in Greek myth: the Titan who
            holds up the sky, the garden of the golden apples, and the war
            between the Titans and the gods.
          </p>
          <p>
            Each section below sets the novel beside the ancient sources, with
            links to the full entries in the atlas. Descriptions of the novel
            are brief and contain spoilers. This is an independent guide, not
            affiliated with Rick Riordan, Disney or the series.
          </p>
        </div>

        <GuideContents
          items={[
            { id: "artemis", label: "Artemis & the Hunters" },
            { id: "apollo", label: "Apollo" },
            { id: "atlas", label: "Atlas" },
            { id: "hesperides", label: "Zoë & the Hesperides" },
            { id: "nemean-lion", label: "Nemean Lion" },
            { id: "ladon", label: "Ladon" },
            { id: "ophiotaurus", label: "Ophiotaurus" },
            { id: "othrys", label: "Mount Othrys" },
            { id: "kronos", label: "Kronos" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <GuideSection
          id="book-vs-myth"
          title="The novel beside the myths"
          intro="Left: what the novel does, in a sentence or two. Right: what the Greek sources say, with the passages to read."
        >
          <MythComparison
            id="artemis"
            title="Artemis and the Hunters"
            retellingLabel={BOOK}
            retelling={
              <p>
                Artemis leads the Hunters, a band of immortal girls who have
                sworn off romance and follow her across the country. She is
                captured, and the quest to find her drives the plot.
              </p>
            }
            myth={
              <p>
                Artemis, daughter of Zeus and Leto and twin of Apollo, is the
                huntress of the mountains and protector of young women and wild
                animals. The Homeric Hymn to Artemis shows her hunting and then
                leading the dance at Delphi. Her companions are nymphs: Ovid
                tells of Callisto, expelled from the band after Zeus seduced
                her, and of Actaeon, who saw the goddess bathing with her
                nymphs. An order of immortal Hunters recruiting modern girls is
                Riordan&apos;s invention.
              </p>
            }
            citations={[
              {
                label: "Homeric Hymn 27, To Artemis",
                href: "/sources/homeric-hymns",
              },
              {
                label: "Ovid, Metamorphoses 2 (Callisto) and 3 (Actaeon)",
                href: "/sources/metamorphoses",
              },
            ]}
            entities={[artemis]}
          />

          <MythComparison
            id="apollo"
            title="Apollo and the sun"
            retellingLabel={BOOK}
            retelling={
              <p>
                Apollo drives the sun chariot, which takes the form of a sports
                car, and gives the heroes a ride.
              </p>
            }
            myth={
              <p>
                Apollo is the god of music, prophecy, healing and archery. The
                sun that crosses the sky in a chariot belongs, in Homer and
                Hesiod, to a different god, Helios. Classical and later writers
                increasingly identified Apollo with the sun, and Riordan uses
                that later, merged figure.
              </p>
            }
            citations={[
              {
                label: "Homeric Hymn 31, To Helios",
                href: "/sources/homeric-hymns",
              },
              { label: "Hesiod, Theogony 371-374", href: theogony },
            ]}
            entities={[apollo, helios]}
          />

          <MythComparison
            id="atlas"
            title="Atlas and the weight of the sky"
            retellingLabel={BOOK}
            retelling={
              <p>
                Atlas is the Titans&apos; general. Free of the sky while others
                are forced to bear it, he leads the enemy; Percy briefly takes
                the weight himself before Atlas is trapped beneath it again.
              </p>
            }
            myth={
              <p>
                Hesiod&apos;s Atlas is a son of Iapetus and brother of
                Prometheus whom Zeus set at the western edge of the world,
                before the Hesperides, to hold up the sky. Apollodorus tells how
                Heracles took the sky onto his own shoulders while Atlas fetched
                the golden apples, then tricked him into taking it back: the
                scene Riordan echoes. Hesiod gives Atlas no command in the war.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 507-520", href: theogony },
              { label: "Apollodorus, Library 2.5.11", href: apollodorus },
            ]}
            entities={[atlas, heracles]}
          />

          <MythComparison
            id="hesperides"
            title="Zoë Nightshade and the Hesperides"
            retellingLabel={BOOK}
            retelling={
              <p>
                Zoë Nightshade, lieutenant of the Hunters, turns out to be a
                daughter of Atlas and one of the Hesperides, cast out for
                helping Heracles. At the end of the novel she is placed among
                the stars.
              </p>
            }
            myth={
              <p>
                The Hesperides tend the golden apples in a garden beyond the
                ocean. Hesiod calls them daughters of Night; later writers make
                them daughters of Atlas. Apollodorus names four (Aegle, Erythia,
                Hesperia and Arethusa), and in Apollonius of Rhodes they mourn
                the serpent Heracles killed. No ancient Hesperid is called Zoë
                or helps Heracles. Her transformation into a constellation
                follows an ancient pattern, like Callisto becoming the Great
                Bear in Ovid.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 215-216", href: theogony },
              { label: "Apollodorus, Library 2.5.11", href: apollodorus },
              {
                label: "Apollonius of Rhodes, Argonautica 4",
                href: "/sources/argonautica",
              },
            ]}
            entities={[garden, nyx, atlas]}
          />

          <MythComparison
            id="nemean-lion"
            title="The Nemean Lion"
            retellingLabel={BOOK}
            retelling={
              <p>
                The lion attacks the heroes inside a museum in Washington, D.C.,
                and they have to find a way past a hide no blade can cut.
              </p>
            }
            myth={
              <p>
                Hesiod has Hera rear the lion and set it on the hills of Nemea.
                Killing it was Heracles&apos; first labour: his arrows glanced
                off, so he trapped it in its two-mouthed cave and strangled it,
                and wore its skin ever after.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 326-332", href: theogony },
              { label: "Apollodorus, Library 2.5.1", href: apollodorus },
            ]}
            entities={[nemeanLion, nemea, heracles]}
          />

          <MythComparison
            id="ladon"
            title="Ladon, the dragon of the garden"
            retellingLabel={BOOK}
            retelling={
              <p>
                A many-headed dragon coils around the tree of golden apples in
                the garden.
              </p>
            }
            myth={
              <p>
                Hesiod mentions an unnamed serpent guarding the golden apples at
                the ends of the earth. Apollodorus gives it a hundred heads and
                many voices; Apollonius of Rhodes names it Ladon and shows it
                lying dead, killed by Heracles, the day before the Argonauts
                arrive.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 333-336", href: theogony },
              { label: "Apollodorus, Library 2.5.11", href: apollodorus },
              {
                label: "Apollonius of Rhodes, Argonautica 4",
                href: "/sources/argonautica",
              },
            ]}
            entities={[ladon, garden]}
          />

          <MythComparison
            id="ophiotaurus"
            title="The Ophiotaurus"
            retellingLabel={BOOK}
            retelling={
              <p>
                A gentle creature, part bull and part serpent, follows Percy.
                Whoever sacrifices it, the heroes learn, gains the power to
                destroy the gods.
              </p>
            }
            myth={
              <p>
                The creature comes from a short passage in Ovid&apos;s{" "}
                <em>Fasti</em> about a monster that was a bull in front and a
                serpent behind, and a prophecy that whoever burned its entrails
                would overcome the gods. That passage is essentially its only
                ancient witness, so Riordan&apos;s premise is Ovid&apos;s,
                nearly unchanged. It has no entry in the atlas because there is
                almost nothing more to say.
              </p>
            }
            citations={[{ label: "Ovid, Fasti 3", href: "/sources/fasti" }]}
            entities={[]}
          />

          <MythComparison
            id="othrys"
            title="Mount Othrys and the garden in California"
            retellingLabel={BOOK}
            retelling={
              <p>
                The Titans rebuild their stronghold on Mount Othrys, which has
                risen on Mount Tamalpais above San Francisco, with the Garden of
                the Hesperides at its foot.
              </p>
            }
            myth={
              <p>
                Othrys is a real mountain range in central Greece, facing
                Olympus across the Thessalian plain. Hesiod names it as the
                Titans&apos; side in their ten-year war with the gods; a palace
                on its summit belongs to later retellings. The garden lies at
                the western edge of the known world. Moving both to California
                is Riordan&apos;s invention, in keeping with his premise that
                the gods follow Western civilization.
              </p>
            }
            citations={[{ label: "Hesiod, Theogony 630-636", href: theogony }]}
            entities={[othrys, garden, olympus]}
          />

          <MythComparison
            id="kronos"
            title="Kronos, lord of time"
            retellingLabel={BOOK}
            retelling={
              <p>
                Kronos, the Titan lord, is slowly regaining his power, and his
                followers prepare for war on Olympus. Across the series,
                Riordan&apos;s Kronos commands time.
              </p>
            }
            myth={
              <p>
                Cronus, youngest of the Titans, overthrew his father Uranus,
                swallowed his own children to escape the same fate, and was
                overthrown by Zeus. He is not a god of time; that is Chronos,
                Time personified, a different figure. The names were confused in
                antiquity (Plutarch notes that the Greeks allegorized Cronus as
                time), and Riordan builds on that confusion.
              </p>
            }
            citations={[
              { label: "Hesiod, Theogony 453-506", href: theogony },
              {
                label: "Plutarch, On Isis and Osiris",
                href: "/sources/plutarch-isis-osiris",
              },
            ]}
            entities={[cronus, zeus]}
          />
        </GuideSection>

        <GuideSection
          id="also"
          title="Also in the novel"
          intro={
            <p>
              Dionysus is still the camp director, the Olympian council meets on
              Olympus, and the manticore that attacks early in the book comes
              from Persian lore reported by the Greek writer Ctesias rather than
              from Greek myth proper.
            </p>
          }
        >
          <EntityRoster entities={[dionysus, zeus, heracles, olympus]} />
        </GuideSection>

        <GuideSection id="questions" title="Questions readers ask">
          <GuideFaq questions={QUESTIONS} />
        </GuideSection>

        <GuideSection id="next" title="Keep exploring">
          <GuideNextSteps
            links={[
              {
                href: "/quiz",
                label: "Test yourself",
                note: "Quizzes on the Greek gods and monsters in this guide.",
              },
              {
                href: "/family-tree",
                label: "The Titan family tree",
                note: "Cronus, his children, and the gods who overthrew him.",
              },
              {
                href: "/stories/titanomachy",
                label: "The Titanomachy",
                note: "The ten-year war between the Titans and the Olympians.",
              },
              {
                href: "/stories/labors-of-hercules",
                label: "The labours of Heracles",
                note: "The Nemean Lion and the golden apples, in order.",
              },
              {
                href: "/guides/hades-ii",
                label: "Hades II mythology",
                note: "Another modern retelling, set beside its sources.",
              },
              {
                href: "/guides",
                label: "All guides",
                note: "Epics, novels and games, read against the myths.",
              },
            ]}
          />
          <p className="mt-8 text-sm text-muted-foreground">
            Percy Jackson and the Olympians is a trademark of its owners. Mythos
            Atlas is an independent reference and quotes nothing from the novels
            or the series. See{" "}
            <Link
              href="/sources"
              className="text-gold-text underline-offset-4 hover:underline"
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
