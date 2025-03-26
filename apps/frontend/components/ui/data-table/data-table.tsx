"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Filter, MoreHorizontal, SortAsc, SortDesc } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => React.ReactNode
  enableSorting?: boolean
  enableFiltering?: boolean
  cell?: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  isLoading?: boolean
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  sorting?: {
    sortBy: string | null
    sortDirection: "asc" | "desc" | null
    onSortChange: (column: string, direction: "asc" | "desc") => void
  }
  filtering?: {
    filters: Record<string, string>
    onFilterChange: (column: string, value: string) => void
  }
  rowSelection?: {
    selectedRows: Record<string, boolean>
    onRowSelectionChange: (rowId: string, selected: boolean) => void
    onSelectAll: (selected: boolean) => void
  }
  actions?: {
    label: string
    onClick: (row: T) => void
    icon?: React.ReactNode
    showIf?: (row: T) => boolean
  }[]
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  pagination,
  sorting,
  filtering,
  rowSelection,
  actions,
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    if (filtering) {
      setLocalFilters(filtering.filters)
    }
  }, [filtering])

  const handleFilterChange = (column: string, value: string) => {
    const newFilters = { ...localFilters, [column]: value }
    setLocalFilters(newFilters)

    if (filtering) {
      filtering.onFilterChange(column, value)
    }
  }

  const handleSort = (column: Column<T>) => {
    if (!sorting || !column.enableSorting) return

    const columnId = column.id
    const currentSortBy = sorting.sortBy
    const currentDirection = sorting.sortDirection

    let newDirection: "asc" | "desc" = "asc"

    if (columnId === currentSortBy) {
      newDirection = currentDirection === "asc" ? "desc" : "asc"
    }

    sorting.onSortChange(columnId, newDirection)
  }

  const renderSortIcon = (column: Column<T>) => {
    if (!sorting || !column.enableSorting) return null

    const isSorted = sorting.sortBy === column.id

    if (!isSorted) {
      return <SortAsc className="ml-2 h-4 w-4 text-gray-400" />
    }

    return sorting.sortDirection === "asc" ? (
      <SortAsc className="ml-2 h-4 w-4" />
    ) : (
      <SortDesc className="ml-2 h-4 w-4" />
    )
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { pageIndex, pageSize, pageCount, onPageChange, onPageSizeChange } = pagination

    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button