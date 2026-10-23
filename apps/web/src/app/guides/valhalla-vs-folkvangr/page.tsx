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
import { getDeityById } from "@/lib/data/catalog";
import { guideEntity } from "@/lib/guide-entities";
import { getGuide } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";
import { citedWork } from "@/lib/seo/cited-works";

const SLUG = "valhalla-vs-folkvangr";
const guide = getGuide(SLUG)!;
const URL = `/guides/${SLUG}`;

export const metadata: Metadata = generateBaseMetadata({
  title: guide.title,
  description:
    "Valhalla or Folkvangr? Odin and Freyja each take half of those slain in battle, and Hel takes the rest. Quoted from the Poetic Edda and the Prose Edda, with what the sources do not say.",
  url: URL,
  type: "article",
  image: null,
  keywords: [
    "valhalla vs folkvangr",
    "who goes to valhalla",
    "who goes to folkvangr",
    "folkvangr freyja",
    "norse afterlife",
    "grimnismal",
    "einherjar",
  ],
  articleSection: "Guides",
});

const linkClass =
  "text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current";

function EntityLink({
  kind,
  id,
}: Readonly<{ kind: "deity" | "location"; id: string }>) {
  const entity = guideEntity(kind, id);
  return (
    <Link href={entity.href} className={linkClass}>
      {entity.name}
    </Link>
  );
}

/** A passage reference that links to the work's page in the atlas. */
function Cite({
  work,
  children,
}: Readonly<{ work: "poetic-edda" | "prose-edda"; children: string }>) {
  return (
    <Link href={`/sources/${work}`} className={linkClass}>
      {children}
    </Link>
  );
}

function Quote({
  children,
  cite,
}: Readonly<{ children: React.ReactNode; cite: React.ReactNode }>) {
  return (
    <figure className="my-4 max-w-[68ch] border-l-2 border-gold/50 pl-5">
      <blockquote className="font-body text-lg italic leading-relaxed text-foreground">
        {children}
      </blockquote>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {cite}
      </figcaption>
    </figure>
  );
}

const QUESTIONS = [
  {
    question: "Who goes to Valhalla?",
    answer:
      "Half of those who die in battle. The Poetic Edda has Odin choose them each day in his hall Valhalla (Grimnismal 8, 14). There they fight each day, are healed, and feast (Vafthruthnismal 41, Grimnismal 18).",
  },
  {
    question: "Who goes to Folkvangr?",
    answer:
      "The other half of those who die in battle, chosen by Freyja (Grimnismal 14; Gylfaginning). The sources do not say how she chooses or what the dead do there, beyond that her hall in the field is called Sessrumnir.",
  },
  {
    question: "Where do people who die of illness or old age go?",
    answer:
      "To Hel. The Prose Edda gives the goddess Hel power over nine worlds and says she appoints abodes to those who die from sickness or old age (Gylfaginning). The atlas notes this is a cold, continuing place, not a Christian hell.",
  },
  {
    question: "Is Folkvangr only for women or for peaceful people?",
    answer:
      "No passage quoted on this page says so. Grimnismal and Gylfaginning both describe a split of the battle dead between Odin and Freyja. The idea that Folkvangr receives women, or the dead who did not fight, is a modern reading, not a stated rule.",
  },
  {
    question: "What does Folkvangr mean?",
    answer:
      "Roughly 'field of the folk', which is how Bellows renders it in his notes to the Poetic Edda. Freyja's hall inside it is Sessrumnir, which Snorri calls great and fair.",
  },
  {
    question: "Does every Norse source agree?",
    answer:
      "No. Grimnismal and Gylfaginning split the slain between Odin and Freyja. Snorri's Ynglinga saga instead has Odin's law send the cremated dead to Valhalla with their goods, and Egil's saga has a woman say she will not eat until she sups with Freyja.",
  },
];

