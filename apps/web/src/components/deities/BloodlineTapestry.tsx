import Image from "next/image";
import Link from "next/link";
import { getPantheonColor } from "@/lib/pantheon-colors";
import {
  hasLineage,
  kinHref,
  type Bloodline,
  type DisputedKin,
  type Kin,
} from "@/lib/deity-page";

function Medallion({
  kin,
  big = false,
  disputed = false,
}: {
  kin: Kin;
  big?: boolean;
  disputed?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 bg-midnight/80 font-serif text-parchment transition-transform duration-200 group-hover:scale-110 ${
          big ? "size-16 text-2xl" : "size-12 text-lg"
        } ${disputed ? "border-dashed opacity-80" : ""}`}
        style={{ borderColor: kin.color }}
      >
        {kin.imageUrl ? (
          // The figure's portrait; the name below carries the meaning.
          <Image
            src={kin.imageUrl}
            alt=""
            fill
            sizes={big ? "64px" : "48px"}
            className="object-cover object-top"
          />
        ) : (
          kin.name.charAt(0)
        )}
      </span>
      <span
        className={`mt-1.5 line-clamp-2 max-w-[7.5rem] text-balance text-center leading-tight ${big ? "text-[0.9375rem] font-semibold text-foreground" : "text-sm text-foreground group-hover:text-gold-text"}`}
      >
        {kin.name}
      </span>
    </>
  );
  const cls = "group flex flex-col items-center";
  const href = kinHref(kin);
  return href ? (
    <Link href={href} className={cls}>
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

const ROLE_LABEL: Record<DisputedKin["role"], string> = {
  parent: "parent",
  child: "child",
  consort: "consort",
  sibling: "sibling",
  rival: "rival",
};

/** Links the sources disagree on: dashed, labelled, with the catalog's note. */
function Disputed({ items }: { items: DisputedKin[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-8 w-full border-t border-dashed border-border/70 pt-6">
      <p className="text-center text-[0.8125rem] uppercase tracking-[0.16em] text-muted-foreground">
        Sources disagree
      </p>
      <ul className="mx-auto mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={`d-${item.kin.key}`} className="flex items-start gap-3">
            <Medallion kin={item.kin} disputed />
            <p className="min-w-0 pt-1 text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">
                {item.kin.name} as {ROLE_LABEL[item.role]}.
              </span>{" "}
              {item.note}
            </p>
          </li>
        ))}
      </ul>
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
  deityImageUrl,
  pantheonId,
  bloodline,
}: {
  deityId: string;
  deityName: string;
  deityImageUrl?: string | null;
  pantheonId: string;
  bloodline: Bloodline;
}) {
  const { parents, children, consorts, siblings, rivals, disputed } = bloodline;
  if (!hasLineage(bloodline)) return null;

  const self: Kin = {
    key: deityId,
    name: deityName,
    slug: null,
    color: getPantheonColor(pantheonId),
    ...(deityImageUrl ? { imageUrl: deityImageUrl } : {}),
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
        <Disputed items={disputed} />
      </div>
    </section>
  );
}
