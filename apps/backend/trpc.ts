import { initTRPC, TRPCError } from "@trpc/server"
import type { Context } from "@/packages/types"
import { hasPermission } from "./utils/permissions"

// Initialize tRPC
const t = initTRPC.context<Context>().create()

// Base router and procedure
export const router = t.router
export const procedure = t.procedure

// Middleware to check if user is authenticated
export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Middleware to check if user is an admin
export const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    })
  }

  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can access this resource",
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Middleware to check if user is faculty
export const isFaculty = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    })
  }

  if (ctx.user.role !== "faculty" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only faculty members can access this resource",
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Middleware to check for specific permissions
export const hasPermissionMiddleware = (permission: string) => {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      })
    }

    if (!hasPermission(ctx.user, permission as any)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have the required permission: ${permission}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })
}

// Protected procedures
export const authedProcedure = t.procedure.use(isAuthed)
export const adminProcedure = t.procedure.use(isAdmin)
export const facultyProcedure = t.procedure.use(isFaculty)

// Create a procedure with specific permission requirements
export const withPermission = (permission: string) => {
  return t.procedure.use(hasPermissionMiddleware(permission))
}

// Export the tRPC instance
export { t }

