"use client"

// File: apps/frontend/components/features/roles/RoleList.tsx
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import { useToast } from "@/components/ui/Toast"
import { type Role, useRoleStore } from "@/stores/roleStore"
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useEffect } from "react"

interface RoleListProps {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onNew: () => void
}

export function RoleList({ onEdit, onDelete, onNew }: RoleListProps) {
  const { roles, fetchRoles, isLoading, error } = useRoleStore()
  const { showToast } = useToast()

  useEffect(() => {
    fetchRoles().catch((err) => {
      showToast("Failed to load roles: " + err.message, "error")
    })
  }, [fetchRoles, showToast])

  const columns = [
    {
      key: "name",
      header: "Role Name",
      accessorFn: (row: Role) => row.name,
    },
    {
      key: "permissions",
      header: "Permissions",
      accessorFn: (row: Role) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.slice(0, 3).map((permission) => (
            <span
              key={permission}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {permission}
            </span>
          ))}
          {row.permissions.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{row.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Roles</h2>
        <Button variant="primary" onClick={onNew} leftIcon={<PlusIcon className="h-5 w-5" />}>
          New Role
        </Button>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        keyField="id"
        isLoading={isLoading}
        actions={(item: Role) => (
          <div className="flex space-x-2">
            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">
              <PencilIcon className="h-5 w-5" />
            </button>
            <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        emptyState={
          <div className="text-center py-10">
            <p className="text-gray-500">No roles found</p>
            <Button variant="outline" onClick={onNew} className="mt-4">
              Create your first role
            </Button>
          </div>
        }
      />
    </div>
  )
}

