"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

/**
 * Component that provides pagination controls
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  // Calculate the range of pages to show
  const getPageRange = () => {
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(currentPage - half, 1)
    const end = Math.min(start + maxVisiblePages - 1, totalPages)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const pageRange = getPageRange()

  return (
    <nav className="flex items-center justify-center space-x-1">
      {/* Previous page button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Previous page</span>
      </button>

      {/* First page */}
      {pageRange[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            1
          </button>
          {pageRange[0] > 2 && (
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
              ...
            </span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pageRange.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium ${
            page === currentPage
              ? "border-westernPurple bg-westernPurple text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page */}
      {pageRange[pageRange.length - 1] < totalPages && (
        <>
          {pageRange[pageRange.length - 1] < totalPages - 1 && (
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
              ...
            </span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next page button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Next page</span>
      </button>
    </nav>
  )
}

