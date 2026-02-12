'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import * as d3 from 'd3'
import {
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  BookOpen,
  Sparkles,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  buildMythTimeline,
  groupEventsByEra,
  ERA_METADATA,
  getPantheonColors,
  type TimelineEvent,
  type MythologicalEra,
  type Story,
  type Pantheon,
} from '@/lib/story-timeline'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryTimelineViewProps {
  stories: Story[]
  pantheons: Pantheon[]
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function EraMarker({ era, isActive }: { era: MythologicalEra; isActive: boolean }) {
  const meta = ERA_METADATA[era]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300',
        meta.bgColor,
        meta.borderColor,
        isActive && 'ring-2 ring-white/20 scale-[1.02]'
      )}
    >
      <div className={cn('w-3 h-3 rounded-full', meta.color.replace('text-', 'bg-'))} />
      <div>
        <h3 className={cn('font-serif font-semibold text-sm', meta.color)}>
          {meta.label}
        </h3>
        <p className="text-[10px] text-muted-foreground line-clamp-1">
          {meta.description}
        </p>
      </div>
    </motion.div>
  )
}

function TimelineEventCard({
  event,
  isExpanded,
  onToggle,
  index,
}: {
  event: TimelineEvent
  isExpanded: boolean
  onToggle: () => void
  index: number
}) {
  const colors = getPantheonColors(event.pantheon)
  const eraColors = ERA_METADATA[event.era]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative"
    >
      {/* Timeline connector line */}
      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border/50 -z-10" />

      {/* Event node */}
      <div className="flex items-start gap-4">
        {/* Timeline dot */}
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
            'bg-background transition-all duration-300',
            colors.border,
            isExpanded && 'scale-110'
          )}
        >
          <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
        </div>

        {/* Event card */}
        <div className="flex-1 pb-6">
          <button
            onClick={onToggle}
            className={cn(
              'w-full text-left p-4 rounded-xl border transition-all duration-300',
              'hover:shadow-lg hover:scale-[1.01]',
              colors.bg,
              colors.border,
              isExpanded && 'ring-2 ring-white/10'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', eraColors.borderColor)}
                  >
                    {eraColors.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', colors.border)}
                  >
                    {event.pantheonName}
                  </Badge>
                  {event.category && (
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {event.category}
                    </span>
                  )}
                </div>
                <h4 className={cn('font-serif font-semibold text-base', colors.text)}>
                  {event.title}
                </h4>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/stories/${event.slug}`}
                      onClick={e => e.stopPropagation()}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium',
                        'px-3 py-1.5 rounded-lg',
                        'bg-white/5 hover:bg-white/10 transition-colors',
                        colors.text
                      )}
                    >
                      <BookOpen className="w-3 h-3" />
                      Read Full Story
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// D3 Visualization Component
// ---------------------------------------------------------------------------

function D3TimelineVisualization({
  events,
  onEventClick,
  selectedEvent,
}: {
  events: TimelineEvent[]
  onEventClick: (event: TimelineEvent) => void
  selectedEvent: string | null
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Group events by era for visualization
  const groupedEvents = useMemo(() => groupEventsByEra(events), [events])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(400, entry.contentRect.width * 0.4),
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 60, right: 40, bottom: 40, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const eras: MythologicalEra[] = ['primordial', 'creation', 'golden-age', 'heroic', 'decline']

    // Create scales
    const xScale = d3
      .scaleBand<MythologicalEra>()
      .domain(eras)
      .range([0, width])
      .padding(0.1)

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Draw era backgrounds
    eras.forEach((era, i) => {
      const eraColor = ERA_METADATA[era].color.replace('text-', '')
      const hue = eraColor.includes('violet')
        ? 270
        : eraColor.includes('amber')
          ? 45
          : eraColor.includes('yellow')
            ? 50
            : eraColor.includes('blue')
              ? 210
              : 0

      g.append('rect')
        .attr('x', xScale(era) || 0)
        .attr('y', 0)
        .attr('width', xScale.bandwidth())
        .attr('height', height)
        .attr('fill', `hsla(${hue}, 70%, 50%, 0.08)`)
        .attr('rx', 8)
    })

    // Draw era labels
    g.selectAll('.era-label')
      .data(eras)
      .join('text')
      .attr('class', 'era-label')
      .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7)
      .attr('font-size', '12px')
      .attr('font-family', 'var(--font-serif)')
      .attr('font-weight', '600')
      .text(d => ERA_METADATA[d].label)

    // Draw events for each era
    eras.forEach(era => {
      const eraEvents = groupedEvents.get(era) || []
      if (eraEvents.length === 0) return

      const eraX = xScale(era) || 0
      const eraWidth = xScale.bandwidth()

      // Y scale for events within era
      const yScale = d3
        .scalePoint()
        .domain(eraEvents.map(e => e.id))
        .range([30, height - 30])
        .padding(0.5)

      // Draw connection line
      if (eraEvents.length > 1) {
        const lineData = eraEvents.map(e => ({
          x: eraX + eraWidth / 2,
          y: yScale(e.id) || 0,
        }))

        g.append('path')
          .datum(lineData)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,0.15)')
          .attr('stroke-width', 2)
          .attr(
            'd',
            d3
              .line<{ x: number; y: number }>()
              .x(d => d.x)
              .y(d => d.y)
              .curve(d3.curveMonotoneY)
          )
      }

      // Draw event nodes
      const eventGroups = g
        .selectAll(`.event-${era}`)
        .data(eraEvents)
        .join('g')
        .attr('class', `event-${era}`)
        .attr('transform', d => `translate(${eraX + eraWidth / 2}, ${yScale(d.id)})`)
        .style('cursor', 'pointer')
        .on('click', (_, d) => onEventClick(d))

      // Event circles
      eventGroups
        .append('circle')
        .attr('r', d => (selectedEvent === d.id ? 12 : 8))
        .attr('fill', d => {
          const colors = getPantheonColors(d.pantheon)
          return colors.dot.replace('bg-', '').includes('500')
            ? `hsl(var(--${colors.dot.replace('bg-', '')}))`
            : '#6b7280'
        })
        .attr('stroke', d => (selectedEvent === d.id ? 'white' : 'rgba(255,255,255,0.3)'))
        .attr('stroke-width', d => (selectedEvent === d.id ? 3 : 1))
        .attr('opacity', d => (selectedEvent === d.id ? 1 : 0.8))
        .attr('class', 'transition-all duration-300')

      // Event labels
      eventGroups
        .append('text')
        .attr('x', 16)
        .attr('y', 4)
        .attr('fill', 'currentColor')
        .attr('font-size', '11px')
        .attr('opacity', 0.8)
        .text(d => (d.title.length > 25 ? d.title.substring(0, 22) + '...' : d.title))
    })

    // Add era flow arrows
    for (let i = 0; i < eras.length - 1; i++) {
      const currentEra = eras[i]
      const nextEra = eras[i + 1]
      const x1 = (xScale(currentEra) || 0) + xScale.bandwidth()
      const x2 = xScale(nextEra) || 0

      g.append('line')
        .attr('x1', x1 + 5)
        .attr('y1', height / 2)
        .attr('x2', x2 - 5)
        .attr('y2', height / 2)
        .attr('stroke', 'rgba(255,255,255,0.2)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('marker-end', 'url(#arrow)')
    }

    // Add arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(255,255,255,0.3)')
  }, [events, dimensions, groupedEvents, onEventClick, selectedEvent])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function StoryTimelineView({ stories, pantheons }: StoryTimelineViewProps) {
  const [selectedPantheon, setSelectedPantheon] = useState<string>('all')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list')
  const [showFilters, setShowFilters] = useState(false)

  // Build timeline data
  const timelineEvents = useMemo(
    () =>
      buildMythTimeline(
        stories,
        pantheons,
        selectedPantheon === 'all' ? undefined : selectedPantheon
      ),
    [stories, pantheons, selectedPantheon]
  )

  // Group by era for list view
  const eventsByEra = useMemo(() => groupEventsByEra(timelineEvents), [timelineEvents])

  // Get available pantheons
  const availablePantheons = useMemo(() => {
    const ids = new Set(stories.map(s => s.pantheonId))
    return pantheons.filter(p => ids.has(p.id))
  }, [stories, pantheons])

  const toggleEvent = (eventId: string) => {
    setExpandedEvent(prev => (prev === eventId ? null : eventId))
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </Button>
          <Button
            variant={viewMode === 'visual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('visual')}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Visual</span>
          </Button>
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          {selectedPantheon !== 'all' && (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {availablePantheons.find(p => p.id === selectedPantheon)?.name || '1'}
            </Badge>
          )}
        </Button>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Filter by Pantheon</h3>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPantheon === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPantheon('all')}
                >
                  All Pantheons
                </Button>
                {availablePantheons.map(pantheon => {
                  const colors = getPantheonColors(pantheon.id)
                  return (
                    <Button
                      key={pantheon.id}
                      variant={selectedPantheon === pantheon.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPantheon(pantheon.id)}
                      className="gap-1.5"
                    >
                      <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                      {pantheon.name.replace(' Pantheon', '')}
                    </Button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Era Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {(['primordial', 'creation', 'golden-age', 'heroic', 'decline'] as MythologicalEra[]).map(
          era => (
            <EraMarker
              key={era}
              era={era}
              isActive={Array.from(eventsByEra.get(era) || []).length > 0}
            />
          )
        )}
      </div>

      {/* Timeline Content */}
      {viewMode === 'visual' ? (
        <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm p-4 overflow-hidden">
          <D3TimelineVisualization
            events={timelineEvents}
            onEventClick={event => toggleEvent(event.id)}
            selectedEvent={expandedEvent}
          />

          {/* Selected Event Detail */}
          <AnimatePresence>
            {expandedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 p-4 rounded-xl border border-border bg-card/50"
              >
                {(() => {
                  const event = timelineEvents.find(e => e.id === expandedEvent)
                  if (!event) return null
                  const colors = getPantheonColors(event.pantheon)
                  return (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn('text-[10px]', colors.border)}>
                              {event.pantheonName}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px]', ERA_METADATA[event.era].borderColor)}
                            >
                              {ERA_METADATA[event.era].label}
                            </Badge>
                          </div>
                          <h3 className={cn('font-serif text-lg font-semibold', colors.text)}>
                            {event.title}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setExpandedEvent(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {event.description}
                      </p>
                      <Link
                        href={`/stories/${event.slug}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium mt-3',
                          'px-3 py-1.5 rounded-lg',
                          'bg-white/5 hover:bg-white/10 transition-colors',
                          colors.text
                        )}
                      >
                        <BookOpen className="w-3 h-3" />
                        Read Full Story
                      </Link>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="space-y-8">
          {(['primordial', 'creation', 'golden-age', 'heroic', 'decline'] as MythologicalEra[]).map(
            era => {
              const eraEvents = eventsByEra.get(era) || []
              if (eraEvents.length === 0) return null

              const meta = ERA_METADATA[era]

              return (
                <motion.div
                  key={era}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Era Header */}
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border',
                      meta.bgColor,
                      meta.borderColor
                    )}
                  >
                    <div
                      className={cn('w-4 h-4 rounded-full', meta.color.replace('text-', 'bg-'))}
                    />
                    <div>
                      <h2 className={cn('font-serif font-bold text-lg', meta.color)}>
                        {meta.label}
                      </h2>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {eraEvents.length} {eraEvents.length === 1 ? 'story' : 'stories'}
                    </Badge>
                  </div>

                  {/* Events */}
                  <div className="pl-4">
                    {eraEvents.map((event, index) => (
                      <TimelineEventCard
                        key={event.id}
                        event={event}
                        isExpanded={expandedEvent === event.id}
                        onToggle={() => toggleEvent(event.id)}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              )
            }
          )}
        </div>
      )}

      {/* Empty State */}
      {timelineEvents.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
            No Stories Found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try selecting a different pantheon or removing filters.
          </p>
        </div>
      )}
    </div>
  )
}
