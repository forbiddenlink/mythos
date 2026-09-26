import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Calendar, Users, BookOpen, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { EditorialByline } from "@/components/content/EditorialByline";
import { ShareButton } from "@/components/sharing/ShareButton";
import { hasWorksheet } from "@/lib/data/worksheets";
import ReactMarkdown from "react-markdown";
import pantheonsData from "@/data/pantheons.json";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import { RouteHero } from "@/components/layout/route-hero";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { resolveCosmology } from "@/lib/cosmology";
import { CosmologyDiagram } from "@/components/cosmology/CosmologyDiagram";

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string | null;
  detailedHistory?: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
  imageUrl?: string | null;
  figuresLabel?: string | null;
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  traditionRole?: string | null;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
  summary: string;
  category: string;
}

interface PantheonPageClientProps {
  slug: string;
}

export function PantheonPageClient({ slug }: PantheonPageClientProps) {
  const pantheons = pantheonsData as Pantheon[];
  const allDeities = deitiesData as Deity[];
  const allStories = storiesData as Story[];
  const pantheon = pantheons.find((p) => p.slug === slug);

  if (!pantheon) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Pantheon Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The pantheon you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/pantheons"
            className="text-gold hover:underline mt-4 inline-block"
          >
            View all pantheons
          </Link>
        </div>
      </div>
    );
  }

  const pantheonDeities = allDeities.filter(
    (deity) => deity.pantheonId === pantheon.id,
  );
  const pantheonStories = allStories.filter(
    (story) => story.pantheonId === pantheon.id,
  );
  const cosmology = resolveCosmology(pantheon.id);

  return (
    <div className="min-h-screen bg-mythic">
      <CollectionPageJsonLd
        name={`${pantheon.name} - ${pantheon.culture} Mythology`}
        description={
          pantheon.description ||
          `Explore the ${pantheon.name} from ${pantheon.culture} mythology.`
        }
        url={`/pantheons/${pantheon.slug}`}
        numberOfItems={pantheonDeities.length}
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pantheons-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-40"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(10,10,25,0.92) 0%, ${getPantheonColor(pantheon.id)}40 50%, rgba(10,10,25,0.9) 100%)`,
            }}
          />
        </div>
        <RouteHero
          overlayClassName="bg-transparent"
          contentClassName="max-w-6xl text-left"
        >
          <p className="mb-3 text-sm text-parchment/85">{pantheon.culture}</p>
          <h1 className="page-title text-parchment mb-6">{pantheon.name}</h1>
          {pantheon.description && pantheon.detailedHistory && (
            <p className="max-w-2xl font-body text-xl leading-relaxed text-parchment/85">
              {pantheon.description}
            </p>
          )}
          <nav
            aria-label="On this page"
            className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
          >
            <a
              href="#pantheon-about"
              className="inline-flex min-h-11 items-center text-parchment underline underline-offset-4"
            >
              {pantheon.detailedHistory ? "History and context" : "Context"}
            </a>
            {pantheonDeities.length > 0 && (
              <a
                href="#pantheon-figures"
                className="inline-flex min-h-11 items-center text-parchment underline underline-offset-4"
              >
                {pantheon.figuresLabel || "Deities"}
              </a>
            )}
            {pantheonStories.length > 0 && (
              <a
                href="#pantheon-stories"
                className="inline-flex min-h-11 items-center text-parchment underline underline-offset-4"
              >
                Stories and myths
              </a>
            )}
          </nav>
          <EditorialByline className="mt-4 max-w-2xl" tone="light" />
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <ShareButton
              surface="pantheon_page"
              title={`${pantheon.name} - Mythos Atlas`}
              text={`Explore the ${pantheon.name} of ${pantheon.culture} mythology on Mythos Atlas`}
              url={`https://mythosatlas.com/pantheons/${pantheon.slug}`}
            />
            {hasWorksheet(pantheon.slug) ? (
              <Link
                href={`/pantheons/${pantheon.slug}/worksheet`}
                className="inline-flex min-h-11 items-center gap-2 text-sm text-parchment underline underline-offset-4 hover:text-gold-light"
              >
                <Printer aria-hidden className="h-4 w-4" />
                Printable worksheet
              </Link>
            ) : null}
          </div>
        </RouteHero>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Breadcrumbs />

        {/* Metadata strip — not a stat-card trio */}
        <dl className="mt-8 mb-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-border/70 py-5 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold" aria-hidden />
            <dt className="text-muted-foreground">Region</dt>
            <dd className="font-medium text-foreground">{pantheon.region}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gold" aria-hidden />
            <dt className="text-muted-foreground">Catalog period</dt>
            <dd className="font-medium text-foreground">
              {pantheon.timePeriodStart !== null
                ? `${pantheon.timePeriodEnd === null ? "From " : ""}${Math.abs(pantheon.timePeriodStart)} ${pantheon.timePeriodStart < 0 ? "BCE" : "CE"}${pantheon.timePeriodEnd !== null ? ` – ${Math.abs(pantheon.timePeriodEnd)} ${pantheon.timePeriodEnd < 0 ? "BCE" : "CE"}` : "; end date not recorded"}`
                : pantheon.timePeriodEnd !== null
                  ? `Until ${Math.abs(pantheon.timePeriodEnd)} ${pantheon.timePeriodEnd < 0 ? "BCE" : "CE"}`
                  : "Dates not recorded"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gold" aria-hidden />
            <dt className="text-muted-foreground">
              {pantheon.figuresLabel || "Deities"}
            </dt>
            <dd className="font-medium text-foreground">
              {pantheonDeities.length}
            </dd>
          </div>
        </dl>

        {/* About — borderless editorial prose */}
        <section
          id="pantheon-about"
          className="mb-14 max-w-[68ch] scroll-mt-24"
        >
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            About
          </h2>
          {pantheon.detailedHistory ? (
            <div className="prose dark:prose-invert prose-gold max-w-none">
              <ReactMarkdown>{pantheon.detailedHistory}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed text-lg">
              {pantheon.description}
            </p>
          )}
        </section>

        {cosmology && (
          <CosmologyDiagram
            cosmology={cosmology}
            accent={getPantheonColor(pantheon.id)}
          />
        )}

        {/* Deities Section */}
        <section id="pantheon-figures" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-gold" />
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              {pantheon.figuresLabel || "Deities"}
            </h2>
          </div>

          {pantheonDeities.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pantheonDeities.map((deity) => (
                <Link
                  key={deity.id}
                  href={`/deities/${deity.slug}`}
                  className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Card
                    interactive
                    className="h-full border-border bg-card hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {deity.imageUrl && (
                      <div className="relative w-full aspect-16/10 bg-midnight/40 overflow-hidden border-b border-border/60">
                        <Image
                          src={deity.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent opacity-80" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                        <CardTitle className="font-serif text-xl text-foreground group-hover:text-gold transition-colors">
                          {deity.name}
                        </CardTitle>
                        {deity.traditionRole && (
                          <span className="text-[0.65rem] uppercase tracking-wider text-gold-text border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-medium">
                            {deity.traditionRole}
                          </span>
                        )}
                      </div>
                      {deity.domain && deity.domain.length > 0 && (
                        <CardDescription className="text-gold-text text-xs uppercase tracking-wider font-medium line-clamp-1">
                          {deity.domain.join(" · ")}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {deity.description || "No description available."}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No deities found for this pantheon.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Stories Section */}
        <section id="pantheon-stories" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-gold" />
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              Stories & Myths
            </h2>
          </div>

          {pantheonStories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {pantheonStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Card
                    interactive
                    className="h-full border-border bg-card hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <CardTitle className="font-serif text-xl text-foreground group-hover:text-gold transition-colors">
                          {story.title}
                        </CardTitle>
                        <span className="text-xs uppercase tracking-widest text-gold-text px-2 py-0.5 rounded border border-gold/25 bg-gold/5 font-sans shrink-0">
                          {story.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {story.summary}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No stories found for this pantheon.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
