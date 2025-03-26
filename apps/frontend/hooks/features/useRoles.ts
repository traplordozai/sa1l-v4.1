"use client"

// File: apps/frontend/hooks/features/useRoles.ts
import { useToast } from "@/components/ui/Toast"
import { useRoleStore } from "@/stores/roleStore"
import type { Role, RoleFormData, RoleOperationCallbacks } from "@/types/role"
import { useCallback, useState } from "react"

const DEFAULT_ROLE: RoleFormData = {
  name: "",
  permissions: [],
  description: "",
}

export function useRoles() {
  const [isEditing, setIsEditing] = useState(false)
  const [currentRole, setCurrentRole] = useState<RoleFormData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null)

  const { roles, permissions, isLoading, error, fetchRoles, fetchPermissions, createRole, updateRole, deleteRole } =
    useRoleStore()

  const { showToast } = useToast()

  const handleError = useCallback(
    (error: unknown, action: string) => {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      showToast(`Failed to ${action}: ${errorMessage}`, "error")
    },
    [showToast],
  )

  const initialize = useCallback(
    async ({ onError }: RoleOperationCallbacks = {}) => {
      try {
        await Promise.all([fetchRoles(), fetchPermissions()])
      } catch (error) {
        handleError(error, "initialize roles")
        onError?.(error as Error)
      }
    },
    [fetchRoles, fetchPermissions, handleError],
  )

  const handleNew = useCallback(() => {
    setCurrentRole({ ...DEFAULT_ROLE })
    setIsEditing(true)
  }, [])

  const handleEdit = useCallback((role: Role) => {
    setCurrentRole({
      name: role.name,
      permissions: [...role.permissions],
      description: role.description,
      id: role.id,
    })
    setIsEditing(true)
  }, [])

  const handleSave = useCallback(
    async (roleData: RoleFormData, callbacks: RoleOperationCallbacks = {}) => {
      try {
        const isNewRole = !roleData.id
        const action = isNewRole ? createRole : updateRole
        const actionName = isNewRole ? "created" : "updated"

        await action(roleData as Role)
        showToast(`Role ${actionName} successfully`, "success")
        callbacks.onSuccess?.(`Role ${actionName}`)

        setIsEditing(false)
        setCurrentRole(null)
      } catch (error) {
        handleError(error, "save role")
        callbacks.onError?.(error as Error)
      }
    },
    [createRole, updateRole, showToast, handleError],
  )

  const handleDeleteClick = useCallback(
    (role: Role) => {
      if (role.isSystem) {
        showToast("System roles cannot be deleted", "error")
        return
      }
      setConfirmDelete(role)
    },
    [showToast],
  )

  const handleConfirmDelete = useCallback(
    async (callbacks: RoleOperationCallbacks = {}) => {
      if (!confirmDelete) return

      try {
        await deleteRole(confirmDelete.id)
        showToast("Role deleted successfully", "success")
        callbacks.onSuccess?.("Role deleted")
        setConfirmDelete(null)
      } catch (error) {
        handleError(error, "delete role")
        callbacks.onError?.(error as Error)
      }
    },
    [confirmDelete, deleteRole, showToast, handleError],
  )

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setCurrentRole(null)
  }, [])

  const cancelDelete = useCallback(() => {
    setConfirmDelete(null)
  }, [])

  return {
    // State
    roles,
    permissions,
    isLoading,
    error,
    isEditing,
    currentRole,
    confirmDelete,

    // Actions
    initialize,
    handleNew,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,
    cancelEdit,
    cancelDelete,
  }
}

