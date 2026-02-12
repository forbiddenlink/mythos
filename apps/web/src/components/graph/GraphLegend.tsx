'use client';

import { cn } from '@/lib/utils';

interface PantheonColor {
  id: string;
  name: string;
  color: string;
}

interface GraphLegendProps {
  pantheonColors: PantheonColor[];
  showRelationships?: boolean;
  className?: string;
}

export function GraphLegend({
  pantheonColors,
  showRelationships = true,
  className
}: GraphLegendProps) {
  return (
    <div className={cn(
      "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg",
      className
    )}>
      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">Legend</h3>

      {/* Pantheon Colors */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Pantheons
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {pantheonColors.map((pantheon) => (
            <div key={pantheon.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: pantheon.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                {pantheon.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship Types */}
      {showRelationships && (
        <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Relationships
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-slate-600 dark:bg-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-300">Parent/Child</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-pink-500" style={{
                background: 'repeating-linear-gradient(90deg, #ec4899, #ec4899 4px, transparent 4px, transparent 8px)'
              }} />
              <span className="text-xs text-slate-600 dark:text-slate-300">Spouse/Lover</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500" style={{
                background: 'repeating-linear-gradient(90deg, #3b82f6, #3b82f6 2px, transparent 2px, transparent 4px)'
              }} />
              <span className="text-xs text-slate-600 dark:text-slate-300">Sibling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 rounded-full" style={{
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                boxShadow: '0 0 8px #fbbf24'
              }} />
              <span className="text-xs text-slate-600 dark:text-slate-300">Cross-Pantheon</span>
            </div>
          </div>
        </div>
      )}

      {/* Node Size */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Node Size
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-300">Major</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-300">Minor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
