'use client'

import { GlobalSearch } from '@/components/search/GlobalSearch'

interface CommandPaletteProviderProps {
  children: React.ReactNode
}

export function CommandPaletteProvider({ 
  children
}: CommandPaletteProviderProps) {
  return (
    <>
      {children}
      <GlobalSearch />
    </>
  )
}
