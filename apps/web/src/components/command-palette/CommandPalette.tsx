'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { 
  Search, 
  Home, 
  Users, 
  BookOpen, 
  Network, 
  Globe,
  Sparkles
} from 'lucide-react'

interface CommandPaletteProps {
  deities?: Array<{ name: string; slug: string; pantheon?: string }>
  stories?: Array<{ title: string; slug: string }>
  pantheons?: Array<{ name: string; slug: string }>
}

export function CommandPalette({ deities = [], stories = [], pantheons = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = useCallback((href: string) => {
    setOpen(false)
    setSearch('')
    router.push(href)
  }, [router])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] px-4">
        <Command
          className="overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          shouldFilter={false}
          label="Command Menu"
        >
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4">
            <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search deities, stories, pantheons..."
              className="flex h-14 w-full bg-transparent py-4 text-base outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={() => setOpen(false)}
              className="ml-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
            >
              ESC
            </button>
          </div>

          <Command.List className="max-h-100 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            {/* Main Navigation */}
            <Command.Group
              heading="Navigation"
              className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              <Command.Item
                onSelect={() => handleSelect('/')}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950/30 aria-selected:bg-teal-100 dark:aria-selected:bg-teal-900/40"
              >
                <Home className="h-4 w-4 text-teal-600" />
                <span>Home</span>
              </Command.Item>
              
              <Command.Item
                onSelect={() => handleSelect('/deities')}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950/30 aria-selected:bg-teal-100 dark:aria-selected:bg-teal-900/40"
              >
                <Users className="h-4 w-4 text-teal-600" />
                <span>All Deities</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect('/stories')}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 aria-selected:bg-amber-100 dark:aria-selected:bg-amber-900/40"
              >
                <BookOpen className="h-4 w-4 text-amber-600" />
                <span>Stories</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect('/family-tree')}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 aria-selected:bg-emerald-100 dark:aria-selected:bg-emerald-900/40"
              >
                <Network className="h-4 w-4 text-emerald-600" />
                <span>Family Tree</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect('/pantheons')}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <Globe className="h-4 w-4 text-slate-600" />
                <span>Pantheons</span>
              </Command.Item>
            </Command.Group>

            {/* Deities */}
            {deities.length > 0 && (
              <Command.Group
                heading="Deities"
                className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                {deities.slice(0, 5).map((deity) => (
                  <Command.Item
                    key={deity.slug}
                    value={deity.name}
                    onSelect={() => handleSelect(`/deities/${deity.slug}`)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950/30 aria-selected:bg-teal-100 dark:aria-selected:bg-teal-900/40"
                  >
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <div className="flex flex-col">
                      <span>{deity.name}</span>
                      {deity.pantheon && (
                        <span className="text-xs text-slate-500">{deity.pantheon}</span>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Stories */}
            {stories.length > 0 && (
              <Command.Group
                heading="Stories"
                className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                {stories.slice(0, 5).map((story) => (
                  <Command.Item
                    key={story.slug}
                    value={story.title}
                    onSelect={() => handleSelect(`/stories/${story.slug}`)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 aria-selected:bg-amber-100 dark:aria-selected:bg-amber-900/40"
                  >
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <span>{story.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Pantheons */}
            {pantheons.length > 0 && (
              <Command.Group
                heading="Pantheons"
                className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                {pantheons.slice(0, 5).map((pantheon) => (
                  <Command.Item
                    key={pantheon.slug}
                    value={pantheon.name}
                    onSelect={() => handleSelect(`/pantheons/${pantheon.slug}`)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                  >
                    <Globe className="h-4 w-4 text-slate-600" />
                    <span>{pantheon.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Press <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↵</kbd> to select</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
