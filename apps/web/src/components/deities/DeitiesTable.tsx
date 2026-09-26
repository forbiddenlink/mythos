"use client";

import { useState, useMemo } from "react";
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
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

interface Deity {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
}

interface DeitiesTableProps {
  deities: Deity[];
}

export function DeitiesTable({ deities }: DeitiesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<Deity>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-gold-text transition-colors font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <Link
            href={`/deities/${row.original.slug}`}
            className="font-medium text-foreground underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "domain",
        header: "Domain",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.domain.slice(0, 3).map((d) => (
              <span
                key={d}
                className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              >
                {d}
              </span>
            ))}
            {row.original.domain.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{row.original.domain.length - 3}
              </span>
            )}
          </div>
        ),
        filterFn: (row, id, value) => {
          return row.original.domain.some((d) =>
            d.toLowerCase().includes(value.toLowerCase()),
          );
        },
      },
      {
        accessorKey: "symbols",
        header: "Symbols",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.symbols.slice(0, 2).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {row.original.symbols.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{row.original.symbols.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => (
          <span className="capitalize text-muted-foreground">
            {row.original.gender || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "importanceRank",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-gold-text transition-colors font-semibold"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Importance
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const rank = row.original.importanceRank;
          if (!rank) return <span className="text-muted-foreground">-</span>;

          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{rank}</span>
              {rank <= 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  Major
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- @tanstack/react-table returns non-memoizable values
  const table = useReactTable({
    data: deities,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{" "}
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
  );
}
