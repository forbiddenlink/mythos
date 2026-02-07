'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface TimelineControlsProps {
    currentRange: [number, number];
    minYear: number;
    maxYear: number;
    onRangeChange: (range: [number, number]) => void;
}

const ERAS = [
    { label: 'All Time', range: [-3500, 2025] },
    { label: 'Bronze Age', range: [-3300, -1200] },
    { label: 'Iron Age', range: [-1200, -500] },
    { label: 'Classical', range: [-500, 476] },
    { label: 'Medieval', range: [476, 1500] },
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
    return (
        <div className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6 mb-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">Timeline Filters</h3>
                    <p className="text-sm text-muted-foreground">Adjust the slider to focus on specific eras.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base py-1 px-3 border-gold/30 bg-gold/5 text-gold font-mono">
                        {formatYear(currentRange[0])} — {formatYear(currentRange[1])}
                    </Badge>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRangeChange([minYear, maxYear])}
                        title="Reset Timeline"
                    >
                        <RotateCcw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                </div>
            </div>

            {/* Slider */}
            <div className="px-2">
                <Slider
                    defaultValue={[minYear, maxYear]}
                    value={currentRange}
                    min={minYear}
                    max={maxYear}
                    step={50}
                    onValueChange={(val) => onRangeChange(val as [number, number])}
                    className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono mt-1">
                    <span>{formatYear(minYear)}</span>
                    <span>{formatYear(maxYear)}</span>
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
