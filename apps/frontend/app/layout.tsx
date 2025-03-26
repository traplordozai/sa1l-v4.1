import type React from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { initializeSentry } from "../../shared/lib/sentry"
import { SonnerProvider } from "@/components/sonner-provider"

// Initialize Sentry on server side
if (typeof window === "undefined") {
  initializeSentry()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
        <SonnerProvider />
      </body>
    </html>
  )
}

