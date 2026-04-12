"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";
import { GitCompareArrows } from "lucide-react";

interface ParallelEdge {
  fromDeityId: string;
  fromName: string;
  fromSlug: string;
  fromPantheon: string;
  fromImage?: string;
  toDeityId: string;
  toName: string;
  toSlug: string;
  toPantheon: string;
  toImage?: string;
  note: string;
}

function buildParallels(): ParallelEdge[] {
  const deities = deitiesData as Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    pantheonId: string;
    crossPantheonParallels?: Array<{
      pantheonId: string;
      deityId: string;
      note: string;
    }>;
  }>;
  const pantheonNames = new Map(
    (pantheonsData as { id: string; name: string }[]).map((p) => [
      p.id,
      p.name.replace(" Pantheon", ""),
    ]),
  );

  const byId = new Map(deities.map((d) => [d.id, d]));

  const out: ParallelEdge[] = [];
  const seenPairs = new Set<string>();
  for (const d of deities) {
    if (!d.crossPantheonParallels?.length) continue;
    for (const p of d.crossPantheonParallels) {
      const other = byId.get(p.deityId);
      if (!other) continue;
      const a = d.id < other.id ? d.id : other.id;
      const b = d.id < other.id ? other.id : d.id;
      const pairKey = `${a}::${b}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      out.push({
        fromDeityId: d.id,
        fromName: d.name,
        fromSlug: d.slug,
        fromPantheon: pantheonNames.get(d.pantheonId) ?? d.pantheonId,
        fromImage: d.imageUrl,
        toDeityId: other.id,
        toName: other.name,
        toSlug: other.slug,
        toPantheon: pantheonNames.get(other.pantheonId) ?? other.pantheonId,
        toImage: other.imageUrl,
        note: p.note,
      });
    }
  }

  return out.toSorted((a, b) => {
    const fa = `${a.fromName} ${a.toName}`;
    const fb = `${b.fromName} ${b.toName}`;
    return fa.localeCompare(fb);
  });
}

export default function CrossPantheonParallelsPage() {
  const edges = buildParallels();

  return (
    <div className="min-h-screen">
      <PageHero
        icon={<GitCompareArrows />}
        tagline="Comparative mythology"
        title="Cross-pantheon parallels"
        description="Analogies and equivalences drawn in Mythos Atlas data between figures from different traditions — useful for comparative study, not proof of historical origin."
      />

      <div className="container mx-auto max-w-6xl px-4 py-10 bg-mythic">
        <Breadcrumbs />
        <p className="text-sm text-muted-foreground max-w-3xl mb-8 leading-relaxed">
          These notes come from curated editorial links in deity entries. They
          complement the side-by-side deity comparison tool and myth variant
          comparisons elsewhere on the site.
        </p>

        {edges.length === 0 ? (
          <p className="text-muted-foreground">No parallels indexed yet.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {edges.map((e) => (
              <li key={`${e.fromDeityId}-${e.toDeityId}`}>
                <Card className="h-full border-border/60 bg-card/60">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">{e.fromPantheon}</Badge>
                      <Link
                        href={`/deities/${e.fromSlug}`}
                        className="font-serif font-semibold text-foreground hover:text-gold"
                      >
                        {e.fromName}
                      </Link>
                      <span className="text-muted-foreground">↔</span>
                      <Badge variant="secondary">{e.toPantheon}</Badge>
                      <Link
                        href={`/deities/${e.toSlug}`}
                        className="font-serif font-semibold text-foreground hover:text-gold"
                      >
                        {e.toName}
                      </Link>
                    </div>
                    <CardTitle className="sr-only">
                      {e.fromName} and {e.toName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    {e.note}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-xs text-muted-foreground max-w-2xl">
          Editorial standards: parallels reflect common scholarly comparison and
          reception history (e.g. interpretatio graeca/romana), not automatic
          identity across cultures. See{" "}
          <Link href="/about" className="text-gold hover:underline">
            About
          </Link>{" "}
          for scope and correction policy.
        </p>
      </div>
    </div>
  );
}
