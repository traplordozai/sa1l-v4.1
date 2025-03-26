"use client"

// File: apps/frontend/components/ui/PermissionGate.tsx
import { useHasPermission } from "@/hooks/utils/useHasPermission"
import { type ReactNode, useMemo } from "react"

interface PermissionGateProps {
  permission: string | string[]
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 * @param permission The permission or array of permissions to check
 * @param fallback Optional content to render when permission is denied
 * @param children Content to render when permission is granted
 * @returns React component
 */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const permissions = Array.isArray(permission) ? permission : [permission]

  // Check if the user has at least one of the required permissions
  const hasPermission = useMemo(() => {
    return permissions.some((p) => useHasPermission(p))
  }, [permissions])

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

