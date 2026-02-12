'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, RotateCcw, MapPin, Filter, X, Crown, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Pantheon {
  id: string
  name: string
  slug: string
  culture: string
  region: string
  timePeriodStart: number | null
  timePeriodEnd: number | null
  description: string | null
}

interface Story {
  id: string
  pantheonId: string
  title: string
  slug: string
  summary: string
  category?: string
}

interface Deity {
  id: string
  pantheonId: string
  name: string
  slug: string
  domain: string[]
  importanceRank: number
}

interface TimelineVisualizationProps {
  pantheons: Pantheon[]
  stories: Story[]
  deities: Deity[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMELINE_START = -3500
const TIMELINE_END = 1600

const PANTHEON_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'greek-pantheon':    { bg: 'bg-blue-500/20',    border: 'border-blue-500/40',    text: 'text-blue-400',    glow: 'shadow-blue-500/20' },
  'norse-pantheon':    { bg: 'bg-emerald-500/20',  border: 'border-emerald-500/40',  text: 'text-emerald-400',  glow: 'shadow-emerald-500/20' },
  'egyptian-pantheon': { bg: 'bg-amber-500/20',   border: 'border-amber-500/40',   text: 'text-amber-400',   glow: 'shadow-amber-500/20' },
  'roman-pantheon':    { bg: 'bg-red-500/20',     border: 'border-red-500/40',     text: 'text-red-400',     glow: 'shadow-red-500/20' },
  'hindu-pantheon':    { bg: 'bg-orange-500/20',  border: 'border-orange-500/40',  text: 'text-orange-400',  glow: 'shadow-orange-500/20' },
  'japanese-pantheon': { bg: 'bg-rose-500/20',    border: 'border-rose-500/40',    text: 'text-rose-400',    glow: 'shadow-rose-500/20' },
  'celtic-pantheon':   { bg: 'bg-teal-500/20',    border: 'border-teal-500/40',    text: 'text-teal-400',    glow: 'shadow-teal-500/20' },
  'aztec-pantheon':    { bg: 'bg-lime-500/20',    border: 'border-lime-500/40',    text: 'text-lime-400',    glow: 'shadow-lime-500/20' },
  'chinese-pantheon':  { bg: 'bg-purple-500/20',  border: 'border-purple-500/40',  text: 'text-purple-400',  glow: 'shadow-purple-500/20' },
  'mesopotamian-pantheon': { bg: 'bg-yellow-700/20', border: 'border-yellow-700/40', text: 'text-yellow-600', glow: 'shadow-yellow-700/20' },
}

const PANTHEON_BAR_COLORS: Record<string, string> = {
  'greek-pantheon':    'from-blue-600 to-blue-400',
  'norse-pantheon':    'from-emerald-600 to-emerald-400',
  'egyptian-pantheon': 'from-amber-600 to-amber-400',
  'roman-pantheon':    'from-red-600 to-red-400',
  'hindu-pantheon':    'from-orange-600 to-orange-400',
  'japanese-pantheon': 'from-rose-600 to-rose-400',
  'celtic-pantheon':   'from-teal-600 to-teal-400',
  'aztec-pantheon':    'from-lime-600 to-lime-400',
  'chinese-pantheon':  'from-purple-600 to-purple-400',
  'mesopotamian-pantheon': 'from-yellow-700 to-yellow-500',
}

const ERA_MARKERS = [
  { start: -3500, end: -3000, label: 'Early Bronze Age',   color: 'bg-amber-700/30' },
  { start: -3000, end: -1200, label: 'Bronze Age',         color: 'bg-amber-600/25' },
  { start: -1200, end: -800,  label: 'Iron Age',           color: 'bg-slate-500/20' },
  { start: -800,  end: -500,  label: 'Archaic Period',     color: 'bg-blue-600/15' },
  { start: -500,  end: -323,  label: 'Classical Period',   color: 'bg-blue-500/20' },
  { start: -323,  end: -31,   label: 'Hellenistic Period', color: 'bg-indigo-500/15' },
  { start: -31,   end: 476,   label: 'Roman Imperial',     color: 'bg-red-500/15' },
  { start: 476,   end: 1000,  label: 'Early Medieval',     color: 'bg-stone-500/15' },
  { start: 1000,  end: 1600,  label: 'Medieval / Post-Classical', color: 'bg-stone-600/15' },
]

const REGION_GROUPS: Record<string, string[]> = {
  'Europe': ['Mediterranean', 'Scandinavia', 'Italian Peninsula and Mediterranean', 'Western Europe'],
  'Asia': ['Indian Subcontinent', 'Japanese Archipelago', 'China'],
  'Africa': ['Nile River Valley'],
  'Americas': ['Central Mexico'],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`
  if (year === 0) return '1 CE'
  return `${year} CE`
}

function yearToPercent(year: number, start: number, end: number): number {
  return ((year - start) / (end - start)) * 100
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimelineVisualization({ pantheons, stories, deities }: TimelineVisualizationProps) {
  const [expandedPantheon, setExpandedPantheon] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>('All')
  const [showFilters, setShowFilters] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Zoom calculations
  const zoomedStart = useMemo(() => {
    const totalRange = TIMELINE_END - TIMELINE_START
    const visibleRange = totalRange / zoomLevel
    const center = TIMELINE_START + totalRange / 2 + panOffset
    return Math.max(TIMELINE_START, center - visibleRange / 2)
  }, [zoomLevel, panOffset])

  const zoomedEnd = useMemo(() => {
    const totalRange = TIMELINE_END - TIMELINE_START
    const visibleRange = totalRange / zoomLevel
    const center = TIMELINE_START + totalRange / 2 + panOffset
    return Math.min(TIMELINE_END, center + visibleRange / 2)
  }, [zoomLevel, panOffset])

  // Filter pantheons by region
  const filteredPantheons = useMemo(() => {
    if (regionFilter === 'All') return pantheons

    const regionGroup = REGION_GROUPS[regionFilter]
    if (regionGroup) {
      return pantheons.filter(p => regionGroup.includes(p.region))
    }

    return pantheons.filter(p => p.region === regionFilter)
  }, [pantheons, regionFilter])

  // Sort pantheons by start date
  const sortedPantheons = useMemo(() => {
    return [...filteredPantheons].sort((a, b) => (a.timePeriodStart ?? 0) - (b.timePeriodStart ?? 0))
  }, [filteredPantheons])

  // Get deities and stories for a pantheon
  const getPantheonDeities = useCallback((pantheonId: string) => {
    return deities
      .filter(d => d.pantheonId === pantheonId)
      .sort((a, b) => a.importanceRank - b.importanceRank)
      .slice(0, 6)
  }, [deities])

  const getPantheonStories = useCallback((pantheonId: string) => {
    return stories.filter(s => s.pantheonId === pantheonId).slice(0, 4)
  }, [stories])

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 8))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 1))
  const handleReset = () => {
    setZoomLevel(1)
    setPanOffset(0)
  }

  // Pan via drag or buttons
  const handlePanLeft = () => {
    const totalRange = TIMELINE_END - TIMELINE_START
    setPanOffset(prev => Math.max(prev - totalRange * 0.1, -totalRange / 2))
  }
  const handlePanRight = () => {
    const totalRange = TIMELINE_END - TIMELINE_START
    setPanOffset(prev => Math.min(prev + totalRange * 0.1, totalRange / 2))
  }

  // Tick marks for the timeline axis
  const tickMarks = useMemo(() => {
    const range = zoomedEnd - zoomedStart
    let interval: number
    if (range > 3000) interval = 500
    else if (range > 1500) interval = 250
    else if (range > 750) interval = 100
    else if (range > 300) interval = 50
    else interval = 25

    const ticks: number[] = []
    const firstTick = Math.ceil(zoomedStart / interval) * interval
    for (let y = firstTick; y <= zoomedEnd; y += interval) {
      ticks.push(y)
    }
    return ticks
  }, [zoomedStart, zoomedEnd])

  const togglePantheon = (id: string) => {
    setExpandedPantheon(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Region Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter by Region</span>
          <span className="sm:hidden">Filter</span>
          {regionFilter !== 'All' && (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {regionFilter}
            </Badge>
          )}
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="outline" size="icon-sm" onClick={handlePanLeft} disabled={zoomLevel <= 1} aria-label="Pan left">
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={handleZoomOut} disabled={zoomLevel <= 1} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center tabular-nums">
            {zoomLevel.toFixed(1)}x
          </span>
          <Button variant="outline" size="icon-sm" onClick={handleZoomIn} disabled={zoomLevel >= 8} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={handlePanRight} disabled={zoomLevel <= 1} aria-label="Pan right">
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleReset} disabled={zoomLevel <= 1} aria-label="Reset zoom">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Region Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Filter by Region</h3>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={regionFilter === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRegionFilter('All')}
                >
                  All Regions
                </Button>
                {Object.keys(REGION_GROUPS).map(group => (
                  <Button
                    key={group}
                    variant={regionFilter === group ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRegionFilter(group)}
                    className="gap-1.5"
                  >
                    <MapPin className="h-3 w-3" />
                    {group}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Horizontal Timeline */}
      <div className="hidden md:block">
        <div
          ref={scrollContainerRef}
          className="relative rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden"
        >
          {/* Era background bands */}
          <div className="absolute inset-0 pointer-events-none">
            {ERA_MARKERS.map(era => {
              const left = yearToPercent(Math.max(era.start, zoomedStart), zoomedStart, zoomedEnd)
              const right = yearToPercent(Math.min(era.end, zoomedEnd), zoomedStart, zoomedEnd)
              if (left >= 100 || right <= 0) return null
              return (
                <div
                  key={era.label}
                  className={cn('absolute top-0 bottom-0', era.color)}
                  style={{
                    left: `${Math.max(0, left)}%`,
                    width: `${Math.min(100, right) - Math.max(0, left)}%`,
                  }}
                />
              )
            })}
          </div>

          {/* Era labels row */}
          <div className="relative h-8 border-b border-border/50">
            {ERA_MARKERS.map(era => {
              const left = yearToPercent(Math.max(era.start, zoomedStart), zoomedStart, zoomedEnd)
              const right = yearToPercent(Math.min(era.end, zoomedEnd), zoomedStart, zoomedEnd)
              const width = right - left
              if (left >= 100 || right <= 0 || width < 5) return null
              return (
                <div
                  key={era.label}
                  className="absolute top-0 h-full flex items-center justify-center overflow-hidden"
                  style={{
                    left: `${Math.max(0, left)}%`,
                    width: `${Math.min(100, right) - Math.max(0, left)}%`,
                  }}
                >
                  <span className="text-[10px] font-medium text-muted-foreground/70 whitespace-nowrap truncate px-1">
                    {era.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Year axis */}
          <div className="relative h-8 border-b border-border/30">
            {tickMarks.map(year => {
              const pos = yearToPercent(year, zoomedStart, zoomedEnd)
              return (
                <div
                  key={year}
                  className="absolute top-0 h-full flex flex-col items-center"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-px h-2 bg-border" />
                  <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap mt-0.5">
                    {formatYear(year)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Pantheon bars */}
          <div className="relative py-3 space-y-2 px-2">
            {sortedPantheons.map((pantheon, index) => {
              const start = pantheon.timePeriodStart ?? TIMELINE_START
              const end = pantheon.timePeriodEnd ?? TIMELINE_END
              const leftPct = yearToPercent(Math.max(start, zoomedStart), zoomedStart, zoomedEnd)
              const rightPct = yearToPercent(Math.min(end, zoomedEnd), zoomedStart, zoomedEnd)
              const widthPct = rightPct - leftPct

              if (leftPct >= 100 || rightPct <= 0) return null

              const isExpanded = expandedPantheon === pantheon.id
              const colors = PANTHEON_COLORS[pantheon.id] || PANTHEON_COLORS['greek-pantheon']
              const barGradient = PANTHEON_BAR_COLORS[pantheon.id] || 'from-gray-600 to-gray-400'
              const pantheonDeities = getPantheonDeities(pantheon.id)
              const pantheonStories = getPantheonStories(pantheon.id)

              return (
                <motion.div
                  key={pantheon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  {/* Bar Row */}
                  <div className="relative h-10 group">
                    {/* Pantheon label (left gutter) */}
                    <div
                      className="absolute top-0 h-10 flex items-center z-10"
                      style={{ left: `${Math.max(0, leftPct)}%` }}
                    >
                      <button
                        onClick={() => togglePantheon(pantheon.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200',
                          'hover:bg-white/10 dark:hover:bg-white/5',
                          colors.text,
                        )}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${pantheon.name}`}
                      >
                        <span className="whitespace-nowrap font-serif text-xs">{pantheon.name}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* Actual bar */}
                    <motion.div
                      className={cn(
                        'absolute top-7 h-2.5 rounded-full cursor-pointer',
                        `bg-gradient-to-r ${barGradient}`,
                        'hover:h-3 transition-all duration-200',
                        isExpanded && 'h-3 ring-2 ring-white/20',
                      )}
                      style={{
                        left: `${Math.max(0, leftPct)}%`,
                        width: `${Math.max(2, Math.min(100, widthPct))}%`,
                      }}
                      onClick={() => togglePantheon(pantheon.id)}
                      layoutId={`bar-${pantheon.id}`}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* "Ongoing" indicator */}
                      {pantheon.timePeriodEnd === null && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
                          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse-subtle" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <div className={cn(
                          'mx-2 mt-1 mb-3 p-4 rounded-xl border backdrop-blur-sm',
                          colors.bg, colors.border,
                        )}>
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className={cn('font-serif text-lg font-semibold', colors.text)}>
                                  {pantheon.name}
                                </h3>
                                <Badge variant="outline" className="text-[10px]">
                                  {formatYear(start)} - {pantheon.timePeriodEnd ? formatYear(end) : 'Present'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {pantheon.culture} &middot; {pantheon.region}
                              </p>
                              {pantheon.description && (
                                <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                                  {pantheon.description}
                                </p>
                              )}
                              <Link
                                href={`/pantheons/${pantheon.slug}`}
                                className={cn(
                                  'inline-flex items-center gap-1 text-xs font-medium mt-2 hover:underline',
                                  colors.text,
                                )}
                              >
                                View full pantheon &rarr;
                              </Link>
                            </div>

                            {/* Key Deities */}
                            <div className="lg:w-64">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Crown className="h-3.5 w-3.5 text-gold" />
                                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                  Key Deities
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {pantheonDeities.map((deity, di) => (
                                  <motion.div
                                    key={deity.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: di * 0.05 }}
                                  >
                                    <Link href={`/deities/${deity.slug}`}>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-[11px] cursor-pointer hover:bg-white/10 transition-colors',
                                          colors.border,
                                        )}
                                      >
                                        {deity.name}
                                      </Badge>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Key Stories */}
                            <div className="lg:w-56">
                              <div className="flex items-center gap-1.5 mb-2">
                                <BookOpen className="h-3.5 w-3.5 text-gold" />
                                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                  Key Stories
                                </h4>
                              </div>
                              <ul className="space-y-1">
                                {pantheonStories.map((story, si) => (
                                  <motion.li
                                    key={story.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: si * 0.06 }}
                                  >
                                    <Link
                                      href={`/stories/${story.slug}`}
                                      className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-1"
                                    >
                                      {story.title}
                                    </Link>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom year axis (mirror) */}
          <div className="relative h-6 border-t border-border/30">
            {tickMarks.map(year => {
              const pos = yearToPercent(year, zoomedStart, zoomedEnd)
              return (
                <div
                  key={year}
                  className="absolute bottom-0 h-full flex flex-col-reverse items-center"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-px h-2 bg-border" />
                  <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap">
                    {formatYear(year)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden space-y-0">
        {/* Vertical axis line */}
        <div className="relative pl-8">
          {/* Era Markers */}
          <div className="space-y-0 mb-6">
            {ERA_MARKERS.map((era, ei) => {
              const eraStart = Math.max(era.start, zoomedStart)
              const eraEnd = Math.min(era.end, zoomedEnd)
              if (eraStart >= zoomedEnd || eraEnd <= zoomedStart) return null

              // Get pantheons that overlap with this era
              const eraPantheons = sortedPantheons.filter(p => {
                const pStart = p.timePeriodStart ?? TIMELINE_START
                const pEnd = p.timePeriodEnd ?? TIMELINE_END
                return pStart < eraEnd && pEnd > eraStart
              })

              return (
                <motion.div
                  key={era.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ei * 0.06, duration: 0.5 }}
                  className="relative"
                >
                  {/* Era header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="absolute left-0 w-4 h-4 rounded-full border-2 border-gold/40 bg-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                    </div>
                    <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border/50" />
                    <div>
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        {era.label}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {formatYear(era.start)} - {formatYear(era.end)}
                      </span>
                    </div>
                  </div>

                  {/* Pantheons in this era */}
                  <div className="space-y-2 mb-6">
                    {eraPantheons.map((pantheon, pi) => {
                      const isExpanded2 = expandedPantheon === pantheon.id
                      const colors = PANTHEON_COLORS[pantheon.id] || PANTHEON_COLORS['greek-pantheon']
                      const barGradient = PANTHEON_BAR_COLORS[pantheon.id] || 'from-gray-600 to-gray-400'
                      const pantheonDeities2 = getPantheonDeities(pantheon.id)
                      const pantheonStories2 = getPantheonStories(pantheon.id)
                      const pStart = pantheon.timePeriodStart ?? TIMELINE_START
                      const pEnd = pantheon.timePeriodEnd ?? TIMELINE_END

                      return (
                        <motion.div
                          key={`${era.label}-${pantheon.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: pi * 0.05 + ei * 0.02 }}
                        >
                          <button
                            onClick={() => togglePantheon(pantheon.id)}
                            className={cn(
                              'w-full text-left p-3 rounded-lg border transition-all duration-200',
                              colors.bg, colors.border,
                              isExpanded2 && 'ring-1 ring-white/10',
                            )}
                            aria-expanded={isExpanded2}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', barGradient)} />
                                <span className={cn('font-serif text-sm font-medium', colors.text)}>
                                  {pantheon.name}
                                </span>
                              </div>
                              {isExpanded2 ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {formatYear(pStart)} - {pantheon.timePeriodEnd ? formatYear(pEnd) : 'Present'}
                            </div>
                          </button>

                          {/* Expanded mobile panel */}
                          <AnimatePresence>
                            {isExpanded2 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className={cn(
                                  'p-3 rounded-b-lg border-x border-b -mt-1',
                                  colors.bg, colors.border,
                                )}>
                                  {pantheon.description && (
                                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-3">
                                      {pantheon.description}
                                    </p>
                                  )}

                                  {/* Deities */}
                                  <div className="mb-3">
                                    <div className="flex items-center gap-1 mb-1.5">
                                      <Crown className="h-3 w-3 text-gold" />
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                                        Key Deities
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {pantheonDeities2.map(deity => (
                                        <Link key={deity.id} href={`/deities/${deity.slug}`}>
                                          <Badge variant="outline" className="text-[10px]">
                                            {deity.name}
                                          </Badge>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Stories */}
                                  <div className="mb-2">
                                    <div className="flex items-center gap-1 mb-1.5">
                                      <BookOpen className="h-3 w-3 text-gold" />
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                                        Key Stories
                                      </span>
                                    </div>
                                    <ul className="space-y-0.5">
                                      {pantheonStories2.map(story => (
                                        <li key={story.id}>
                                          <Link
                                            href={`/stories/${story.slug}`}
                                            className="text-[11px] text-muted-foreground hover:text-foreground"
                                          >
                                            {story.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <Link
                                    href={`/pantheons/${pantheon.slug}`}
                                    className={cn('text-xs font-medium hover:underline', colors.text)}
                                  >
                                    View pantheon &rarr;
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground font-medium">Legend:</span>
        {sortedPantheons.map(p => {
          const colors = PANTHEON_COLORS[p.id] || PANTHEON_COLORS['greek-pantheon']
          const barGradient = PANTHEON_BAR_COLORS[p.id] || 'from-gray-600 to-gray-400'
          return (
            <button
              key={p.id}
              onClick={() => togglePantheon(p.id)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all',
                'hover:bg-muted/50',
                expandedPantheon === p.id && 'bg-muted/80',
              )}
            >
              <div className={cn('w-3 h-1.5 rounded-full bg-gradient-to-r', barGradient)} />
              <span className={cn('whitespace-nowrap', colors.text)}>{p.name.replace(' Pantheon', '')}</span>
            </button>
          )
        })}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse-subtle" />
          <span className="text-[10px] text-muted-foreground">= Ongoing tradition</span>
        </div>
      </div>
    </div>
  )
}
