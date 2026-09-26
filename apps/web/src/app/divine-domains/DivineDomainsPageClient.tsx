"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import {
  ChipRow,
  EmptyResults,
  FilterChip,
  FilterToolbar,
} from "@/components/entities/FilterToolbar";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeDeityReference } from "@/lib/deity-reference";
import { getPantheonColor } from "@/lib/pantheon-colors";

interface CrossPantheonParallel {
  pantheonId: string;
  deityId: string;
  note?: string;
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  description?: string | null;
  imageUrl?: string | null;
  alternateNames?: string[];
  importanceRank?: number | null;
  crossPantheonParallels?: CrossPantheonParallel[];
}

/** The domains most traditions share, shown first. */
const PRIMARY_DOMAINS = [
  "war",
  "love",
  "death",
  "wisdom",
  "sea",
  "fertility",
  "sky",
  "underworld",
  "crafts",
  "sun",
  "magic",
  "sovereignty",
];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function DivineDomainsPageClient({
  deities,
  pantheonNames,
  domainPages = {},
}: Readonly<{
  deities: Deity[];
  /** Lower-case catalog domain term → slug of its /gods-of page, if any. */
  domainPages?: Record<string, string>;
  /** Pantheon id → short display name ("Greek"), computed on the server. */
  pantheonNames: Record<string, string>;
}>) {
  const getPantheonName = (pantheonId: string): string =>
    pantheonNames[pantheonId] || pantheonId;
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [pantheonFilter, setPantheonFilter] = useState<string>("all");

  const deityReferenceMap = useMemo(() => {
    const map = new Map<string, Deity>();
    for (const deity of deities) {
      map.set(normalizeDeityReference(deity.id), deity);
      map.set(normalizeDeityReference(deity.slug), deity);
      for (const alternateName of deity.alternateNames ?? [])
        map.set(normalizeDeityReference(alternateName), deity);
    }
    return map;
  }, [deities]);

  // Every domain with its deity count and traditions.
  const domainStats = useMemo(() => {
    const stats = new Map<string, { count: number; pantheons: Set<string> }>();
    for (const deity of deities) {
      for (const raw of deity.domain ?? []) {
        const key = raw.toLowerCase();
        const entry = stats.get(key) ?? {
          count: 0,
          pantheons: new Set<string>(),
        };
        entry.count++;
        entry.pantheons.add(deity.pantheonId);
        stats.set(key, entry);
      }
    }
    return stats;
  }, [deities]);

  // A distinct portrait and a few names per headline domain: deities that
  // list the domain first win, then the more important ones.
  const domainLeads = useMemo(() => {
    const used = new Set<string>();
    const leads = new Map<string, { image: string | null; names: string[] }>();
    for (const domain of PRIMARY_DOMAINS) {
      const holders = deities
        .filter((d) => d.domain?.some((x) => x.toLowerCase() === domain))
        .sort(
          (a, b) =>
            Number(a.domain[0]?.toLowerCase() !== domain) -
              Number(b.domain[0]?.toLowerCase() !== domain) ||
            (a.importanceRank ?? 999) - (b.importanceRank ?? 999),
        );
      const lead = holders.find((d) => d.imageUrl && !used.has(d.id));
      if (lead) used.add(lead.id);
      leads.set(domain, {
        image: lead?.imageUrl ?? null,
        names: holders.slice(0, 4).map((d) => d.name),
      });
    }
    return leads;
  }, [deities]);

  const primaryDomains = PRIMARY_DOMAINS.filter((d) => domainStats.has(d));
  const otherDomains = useMemo(
    () =>
      [...domainStats.keys()]
        .filter((d) => !PRIMARY_DOMAINS.includes(d))
        .sort((a, b) => a.localeCompare(b)),
    [domainStats],
  );

  const filteredDeities = useMemo(() => {
    if (!selectedDomain) return [];
    return deities
      .filter((deity) =>
        deity.domain?.some((d) => d.toLowerCase() === selectedDomain),
      )
      .sort((a, b) => (a.importanceRank ?? 999) - (b.importanceRank ?? 999));
  }, [deities, selectedDomain]);

  const displayDeities =
    pantheonFilter === "all"
      ? filteredDeities
      : filteredDeities.filter((d) => d.pantheonId === pantheonFilter);

  const availablePantheons = useMemo(
    () =>
      [...new Set(filteredDeities.map((d) => d.pantheonId))]
        .map((id) => ({ id, name: pantheonNames[id] || id }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [filteredDeities, pantheonNames],
  );

  // Cross-pantheon parallels between deities that share the domain
  const crossPantheonConnections = useMemo(() => {
    if (!selectedDomain) return [];
    const connections: Array<{ from: Deity; to: Deity }> = [];
    for (const deity of filteredDeities) {
      for (const parallel of deity.crossPantheonParallels ?? []) {
        const other = deityReferenceMap.get(
          normalizeDeityReference(parallel.deityId),
        );
        if (
          other?.domain?.some((d) => d.toLowerCase() === selectedDomain) &&
          !connections.some(
            (c) =>
              (c.from.id === deity.id && c.to.id === other.id) ||
              (c.from.id === other.id && c.to.id === deity.id),
          )
        )
          connections.push({ from: deity, to: other });
      }
    }
    return connections;
  }, [selectedDomain, filteredDeities, deityReferenceMap]);

  const selectDomain = (domain: string | null) => {
    setSelectedDomain(domain);
    setPantheonFilter("all");
  };

  const stats = selectedDomain ? domainStats.get(selectedDomain) : undefined;
  const domainPage = selectedDomain ? domainPages[selectedDomain] : undefined;

  return (
    <>
      <Container className="pt-6 pb-4 md:pt-8">
        <FilterToolbar
          label="Choose a domain"
          count={
            selectedDomain && stats
              ? `${filteredDeities.length} deities · ${stats.pantheons.size} traditions`
              : `${domainStats.size} domains`
          }
          chips={
            <ChipRow label="Domain">
              <FilterChip
                active={selectedDomain === null}
                onClick={() => selectDomain(null)}
              >
                All
              </FilterChip>
              {primaryDomains.map((domain) => (
                <FilterChip
                  key={domain}
                  active={selectedDomain === domain}
                  onClick={() =>
                    selectDomain(selectedDomain === domain ? null : domain)
                  }
                  count={domainStats.get(domain)?.count}
                >
                  {capitalize(domain)}
                </FilterChip>
              ))}
            </ChipRow>
          }
        >
          <Select
            value={
              selectedDomain && !PRIMARY_DOMAINS.includes(selectedDomain)
                ? selectedDomain
                : "none"
            }
            onValueChange={(value) =>
              selectDomain(value === "none" ? null : value)
            }
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="More domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">More domains…</SelectItem>
              {otherDomains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {`${capitalize(domain)} (${domainStats.get(domain)?.count ?? 0})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDomain && availablePantheons.length > 1 ? (
            <Select value={pantheonFilter} onValueChange={setPantheonFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tradition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {`All traditions (${filteredDeities.length})`}
                </SelectItem>
                {availablePantheons.map((pantheon) => (
                  <SelectItem key={pantheon.id} value={pantheon.id}>
                    {`${pantheon.name} (${
                      filteredDeities.filter(
                        (d) => d.pantheonId === pantheon.id,
                      ).length
                    })`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </FilterToolbar>
      </Container>

      <Container className="pt-8 pb-12">
        {selectedDomain ? (
          <>
            <SectionHeading
              eyebrow="Domain"
              title={capitalize(selectedDomain)}
              description={`Deities across ${availablePantheons.length} traditions whose entries list ${selectedDomain}.`}
              action={
                domainPage
                  ? {
                      href: `/gods-of/${domainPage}`,
                      label: `Read the full ${selectedDomain} page`,
                    }
                  : undefined
              }
            />

            {crossPantheonConnections.length > 0 &&
              pantheonFilter === "all" && (
                <section
                  aria-labelledby="domain-parallels-heading"
                  className="mb-12"
                >
                  <h3
                    id="domain-parallels-heading"
                    className="type-h3 text-foreground"
                  >
                    Parallels across traditions
                  </h3>
                  <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                    {crossPantheonConnections
                      .slice(0, 6)
                      .map(({ from, to }) => (
                        <li
                          key={`${from.id}-${to.id}`}
                          className="flex items-center gap-2 border-t border-border/60 py-3"
                        >
                          <ParallelName
                            deity={from}
                            tradition={getPantheonName(from.pantheonId)}
                          />
                          <ArrowRight
                            className="size-4 shrink-0 text-gold-text"
                            aria-label="parallels"
                          />
                          <ParallelName
                            deity={to}
                            tradition={getPantheonName(to.pantheonId)}
                          />
                        </li>
                      ))}
                  </ul>
                  {crossPantheonConnections.length > 6 ? (
                    <p className="mt-2 type-meta text-muted-foreground">
                      And {crossPantheonConnections.length - 6} more parallels.
                    </p>
                  ) : null}
                </section>
              )}

            {displayDeities.length === 0 ? (
              <EmptyResults
                title="No deities here"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPantheonFilter("all")}
                  >
                    Show every tradition
                  </Button>
                }
              >
                No deity in this tradition holds the domain.
              </EmptyResults>
            ) : (
              <EntityGrid aspect="portrait">
                {displayDeities.map((deity, index) => (
                  <EntityCard
                    key={deity.id}
                    href={`/deities/${deity.slug}`}
                    title={deity.name}
                    image={deity.imageUrl}
                    imagePosition="50% 22%"
                    aspect="portrait"
                    priority={index < 4}
                    tradition={getPantheonName(deity.pantheonId)}
                    traditionColor={getPantheonColor(deity.pantheonId)}
                    subtitle={deity.domain
                      .filter((d) => d.toLowerCase() !== selectedDomain)
                      .slice(0, 3)
                      .map(capitalize)
                      .join(" · ")}
                    description={deity.description}
                  />
                ))}
              </EntityGrid>
            )}
          </>
        ) : (
          <EntityGrid>
            {primaryDomains.map((domain, index) => {
              const entry = domainStats.get(domain);
              const slug = domainPages[domain];
              if (!entry || !slug) return null;
              return (
                <EntityCard
                  key={domain}
                  href={`/gods-of/${slug}`}
                  title={capitalize(domain)}
                  image={domainLeads.get(domain)?.image}
                  imagePosition="50% 25%"
                  aspect="landscape"
                  priority={index < 3}
                  headingLevel="h2"
                  subtitle={`${entry.count} deities · ${entry.pantheons.size} traditions`}
                  description={`${domainLeads.get(domain)?.names.join(", ")} and more.`}
                />
              );
            })}
          </EntityGrid>
        )}
      </Container>
    </>
  );
}

function ParallelName({
  deity,
  tradition,
}: {
  deity: Deity;
  tradition: string;
}) {
  return (
    <Link
      href={`/deities/${deity.slug}`}
      className="group flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-gold"
    >
      {deity.imageUrl ? (
        <Image
          src={deity.imageUrl}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover object-top ring-1 ring-border"
        />
      ) : null}
      <span className="min-w-0">
        <span className="block truncate type-ui font-medium text-foreground group-hover:text-gold-text">
          {deity.name}
        </span>
        <span className="block truncate type-meta text-muted-foreground">
          {tradition}
        </span>
      </span>
    </Link>
  );
}
