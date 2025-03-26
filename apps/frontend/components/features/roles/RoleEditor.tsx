"use client"

import type React from "react"

// File: apps/frontend/components/features/roles/RoleEditor.tsx
import { useState } from "react"
import Button from "@/components/ui/Button"
import { PermissionMatrix } from "./PermissionMatrix"
import type { Role } from "@/stores/roleStore"

interface RoleEditorProps {
  initialRole: Role
  permissions: { key: string; label: string; category: string }[]
  onSave: (role: Role) => void
  onCancel: () => void
}

export function RoleEditor({ initialRole, permissions, onSave, onCancel }: RoleEditorProps) {
  const [role, setRole] = useState<Role>(initialRole)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update role field
  const updateField = (field: keyof Role, value: any) => {
    setRole((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Handle permission changes
  const handlePermissionChange = (permission: string, checked: boolean) => {
    setRole((prev) => {
      const updatedPermissions = checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission)

      return { ...prev, permissions: updatedPermissions }
    })
  }

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Name validation
    if (!role.name) {
      errors.name = "Name is required"
    } else if (role.name.length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    // Set errors and return validation result
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(role)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Role Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={role.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm ${
            validationErrors.name ? "border-red-500" : ""
          }`}
          required
        />
        {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
      </div>

      {/* Permissions Matrix */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Assign permissions to this role. Users with this role will have all selected permissions.
        </p>

        <div className="mt-4">
          <PermissionMatrix
            permissions={permissions}
            selectedPermissions={role.permissions}
            onChange={handlePermissionChange}
          />
        </div>
      </div>

      {/* Form actions */}
      <div className="pt-4 flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {role.id ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </form>
  )
}

