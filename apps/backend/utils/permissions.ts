import { TRPCError } from "@trpc/server"
import type { Context, Permission, RolePermissions, User } from "@/packages/types"

// Define permissions for each role
const rolePermissions: RolePermissions = {
  user: ["user:read", "document:read", "submission:read", "submission:write"],
  faculty: ["user:read", "document:read", "document:write", "submission:read", "submission:write", "faculty:access"],
  admin: [
    "user:read",
    "user:write",
    "document:read",
    "document:write",
    "submission:read",
    "submission:write",
    "admin:access",
    "faculty:access",
  ],
}

/**
 * Checks if a user has a specific permission
 * @param user The user to check permissions for
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false

  // If user is impersonating, use their original role for permission checks
  const role = user.role

  return rolePermissions[role]?.includes(permission) || false
}

/**
 * Middleware to check if a user has a specific permission
 * @param permission The permission to check
 * @returns tRPC middleware that checks for the permission
 */
export function requirePermission(permission: Permission) {
  return ({ ctx, next }: { ctx: Context; next: () => Promise<unknown> }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      })
    }

    if (!hasPermission(ctx.user, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have permission to perform this action`,
      })
    }

    return next()
  }
}

/**
 * Gets all permissions for a specific role
 * @param role The role to get permissions for
 * @returns Array of permissions for the role
 */
export function getPermissionsForRole(role: string): Permission[] {
  return rolePermissions[role] || []
}

/**
 * Checks if a user has access to a specific resource
 * @param user The user to check
 * @param resourceOwnerId The ID of the resource owner
 * @param adminOnly Whether only admins can access the resource
 * @returns Boolean indicating if the user has access
 */
export function canAccessResource(user: User | null, resourceOwnerId: string, adminOnly = false): boolean {
  if (!user) return false

  // Admins can access any resource
  if (user.role === "admin") return true

  // If admin only, other roles can't access
  if (adminOnly) return false

  // Users can access their own resources
  return user.id === resourceOwnerId
}