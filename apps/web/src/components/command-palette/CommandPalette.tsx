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

import { LucideIcon } from 'lucide-react'

export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  href: string
  icon?: LucideIcon
  iconColor?: string // Tailwind class e.g., "text-red-500"
}

export interface SearchGroup {
  heading: string
  items: SearchItem[]
}

interface CommandPaletteProps {
  groups?: SearchGroup[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
  isLoading?: boolean
}

export function CommandPalette({
  groups = [],
  open: controlledOpen,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  isLoading
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = useCallback((newOpen: boolean | ((prevState: boolean) => boolean)) => {
    if (onOpenChange) {
      // If controlled, just notify parent. The parent updates the prop, which updates 'open'.
      // We need to resolve the value if it's a function.
      const startValue = isControlled ? controlledOpen : internalOpen;
      const nextValue = typeof newOpen === 'function' ? newOpen(startValue || false) : newOpen;

      onOpenChange(nextValue);
    }

    if (!isControlled) {
      setInternalOpen(newOpen);
    }
  }, [isControlled, onOpenChange, controlledOpen, internalOpen]);

  const [internalSearch, setInternalSearch] = useState('')
  const search = searchQuery !== undefined ? searchQuery : internalSearch
  const setSearch = (value: string) => {
    if (onSearchQueryChange) onSearchQueryChange(value)
    if (searchQuery === undefined) setInternalSearch(value)
  }

  const router = useRouter()

  const handleSelect = useCallback((href: string) => {
    setOpen(false)
    setSearch('')
    router.push(href)
  }, [router, setOpen])

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

            {isLoading && (
              <div className="py-6 text-center text-sm text-slate-500">Loading...</div>
            )}

            {!isLoading && groups.length === 0 && (
              <Command.Empty className="py-8 text-center text-sm text-slate-500">
                No results found.
              </Command.Empty>
            )}

            {!isLoading && groups.map((group) => (
              <Command.Group
                key={group.heading}
                heading={group.heading}
                className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                {group.items.map((item) => {
                  const Icon = item.icon || Sparkles
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.title}
                      onSelect={() => handleSelect(item.href)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                    >
                      <Icon className={`h-4 w-4 ${item.iconColor || 'text-slate-500'}`} />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span>
                        )}
                      </div>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}

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
