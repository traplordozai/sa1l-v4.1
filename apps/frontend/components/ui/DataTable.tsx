"use client"

import type React from "react"

// File: apps/frontend/components/ui/DataTable.tsx
import { cn } from "@/lib/utils"
import { type ReactNode, useCallback, useState } from "react"

export interface Column<T> {
  key: string
  header: string
  accessorFn?: (row: T) => ReactNode
  className?: string
  sortable?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  isLoading?: boolean
  emptyState?: ReactNode
  actions?: (row: T) => ReactNode
  selectable?: boolean
  onRowSelect?: (selectedIds: string[]) => void
  selectedIds?: string[]
  onSort?: (key: string, direction: "asc" | "desc") => void
  className?: string
}

function DataTable<T>({
  data,
  columns,
  keyField,
  isLoading = false,
  emptyState,
  actions,
  selectable = false,
  onRowSelect,
  selectedIds = [],
  onSort,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onRowSelect) {
        if (e.target.checked) {
          // @ts-ignore - keyField might be a number or other type
          onRowSelect(data.map((row) => String(row[keyField])))
        } else {
          onRowSelect([])
        }
      }
    },
    [data, keyField, onRowSelect],
  )

  const handleSelectRow = useCallback(
    (id: string, checked: boolean) => {
      if (onRowSelect) {
        if (checked) {
          onRowSelect([...selectedIds, id])
        } else {
          onRowSelect(selectedIds.filter((selectedId) => selectedId !== id))
        }
      }
    },
    [selectedIds, onRowSelect],
  )

  const handleSort = useCallback(
    (key: string) => {
      const direction = sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
      setSortConfig({ key, direction })

      if (onSort) {
        onSort(key, direction)
      }
    },
    [sortConfig, onSort],
  )

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-westernPurple"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    )
  }

  // Display empty state
  if (data.length === 0) {
    return <div className="flex justify-center py-8 text-gray-500">{emptyState || "No data available"}</div>
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th scope="col" className="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === data.length && data.length > 0}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.sortable && "cursor-pointer hover:bg-gray-100",
                  column.className,
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortConfig?.key === column.key && (
                    <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </div>
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-6 py-3 w-20">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => {
            // @ts-ignore - keyField might be a number or other type
            const rowId = String(row[keyField])

            return (
              <tr key={rowId} className="hover:bg-gray-50">
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                      checked={selectedIds.includes(rowId)}
                      onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={`${rowId}-${column.key}`} className={cn("px-6 py-4 whitespace-nowrap", column.className)}>
                    {column.accessorFn
                      ? column.accessorFn(row)
                      : // @ts-ignore - Dynamically accessing property
                        row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{actions(row)}</td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable

