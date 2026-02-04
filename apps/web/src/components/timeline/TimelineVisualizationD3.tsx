'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
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

interface TimelineEvent {
    id: string
    title: string
    year: number
    pantheonId: string
    type: 'mythical' | 'historical'
    description: string
}

interface TimelineVisualizationProps {
    pantheons: Pantheon[]
    events: TimelineEvent[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMELINE_START = -3500
const TIMELINE_END = 2025 // Extended to present
const MARGIN = { top: 60, right: 40, bottom: 40, left: 220 } // Left margin for pantheon labels

const PANTHEON_COLORS: Record<string, string> = {
    'greek-pantheon': '#3b82f6', // blue-500
    'norse-pantheon': '#10b981', // emerald-500
    'egyptian-pantheon': '#f59e0b', // amber-500
    'roman-pantheon': '#ef4444', // red-500
    'hindu-pantheon': '#f97316', // orange-500
    'japanese-pantheon': '#f43f5e', // rose-500
    'celtic-pantheon': '#14b8a6', // teal-500
    'aztec-pantheon': '#84cc16', // lime-500
    'chinese-pantheon': '#a855f7', // purple-500
}

const ERA_MARKERS = [
    { start: -3500, end: -3000, label: 'Early Bronze', color: 'rgba(180, 83, 9, 0.1)' },
    { start: -3000, end: -1200, label: 'Bronze Age', color: 'rgba(217, 119, 6, 0.08)' },
    { start: -1200, end: -800, label: 'Iron Age', color: 'rgba(100, 116, 139, 0.1)' },
    { start: -800, end: -500, label: 'Archaic', color: 'rgba(37, 99, 235, 0.05)' },
    { start: -500, end: -323, label: 'Classical', color: 'rgba(59, 130, 246, 0.08)' },
    { start: -323, end: -31, label: 'Hellenistic', color: 'rgba(99, 102, 241, 0.08)' },
    { start: -31, end: 476, label: 'Roman Empire', color: 'rgba(220, 38, 38, 0.08)' },
    { start: 476, end: 1000, label: 'Early Medieval', color: 'rgba(120, 113, 108, 0.1)' },
    { start: 1000, end: 1500, label: 'Medieval', color: 'rgba(87, 83, 78, 0.1)' },
    { start: 1500, end: 2025, label: 'Modern Era', color: 'rgba(120, 113, 108, 0.05)' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatYear(year: number): string {
    if (year < 0) return `${Math.abs(year)} BCE`
    if (year === 0) return '1 CE'
    return `${year} CE`
}

// ---------------------------------------------------------------------------
// D3 Component
// ---------------------------------------------------------------------------

export function TimelineVisualizationD3({ pantheons, events }: TimelineVisualizationProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    const [selectedPantheon, setSelectedPantheon] = useState<string | null>(null)
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null)

    // Initialize D3
    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return

        const svg = d3.select(svgRef.current)
        const container = containerRef.current
        const { width } = container.getBoundingClientRect()
        const height = 600
        const innerWidth = width - MARGIN.left - MARGIN.right
        const innerHeight = height - MARGIN.top - MARGIN.bottom

        // Clear previous
        svg.selectAll('*').remove()

        // -------------------------------------------------------
        // Setup Scales & Zoom
        // -------------------------------------------------------
        const xScaleOriginal = d3.scaleLinear()
            .domain([TIMELINE_START, TIMELINE_END])
            .range([0, innerWidth])

        let xScale = xScaleOriginal

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 50]) // Zoom from 1x to 50x
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on('zoom', (event) => {
                xScale = event.transform.rescaleX(xScaleOriginal)
                update()
            })

        svg.call(zoom)
            // Disable double click zoom
            .on("dblclick.zoom", null)

        // -------------------------------------------------------
        // Layers
        // -------------------------------------------------------
        const defs = svg.append('defs')

        // Gradients for bars
        Object.entries(PANTHEON_COLORS).forEach(([id, color]) => {
            const gradient = defs.append('linearGradient')
                .attr('id', `grad-${id}`)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%')

            gradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.6)
            gradient.append('stop').attr('offset', '50%').attr('stop-color', color).attr('stop-opacity', 0.9)
            gradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.6)
        })

        const bgLayer = svg.append('g').attr('class', 'bg-layer').attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
        const axisLayer = svg.append('g').attr('class', 'axis-layer').attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
        const contentLayer = svg.append('g').attr('class', 'content-layer').attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)

        // Clip path ensures content doesn't draw over margins
        defs.append('clipPath')
            .attr('id', 'content-clip')
            .append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('x', 0)
            .attr('y', 0)

        bgLayer.attr('clip-path', 'url(#content-clip)')
        contentLayer.attr('clip-path', 'url(#content-clip)')

        // -------------------------------------------------------
        // Draw Function
        // -------------------------------------------------------
        function update() {
            // 1. Eras (Background)
            const eraSelection = bgLayer.selectAll('.era').data(ERA_MARKERS)

            eraSelection.join('rect')
                .attr('class', 'era')
                .attr('x', d => Math.max(0, xScale(d.start)))
                .attr('width', d => Math.max(0, xScale(d.end) - xScale(d.start)))
                .attr('y', 0)
                .attr('height', innerHeight)
                .attr('fill', d => d.color)

            // Era Labels (only if wide enough)
            const eraLabels = bgLayer.selectAll('.era-label').data(ERA_MARKERS)
            eraLabels.join('text')
                .attr('class', 'era-label')
                .attr('x', d => xScale(d.start) + (xScale(d.end) - xScale(d.start)) / 2)
                .attr('y', innerHeight + 20)
                .attr('text-anchor', 'middle')
                .attr('fill', 'rgba(255,255,255,0.4)')
                .attr('font-size', 10)
                .text(d => d.label)
                .attr('opacity', d => (xScale(d.end) - xScale(d.start)) > 60 ? 1 : 0)

            // 2. Axes & Grid
            const xAxis = d3.axisTop(xScale)
                .tickFormat((d) => formatYear(d as number))
                .ticks(width / 100) // Density based on width
                .tickSize(-innerHeight) // Full height grid lines

            axisLayer.call(xAxis)
                .attr('class', 'axis-layer text-[10px] text-muted-foreground/50')

            // Style axis lines
            axisLayer.selectAll('.tick line')
                .attr('stroke', 'rgba(255,255,255,0.1)')
                .attr('stroke-dasharray', '2,2')

            axisLayer.select('.domain').remove() // Remove main axis line

            // 3. Pantheon Bars
            const sortedPantheons = [...pantheons].sort((a, b) => (a.timePeriodStart ?? 0) - (b.timePeriodStart ?? 0))
            const barHeight = 24
            const barGap = 12

            const bars = contentLayer.selectAll('.pantheon-group')
                .data(sortedPantheons)

            const groups = bars.join('g')
                .attr('class', 'pantheon-group cursor-pointer')
                .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barGap)})`)
                // Click to select
                .on('click', (e, d) => {
                    setSelectedPantheon(current => current === d.id ? null : d.id)
                })

            // The Bar Base
            groups.each(function (d) {
                const g = d3.select(this)
                const startX = xScale(d.timePeriodStart ?? TIMELINE_START)
                const endX = xScale(d.timePeriodEnd ?? new Date().getFullYear())
                const barW = Math.max(4, endX - startX)

                // Clear old rects/text in this group to avoid dupes on re-render
                g.selectAll('*').remove()

                // Bar Rect
                g.append('rect')
                    .attr('x', startX)
                    .attr('y', 0)
                    .attr('width', barW)
                    .attr('height', barHeight)
                    .attr('rx', 4)
                    .attr('fill', `url(#grad-${d.id})`)
                    .attr('stroke', PANTHEON_COLORS[d.id])
                    .attr('stroke-width', 1)
                    .attr('stroke-opacity', 0.5)
                    .attr('opacity', selectedPantheon && selectedPantheon !== d.id ? 0.3 : 1) // Dim if not selected
                    .transition()
                    .duration(200)

                // Events for this pantheon
                const pantheonEvents = events.filter(e => e.pantheonId === d.id)

                pantheonEvents.forEach(ev => {
                    const evX = xScale(ev.year)
                    if (evX >= startX && evX <= startX + barW) {
                        g.append('circle')
                            .attr('cx', evX)
                            .attr('cy', barHeight / 2)
                            .attr('r', 5)
                            .attr('fill', 'white')
                            .attr('stroke', PANTHEON_COLORS[d.id])
                            .attr('class', 'event-marker hover:scale-150 transition-transform')
                            .style('cursor', 'help')
                            // Tooltip Event
                            .on('mouseenter', (e) => {
                                const rect = container.getBoundingClientRect()
                                setTooltip({
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                    content: (
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-[#ffd700] uppercase tracking-wider">{ev.type}</div>
                                            <div className="font-serif font-semibold text-base">{ev.title}</div>
                                            <div className="text-xs text-muted-foreground">{formatYear(ev.year)}</div>
                                            <p className="text-xs leading-relaxed max-w-[200px]">{ev.description}</p>
                                        </div>
                                    )
                                })
                            })
                            .on('mouseleave', () => setTooltip(null))
                    }
                })
            })

            // 4. Labels (Left Gutter - Outside Clip)
            // Use a known class selector or ID to ensure we don't duplicate
            let labelLayer = svg.select<SVGGElement>('.label-layer')
            if (labelLayer.empty()) {
                labelLayer = svg.append('g')
                    .attr('class', 'label-layer')
                    .attr('transform', `translate(0, ${MARGIN.top})`)
            }

            // Using proper generics for selectAll to fix TypeScript error
            const labels = labelLayer.selectAll<SVGGElement, Pantheon>('.row-label')
                .data(sortedPantheons, (d) => d.id)

            labels.join(
                enter => {
                    const g = enter.append('g')
                        .attr('class', 'row-label cursor-pointer')

                    // Background
                    g.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', MARGIN.left - 10)
                        .attr('height', barHeight)
                        .attr('rx', 4)
                        .attr('fill', 'transparent')
                        .attr('class', 'hover:bg-white/5 transition-colors')

                    // Dot
                    g.append('circle')
                        .attr('cx', 20)
                        .attr('cy', barHeight / 2)
                        .attr('r', 4)
                        .attr('class', 'label-dot')

                    // Text
                    g.append('text')
                        .attr('x', 35)
                        .attr('y', barHeight / 2)
                        .attr('dy', '0.32em')
                        .attr('class', 'label-text')
                        .style('font-family', 'var(--font-serif)')

                    return g
                },
                update => update,
                exit => exit.remove()
            )
                .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barGap)})`)
                .each(function (d) {
                    const g = d3.select(this)

                    // Update interactions & styles
                    g.select('rect')
                        .on('click', () => setSelectedPantheon(current => current === d.id ? null : d.id))

                    g.select('.label-dot')
                        .attr('fill', PANTHEON_COLORS[d.id] || '#ccc')

                    g.select('.label-text')
                        .text(d.name)
                        .attr('fill', 'currentColor')
                        .attr('class', cn('text-sm font-medium transition-colors label-text', selectedPantheon === d.id ? 'text-white' : 'text-muted-foreground'))
                })

        }

        // Initial draw
        update()

        // Cleanup
        return () => {
            // D3 cleanup if needed
        }
    }, [pantheons, events, selectedPantheon]) // Re-run when selection changes

    return (
        <div className="relative w-full rounded-xl border border-border bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Header / Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <Badge variant="outline" className="bg-black/50 backdrop-blur border-gold/20 text-gold">
                    <span className="mr-1">●</span> Interactive Mode
                </Badge>
                <Button size="icon-sm" variant="outline" className="h-8 w-8 bg-black/50" onClick={() => {
                    // Logic to reset zoom would involve re-selecting svg and invoking zoom.transform
                    if (svgRef.current) {
                        const svg = d3.select(svgRef.current)
                        // @ts-ignore
                        svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity)
                    }
                }}>
                    <RotateCcw className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div ref={containerRef} className="w-full h-[600px] relative">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    className="w-full h-full touch-none select-none"
                />

                {/* Tooltip Overlay */}
                <AnimatePresence>
                    {tooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute pointer-events-none z-50 p-3 rounded-lg border border-gold/30 bg-black/90 backdrop-blur-xl shadow-xl max-w-xs"
                            style={{
                                left: tooltip.x + 20,
                                top: tooltip.y + 20
                            }}
                        >
                            {tooltip.content}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Info */}
            <div className="p-3 border-t border-white/5 bg-white/5 text-[10px] text-center text-muted-foreground">
                Scroll to zoom &middot; Drag to pan &middot; Hover events for details
            </div>
        </div>
    )
}
