"use client"

import { useState } from "react"
import { Columns } from "lucide-react"
import { Column } from "./index"

interface DataTableColumnToggleProps<T> {
  columns: Column<T>[]
  visibleColumns: string[]
  onToggleColumn: (columnId: string) => void
}

/**
 * Component that allows users to show/hide columns in the DataTable
 */
export default function DataTableColumnToggle<T>({
  columns,
  visibleColumns,
  onToggleColumn,
}: DataTableColumnToggleProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-westernPurple focus:ring-offset-2"
      >
        <Columns className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
        Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900">Visible columns</h3>
            <div className="mt-4 space-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`column-${column.id}`}
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => onToggleColumn(column.id)}
                    className="h-4 w-4 rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                  />
                  <label
                    htmlFor={`column-${column.id}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {column.header}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

