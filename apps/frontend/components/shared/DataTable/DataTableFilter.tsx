"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Column } from "./index"

interface DataTableFilterProps<T> {
  columns: Column<T>[]
  filters: Record<string, string | number | boolean | null>
  onFilterChange: (columnId: string, value: string | number | boolean | null) => void
  onClearFilters: () => void
}

/**
 * Component that provides filtering functionality for the DataTable
 */
export default function DataTableFilter<T>({
  columns,
  filters,
  onFilterChange,
  onClearFilters,
}: DataTableFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  // Get the number of active filters
  const activeFilters = Object.keys(filters).filter(
    (key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== ""
  ).length

  return (
    <div className="relative">
      {/* Filter button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
          activeFilters > 0
            ? "bg-westernPurple text-white hover:bg-westernPurple-dark"
            : "bg-white text-gray-700 hover:bg-gray-50"
        } shadow-sm focus:outline-none focus:ring-2 focus:ring-westernPurple focus:ring-offset-2`}
      >
        <Filter className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
        Filters
        {activeFilters > 0 && (
          <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-westernPurple">
            {activeFilters}
          </span>
        )}
      </button>

      {/* Filter panel */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {columns.map((column) => {
                const value = filters[column.id]
                const isActive = value !== undefined && value !== null && value !== ""

                return (
                  <div key={column.id} className="space-y-2">
                    <label
                      htmlFor={column.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {column.header}
                    </label>

                    {/* Text input */}
                    <input
                      type="text"
                      id={column.id}
                      value={String(value || "")}
                      onChange={(e) => onFilterChange(column.id, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
                      placeholder={`Filter ${column.header.toLowerCase()}...`}
                    />

                    {/* Active filter indicator */}
                    {isActive && (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full bg-westernPurple px-2 py-0.5 text-xs font-medium text-white">
                          Active
                        </span>
                        <button
                          type="button"
                          onClick={() => onFilterChange(column.id, null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

