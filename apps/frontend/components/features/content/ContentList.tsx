"use client"

// File: apps/frontend/components/features/content/ContentList.tsx
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import { useToast } from "@/components/ui/Toast"
import { formatDate } from "@/lib/utils"
import { type Content, useContentStore } from "@/stores/contentStore"
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

interface ContentListProps {
  onEdit: (content: Content) => void
  onDelete: (content: Content) => void
  onNew: () => void
}

export function ContentList({ onEdit, onDelete, onNew }: ContentListProps) {
  const { content, fetchContent, isLoading, error } = useContentStore()
  const { showToast } = useToast()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    fetchContent().catch((err) => {
      showToast("Failed to load content: " + err.message, "error")
    })
  }, [fetchContent, showToast])

  const columns = [
    {
      key: "title",
      header: "Title",
      accessorFn: (row: Content) => row.title,
    },
    {
      key: "slug",
      header: "Slug",
      accessorFn: (row: Content) => row.slug,
    },
    {
      key: "status",
      header: "Status",
      accessorFn: (row: Content) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      accessorFn: (row: Content) => formatDate(row.updatedAt || new Date(), "datetime"),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Content</h2>
        <Button variant="primary" onClick={onNew} leftIcon={<PlusIcon className="h-5 w-5" />}>
          New Content
        </Button>
      </div>

      <DataTable
        data={content}
        columns={columns}
        keyField="id"
        isLoading={isLoading}
        selectable
        selectedIds={selectedItems}
        onRowSelect={setSelectedItems}
        actions={(item: Content) => (
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
            <p className="text-gray-500">No content found</p>
            <Button variant="outline" onClick={onNew} className="mt-4">
              Create your first content
            </Button>
          </div>
        }
      />
    </div>
  )
}

