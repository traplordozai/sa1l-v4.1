"use client"

import type React from "react"

// File: apps/frontend/components/features/content/ContentEditor.tsx
import Button from "@/components/ui/Button"
import { useAuthStore } from "@/stores/authStore"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Dynamically import the TipTap editor to avoid SSR issues
const Editor = dynamic(() => import("./TipTapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 border rounded-md bg-gray-50 flex items-center justify-center">Loading editor...</div>
  ),
})

export interface ContentEditorProps {
  initialContent: {
    id?: string
    title: string
    slug: string
    body: string
    status: "draft" | "published"
    publishAt?: string
  }
  onSave: (content: any) => void
  onCancel: () => void
}

export function ContentEditor({ initialContent, onSave, onCancel }: ContentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()

  // Generate slug from title
  useEffect(() => {
    if (!content.id && content.title && !content.slug) {
      const slug = content.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
      setContent((prev) => ({ ...prev, slug }))
    }
  }, [content.id, content.title, content.slug])

  // Update content field
  const updateField = (field: string, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Handle rich text editor changes
  const handleEditorChange = (html: string) => {
    updateField("body", html)
  }

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Title validation
    if (!content.title) {
      errors.title = "Title is required"
    }

    // Slug validation
    if (!content.slug) {
      errors.slug = "Slug is required"
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.slug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens"
    }

    // Body validation
    if (!content.body || content.body === "<p></p>") {
      errors.body = "Content is required"
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
      await onSave(content)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={content.title}
          onChange={(e) => updateField("title", e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm ${
            validationErrors.title ? "border-red-500" : ""
          }`}
          required
        />
        {validationErrors.title && <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>}
      </div>

      {/* Slug field */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            /content/
          </span>
          <input
            type="text"
            id="slug"
            name="slug"
            value={content.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className={`block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-westernPurple focus:ring-westernPurple sm:text-sm ${
              validationErrors.slug ? "border-red-500" : ""
            }`}
            required
          />
        </div>
        {validationErrors.slug ? (
          <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">The URL-friendly identifier for this content.</p>
        )}
      </div>

      {/* Content body */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">
          Content <span className="text-red-500">*</span>
        </label>
        <div className={validationErrors.body ? "border border-red-500 rounded-md" : ""}>
          <Editor initialContent={content.body} onChange={handleEditorChange} />
        </div>
        {validationErrors.body && <p className="mt-1 text-sm text-red-600">{validationErrors.body}</p>}
      </div>

      {/* Publishing options */}
      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={content.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="publishAt" className="block text-sm font-medium text-gray-700">
            Publish Date
          </label>
          <input
            type="datetime-local"
            id="publishAt"
            name="publishAt"
            value={content.publishAt || ""}
            onChange={(e) => updateField("publishAt", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-westernPurple focus:ring-westernPurple sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to publish immediately when status is set to Published.
          </p>
        </div>
      </div>

      {/* Form actions */}
      <div className="pt-4 flex justify-between">
        <div>
          {content.id && (
            <p className="text-sm text-gray-500">Last edited by {user?.name || user?.email || "Unknown user"}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {content.id ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  )
}

