"use client"

import type React from "react"

// File: apps/frontend/components/shared/GroupedRecordsTable.tsx
import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { useCallback, useState } from "react"
import DataTable, { type Column } from "../ui/DataTable"

interface GroupedRecordsTableProps<T, G> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  groupBy: keyof T
  groupFormatter?: (group: G) => string
  groupNameAccessor?: (item: T) => G
  actions?: (row: T) => React.ReactNode
  isLoading?: boolean
  emptyState?: React.ReactNode
  className?: string
  initialExpandedGroups?: G[]
}

export default function GroupedRecordsTable<T, G>({
  data,
  columns,
  keyField,
  groupBy,
  groupFormatter,
  groupNameAccessor,
  actions,
  isLoading = false,
  emptyState,
  className,
  initialExpandedGroups = [],
}: GroupedRecordsTableProps<T, G>) {
  const [expandedGroups, setExpandedGroups] = useState<G[]>(initialExpandedGroups)

  // Group the data
  const groupedData = data.reduce(
    (acc, item) => {
      // Get the group value either through accessor or direct property access
      const groupValue = groupNameAccessor ? groupNameAccessor(item) : (item[groupBy] as unknown as G)

      if (!acc[groupValue as keyof typeof acc]) {
        acc[groupValue as keyof typeof acc] = []
      }

      acc[groupValue as keyof typeof acc].push(item)
      return acc
    },
    {} as Record<string | symbol, T[]>,
  )

  // Toggle a group's expanded state
  const toggleGroup = useCallback((group: G) => {
    setExpandedGroups((prev) => {
      const isExpanded = prev.includes(group)
      return isExpanded ? prev.filter((g) => g !== group) : [...prev, group]
    })
  }, [])

  // Expand all groups
  const expandAll = useCallback(() => {
    setExpandedGroups(Object.keys(groupedData) as unknown as G[])
  }, [groupedData])

  // Collapse all groups
  const collapseAll = useCallback(() => {
    setExpandedGroups([])
  }, [])

  // If loading, show loading state
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

  // If no data, show empty state
  if (Object.keys(groupedData).length === 0) {
    return <div className="flex justify-center py-8 text-gray-500">{emptyState || "No data available"}</div>
  }

  return (
    <div className={className}>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={expandAll} className="text-sm text-westernPurple hover:underline">
          Expand All
        </button>
        <button onClick={collapseAll} className="text-sm text-westernPurple hover:underline">
          Collapse All
        </button>
      </div>

      {Object.entries(groupedData).map(([groupKey, groupItems]) => {
        const isExpanded = expandedGroups.includes(groupKey as unknown as G)
        const formattedGroupName = groupFormatter ? groupFormatter(groupKey as unknown as G) : String(groupKey)

        return (
          <div key={groupKey} className="mb-4">
            {/* Group header */}
            <div
              onClick={() => toggleGroup(groupKey as unknown as G)}
              className="flex items-center gap-2 p-3 bg-gray-100 rounded-t cursor-pointer hover:bg-gray-200"
            >
              {isExpanded ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
              <span className="font-medium">{formattedGroupName}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({groupItems.length} {groupItems.length === 1 ? "item" : "items"})
              </span>
            </div>

            {/* Group content */}
            {isExpanded && (
              <div className={cn("rounded-b overflow-hidden", !isExpanded && "hidden")}>
                <DataTable
                  data={groupItems}
                  columns={columns}
                  keyField={keyField}
                  actions={actions}
                  className="rounded-t-none"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

