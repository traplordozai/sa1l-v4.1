import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/packages/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  accessToken: string | null

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  checkAuth: () => Promise<boolean>
  setUser: (user: User | null) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || "Login failed")
          }

          const data = await response.json()
          set({
            user: data.user,
            isAuthenticated: true,
            accessToken: data.accessToken,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || "Login failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
          })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await fetch("/api/auth/logout", { method: "POST" })
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            isLoading: false,
            error: null,
          })
        }
      },

      refreshSession: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch("/api/auth/refresh", { method: "POST" })

          if (!response.ok) {
            throw new Error("Session refresh failed")
          }

          const data = await response.json()
          set({
            accessToken: data.accessToken,
            isLoading: false,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            isLoading: false,
          })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch("/api/auth/me")

          if (!response.ok) {
            throw new Error("Not authenticated")
          }

          const data = await response.json()
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            isLoading: false,
          })
          return false
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setError: (error) => {
        set({ error })
      },
    }),
    {
      name: "auth-storage", // Name for localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    },
  ),
)

