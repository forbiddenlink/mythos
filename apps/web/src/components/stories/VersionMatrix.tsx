import type { BeatState, MythVersions, SourceKind } from "@/lib/myth-versions";

/**
 * "One myth, many tellings" — a story's key moments set against every source
 * that tells it, oldest first. An ordered chronology dates the sources; the table shows where they agree, where they tell it
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
  absent: "Not narrated here",
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

  return (
    <section
      id="versions"
      aria-labelledby="version-matrix-title"
      className="scroll-mt-24"
    >
      <p className="type-eyebrow mb-2">One myth, many tellings</p>
      <h2
        id="version-matrix-title"
        className="page-section-title text-foreground"
      >
        {versions.question}
      </h2>
      <p className="mt-3 max-w-reading type-reading text-muted-foreground">
        {versions.takeaway}
      </p>

      <ol
        aria-label="Sources in chronological order"
        className="mt-8 flex flex-wrap gap-3"
      >
        {sources.map((source, index) => (
          <li
            key={source.name}
            className="min-w-0 rounded-lg border border-border/70 p-3 text-sm"
          >
            <span className="block text-xs text-gold-text">
              {index + 1} · {formatYear(source.sortYear)}
            </span>
            <span className="break-words font-serif">{source.name}</span>
          </li>
        ))}
      </ol>

      <ul
        aria-label="Legend"
        className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-muted-foreground"
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
          Shaded source: comparison baseline
        </li>
      </ul>

      <div className="mt-6 space-y-4 md:hidden">
        {sources.map((source, index) => (
          <article
            key={source.name}
            aria-labelledby={`version-source-${index}`}
            className={`min-w-0 rounded-lg border border-border/70 p-4 ${source.reference ? "bg-gold/5" : ""}`}
          >
            <h3
              id={`version-source-${index}`}
              className="break-words font-serif text-lg"
            >
              {index + 1}. {source.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{source.work}</p>
            <p className="mt-1 text-sm text-muted-foreground">{source.date}</p>
            <p className="mt-2 text-xs text-gold-text">
              {KIND_LABEL[source.kind]}
              {source.reference && " · comparison baseline"}
            </p>
            {source.readingUrl && (
              <a
                href={source.readingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm text-gold-text underline underline-offset-4"
              >
                Read the passage (opens a new tab)
              </a>
            )}
            <dl className="mt-3 space-y-4">
              {beats.map((beat) => {
                const cell = source.cells[beat.id];
                return (
                  <div key={beat.id}>
                    <dt className="font-serif text-sm">{beat.label}</dt>
                    <dd className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5">
                        <StateMark state={cell.state} />
                      </span>
                      <span className="min-w-0 break-words">
                        <span className="block text-xs text-gold-text">
                          {STATE_LABEL[cell.state]}
                        </span>
                        {cell.note}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))}
      </div>

      <p
        id="version-table-help"
        className="mt-6 hidden text-sm text-muted-foreground md:block"
      >
        Scroll horizontally to compare all sources.
      </p>
      <div
        role="region"
        aria-labelledby="version-matrix-title"
        aria-describedby="version-table-help"
        tabIndex={0}
        className="relative mt-2 hidden overflow-x-auto md:block rounded-lg border border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="sticky left-0 z-10 w-40 min-w-40 bg-muted/90 p-3 text-[0.8125rem] font-normal uppercase tracking-[0.15em] text-muted-foreground backdrop-blur"
              >
                Moment
              </th>
              {sources.map((s, i) => (
                <th
                  key={s.name}
                  scope="col"
                  className={`min-w-52 p-3 align-bottom font-normal ${s.reference ? "bg-gold/10" : ""}`}
                >
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                  <span className="block font-serif text-sm leading-snug text-foreground">
                    {s.name}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {s.work}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-muted-foreground">
                    {s.date}
                  </span>
                  {s.readingUrl && (
                    <a
                      href={s.readingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-11 items-center text-[0.8125rem] text-gold-text underline underline-offset-4"
                    >
                      Read the passage (opens a new tab)
                    </a>
                  )}
                  <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-gold-text">
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
      <p className="mt-3 text-[0.8125rem] text-muted-foreground">
        Dates are approximate. For manuscripts copied long after composition,
        the chronology uses the estimated date of the telling.
      </p>
    </section>
  );
}
