"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import * as Sentry from "@sentry/nextjs"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to Sentry
    Sentry.withScope((scope) => {
      scope.setExtra("componentStack", errorInfo.componentStack)
      Sentry.captureException(error)
    })

    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h2>
              <p className="mb-4 text-gray-600">We've encountered an error and our team has been notified.</p>
              <p className="mb-6 text-sm text-gray-500">{this.state.error?.message || "Unknown error"}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

