"use client"

import type React from "react"

import { useToast } from "@/components/ui"
import { trpc } from "@/utils/trpc.ts"
import { Dialog } from "@headlessui/react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useState } from "react"
import AdminLayout from "../../../../../../../archive13628-pm/apps/frontend/components/features/admin/AdminLayout"

interface Content {
  id: string
  title: string
  slug: string
  body: string
  status: "draft" | "published"
}

export default function AdminContentPage() {
  const { toast } = useToast() // Fixed: Corrected the destructuring to match ToastContextValue
  const [form, setForm] = useState<{
    title: string
    slug: string
    body: string
    status: "draft" | "published"
  }>({
    title: "",
    slug: "",
    body: "",
    status: "draft",
  })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 10

  // Fixed: Removed generic type parameter and using correct TRPC path
  const { data: contentList, isLoading, error, refetch } = trpc.admin.content.getAll.useQuery()

  // Fixed: Using correct TRPC path for content management
  const createContent = trpc.admin.content.create.useMutation()

  const handleCreate = async () => {
    try {
      await createContent.mutateAsync(form)
      // Fixed: Using the correct toast function signature
      toast({
        title: "Content created!",
        variant: "success",
      })
      setForm({ title: "", slug: "", body: "", status: "draft" })
      refetch()
      setIsOpen(false)
    } catch (err) {
      // Fixed: Using the correct toast function signature
      toast({
        title: "Failed to create content.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    if (newStatus === "draft" || newStatus === "published") {
      setForm({ ...form, status: newStatus })
    }
  }

  const filtered = contentList?.filter((c: Content) => c.title.toLowerCase().includes(search.toLowerCase()))

  const paginated = filtered?.slice(page * pageSize, (page + 1) * pageSize)

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.body,
    onUpdate: ({ editor }) => {
      setForm({ ...form, body: editor.getHTML() })
    },
  })

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">📚 Content Management</h1>

      <div className="flex justify-between items-center gap-2 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Filter by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded border"
        />
        <button
          onClick={() => setIsOpen(true)}
          className="bg-westernPurple hover:bg-orchid px-4 py-2 rounded text-white"
        >
          ➕ New Content
        </button>
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded shadow-xl">
            <Dialog.Title className="text-lg font-bold mb-2">Create New Content</Dialog.Title>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Slug"
              value={form.slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, slug: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <select value={form.status} onChange={handleStatusChange} className="border p-2 rounded w-full mb-2">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <EditorContent editor={editor} className="border p-2 rounded bg-white text-black h-48 overflow-auto" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-westernPurple text-white rounded">
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {isLoading && <p>Loading content...</p>}
      {error && <p className="text-red-500">Error loading content</p>}

      <ul className="space-y-2">
        {paginated?.map((item: Content) => (
          <li key={item.id} className="p-4 bg-deepFocus rounded text-white space-y-1">
            <div className="flex justify-between items-center">
              <strong>{item.title}</strong>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "published" ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm">{item.body.slice(0, 150)}...</p>
            <div className="text-xs text-gray-300">Slug: {item.slug}</div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between mt-6 text-sm">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="underline disabled:text-gray-500"
        >
          ← Prev
        </button>
        <button
          disabled={(page + 1) * pageSize >= (filtered?.length || 0)}
          onClick={() => setPage((p) => p + 1)}
          className="underline disabled:text-gray-500"
        >
          Next →
        </button>
      </div>
    </AdminLayout>
  )
}

