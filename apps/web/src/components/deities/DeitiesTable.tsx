'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'

interface Deity {
  id: string
  name: string
  slug: string
  gender: string | null
  domain: string[]
  symbols: string[]
  description: string | null
  importanceRank: number | null
  imageUrl: string | null
  alternateNames: string[]
}

interface DeitiesTableProps {
  deities: Deity[]
}

export function DeitiesTable({ deities }: DeitiesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Deity>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-teal-600 transition-colors font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Name
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          )
        },
        cell: ({ row }) => (
          <Link
            href={`/deities/${row.original.slug}`}
            className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'domain',
        header: 'Domain',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.domain.slice(0, 3).map((d, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              >
                {d}
              </span>
            ))}
            {row.original.domain.length > 3 && (
              <span className="text-xs text-slate-500">+{row.original.domain.length - 3}</span>
            )}
          </div>
        ),
        filterFn: (row, id, value) => {
          return row.original.domain.some((d) =>
            d.toLowerCase().includes(value.toLowerCase())
          )
        },
      },
      {
        accessorKey: 'symbols',
        header: 'Symbols',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.symbols.slice(0, 2).map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {s}
              </span>
            ))}
            {row.original.symbols.length > 2 && (
              <span className="text-xs text-slate-500">+{row.original.symbols.length - 2}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => (
          <span className="capitalize text-slate-600 dark:text-slate-400">
            {row.original.gender || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'importanceRank',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-teal-600 transition-colors font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Importance
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const rank = row.original.importanceRank
          if (!rank) return <span className="text-slate-400">-</span>
          
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{rank}</span>
              {rank <= 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  Major
                </span>
              )}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: deities,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <label htmlFor="deity-search" className="sr-only">Search deities</label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
        <Input
          id="deity-search"
          placeholder="Search deities by name, domain, or symbols..."
          value={globalFilter ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} deities
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
