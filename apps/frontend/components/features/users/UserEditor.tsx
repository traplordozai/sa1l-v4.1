"use client"

import type React from "react"

// File: apps/frontend/components/features/users/UserEditor.tsx
import Button from "@/components/ui/Button"
import type { User } from "@/stores/authStore"
import { useRoleStore } from "@/stores/roleStore"
import { useEffect, useState } from "react"

interface UserEditorProps {
  initialUser: User
  onSave: (user: User) => void
  onCancel: () => void
}

export function UserEditor({ initialUser, onSave, onCancel }: UserEditorProps) {
  const [user, setUser] = useState<User>(initialUser)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch roles for the role dropdown
  const { roles, fetchRoles, isLoading: rolesLoading } = useRoleStore()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Update user field
  const updateField = (field: keyof User, value: any) => {
    setUser((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Email validation
    if (!user.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = "Invalid email format"
    }

    // Name validation (optional)
    if (user.name && user.name.length < 2) {
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
      await onSave(user)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={user.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm ${
            validationErrors.email ? "border-red-500" : ""
          }`}
          required
        />
        {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
      </div>

      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={user.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm ${
            validationErrors.name ? "border-red-500" : ""
          }`}
        />
        {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
      </div>

      {/* Role field */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          value={user.role}
          onChange={(e) => updateField("role", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
          required
        >
          <option value="user">User</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
          <option value="org">Organization</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Status field - only for editing existing users */}
      {user.id && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={user.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      )}

      {/* Assigned Role ID field - if we're using role assignments */}
      {roles.length > 0 && (
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
            Assigned Role
          </label>
          <select
            id="roleId"
            name="roleId"
            value={user.roleId || ""}
            onChange={(e) => updateField("roleId", e.target.value || null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
          >
            <option value="">No specific role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Password field - only for new users */}
      {!user.id && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password || ""}
            onChange={(e) => updateField("password", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
            placeholder="Enter password for new user"
            required={!user.id}
          />
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </p>
        </div>
      )}

      {/* Form actions */}
      <div className="pt-4 flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {user.id ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  )
}

