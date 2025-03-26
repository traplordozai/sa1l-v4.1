import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server"
import type { userRouter } from "./backend/routers/v1/user"
import type { User } from "@/packages/types"

// Define types based on the backend router
type UserRouter = typeof userRouter
export type UserOutput = inferRouterOutputs<UserRouter>
export type UserInput = inferRouterInputs<UserRouter>

// Create the TRPC client with the new createTRPCClient function
const trpcClient = createTRPCClient<UserRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
})

/**
 * Get all users
 * @returns Promise with all users
 */
export function getUsers(): Promise<User[]> {
  return trpcClient.getAll.query()
}

/**
 * Create a new user
 * @param user User data to create
 * @returns Promise with created user
 */
export function createUser(user: UserInput["create"]): Promise<User> {
  return trpcClient.create.mutate(user)
}

/**
 * Update an existing user
 * @param userUpdate User data to update
 * @returns Promise with updated user
 */
export function updateUser(userUpdate: UserInput["update"]): Promise<User> {
  return trpcClient.update.mutate(userUpdate)
}

/**
 * Delete a user
 * @param userId ID of user to delete
 * @returns Promise with deleted user
 */
export function deleteUser(userId: string): Promise<User> {
  return trpcClient.delete.mutate(userId)
}

/**
 * Reset a user's password
 * @param userId ID of user to reset password
 * @returns Promise with success status
 */
export function resetPassword(userId: string): Promise<{ success: boolean }> {
  return trpcClient.resetPassword.mutate(userId)
}

/**
 * Impersonate a user
 * @param userId ID of user to impersonate
 * @returns Promise with impersonation token
 */
export function impersonateUser(userId: string): Promise<{
  token: string
  expiresAt: Date
  impersonatedUser: {
    id: string
    email: string
    name?: string
    role: string
  }
}> {
  return trpcClient.impersonate.mutate(userId)
}

