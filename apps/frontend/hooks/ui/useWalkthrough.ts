"use client"

// File: apps/frontend/hooks/features/useContent.ts
import { useToast } from "@/components/ui/Toast"
import { useCallback, useState } from "react"
import { useContentStore } from "../../../stores/contentStore"

export interface ContentItem {
  id: string
  title: string
  slug: string
  body: string
  status: "draft" | "published"
  publishAt?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface NewContent {
  title: string
  slug: string
  body: string
  status: "draft" | "published"
  publishAt?: string
}

export function useContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ContentItem | null>(null)

  const {
    content,
    currentContent: storeContent,
    isLoading,
    error,
    fetchContent,
    fetchContentById,
    createContent,
    updateContent,
    deleteContent,
    setFilter,
  } = useContentStore()

  const { showToast } = useToast()

  // Initialize - fetch all content
  const initialize = useCallback(async () => {
    try {
      await fetchContent()
    } catch (err: any) {
      showToast("Failed to load content: " + err.message, "error")
    }
  }, [fetchContent, showToast])

  // Create new content
  const handleNew = useCallback(() => {
    setCurrentContent({
      id: "",
      title: "",
      slug: "",
      body: "",
      status: "draft",
    })
    setIsEditing(true)
  }, [])

  // Edit existing content
  const handleEdit = useCallback((content: ContentItem) => {
    setCurrentContent(content)
    setIsEditing(true)
  }, [])

  // Save content (create or update)
  const handleSave = useCallback(
    async (content: ContentItem) => {
      try {
        if (!content.id) {
          // Create new
          await createContent(content)
          showToast("Content created successfully", "success")
        } else {
          // Update existing
          await updateContent(content)
          showToast("Content updated successfully", "success")
        }

        setIsEditing(false)
        setCurrentContent(null)
      } catch (err: any) {
        showToast("Failed to save content: " + err.message, "error")
      }
    },
    [createContent, updateContent, showToast],
  )

  // Show delete confirmation
  const handleDeleteClick = useCallback((content: ContentItem) => {
    setConfirmDelete(content)
  }, [])

  // Confirm and perform delete
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return

    try {
      await deleteContent(confirmDelete.id)
      showToast("Content deleted successfully", "success")
      setConfirmDelete(null)
    } catch (err: any) {
      showToast("Failed to delete content: " + err.message, "error")
    }
  }, [confirmDelete, deleteContent, showToast])

  // Filter content
  const handleFilter = useCallback(
    (filter: { search?: string; status?: "draft" | "published" }) => {
      setFilter(filter)
    },
    [setFilter],
  )

  return {
    content,
    storeContent,
    isLoading,
    error,
    isEditing,
    currentContent,
    confirmDelete,
    initialize,
    handleNew,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleConfirmDelete,
    handleFilter,
    cancelEdit: () => setIsEditing(false),
    cancelDelete: () => setConfirmDelete(null),
  }
}

