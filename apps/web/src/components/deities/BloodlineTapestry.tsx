import Link from "next/link";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { hasLineage, type Bloodline, type Kin } from "@/lib/deity-page";

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
        className={`mt-1.5 max-w-[7rem] truncate text-center ${big ? "text-[0.9375rem] font-semibold text-foreground" : "text-sm text-foreground group-hover:text-gold-text"}`}
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
      <span className="text-[0.8125rem] uppercase tracking-[0.16em] text-muted-foreground">
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

/**
 * Genealogy plate for a deity page. Pure markup: the server page computes the
 * tiers with `buildBloodline` and passes only the kin it links to.
 */
export function BloodlineTapestry({
  deityId,
  deityName,
  pantheonId,
  bloodline,
}: {
  deityId: string;
  deityName: string;
  pantheonId: string;
  bloodline: Bloodline;
}) {
  const { parents, children, consorts, siblings, rivals } = bloodline;
  if (!hasLineage(bloodline)) return null;

  const self: Kin = {
    key: deityId,
    name: deityName,
    slug: null,
    color: getPantheonColor(pantheonId),
  };

  return (
    <section
      className="rounded-lg bg-muted/40 px-4 py-8 ring-1 ring-border/60 sm:px-8"
      aria-label={`Bloodline of ${deityName}`}
    >
      <div className="flex flex-col items-center gap-1">
        <Tier label="Parents" kin={parents} />
        {parents.length > 0 && <Descent />}

        {/* the deity, flanked by consorts */}
        <div className="flex flex-col items-center gap-2">
          {consorts.length > 0 && (
            <span className="text-[0.8125rem] uppercase tracking-[0.16em] text-muted-foreground">
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
                <span className="text-[0.8125rem] uppercase tracking-[0.16em] text-destructive">
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
