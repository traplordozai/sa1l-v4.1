"use client"

import { useAuthStore } from "@/stores/authStore"
import { useMemo } from "react"

/**
 * Hook to check if the current user has a specific permission
 * @param permission The permission key to check
 * @returns boolean indicating if the user has the permission
 */
export function useHasPermission(permission: string): boolean {
  const { user } = useAuthStore()

  // Admin has all permissions
  if (user?.role === "admin") return true

  // Check if the user has the specific permission
  return user?.permissions?.includes(permission) || false
}

// File: apps/frontend/components/PermissionGate.tsx
import type { ReactNode } from "react"
import { useAuthStore as useAuthStorePermissionGate } from "@/stores/authStore"

interface PermissionGateProps {
  permission: string | string[]
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { user } = useAuthStorePermissionGate()

  const hasPermission = useMemo(() => {
    const permissions = Array.isArray(permission) ? permission : [permission]
    return permissions.some((p) => {
      // Admin has all permissions
      if (user?.role === "admin") return true

      // Check if the user has the specific permission
      return user?.permissions?.includes(p) || false
    })
  }, [permission, user])

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

