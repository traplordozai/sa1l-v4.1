"use client"

// File: apps/frontend/app/(portal)/layout.tsx
import type { ReactNode } from "react"
import { ToastProvider } from "@/components/ui/Toast"
import { Shell } from "@/components/layout/Shell"
import { useEffect } from "react"
import { startIdleTimer } from "@/lib/idleLogout"
import { CommandBar } from "@/components/shared/CommandBar"

export default function PortalLayout({ children }: { children: ReactNode }) {
  // Start idle timer for automatic logout
  useEffect(() => {
    const cleanup = startIdleTimer(15 * 60 * 1000) // 15 minutes
    return () => cleanup()
  }, [])

  return (
    <ToastProvider>
      <Shell>{children}</Shell>
      <CommandBar />
    </ToastProvider>
  )
}

