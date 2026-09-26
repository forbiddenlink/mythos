import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/section";
import { getDeities } from "@/lib/data/catalog";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { getSyncretismChains } from "@/lib/linked-mentions";

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
  const images = new Map(getDeities().map((d) => [d.slug, d.imageUrl]));

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
        {chains.map((chain) => (
          <li
            key={chain.id}
            className="rounded-lg bg-card p-4 ring-1 ring-border/70 sm:p-5"
          >
            <p className="mb-4 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              The {chain.label} parallels
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {chain.members.slice(0, 4).map((member) => {
                const image = images.get(member.slug);
                return (
                  <li key={member.slug}>
                    <Link
                      href={`/deities/${member.slug}`}
                      className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
                        {image ? (
                          <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 8rem, 45vw"
                            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
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
