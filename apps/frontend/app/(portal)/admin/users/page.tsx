// File: apps/frontend/app/admin/users/page.tsx
"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import { UserEditor } from "@/components/features/users/UserEditor"
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import Modal, { ConfirmModal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { useUserStore } from "@/stores/userStore"
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
// Fixed import path for PermissionGate
import NaturalLanguageSearch from "@/components/shared/NaturalLanguageSearch"
import { PermissionGate } from "@/components/ui/PermissionGate"
import type { User } from "@/stores/authStore"

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get("action")

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "reset-password" | "impersonate" | "suspend" | "activate" | null
    user: User | null
  }>({ type: null, user: null })

  const {
    users,
    selectedUsers,
    filters,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    impersonateUser,
    selectUser,
    unselectUser,
    selectAll,
    unselectAll,
    setFilter,
  } = useUserStore()

  const { showToast } = useToast()

  // Fetch users on mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Handle URL actions
  useEffect(() => {
    if (action === "create") {
      setEditingUser({
        id: "",
        email: "",
        name: "",
        role: "user",
        status: "active",
      } as User)
    }
  }, [action])

  // Handle row selection
  const handleRowSelect = (selectedIds: string[]) => {
    // Clear current selection
    unselectAll()

    // Add each selected ID
    selectedIds.forEach((id) => selectUser(id))
  }

  // Handle user actions
  const handleUserAction = async (
    type: "delete" | "reset-password" | "impersonate" | "suspend" | "activate",
    user: User,
  ) => {
    setConfirmAction({ type, user })
  }

  // Perform the confirmed action
  const performAction = async () => {
    if (!confirmAction.user) return

    try {
      switch (confirmAction.type) {
        case "delete":
          await deleteUser(confirmAction.user.id)
          showToast("User deleted successfully", "success")
          break

        case "reset-password":
          await resetPassword(confirmAction.user.id)
          showToast("Password reset email sent", "success")
          break

        case "impersonate":
          const result = await impersonateUser(confirmAction.user.id)
          showToast(`Now impersonating ${confirmAction.user.name || confirmAction.user.email}`, "success")
          router.push("/")
          break

        case "suspend":
          await updateUser({ ...confirmAction.user, status: "suspended" })
          showToast("User suspended", "success")
          break

        case "activate":
          await updateUser({ ...confirmAction.user, status: "active" })
          showToast("User activated", "success")
          break
      }
    } catch (err) {
      showToast(`Failed to ${confirmAction.type} user.`, "error")
    } finally {
      setConfirmAction({ type: null, user: null })
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (type: "delete" | "suspend" | "activate") => {
    // Implementation for bulk actions
    // This would need to be added to the userStore as well
  }

  // Table columns
  const columns = [
    {
      key: "name",
      header: "Name",
      accessorFn: (row: User) => row.name || "—",
    },
    {
      key: "email",
      header: "Email",
      accessorFn: (row: User) => row.email,
    },
    {
      key: "role",
      header: "Role",
      accessorFn: (row: User) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessorFn: (row: User) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">User Management</h1>

          <PermissionGate permission="create_users">
            <Button
              variant="primary"
              onClick={() =>
                setEditingUser({
                  id: "",
                  email: "",
                  name: "",
                  role: "user",
                  status: "active",
                } as User)
              }
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              New User
            </Button>
          </PermissionGate>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Search and filter controls */}
          <div className="p-4 border-b">
            <NaturalLanguageSearch
              onSearch={(filters) => {
                if (filters.length > 0) {
                  // Map the natural language filters to the user store filters
                  const searchTerms = filters
                    .filter((f) => f.field === "name" || f.field === "email")
                    .map((f) => f.value)
                    .join(" ")

                  const role = filters.find((f) => f.field === "role")?.value as string
                  const status = filters.find((f) => f.field === "status")?.value as string

                  setFilter({
                    search: searchTerms || undefined,
                    role: role || undefined,
                    status: status || undefined,
                  })
                } else {
                  setFilter({
                    search: undefined,
                    role: undefined,
                    status: undefined,
                  })
                }
              }}
              placeholder="Search users... (e.g., 'name contains John' or 'role = admin')"
              loading={isLoading}
            />
          </div>

          {/* Selection actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 p-3 flex items-center justify-between border-b">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </span>

              <div className="flex space-x-2">
                <PermissionGate permission="delete_users">
                  <Button variant="danger" size="sm" onClick={() => handleBulkAction("delete")}>
                    Delete
                  </Button>
                </PermissionGate>

                <PermissionGate permission="manage_users">
                  <Button variant="secondary" size="sm" onClick={() => handleBulkAction("suspend")}>
                    Suspend
                  </Button>
                </PermissionGate>

                <PermissionGate permission="manage_users">
                  <Button variant="secondary" size="sm" onClick={() => handleBulkAction("activate")}>
                    Activate
                  </Button>
                </PermissionGate>

                <Button variant="outline" size="sm" onClick={unselectAll}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* User table */}
          <DataTable
            data={users}
            columns={columns}
            keyField="id"
            isLoading={isLoading}
            selectable
            selectedIds={selectedUsers}
            onRowSelect={handleRowSelect}
            actions={(user: User) => (
              <div className="flex space-x-2">
                <PermissionGate permission="manage_users">
                  <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                </PermissionGate>

                <PermissionGate permission="delete_users">
                  <button onClick={() => handleUserAction("delete", user)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </PermissionGate>

                <PermissionGate permission="manage_users">
                  <button
                    onClick={() => handleUserAction("reset-password", user)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Reset Password
                  </button>
                </PermissionGate>

                <PermissionGate permission="impersonate_users">
                  <button
                    onClick={() => handleUserAction("impersonate", user)}
                    className="text-purple-600 hover:text-purple-900"
                  >
                    Impersonate
                  </button>
                </PermissionGate>

                <PermissionGate permission="manage_users">
                  {user.status === "active" ? (
                    <button
                      onClick={() => handleUserAction("suspend", user)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserAction("activate", user)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Activate
                    </button>
                  )}
                </PermissionGate>
              </div>
            )}
            emptyState={
              <div className="text-center py-10">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {error || "Try adjusting your search or filter to find what you're looking for."}
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilter({
                        search: undefined,
                        role: undefined,
                        status: undefined,
                      })
                      fetchUsers()
                    }}
                    leftIcon={<ArrowPathIcon className="h-5 w-5" />}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* User Editor Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser?.id ? "Edit User" : "Create User"}
        size="md"
      >
        {editingUser && (
          <UserEditor
            initialUser={editingUser}
            onSave={async (user) => {
              try {
                if (user.id) {
                  await updateUser(user)
                  showToast("User updated successfully", "success")
                } else {
                  await createUser(user)
                  showToast("User created successfully", "success")
                }
                setEditingUser(null)
              } catch (err) {
                showToast("Failed to save user", "error")
              }
            }}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmAction.type === "delete"}
        onClose={() => setConfirmAction({ type: null, user: null })}
        onConfirm={performAction}
        title="Delete User"
        message={`Are you sure you want to delete ${
          confirmAction.user?.name || confirmAction.user?.email
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmModal
        isOpen={confirmAction.type === "reset-password"}
        onClose={() => setConfirmAction({ type: null, user: null })}
        onConfirm={performAction}
        title="Reset Password"
        message={`Are you sure you want to reset the password for ${
          confirmAction.user?.name || confirmAction.user?.email
        }? They will receive an email with instructions.`}
        confirmText="Reset Password"
      />

      <ConfirmModal
        isOpen={confirmAction.type === "impersonate"}
        onClose={() => setConfirmAction({ type: null, user: null })}
        onConfirm={performAction}
        title="Impersonate User"
        message={`You are about to impersonate ${
          confirmAction.user?.name || confirmAction.user?.email
        }. You will be logged in as this user until you end the impersonation.`}
        confirmText="Impersonate"
      />

      <ConfirmModal
        isOpen={confirmAction.type === "suspend"}
        onClose={() => setConfirmAction({ type: null, user: null })}
        onConfirm={performAction}
        title="Suspend User"
        message={`Are you sure you want to suspend ${
          confirmAction.user?.name || confirmAction.user?.email
        }? They will no longer be able to log in.`}
        confirmText="Suspend"
      />

      <ConfirmModal
        isOpen={confirmAction.type === "activate"}
        onClose={() => setConfirmAction({ type: null, user: null })}
        onConfirm={performAction}
        title="Activate User"
        message={`Are you sure you want to activate ${
          confirmAction.user?.name || confirmAction.user?.email
        }? They will be able to log in again.`}
        confirmText="Activate"
      />
    </AdminLayout>
  )
}

