export type UserRole = "user" | "admin" | "faculty"
export type UserStatus = "active" | "suspended"
export type ActionType = "delete" | "reset-password" | "impersonate" | "suspend" | "activate" | null

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  status: UserStatus
}

export interface ConfirmAction {
  type: ActionType
  user: User | null
}

export interface UserActionHandlers {
  onSuccess?: (message: string) => void
  onError?: (error: unknown) => void
}

