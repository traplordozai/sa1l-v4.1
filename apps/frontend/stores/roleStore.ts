import type { Role, RoleState } from "@/types/role"
import { trpc } from "@/utils/trpc"
import { create } from "zustand"

interface RoleStore extends RoleState {
  fetchRoles: () => Promise<void>
  fetchPermissions: () => Promise<void>
  createRole: (role: Omit<Role, "id">) => Promise<Role>
  updateRole: (role: Role) => Promise<Role>
  deleteRole: (id: string) => Promise<void>
}

export const useRoleStore = create<RoleStore>((set) => ({
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    set({ isLoading: true, error: null })
    try {
      const roles = await trpc.role.getAll()
      set({ roles, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  fetchPermissions: async () => {
    set({ isLoading: true, error: null })
    try {
      const permissions = await trpc.permissions.list()
      set({ permissions, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  createRole: async (roleData) => {
    set({ isLoading: true, error: null })
    try {
      const newRole = await trpc.role.create.mutate(roleData)
      set((state) => ({
        roles: [...state.roles, newRole],
        isLoading: false,
      }))
      return newRole
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  updateRole: async (role) => {
    set({ isLoading: true, error: null })
    try {
      const updatedRole = await trpc.role.update.mutate(role)
      set((state) => ({
        roles: state.roles.map((r) => (r.id === role.id ? updatedRole : r)),
        isLoading: false,
      }))
      return updatedRole
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  deleteRole: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await trpc.role.delete({ id })
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },
}))

