"use client";

import { useMemo } from "react";
import Link from "next/link";
import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";
import { getPantheonColor } from "@/lib/pantheon-colors";

interface RawDeity {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
}
interface RawRel {
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
}

export interface Kin {
  key: string;
  name: string;
  slug: string | null;
  color: string;
}

const byId = new Map(
  (deitiesData as unknown as RawDeity[]).map((d) => [d.id, d]),
);

function toKin(id: string): Kin {
  const d = byId.get(id);
  if (d)
    return {
      key: id,
      name: d.name,
      slug: d.slug,
      color: getPantheonColor(d.pantheonId),
    };
  // dangling reference — show a readable name, no link
  return {
    key: id,
    name: id
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug: null,
    color: "#6b7280",
  };
}

function Medallion({ kin, big = false }: { kin: Kin; big?: boolean }) {
  const inner = (
    <>
      <span
        className={`flex items-center justify-center rounded-full border-2 bg-midnight/80 font-serif text-parchment transition-transform duration-200 group-hover:scale-110 ${
          big ? "size-16 text-2xl" : "size-11 text-lg"
        }`}
        style={{ borderColor: kin.color }}
      >
        {kin.name.charAt(0)}
      </span>
      <span
        className={`mt-1 max-w-[6rem] truncate text-center ${big ? "text-sm font-semibold text-foreground" : "text-xs text-foreground/80 group-hover:text-gold"}`}
      >
        {kin.name}
      </span>
    </>
  );
  const cls = "group flex flex-col items-center";
  return kin.slug ? (
    <Link href={`/deities/${kin.slug}`} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Descent() {
  return (
    <div
      aria-hidden
      className="mx-auto h-8 w-px bg-gradient-to-b from-gold/50 to-gold/10"
    />
  );
}

function Tier({ label, kin }: { label: string; kin: Kin[] }) {
  if (kin.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap justify-center gap-4">
        {kin.map((k) => (
          <Medallion key={k.key} kin={k} />
        ))}
      </div>
    </div>
  );
}

export function BloodlineTapestry({
  deityId,
  deityName,
  pantheonId,
}: {
  deityId: string;
  deityName: string;
  pantheonId: string;
}) {
  const groups = useMemo(() => {
    const rels = relationshipsData as unknown as RawRel[];
    const parents: Kin[] = [];
    const children: Kin[] = [];
    const consorts: Kin[] = [];
    const siblings: Kin[] = [];
    const rivals: Kin[] = [];
    const seen = new Set<string>();
    const push = (arr: Kin[], id: string) => {
      const tag = arr === consorts ? "c" : arr === rivals ? "r" : "";
      const dedup = `${tag}:${id}`;
      if (seen.has(dedup)) return;
      seen.add(dedup);
      arr.push(toKin(id));
    };

    for (const r of rels) {
      const involvesFrom = r.fromDeityId === deityId;
      const involvesTo = r.toDeityId === deityId;
      if (!involvesFrom && !involvesTo) continue;
      const other = involvesFrom ? r.toDeityId : r.fromDeityId;
      switch (r.relationshipType) {
        case "parent_of":
          if (involvesTo)
            push(parents, other); // other is parent OF me
          else push(children, other); // I am parent OF other
          break;
        case "spouse_of":
        case "lover":
          push(consorts, other);
          break;
        case "sibling_of":
          push(siblings, other);
          break;
        case "enemy_of":
          push(rivals, other);
          break;
        default:
          break; // ally_of / aspect_of not part of the bloodline plate
      }
    }
    return { parents, children, consorts, siblings, rivals };
  }, [deityId]);

  const { parents, children, consorts, siblings, rivals } = groups;
  const hasLineage = parents.length + children.length + consorts.length > 0;
  if (!hasLineage) return null;

  const self: Kin = {
    key: deityId,
    name: deityName,
    slug: null,
    color: getPantheonColor(pantheonId),
  };

  return (
    <section
      className="rounded-2xl border border-border/60 bg-card/40 p-6 md:p-8"
      aria-label={`Bloodline of ${deityName}`}
    >
      <div className="mb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold/80">
          Bloodline
        </span>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          The house of {deityName}
        </h2>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Tier label="Parents" kin={parents} />
        {parents.length > 0 && <Descent />}

        {/* the deity, flanked by consorts */}
        <div className="flex flex-col items-center gap-2">
          {consorts.length > 0 && (
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              with
            </span>
          )}
          <div className="flex flex-wrap items-end justify-center gap-6">
            {consorts.slice(0, 2).map((c) => (
              <Medallion key={`c-${c.key}`} kin={c} />
            ))}
            <Medallion kin={self} big />
            {consorts.slice(2).map((c) => (
              <Medallion key={`c-${c.key}`} kin={c} />
            ))}
          </div>
        </div>

        {children.length > 0 && <Descent />}
        <Tier label="Children" kin={children} />

        {(siblings.length > 0 || rivals.length > 0) && (
          <div className="mt-8 flex w-full flex-col gap-4 border-t border-border/50 pt-6 sm:flex-row sm:justify-center sm:gap-12">
            <Tier label="Siblings" kin={siblings} />
            {rivals.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-red-400/80">
                  Rivals
                </span>
                <div className="flex flex-wrap justify-center gap-4">
                  {rivals.map((k) => (
                    <Medallion key={`r-${k.key}`} kin={k} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default BloodlineTapestry;
