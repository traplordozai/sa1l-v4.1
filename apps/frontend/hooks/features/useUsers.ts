"use client"

// File: apps/frontend/hooks/features/useUsers.ts
import { useToast } from "@/components/ui/Toast"
import { useUserStore } from "@/stores/userStore"
import type { ActionType, ConfirmAction, User, UserActionHandlers } from "@/types/user"
import { useCallback, useState } from "react"

const DEFAULT_USER: User = {
  id: "",
  email: "",
  name: "",
  role: "user",
  status: "active",
}

const DEFAULT_CONFIRM_ACTION: ConfirmAction = {
  type: null,
  user: null,
}

export function useUsers() {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(DEFAULT_CONFIRM_ACTION)

  const {
    users,
    selectedUsers,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    impersonateUser,
  } = useUserStore()

  const { showToast } = useToast()

  const handleError = useCallback(
    (error: unknown, action: string): void => {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      showToast(`Failed to ${action}: ${errorMessage}`, "error")
    },
    [showToast],
  )

  const initialize = useCallback(
    async ({ onError }: UserActionHandlers = {}): Promise<void> => {
      try {
        await fetchUsers()
      } catch (error) {
        handleError(error, "load users")
        onError?.(error)
      }
    },
    [fetchUsers, handleError],
  )

  const handleNew = useCallback((): void => {
    setCurrentUser({ ...DEFAULT_USER })
    setIsEditing(true)
  }, [])

  const handleEdit = useCallback((user: User): void => {
    setCurrentUser({ ...user })
    setIsEditing(true)
  }, [])

  const handleSave = useCallback(
    async (user: User, handlers: UserActionHandlers = {}): Promise<void> => {
      try {
        const isNewUser = !user.id
        const action = isNewUser ? createUser : updateUser

        await action(user)
        showToast(`User ${isNewUser ? "created" : "updated"} successfully`, "success")
        handlers.onSuccess?.(isNewUser ? "created" : "updated")

        setIsEditing(false)
        setCurrentUser(null)
        await fetchUsers()
      } catch (error) {
        handleError(error, "save user")
        handlers.onError?.(error)
      }
    },
    [createUser, updateUser, fetchUsers, showToast, handleError],
  )

  const handleAction = useCallback((type: ActionType, user: User): void => {
    setConfirmAction({ type, user })
  }, [])

  const performAction = useCallback(
    async (handlers: UserActionHandlers = {}): Promise<void> => {
      if (!confirmAction.user || !confirmAction.type) return

      try {
        const { user, type } = confirmAction
        let successMessage = ""

        switch (type) {
          case "delete":
            await deleteUser(user.id)
            successMessage = "User deleted successfully"
            break

          case "reset-password":
            await resetPassword(user.id)
            successMessage = "Password reset link sent"
            break

          case "impersonate":
            await impersonateUser(user.id)
            successMessage = `Now impersonating ${user.name || user.email}`
            break

          case "suspend":
          case "activate":
            const newStatus = type === "suspend" ? "suspended" : "active"
            await updateUser({ ...user, status: newStatus })
            successMessage = `User ${type === "suspend" ? "suspended" : "activated"}`
            await fetchUsers()
            break
        }

        showToast(successMessage, "success")
        handlers.onSuccess?.(successMessage)
      } catch (error) {
        handleError(error, `${confirmAction.type} user`)
        handlers.onError?.(error)
      } finally {
        setConfirmAction(DEFAULT_CONFIRM_ACTION)
      }
    },
    [confirmAction, deleteUser, resetPassword, impersonateUser, updateUser, fetchUsers, showToast, handleError],
  )

  const cancelEdit = useCallback((): void => {
    setIsEditing(false)
    setCurrentUser(null)
  }, [])

  const cancelAction = useCallback((): void => {
    setConfirmAction(DEFAULT_CONFIRM_ACTION)
  }, [])

  return {
    // State
    users,
    selectedUsers,
    isLoading,
    error,
    isEditing,
    currentUser,
    confirmAction,

    // Actions
    initialize,
    handleNew,
    handleEdit,
    handleSave,
    handleAction,
    performAction,
    cancelEdit,
    cancelAction,
  }
}

