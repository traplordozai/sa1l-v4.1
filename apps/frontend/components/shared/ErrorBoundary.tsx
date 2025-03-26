"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { captureException } from "@/lib/errorReporting"

interface ErrorBoundaryProps {
  fallback?: ReactNode
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI instead of crashing the whole application
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    captureException(error, { extra: errorInfo })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">An error occurred while rendering this component.</p>
            <details className="bg-white p-3 rounded border border-red-100">
              <summary className="cursor-pointer text-sm text-red-500 font-medium">Error details</summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-50 rounded">{this.state.error?.toString()}</pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.FC<P> {
  const displayName = Component.displayName || Component.name || "Component"

  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`

  return WrappedComponent
}

/**
 * Hook to create an error boundary wrapper for a component
 */
export function useErrorBoundary(): [(error: Error) => void, () => void] {
  const [error, setError] = React.useState<Error | null>(null)

  if (error) {
    throw error
  }

  return [
    (error: Error) => {
      captureException(error)
      setError(error)
    },
    () => setError(null),
  ]
}

