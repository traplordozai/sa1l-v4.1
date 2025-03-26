"use client"

// File: apps/frontend/components/shared/CompoundFilterBuilder.tsx
import { cn } from "@/lib/utils"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useCallback, useState } from "react"
import Button from "../ui/Button"

type FieldType = "string" | "number" | "boolean" | "date" | "select"

interface FilterField {
  key: string
  label: string
  type: FieldType
  options?: { value: string; label: string }[]
}

type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "startsWith" | "endsWith" | "in"

interface FilterCondition {
  id: string
  field: string
  operator: Operator
  value: string | number | boolean | string[]
}

interface FilterGroup {
  id: string
  type: "AND" | "OR"
  conditions: FilterCondition[]
  groups: FilterGroup[]
}

interface CompoundFilterBuilderProps {
  fields: FilterField[]
  initialFilter?: FilterGroup
  onChange: (filter: FilterGroup) => void
  className?: string
  maxDepth?: number
}

export default function CompoundFilterBuilder({
  fields,
  initialFilter,
  onChange,
  className,
  maxDepth = 3,
}: CompoundFilterBuilderProps) {
  const [rootGroup, setRootGroup] = useState<FilterGroup>(
    initialFilter || {
      id: "root",
      type: "AND",
      conditions: [],
      groups: [],
    },
  )

  // Get operator options based on field type
  const getOperatorsForType = (type: FieldType): { value: Operator; label: string }[] => {
    switch (type) {
      case "string":
        return [
          { value: "eq", label: "Equals" },
          { value: "neq", label: "Not Equals" },
          { value: "contains", label: "Contains" },
          { value: "startsWith", label: "Starts With" },
          { value: "endsWith", label: "Ends With" },
        ]
      case "number":
        return [
          { value: "eq", label: "Equals" },
          { value: "neq", label: "Not Equals" },
          { value: "gt", label: "Greater Than" },
          { value: "gte", label: "Greater Than or Equal" },
          { value: "lt", label: "Less Than" },
          { value: "lte", label: "Less Than or Equal" },
        ]
      case "boolean":
        return [{ value: "eq", label: "Equals" }]
      case "date":
        return [
          { value: "eq", label: "Equals" },
          { value: "neq", label: "Not Equals" },
          { value: "gt", label: "After" },
          { value: "gte", label: "After or On" },
          { value: "lt", label: "Before" },
          { value: "lte", label: "Before or On" },
        ]
      case "select":
        return [
          { value: "eq", label: "Equals" },
          { value: "neq", label: "Not Equals" },
          { value: "in", label: "In" },
        ]
      default:
        return [
          { value: "eq", label: "Equals" },
          { value: "neq", label: "Not Equals" },
        ]
    }
  }

  // Generate a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 11)

  // Add a new condition to a group
  const addCondition = useCallback(
    (groupId: string) => {
      const updateGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: [
              ...group.conditions,
              {
                id: generateId(),
                field: fields[0].key,
                operator: getOperatorsForType(fields[0].type)[0].value,
                value: "",
              },
            ],
          }
        }

        return {
          ...group,
          groups: group.groups.map(updateGroup),
        }
      }

      const updatedRoot = updateGroup(rootGroup)
      setRootGroup(updatedRoot)
      onChange(updatedRoot)
    },
    [rootGroup, fields, onChange],
  )

  // Update a condition
  const updateCondition = useCallback(
    (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
      const updateGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map((condition) =>
              condition.id === conditionId ? { ...condition, ...updates } : condition,
            ),
          }
        }

        return {
          ...group,
          groups: group.groups.map(updateGroup),
        }
      }

      const updatedRoot = updateGroup(rootGroup)
      setRootGroup(updatedRoot)
      onChange(updatedRoot)
    },
    [rootGroup, onChange],
  )

  // Remove a condition
  const removeCondition = useCallback(
    (groupId: string, conditionId: string) => {
      const updateGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.filter((condition) => condition.id !== conditionId),
          }
        }

        return {
          ...group,
          groups: group.groups.map(updateGroup),
        }
      }

      const updatedRoot = updateGroup(rootGroup)
      setRootGroup(updatedRoot)
      onChange(updatedRoot)
    },
    [rootGroup, onChange],
  )

  // Add a new group
  const addGroup = useCallback(
    (parentGroupId: string, depth: number) => {
      if (depth >= maxDepth) return

      const updateGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === parentGroupId) {
          return {
            ...group,
            groups: [
              ...group.groups,
              {
                id: generateId(),
                type: "AND",
                conditions: [],
                groups: [],
              },
            ],
          }
        }

        return {
          ...group,
          groups: group.groups.map(updateGroup),
        }
      }

      const updatedRoot = updateGroup(rootGroup)
      setRootGroup(updatedRoot)
      onChange(updatedRoot)
    },
    [rootGroup, maxDepth, onChange],
  )

  // Toggle group type (AND/OR)
  const toggleGroupType = useCallback(
    (groupId: string) => {
      const updateGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            type: group.type === "AND" ? "OR" : "AND",
          }
        }

        return {
          ...group,
          groups: group.groups.map(updateGroup),
        }
      }

      const updatedRoot = updateGroup(rootGroup)
      setRootGroup(updatedRoot)
      onChange(updatedRoot)
    },
    [rootGroup, onChange],
  )

  // Remove a group
  const removeGroup = useCallback(
    (parentGroupId: string, groupId: string) => {
      const updateGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === parentGroupId) {
          return {
            ...group,
            groups: group.groups.filter((g) => g.id !== groupId),
          }
        }

        return {
          ...group,
          groups: group.groups.map(updateGroup),
        }
      }

      const updatedRoot = updateGroup(rootGroup)
      setRootGroup(updatedRoot)
      onChange(updatedRoot)
    },
    [rootGroup, onChange],
  )

  // Reset all filters
  const resetFilters = useCallback(() => {
    const emptyRoot: FilterGroup = {
      id: "root",
      type: "AND",
      conditions: [],
      groups: [],
    }
    setRootGroup(emptyRoot)
    onChange(emptyRoot)
  }, [onChange])

  // Render a filter group recursively
  const renderFilterGroup = (group: FilterGroup, depth = 0) => {
    const isRoot = group.id === "root"

    return (
      <div
        className={cn(
          "p-4 border rounded-lg",
          !isRoot && (group.type === "AND" ? "bg-blue-50" : "bg-green-50"),
          !isRoot && "mt-2",
        )}
      >
        {!isRoot && (
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleGroupType(group.id)}
                className={cn(
                  "px-2 py-1 rounded text-white text-sm font-medium",
                  group.type === "AND" ? "bg-blue-600" : "bg-green-600",
                )}
              >
                {group.type}
              </button>
              <span className="text-sm text-gray-600">
                Match {group.type === "AND" ? "all" : "any"} of the following:
              </span>
            </div>
            <button
              onClick={() => removeGroup("root", group.id)}
              className="text-red-600 hover:text-red-800"
              aria-label="Remove group"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Render conditions */}
        {group.conditions.map((condition) => {
          const fieldConfig = fields.find((f) => f.key === condition.field)
          const operators = fieldConfig ? getOperatorsForType(fieldConfig.type) : []

          return (
            <div key={condition.id} className="flex flex-wrap items-center gap-2 mb-2">
              <select
                value={condition.field}
                onChange={(e) => {
                  const newField = e.target.value
                  const fieldConfig = fields.find((f) => f.key === newField)
                  const operators = fieldConfig ? getOperatorsForType(fieldConfig.type) : []

                  updateCondition(group.id, condition.id, {
                    field: newField,
                    operator: operators[0].value,
                    value: "",
                  })
                }}
                className="p-2 border rounded"
              >
                {fields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>

              <select
                value={condition.operator}
                onChange={(e) =>
                  updateCondition(group.id, condition.id, {
                    operator: e.target.value as Operator,
                  })
                }
                className="p-2 border rounded"
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {fieldConfig?.type === "boolean" ? (
                <select
                  value={condition.value ? "true" : "false"}
                  onChange={(e) =>
                    updateCondition(group.id, condition.id, {
                      value: e.target.value === "true",
                    })
                  }
                  className="p-2 border rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : fieldConfig?.type === "select" ? (
                <select
                  value={condition.value as string}
                  onChange={(e) =>
                    updateCondition(group.id, condition.id, {
                      value: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                >
                  {fieldConfig.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : fieldConfig?.type === "date" ? (
                <input
                  type="date"
                  value={condition.value as string}
                  onChange={(e) =>
                    updateCondition(group.id, condition.id, {
                      value: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
              ) : fieldConfig?.type === "number" ? (
                <input
                  type="number"
                  value={condition.value as number}
                  onChange={(e) =>
                    updateCondition(group.id, condition.id, {
                      value: Number.parseFloat(e.target.value),
                    })
                  }
                  className="p-2 border rounded"
                />
              ) : (
                <input
                  type="text"
                  value={condition.value as string}
                  onChange={(e) =>
                    updateCondition(group.id, condition.id, {
                      value: e.target.value,
                    })
                  }
                  placeholder="Value"
                  className="p-2 border rounded"
                />
              )}

              <button
                onClick={() => removeCondition(group.id, condition.id)}
                className="p-1 text-red-600 hover:text-red-800 rounded"
                aria-label="Remove condition"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )
        })}

        {/* Render nested groups */}
        {group.groups.map((nestedGroup) => renderFilterGroup(nestedGroup, depth + 1))}

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => addCondition(group.id)} className="flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Condition
          </Button>

          {depth < maxDepth - 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => addGroup(group.id, depth + 1)}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Group
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {renderFilterGroup(rootGroup)}

      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}

