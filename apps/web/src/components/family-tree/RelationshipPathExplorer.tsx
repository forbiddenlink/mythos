"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  connectionStepLabel,
  shortestRelationshipPath,
  type ConnectionFigure,
  type ConnectionRelationship,
} from "@/lib/relationship-path";

export function RelationshipPathExplorer({
  deities,
  relationships,
}: Readonly<{
  deities: readonly ConnectionFigure[];
  relationships: readonly ConnectionRelationship[];
}>) {
  const selectId = useId();
  const figures = useMemo(
    () => [...deities].sort((a, b) => a.name.localeCompare(b.name)),
    [deities],
  );
  const [fromId, setFromId] = useState(figures[0]?.id ?? "");
  const [toId, setToId] = useState(figures[1]?.id ?? figures[0]?.id ?? "");
  const byId = useMemo(
    () => new Map(figures.map((figure) => [figure.id, figure])),
    [figures],
  );
  const path = useMemo(
    () => shortestRelationshipPath(figures, relationships, fromId, toId),
    [figures, relationships, fromId, toId],
  );

  const figureLink = (id: string) => {
    const figure = byId.get(id)!;
    return (
      <Link
        href={`/deities/${figure.slug}`}
        className="font-medium text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text"
      >
        {figure.name}
      </Link>
    );
  };

  return (
    <section
      aria-labelledby={`${selectId}-heading`}
      className="mx-auto max-w-3xl"
    >
      <h2 id={`${selectId}-heading`} className="type-h3 text-foreground">
        Find a recorded connection
      </h2>
      <p className="mt-2 type-body text-muted-foreground">
        Choose two figures to trace the shortest chain in this tradition’s
        catalog. Connections can include alliances, rivalries, and aspects as
        well as family ties. An absent path means no chain is recorded here.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          {
            key: "from",
            label: "From figure",
            value: fromId,
            onChange: setFromId,
          },
          { key: "to", label: "To figure", value: toId, onChange: setToId },
        ].map(({ key, label, value, onChange }) => (
          <div key={key} className="min-w-0">
            <label
              htmlFor={`${selectId}-${key}`}
              className="block type-ui font-medium"
            >
              {label}
            </label>
            <select
              id={`${selectId}-${key}`}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {figures.map((figure) => (
                <option key={figure.id} value={figure.id}>
                  {figure.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <p role="status" className="mt-6 type-ui text-muted-foreground">
        {path.status === "unknown-figure"
          ? "Choose two figures from this tradition."
          : path.status === "disconnected"
            ? "No recorded connection between these figures in this tradition."
            : path.steps.length === 0
              ? "Both selections name the same figure. No connection steps are needed."
              : `${path.steps.length} recorded connection${path.steps.length === 1 ? "" : "s"} from ${byId.get(fromId)?.name} to ${byId.get(toId)?.name}.`}
      </p>
      {path.status === "found" && path.steps.length > 0 ? (
        <ol aria-label="Recorded connection chain" className="mt-4 space-y-4">
          {path.steps.map((step, index) => (
            <li
              key={`${step.relationship.id}-${index}`}
              className="rounded-lg border border-border p-4 sm:p-5"
            >
              <p className="type-body">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {figureLink(step.fromId)} {connectionStepLabel(step)}{" "}
                {figureLink(step.toId)}
              </p>
              {step.relationship.description ? (
                <p className="mt-2 type-ui text-muted-foreground">
                  {step.relationship.description}
                </p>
              ) : null}
              <p className="mt-2 type-meta text-muted-foreground">
                {step.relationship.isDisputed ? "Disputed · " : ""}
                {step.relationship.confidenceLevel
                  ? `Catalog confidence: ${step.relationship.confidenceLevel}`
                  : "Catalog confidence not specified"}
              </p>
              {step.relationship.evidence?.length ? (
                <ul
                  aria-label="Attached passages"
                  className="mt-3 space-y-2 type-ui"
                >
                  {step.relationship.evidence.map((evidence, evidenceIndex) => (
                    <li key={`${evidence.sourceId}-${evidenceIndex}`}>
                      {evidence.sourceTitle ? (
                        <Link
                          href={`/sources/${evidence.sourceId}`}
                          className="text-gold-text underline underline-offset-4"
                        >
                          {evidence.sourceTitle}
                        </Link>
                      ) : (
                        evidence.sourceId
                      )}
                      {" · "}
                      {evidence.locator}
                      <span className="block type-meta text-muted-foreground">
                        {evidence.edition}
                      </span>
                      {/^https?:\/\//i.test(evidence.sourceUrl) ? (
                        <a
                          href={evidence.sourceUrl}
                          className="text-gold-text underline underline-offset-4"
                        >
                          Read passage
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 type-ui text-muted-foreground">
                  No passage attached
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
