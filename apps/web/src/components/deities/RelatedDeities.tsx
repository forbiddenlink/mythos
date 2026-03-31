"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users } from "lucide-react";
import { getTopRelatedDeities, type RelatedDeity } from "@/lib/relationships";
import deitiesData from "@/data/deities.json";

interface DeityBasic {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  imageUrl: string | null;
}

interface RelatedDeitiesProps {
  deityId: string;
  pantheonId: string;
  maxItems?: number;
}

export function RelatedDeities({
  deityId,
  pantheonId,
  maxItems = 6,
}: RelatedDeitiesProps) {
  // Get related deities from relationships data
  const relatedDeities = getTopRelatedDeities(deityId, maxItems);
  const deities = deitiesData as DeityBasic[];

  if (relatedDeities.length === 0) {
    return null;
  }

  // Create a map for quick lookup
  const deityMap = new Map<string, DeityBasic>();
  deities.forEach((d) => deityMap.set(d.id, d));

  // Get full deity data for related deities
  const relatedWithData = relatedDeities
    .map((rel) => ({
      ...rel,
      deity: deityMap.get(rel.deityId),
    }))
    .filter((r): r is RelatedDeity & { deity: DeityBasic } => !!r.deity);

  // If we have fewer than 4, try to fill with same-pantheon deities
  let filledRelated = [...relatedWithData];
  if (filledRelated.length < 4) {
    const existingIds = new Set(filledRelated.map((r) => r.deity.id));
    existingIds.add(deityId); // Don't include self

    const samePantheon = deities
      .filter((d) => d.pantheonId === pantheonId && !existingIds.has(d.id))
      .slice(0, 4 - filledRelated.length)
      .map((d) => ({
        deityId: d.id,
        relationshipType: "same_pantheon",
        label: "Same Pantheon",
        direction: "to" as const,
        deity: d,
      }));

    filledRelated = [...filledRelated, ...samePantheon];
  }

  if (filledRelated.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2 text-xl">
          <Users className="h-5 w-5 text-gold" />
          Related Deities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filledRelated.map(({ deity, label }, index) => (
            <Link
              key={deity.id}
              href={`/deities/${deity.slug}`}
              className="group"
            >
              <div className="flex flex-col items-center p-3 rounded-xl border border-border hover:border-gold/50 hover:bg-gold/5 transition-all duration-200">
                {deity.imageUrl ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold/20 group-hover:border-gold/40 transition-colors mb-2">
                    <Image
                      src={deity.imageUrl}
                      alt={deity.name}
                      width={64}
                      height={64}
                      sizes="64px"
                      priority={index < 2}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/20 group-hover:border-gold/40 transition-colors flex items-center justify-center mb-2">
                    <Sparkles className="h-6 w-6 text-gold" />
                  </div>
                )}
                <span className="text-sm font-medium text-foreground group-hover:text-gold transition-colors text-center">
                  {deity.name}
                </span>
                <Badge
                  variant="outline"
                  className="mt-1 text-xs border-gold/30 text-gold/80"
                >
                  {label}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
