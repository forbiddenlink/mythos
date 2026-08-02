"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import deities from "@/data/deities.json";
import { getPantheonColor } from "@/lib/pantheon-colors";
import {
  attestationOf,
  formatYear,
  type PrimarySource,
} from "@/lib/attestation";

interface DeityRecord {
  slug: string;
  name: string;
  pantheonId: string;
  primarySources?: PrimarySource[];
}

interface Point {
  slug: string;
  name: string;
  pantheonId: string;
  year: number;
  source: string;
}

const VIEW_W = 1000;
const PAD_L = 150;
const PAD_R = 40;
const PAD_TOP = 16;
const ROW_H = 46;
const AXIS_H = 40;

function pantheonLabel(id: string): string {
  return id
    .replace(/-pantheon$/, "")
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/**
 * A swimlane deep-time chart: every deity that carries a *dated* primary source
 * is plotted at its earliest attestation year, in its pantheon's lane. Deities
 * without a datable source are honestly omitted — nothing is placed by guess.
 */
export function AttestationTimeline() {
  const [hover, setHover] = useState<Point | null>(null);

  const { points, lanes, minYear, maxYear } = useMemo(() => {
    const pts: Point[] = [];
    for (const d of deities as DeityRecord[]) {
      const att = attestationOf(d.primarySources);
      if (att.earliestYear === null || !att.earliestSource) continue;
      pts.push({
        slug: d.slug,
        name: d.name,
        pantheonId: d.pantheonId,
        year: att.earliestYear,
        source: att.earliestSource.source,
      });
    }

    const laneOrder = Array.from(new Set(pts.map((p) => p.pantheonId)));
    // Order lanes by each pantheon's earliest point (oldest first).
    laneOrder.sort((a, b) => {
      const ea = Math.min(
        ...pts.filter((p) => p.pantheonId === a).map((p) => p.year),
      );
      const eb = Math.min(
        ...pts.filter((p) => p.pantheonId === b).map((p) => p.year),
      );
      return ea - eb;
    });

    const years = pts.map((p) => p.year);
    return {
      points: pts,
      lanes: laneOrder,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    };
  }, []);

  if (points.length === 0) return null;

  const span = Math.max(1, maxYear - minYear);
  const padY = Math.round(span * 0.06);
  const lo = minYear - padY;
  const hi = maxYear + padY;
  const xOf = (year: number) =>
    PAD_L + ((year - lo) / (hi - lo)) * (VIEW_W - PAD_L - PAD_R);
  const laneY = (i: number) => PAD_TOP + i * ROW_H + ROW_H / 2;
  const height = PAD_TOP + lanes.length * ROW_H + AXIS_H;

  // Axis ticks every 500 years across the domain.
  const ticks: number[] = [];
  const step = 500;
  const first = Math.ceil(lo / step) * step;
  for (let y = first; y <= hi; y += step) ticks.push(y);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-2xl text-gold">
          Deities by First Attestation
        </h2>
        <p className="text-sm text-parchment/50">
          {points.length} of {deities.length} placed by their earliest dated
          primary source
        </p>
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-gold/15 bg-midnight/40 p-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${height}`}
          className="h-auto w-full min-w-[720px]"
          role="img"
          aria-label="Deities plotted by earliest attested primary source, grouped by pantheon"
        >
          {/* Axis gridlines + year labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={xOf(t)}
                y1={PAD_TOP}
                x2={xOf(t)}
                y2={height - AXIS_H}
                stroke="rgba(212,175,55,0.10)"
              />
              <text
                x={xOf(t)}
                y={height - AXIS_H + 22}
                textAnchor="middle"
                className="fill-parchment/45"
                fontSize="12"
              >
                {t < 0 ? `${Math.abs(t)} BCE` : t === 0 ? "0" : `${t} CE`}
              </text>
            </g>
          ))}

          {/* Lanes */}
          {lanes.map((pid, i) => {
            const color = getPantheonColor(pid);
            return (
              <g key={pid}>
                <line
                  x1={PAD_L}
                  y1={laneY(i)}
                  x2={VIEW_W - PAD_R}
                  y2={laneY(i)}
                  stroke="rgba(255,255,255,0.05)"
                />
                <text
                  x={PAD_L - 12}
                  y={laneY(i) + 4}
                  textAnchor="end"
                  fill={color}
                  fontSize="13"
                  className="font-serif"
                >
                  {pantheonLabel(pid)}
                </text>
                {points
                  .filter((p) => p.pantheonId === pid)
                  .map((p) => (
                    <Link key={p.slug} href={`/deities/${p.slug}`}>
                      <circle
                        cx={xOf(p.year)}
                        cy={laneY(i)}
                        r={hover?.slug === p.slug ? 8 : 5}
                        fill={color}
                        fillOpacity={hover?.slug === p.slug ? 1 : 0.75}
                        stroke="rgba(11,12,20,0.8)"
                        strokeWidth={1}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHover(p)}
                        onMouseLeave={() => setHover(null)}
                      />
                    </Link>
                  ))}
              </g>
            );
          })}
        </svg>

        {hover && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-gold/30 bg-midnight/95 px-4 py-2 text-sm shadow-lg">
            <span className="font-serif text-gold">{hover.name}</span>
            <span className="text-parchment/60">
              {" "}
              · {formatYear(hover.year)}
            </span>
            <div className="text-xs italic text-parchment/50">
              {hover.source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttestationTimeline;
