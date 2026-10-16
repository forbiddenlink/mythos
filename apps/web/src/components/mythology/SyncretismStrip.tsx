import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/section";
import { getDeities } from "@/lib/data/catalog";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { getSyncretismChains } from "@/lib/linked-mentions";
import { getMuseumObjectsFor, getMuseumPortrait } from "@/lib/museum";
import { cn } from "@/lib/utils";

function traditionName(pantheonId: string): string {
  const label = pantheonId.replace(/-pantheon$/, "").replaceAll("-", " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Homepage comparison section: curated groups of figures with related roles
 * (from crossPantheonParallels), each shown as a row of portraits.
 */
export function SyncretismStrip() {
  const chains = getSyncretismChains(4);
  if (chains.length === 0) return null;
  const deities = new Map(getDeities().map((deity) => [deity.slug, deity]));

  return (
    <Section tone="muted" aria-labelledby="compare-strip-title">
      <SectionHeading
        id="compare-strip-title"
        eyebrow="Across traditions"
        title="Compare figures and traditions"
        description="Figures grouped by related roles. A shared role is not, by itself, evidence of a shared origin."
        action={{ href: "/compare/parallels", label: "Browse all parallels" }}
      />
      <ul className="grid gap-5 md:grid-cols-2">
        {chains.map((chain, index) => (
          <li
            key={chain.id}
            className={cn(
              "rounded-lg bg-card p-4 ring-1 ring-border/70 sm:p-5",
              index > 1 && "hidden md:block",
            )}
          >
            <p className="mb-4 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              The {chain.label} parallels
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {chain.members.slice(0, 4).map((member) => {
                const deity = deities.get(member.slug);
                const portrait = deity
                  ? getMuseumPortrait(getMuseumObjectsFor({ deity: deity.id }))
                  : null;
                const image = portrait?.imageUrl ?? deity?.imageUrl;
                return (
                  <li key={member.slug}>
                    <Link
                      href={`/deities/${member.slug}`}
                      className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <span
                        className={cn(
                          "relative block aspect-4/5 overflow-hidden plate-flat",
                          portrait ? "bg-parchment" : "bg-midnight",
                        )}
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={
                              portrait
                                ? portrait.imageAlt || portrait.title
                                : ""
                            }
                            unoptimized={Boolean(portrait)}
                            fill
                            sizes="(min-width: 768px) 8rem, 45vw"
                            className={cn(
                              "motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.025]",
                              portrait
                                ? "object-contain p-2"
                                : "object-cover object-top",
                            )}
                          />
                        ) : (
                          <span
                            className="flex h-full items-center justify-center font-serif text-3xl text-gold-text"
                            aria-hidden="true"
                          >
                            {member.name.charAt(0)}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block font-serif text-base font-semibold leading-tight text-foreground group-hover:text-gold-text">
                        {member.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
                        <span
                          className="inline-block size-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: getPantheonColor(
                              member.pantheonId,
                            ),
                          }}
                          aria-hidden="true"
                        />
                        {traditionName(member.pantheonId)}
                      </span>
                    </Link>
                    {portrait ? (
                      <a
                        href={portrait.url}
                        className="mt-2 flex min-h-11 items-center text-xs text-muted-foreground underline underline-offset-2"
                        title={portrait.title}
                      >
                        {portrait.institution}
                      </a>
                    ) : image ? (
                      <span className="mt-2 block text-xs text-muted-foreground">
                        Illustration
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
