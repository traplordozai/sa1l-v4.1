"use client"

// File: apps/frontend/components/features/roles/PermissionMatrix.tsx
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

interface Permission {
  key: string
  label: string
  category: string
}

interface PermissionMatrixProps {
  permissions: Permission[]
  selectedPermissions: string[]
  onChange: (permission: string, checked: boolean) => void
}

export function PermissionMatrix({ permissions, selectedPermissions, onChange }: PermissionMatrixProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    return permissions.reduce(
      (acc, permission) => {
        const category = permission.category || "Other"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(permission)
        return acc
      },
      {} as Record<string, Permission[]>,
    )
  }, [permissions])

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (categoryPermissions: Permission[]) => {
    return categoryPermissions.every((permission) => selectedPermissions.includes(permission.key))
  }

  // Check if some permissions in a category are selected
  const isCategoryPartiallySelected = (categoryPermissions: Permission[]) => {
    return (
      categoryPermissions.some((permission) => selectedPermissions.includes(permission.key)) &&
      !isCategoryFullySelected(categoryPermissions)
    )
  }

  // Handle category checkbox change (select/deselect all)
  const handleCategoryChange = (category: string, checked: boolean) => {
    const categoryPermissions = groupedPermissions[category] || []
    categoryPermissions.forEach((permission) => {
      onChange(permission.key, checked)
    })
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
        const isExpanded = expandedCategories[category] !== false // Default to expanded
        const isFullySelected = isCategoryFullySelected(categoryPermissions)
        const isPartiallySelected = isCategoryPartiallySelected(categoryPermissions)

        return (
          <div key={category} className="border rounded-md overflow-hidden">
            {/* Category header */}
            <div
              className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isFullySelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isPartiallySelected
                    }
                  }}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCategoryChange(category, e.target.checked)
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                />
                <h3 className="text-sm font-medium text-gray-900">{category}</h3>
              </div>
              <div>
                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>

            {/* Category permissions */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission.key}
                        checked={selectedPermissions.includes(permission.key)}
                        onChange={(e) => onChange(permission.key, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-westernPurple focus:ring-westernPurple"
                      />
                      <label htmlFor={permission.key} className="ml-2 block text-sm text-gray-900">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