export default function ValhallaVsFolkvangrGuide() {
  const freyjaSource = getDeityById("freyja")?.primarySources?.[0];
  const helSource = getDeityById("hel")?.primarySources?.[0];

  const citations = ["poetic-edda", "prose-edda"]
    .map(citedWork)
    .filter((work) => work !== undefined);

  return (
    <>
      <GuideJsonLd
        headline={guide.title}
        description={guide.description}
        url={URL}
        about={[
          { name: "Odin", url: guideEntity("deity", "odin").href },
          { name: "Freyja", url: guideEntity("deity", "freyja").href },
          { name: "Hel", url: guideEntity("deity", "hel").href },
        ]}
        citations={citations}
      />

      <PageHero
        mark="blade"
        tagline="Guide · The Eddas"
        title={guide.title}
        description="Where the Norse sources send the dead, and where they stop saying."
        minHeight="min-h-[42vh]"
      />

      <div className="page-shell pb-20">
        <div className="mt-8 max-w-[68ch] space-y-4 font-body text-lg leading-relaxed text-foreground">
          <p>
            <strong className="font-medium">Short answer:</strong>{" "}
            <EntityLink kind="deity" id="odin" /> takes half of those killed in
            battle to Valhalla, and <EntityLink kind="deity" id="freyja" />{" "}
            takes the other half to Folkvangr. The Poetic Edda and the Prose
            Edda say exactly that, and neither says more about how the halves
            are chosen. Those who die of sickness or old age go to{" "}
            <EntityLink kind="deity" id="hel" />.
          </p>
        </div>

        <GuideContents
          items={[
            { id: "compare", label: "Side by side" },
            { id: "poetic-edda", label: "The Poetic Edda" },
            { id: "prose-edda", label: "The Prose Edda" },
            { id: "disagree", label: "Where sources differ" },
            { id: "unsaid", label: "What the sources do not say" },
            { id: "questions", label: "Questions" },
          ]}
        />

        <GuideSection
          id="compare"
          title="Valhalla, Folkvangr and Hel side by side"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                Valhalla, Folkvangr and Hel compared by ruler, who goes there
                and what the sources say
              </caption>
              <thead>
                <tr className="border-b border-border">
                  {["", "Valhalla", "Folkvangr", "Hel"].map((heading) => (
                    <th
                      key={heading || "row"}
                      scope="col"
                      className="py-3 pr-4 font-serif text-lg font-semibold text-foreground"
                    >
                      {heading || <span className="sr-only">Feature</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-body text-base">
                <tr className="border-b border-border/70 align-top">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-sm font-normal text-muted-foreground"
                  >
                    Ruler
                  </th>
                  <td className="py-3 pr-4">
                    <EntityLink kind="deity" id="odin" />, in{" "}
                    <EntityLink kind="location" id="asgard" />
                  </td>
                  <td className="py-3 pr-4">
                    <EntityLink kind="deity" id="freyja" />, in her hall
                    Sessrumnir
                  </td>
                  <td className="py-3">
                    <EntityLink kind="deity" id="hel" />, in{" "}
                    <EntityLink kind="location" id="helheim" />
                  </td>
                </tr>
                <tr className="border-b border-border/70 align-top">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-sm font-normal text-muted-foreground"
                  >
                    Who goes
                  </th>
                  <td className="py-3 pr-4">
                    Half of the slain in battle, chosen each day
                  </td>
                  <td className="py-3 pr-4">
                    The other half of the slain, chosen by Freyja
                  </td>
                  <td className="py-3">Those who die of sickness or old age</td>
                </tr>
                <tr className="border-b border-border/70 align-top">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-sm font-normal text-muted-foreground"
                  >
                    What the dead do
                  </th>
                  <td className="py-3 pr-4">
                    The einherjar fight each day, are healed, and feast
                  </td>
                  <td className="py-3 pr-4">Not stated in the sources</td>
                  <td className="py-3">
                    Cold monotony, per the atlas entry; not a place of
                    punishment
                  </td>
                </tr>
                <tr className="align-top">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-sm font-normal text-muted-foreground"
                  >
                    Main passages
                  </th>
                  <td className="py-3 pr-4">
                    <Cite work="poetic-edda">Grimnismal 8, 18, 23</Cite>;{" "}
                    <Cite work="poetic-edda">Vafthruthnismal 41</Cite>
                  </td>
                  <td className="py-3 pr-4">
                    <Cite work="poetic-edda">Grimnismal 14</Cite>;{" "}
                    <Cite work="prose-edda">Gylfaginning</Cite>
                  </td>
                  <td className="py-3">
                    <Cite work="prose-edda">Gylfaginning</Cite>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GuideSection>

        <GuideSection
          id="poetic-edda"
          title="What the Poetic Edda says"
          intro={
            <p>
              <Cite work="poetic-edda">Grimnismal</Cite> is a poem in which
              Odin, in disguise, lists the halls of the gods. Two stanzas decide
              the question. Quotations are from Henry Adams Bellows&apos;s
              translation.
            </p>
          }
        >
          <Quote
            cite={
              <>
                <Cite work="poetic-edda">Grimnismal 8</Cite> (Valhalla)
              </>
            }
          >
            The fifth is Glathsheim, and gold-bright there / Stands Valhall
            stretching wide; / And there does Othin each day choose / The men
            who have fallen in fight.
          </Quote>
          <Quote
            cite={
              <>
                <Cite work="poetic-edda">Grimnismal 14</Cite> (Folkvangr)
              </>
            }
          >
            The ninth is Folkvang, where Freyja decrees / Who shall have seats
            in the hall; / The half of the dead each day does she choose, / And
            half does Othin have.
          </Quote>
          <p className="mt-6 max-w-[68ch] font-body text-lg leading-relaxed text-foreground">
            The same poem describes Valhalla in some detail. Its rafters are
            spears and its roof is shields (stanza 9). The cook Andhrimnir boils
            the boar Saehrimnir for the warriors (stanza 18). The hall has 540
            doors, and 800 fighters go through each when they march against the
            wolf (stanza 23). The goat Heidrun stands by the hall and fills a
            pitcher with mead (stanza 25). Valkyries bring the warriors beer
            (stanza 36). In <Cite work="poetic-edda">Vafthruthnismal</Cite> 41,
            the giant says the heroes in Odin&apos;s hall go out to fight each
            day, and &ldquo;fare from the fight / All healed full soon to
            sit.&rdquo;
          </p>
        </GuideSection>

        <GuideSection
          id="prose-edda"
          title="What the Prose Edda adds"
          intro={
            <p>
              Snorri Sturluson wrote the{" "}
              <Cite work="prose-edda">Prose Edda</Cite> around 1220 as a
              handbook for poets, and it is the other main source for both
              halls.
            </p>
          }
        >
          {freyjaSource ? (
            <Quote
              cite={
                <>
                  {freyjaSource.source}. Also in the atlas entry for{" "}
                  <EntityLink kind="deity" id="freyja" />.
                </>
              }
            >
              {freyjaSource.text}
            </Quote>
          ) : null}
          <p className="max-w-[68ch] font-body text-lg leading-relaxed text-foreground">
            Snorri repeats the half-and-half split from Grimnismal and names
            Freyja&apos;s hall: Sessrumnir, which he calls great and fair. He
            also lists &ldquo;Possessor of the Slain&rdquo; among her titles in
            the Skaldskaparmal. For the third destination he gives the goddess
            Hel her own realm:
          </p>
          {helSource ? (
            <Quote
              cite={
                <>
                  {helSource.source}. Also in the atlas entry for{" "}
                  <EntityLink kind="location" id="helheim" />.
                </>
              }
            >
              {helSource.text}
            </Quote>
          ) : null}
        </GuideSection>

        <GuideSection
          id="disagree"
          title="Where the sources differ"
          intro="The tidy Valhalla-or-Folkvangr picture is the Eddas'. Other texts do not match it."
        >
          <ul className="max-w-[68ch] list-disc space-y-4 pl-6 font-body text-lg leading-relaxed text-foreground">
            <li>
              <strong className="font-medium">Ynglinga saga.</strong> In
              Snorri&apos;s history of the early Swedish kings (Heimskringla,
              chapter 8), Odin makes a law that all dead men be burned with
              their property, so that &ldquo;every one will come to Valhalla
              with the riches he had with him upon the pile.&rdquo; Here
              Valhalla receives the cremated dead, with no mention of battle or
              of Freyja&apos;s half (Laing translation).
            </li>
            <li>
              <strong className="font-medium">Egil&apos;s saga.</strong> After
              her brother dies, Egil&apos;s daughter Thorgerd refuses supper:
              &ldquo;none will I have till I sup with Freyja.&rdquo; She expects
              to be with Freyja without having fallen in battle, which neither
              Edda mentions.
            </li>
            <li>
              <strong className="font-medium">When the choice is made.</strong>{" "}
              Grimnismal has both Odin and Freyja choose &ldquo;each day.&rdquo;
              Snorri ties Freyja&apos;s share to the moment she &ldquo;rides to
              the battle.&rdquo; The two texts do not say the same thing about
              timing.
            </li>
          </ul>
        </GuideSection>

        <GuideSection id="unsaid" title="What the sources do not say">
          <ul className="max-w-[68ch] list-disc space-y-3 pl-6 font-body text-lg leading-relaxed text-foreground">
            <li>
              No passage on this page gives a rule for how Freyja or Odin
              chooses. Valor, rank, weapon or sex are all modern guesses.
            </li>
            <li>
              Nothing quoted here says what the dead do in Folkvangr. The
              feasting and fighting belong to Valhalla.
            </li>
            <li>
              Hel is not described as a place of punishment. The atlas entry for{" "}
              <EntityLink kind="location" id="helheim" /> calls it a cold,
              continuing place, not a moral furnace, which differs from
              Christian ideas of hell.
            </li>
            <li>
              The Eddas were written down in Christian Iceland, in the 1200s,
              centuries after the beliefs they describe. Treat each as one
              medieval voice, not a pagan creed (the atlas&apos;s Asgard entry
              makes the same point about Snorri).
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
                href: "/deities/freyja",
                label: "Freyja",
                note: "Lady of the Vanir and keeper of Folkvangr.",
              },
              {
                href: "/deities/odin",
                label: "Odin",
                note: "Ruler of Valhalla and the Aesir.",
              },
              {
                href: "/stories/ragnarok",
                label: "Ragnarok",
                note: "The battle the einherjar are gathered for.",
              },
              {
                href: "/stories/yggdrasil",
                label: "Yggdrasil",
                note: "The world tree and the goat Heidrun above Valhalla.",
              },
              {
                href: "/sources/poetic-edda",
                label: "The Poetic Edda",
                note: "Translations and key scenes.",
              },
              {
                href: "/pantheons/norse",
                label: "The Norse pantheon",
                note: "Every Norse deity in the atlas.",
              },
            ]}
          />
        </GuideSection>
      </div>
    </>
  );
}
