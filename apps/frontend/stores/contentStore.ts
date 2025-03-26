// File: apps/frontend/stores/contentStore.ts
import type { RouterInputs, RouterOutputs } from "@/utils/trpc"
import { client } from "@/utils/trpc"
import { create } from "zustand"

type ContentResponse = RouterOutputs["contentManagement"]["getAll"][0]
type CreateContentInput = RouterInputs["content"]["create"]
type UpdateContentInput = RouterInputs["content"]["update"]

export interface Content extends ContentResponse {
  id: string
  title: string
  slug: string
  body: string
  status: "draft" | "published"
  authorId?: string
  publishAt?: string
  createdAt?: Date
  updatedAt?: Date
}

interface ContentFilter {
  search?: string
  status?: "draft" | "published"
}

interface ContentState {
  content: Content[]
  currentContent: Content | null
  isLoading: boolean
  error: string | null
  filters: ContentFilter

  // Actions
  fetchContent: () => Promise<void>
  fetchContentById: (id: string) => Promise<void>
  createContent: (content: CreateContentInput) => Promise<void>
  updateContent: (content: UpdateContentInput) => Promise<void>
  deleteContent: (id: string) => Promise<void>
  setFilter: (filter: Partial<ContentFilter>) => void
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: [],
  currentContent: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchContent: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await client.contentManagement.getAll.query()
      const { filters } = get()

      // Filter content based on filters
      const filteredContent = response.filter((item) => {
        const matchesSearch =
          !filters.search ||
          item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.body.toLowerCase().includes(filters.search.toLowerCase())

        const matchesStatus = !filters.status || item.status === filters.status

        return matchesSearch && matchesStatus
      })

      set({
        content: filteredContent,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch content",
        isLoading: false,
      })
    }
  },

  fetchContentById: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await client.contentManagement.getById.query(id)

      if (!response) {
        throw new Error("Content not found")
      }

      set({
        currentContent: response,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch content",
        isLoading: false,
      })
    }
  },

  createContent: async (content: CreateContentInput) => {
    set({ isLoading: true, error: null })

    try {
      const response = await client.content.create.mutate(content)

      set((state) => ({
        content: [...state.content, response],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create content",
        isLoading: false,
      })
    }
  },

  updateContent: async (content: UpdateContentInput) => {
    set({ isLoading: true, error: null })

    try {
      const response = await client.content.update.mutate(content)

      set((state) => ({
        content: state.content.map((item) => (item.id === content.id ? { ...item, ...response } : item)),
        currentContent:
          state.currentContent?.id === content.id ? { ...state.currentContent, ...response } : state.currentContent,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update content",
        isLoading: false,
      })
    }
  },

  deleteContent: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      await client.content.delete.mutate(id)

      set((state) => ({
        content: state.content.filter((item) => item.id !== id),
        currentContent: state.currentContent?.id === id ? null : state.currentContent,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete content",
        isLoading: false,
      })
    }
  },

  setFilter: (filters: Partial<ContentFilter>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
    get().fetchContent()
  },
}))

