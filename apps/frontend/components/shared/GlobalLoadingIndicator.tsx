"use client"

import React from "react"
import { RefreshCw } from "lucide-react"

interface GlobalLoadingIndicatorProps {
  isLoading?: boolean
  children?: React.ReactNode
}

/**
 * Component that shows a loading state for the entire application
 */
export default function GlobalLoadingIndicator({
  isLoading = false,
  children,
}: GlobalLoadingIndicatorProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
      <div className="flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-westernPurple" />
        <p className="mt-2 text-sm font-medium text-gray-900">Loading...</p>
        <p className="mt-1 text-sm text-gray-500">Please wait while we fetch the data.</p>
      </div>
    </div>
  )
}

