"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineControlsProps {
  currentRange: [number, number];
  minYear: number;
  maxYear: number;
  onRangeChange: (range: [number, number]) => void;
}

const ERAS = [
  { label: "All Time", range: [-3500, 2025] },
  { label: "Bronze Age", range: [-3300, -1200] },
  { label: "Iron Age", range: [-1200, -500] },
  { label: "Classical", range: [-500, 476] },
  { label: "Medieval", range: [476, 1500] },
];

function formatYear(year: number) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

export function TimelineControls({
  currentRange,
  minYear,
  maxYear,
  onRangeChange,
}: TimelineControlsProps) {
  const updateBoundary = (index: 0 | 1, nextValue: number) => {
    const clamped = Math.min(maxYear, Math.max(minYear, nextValue));
    const nextRange: [number, number] = [...currentRange] as [number, number];
    nextRange[index] = clamped;

    if (index === 0 && nextRange[0] > nextRange[1]) {
      nextRange[1] = clamped;
    }

    if (index === 1 && nextRange[1] < nextRange[0]) {
      nextRange[0] = clamped;
    }

    onRangeChange(nextRange);
  };

  const inputClass =
    "h-10 w-28 rounded-md border border-border bg-background px-3 type-ui tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  return (
    <div
      role="group"
      aria-label="Timeline range"
      className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border/70 pb-4"
    >
      <div
        role="group"
        aria-label="Jump to an era"
        className="inline-flex flex-wrap rounded-md border border-border bg-muted/50 p-0.5"
      >
        {ERAS.map((era) => {
          const selected =
            currentRange[0] === era.range[0] &&
            currentRange[1] === era.range[1];
          return (
            <button
              key={era.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onRangeChange(era.range as [number, number])}
              className={cn(
                "inline-flex min-h-10 items-center rounded-[5px] px-3 type-ui font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                selected
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {era.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="timeline-start-year"
          className="type-ui font-medium text-muted-foreground"
        >
          Start year
        </label>
        <input
          id="timeline-start-year"
          type="number"
          inputMode="numeric"
          min={minYear}
          max={maxYear}
          step={50}
          value={currentRange[0]}
          onChange={(event) =>
            updateBoundary(0, Number.parseInt(event.target.value, 10))
          }
          className={inputClass}
        />
        <label
          htmlFor="timeline-end-year"
          className="type-ui font-medium text-muted-foreground"
        >
          End year
        </label>
        <input
          id="timeline-end-year"
          type="number"
          inputMode="numeric"
          min={minYear}
          max={maxYear}
          step={50}
          value={currentRange[1]}
          onChange={(event) =>
            updateBoundary(1, Number.parseInt(event.target.value, 10))
          }
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-1 lg:ml-auto">
        <output
          aria-live="polite"
          className="type-ui font-medium tabular-nums text-gold-text"
        >
          {formatYear(currentRange[0])} – {formatYear(currentRange[1])}
        </output>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRangeChange([minYear, maxYear])}
          aria-label="Reset Timeline"
        >
          <RotateCcw className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
