"use client"

import AdminLayout from "@/components/features/admin/AdminLayout"
import { PermissionMatrix } from "@/components/features/roles/PermissionMatrix"
import { useToast } from "@/components/ui/Toast"
import { trpc } from "@/utils/trpc"
import { Dialog } from "@headlessui/react"
import { useState } from "react"

const PERMISSIONS = [
  { key: "user.read", label: "Read Users", category: "Users" },
  { key: "user.write", label: "Edit Users", category: "Users" },
  { key: "content.publish", label: "Publish Content", category: "Content" },
  { key: "content.delete", label: "Delete Content", category: "Content" },
  { key: "audit.view", label: "View Audit Logs", category: "System" },
]

interface Role {
  id: string
  name: string
  permissions: string[]
}

export default function AdminRolesPage() {
  // Fix the type casting by providing a more specific type or using proper typing
  const { data: roles, refetch } = trpc.role.getAll.useQuery()
  const createRole = trpc.role.create.useMutation()
  const updateRole = trpc.role.update.useMutation()
  const deleteRole = trpc.role.delete.useMutation()

  // Fix: Only use showToast from useToast
  const { showToast } = useToast()
  const [editing, setEditing] = useState<any | null>(null)

  const handleSubmit = async () => {
    try {
      if (editing.id) {
        await updateRole.mutateAsync(editing)
      } else {
        await createRole.mutateAsync(editing)
      }
      refetch()
      showToast("Role saved", "success")
      setEditing(null)
    } catch (error) {
      showToast("Failed to save role", "error")
    }
  }

  return (
    <AdminLayout>
      {/* Remove Toast component which doesn't exist */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">🛡 Roles</h1>
        <button
          onClick={() => setEditing({ name: "", permissions: [] })}
          className="bg-westernPurple text-white px-4 py-2 rounded"
        >
          ➕ New Role
        </button>
      </div>

      <table className="w-full border-collapse text-white">
        <thead>
          <tr className="bg-westernPurple">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Permissions</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles?.map((role: Role) => (
            <tr key={role.id} className="border-t border-white/10">
              <td className="p-2">{role.name}</td>
              <td className="p-2 text-sm">
                {role.permissions?.map((p: string) => (
                  <span key={p} className="mr-2 bg-sky-600 px-2 py-1 rounded text-xs">
                    {p}
                  </span>
                ))}
              </td>
              <td className="p-2 text-center">
                <button onClick={() => setEditing(role)} className="text-sky-300 underline mr-2">
                  Edit
                </button>
                <button
                  onClick={async () => {
                    await deleteRole.mutateAsync(role.id)
                    refetch()
                  }}
                  className="text-red-400 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!editing} onClose={() => setEditing(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white text-black p-6 rounded max-w-lg w-full space-y-4">
            <Dialog.Title>{editing?.id ? "Edit Role" : "New Role"}</Dialog.Title>
            <input
              value={editing?.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="border p-2 w-full rounded"
              placeholder="Role name"
            />

            {/* Replace checkbox fieldset with PermissionMatrix */}
            {editing && (
              <PermissionMatrix
                permissions={PERMISSIONS}
                selectedPermissions={editing.permissions || []}
                onChange={(permission, checked) => {
                  setEditing({
                    ...editing,
                    permissions: checked
                      ? [...editing.permissions, permission]
                      : editing.permissions.filter((p: string) => p !== permission),
                  })
                }}
              />
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-westernPurple text-white rounded">
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AdminLayout>
  )
}

