"use client"

// File: apps/frontend/components/features/users/UserList.tsx
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import { useToast } from "@/components/ui/Toast"
import type { User } from "@/stores/authStore"
import { useUserStore } from "@/stores/userStore"
import { ArrowPathIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useEffect } from "react"

interface UserListProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onNew: () => void
  onResetPassword?: (user: User) => void
  onImpersonate?: (user: User) => void
}

export function UserList({ onEdit, onDelete, onNew, onResetPassword, onImpersonate }: UserListProps) {
  const {
    users,
    selectedUsers,
    filters,
    isLoading,
    error,
    fetchUsers,
    selectUser,
    unselectUser,
    selectAll,
    unselectAll,
    setFilter,
  } = useUserStore()

  const { showToast } = useToast()

  useEffect(() => {
    fetchUsers().catch((err) => {
      showToast("Failed to load users: " + err.message, "error")
    })
  }, [fetchUsers, showToast])

  const handleRowSelect = (selectedIds: string[]) => {
    unselectAll()
    selectedIds.forEach((id) => selectUser(id))
  }

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Users</h2>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchUsers()} leftIcon={<ArrowPathIcon className="h-5 w-5" />}>
            Refresh
          </Button>

          <Button variant="primary" onClick={onNew} leftIcon={<PlusIcon className="h-5 w-5" />}>
            New User
          </Button>
        </div>
      </div>

      {/* Selection actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-3 flex items-center justify-between border rounded">
          <span className="text-sm font-medium text-blue-900">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
          </span>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={unselectAll}>
              Clear
            </Button>
          </div>
        </div>
      )}

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
            <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900" title="Edit">
              <PencilIcon className="h-5 w-5" />
            </button>

            <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-900" title="Delete">
              <TrashIcon className="h-5 w-5" />
            </button>

            {onResetPassword && (
              <button
                onClick={() => onResetPassword(user)}
                className="text-orange-600 hover:text-orange-900"
                title="Reset Password"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  <path
                    fillRule="evenodd"
                    d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}

            {onImpersonate && (
              <button
                onClick={() => onImpersonate(user)}
                className="text-purple-600 hover:text-purple-900"
                title="Impersonate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        )}
        emptyState={
          <div className="text-center py-10">
            <p className="text-gray-500">No users found</p>
            <Button variant="outline" onClick={onNew} className="mt-4">
              Create your first user
            </Button>
          </div>
        }
      />
    </div>
  )
}

