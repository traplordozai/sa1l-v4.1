"use client"

import { useState } from "react"
import { Download } from "lucide-react"

interface DataTableExportProps {
  onExport: (format: "csv" | "excel" | "pdf") => void
}

/**
 * Component that provides export functionality for the DataTable
 */
export default function DataTableExport({ onExport }: DataTableExportProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-westernPurple focus:ring-offset-2"
      >
        <Download className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onExport("csv")
                setIsOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as CSV
            </button>
            <button
              type="button"
              onClick={() => {
                onExport("excel")
                setIsOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as Excel
            </button>
            <button
              type="button"
              onClick={() => {
                onExport("pdf")
                setIsOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

