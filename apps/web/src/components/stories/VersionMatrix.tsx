import type { BeatState, MythVersions, SourceKind } from "@/lib/myth-versions";

/**
 * "One myth, many tellings" — a story's key moments set against every source
 * that tells it, oldest first. A timeline strip shows how far apart the
 * sources are in time; the table shows where they agree, where they tell it
 * differently, and where a text is silent or broken. A real <table>, so screen
 * readers get the same grid sighted readers do.
 */

const KIND_LABEL: Record<SourceKind, string> = {
  primary: "Primary source",
  "later-ancient": "Later ancient",
  medieval: "Medieval",
  modern: "Modern",
};

const STATE_LABEL: Record<BeatState, string> = {
  present: "Told this way",
  variant: "Told differently",
  absent: "Not in this source",
  lost: "Text lost or broken",
};

function StateMark({ state }: { state: BeatState }) {
  const base = "inline-block shrink-0";
  switch (state) {
    case "present":
      return (
        <span
          aria-hidden
          className={`${base} h-2.5 w-2.5 rounded-full bg-gold`}
        />
      );
    case "variant":
      return (
        <span
          aria-hidden
          className={`${base} h-2.5 w-2.5 rotate-45 border-2 border-bronze bg-bronze/25`}
        />
      );
    case "absent":
      return (
        <span
          aria-hidden
          className={`${base} h-px w-3 bg-muted-foreground/50`}
        />
      );
    case "lost":
      return (
        <span
          aria-hidden
          className={`${base} h-3 w-3 rounded-sm border border-muted-foreground/40 bg-[repeating-linear-gradient(45deg,transparent_0_2px,color-mix(in_oklch,var(--muted-foreground)_45%,transparent)_2px_3px)]`}
        />
      );
  }
}

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

export function VersionMatrix({ versions }: { versions: MythVersions }) {
  const { sources, beats } = versions;
  const years = sources.map((s) => s.sortYear);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const span = Math.max(max - min, 1);

  return (
    <section
      aria-labelledby="version-matrix-title"
      className="border-y border-border py-8"
    >
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold-text">
        One myth, many tellings
      </p>
      <h2
        id="version-matrix-title"
        className="page-section-title text-foreground"
      >
        {versions.question}
      </h2>
      <p className="mt-3 max-w-[68ch] font-body text-lg leading-relaxed text-muted-foreground">
        {versions.takeaway}
      </p>

      {/* Timeline strip: where each source sits in time */}
      <div className="mt-8" aria-hidden>
        <div className="relative mx-4 h-10">
          <div className="absolute inset-x-0 top-4 h-px bg-border" />
          {sources.map((s, i) => {
            const left = ((s.sortYear - min) / span) * 100;
            return (
              <div
                key={s.name}
                className="absolute top-2 -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                <span
                  className={`block h-4 w-4 rounded-full border-2 ${s.reference ? "border-gold bg-gold" : "border-gold/70 bg-background"}`}
                />
                <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[0.65rem] text-muted-foreground">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mx-4 mt-1 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
          <span>{formatYear(min)}</span>
          <span>{formatYear(max)}</span>
        </div>
      </div>

      <ul
        aria-label="Legend"
        className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
      >
        {(Object.keys(STATE_LABEL) as BeatState[]).map((state) => (
          <li key={state} className="flex items-center gap-2">
            <StateMark state={state} />
            {STATE_LABEL[state]}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-3 w-5 rounded-sm border border-gold/40 bg-gold/15"
          />
          Shaded column: comparison baseline
        </li>
      </ul>

      <div
        role="region"
        aria-labelledby="version-matrix-title"
        tabIndex={0}
        className="relative mt-6 overflow-x-auto rounded-lg border border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            {versions.question} Rows are moments in the story; columns are
            sources, oldest first.
          </caption>
          <thead>
            <tr className="bg-muted/40 align-bottom">
              <th
                scope="col"
                className="sticky left-0 z-10 w-40 bg-muted/90 p-3 text-xs font-normal uppercase tracking-[0.15em] text-muted-foreground backdrop-blur"
              >
                Moment
              </th>
              {sources.map((s, i) => (
                <th
                  key={s.name}
                  scope="col"
                  className={`p-3 align-bottom font-normal ${s.reference ? "bg-gold/10" : ""}`}
                >
                  <span className="text-[0.65rem] text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="block font-serif text-sm leading-snug text-foreground">
                    {s.name}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {s.work}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {s.date}
                  </span>
                  {s.readingUrl && (
                    <a
                      href={s.readingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-11 items-center text-xs text-gold-text underline underline-offset-4"
                    >
                      Read the passage (opens a new tab)
                    </a>
                  )}
                  <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.12em] text-gold-text">
                    {KIND_LABEL[s.kind]}
                    {s.reference && " · baseline"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beats.map((beat) => (
              <tr key={beat.id} className="border-t border-border/60 align-top">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-background/95 p-3 font-serif text-sm font-normal text-foreground backdrop-blur"
                >
                  {beat.label}
                </th>
                {sources.map((s) => {
                  const cell = s.cells[beat.id];
                  return (
                    <td
                      key={s.name}
                      className={`p-3 ${s.reference ? "bg-gold/5" : ""} ${cell.state === "absent" || cell.state === "lost" ? "text-muted-foreground" : "text-foreground/90"}`}
                    >
                      <span className="flex items-start gap-2">
                        <span className="mt-1.5 flex w-3 justify-center">
                          <StateMark state={cell.state} />
                        </span>
                        <span>
                          <span className="sr-only">
                            {STATE_LABEL[cell.state]}.{" "}
                          </span>
                          {cell.note ?? (
                            <span aria-hidden className="text-muted-foreground">
                              {cell.state === "present"
                                ? ""
                                : STATE_LABEL[cell.state]}
                            </span>
                          )}
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Dates are approximate. For manuscripts copied long after composition,
        the position shows the estimated date of the telling.
      </p>
    </section>
  );
}
