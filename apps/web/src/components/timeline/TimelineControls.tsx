"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

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

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6 mb-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Timeline Filters
          </h2>
          <p className="text-sm text-muted-foreground">
            Set a custom year range or jump to a named era.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-base py-1 px-3 border-gold/30 bg-gold/5 text-gold font-mono"
          >
            {formatYear(currentRange[0])} — {formatYear(currentRange[1])}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRangeChange([minYear, maxYear])}
            aria-label="Reset Timeline"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>

      {/* Range Inputs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="timeline-start-year"
            className="text-sm font-medium text-foreground"
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
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs font-mono text-muted-foreground">
            {formatYear(currentRange[0])}
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="timeline-end-year"
            className="text-sm font-medium text-foreground"
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
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs font-mono text-muted-foreground">
            {formatYear(currentRange[1])}
          </p>
        </div>
      </div>

      {/* Quick Eras */}
      <div className="flex flex-wrap gap-2">
        {ERAS.map((era) => (
          <Button
            key={era.label}
            variant="outline"
            size="sm"
            onClick={() => onRangeChange(era.range as [number, number])}
            className="text-xs border-dashed border-border/60 hover:border-gold/50 hover:bg-gold/5 hover:text-gold"
          >
            {era.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
