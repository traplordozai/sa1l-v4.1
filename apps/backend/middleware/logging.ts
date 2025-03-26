import type { inferAsyncReturnType } from "@trpc/server"
import { TRPCError } from "@trpc/server"
import type { createContext } from "../context"
import { prisma } from "../../../../archive13628-pm/apps/backend/db/prisma"
import { t } from "../trpc"

type Context = inferAsyncReturnType<typeof createContext>

interface LogMetadata {
  userAgent?: string
  ip?: string
  errorStack?: string
  [key: string]: unknown
}

/**
 * Middleware for logging all TRPC procedure calls
 */
export const logActivity = t.middleware(async (opts) => {
  const { ctx, next, path, type, input } = opts
  const startTime = Date.now()

  try {
    // Execute the actual procedure
    const result = await next()

    // Log successful operation
    await prisma.log.create({
      data: {
        userId: ctx.session?.user?.id,
        action: path,
        type,
        input: input ? JSON.stringify(input) : null,
        status: "success",
        duration: Date.now() - startTime,
        metadata: {
          userAgent: ctx.req?.headers["user-agent"],
          ip: ctx.req?.socket.remoteAddress,
        } as LogMetadata,
      },
    })

    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    // Log error
    await prisma.log.create({
      data: {
        userId: ctx.session?.user?.id,
        action: path,
        type,
        input: input ? JSON.stringify(input) : null,
        status: "error",
        duration: Date.now() - startTime,
        error: err.message,
        metadata: {
          userAgent: ctx.req?.headers["user-agent"],
          ip: ctx.req?.socket.remoteAddress,
          errorStack: err.stack,
        } as LogMetadata,
      },
    })

    // Re-throw the error to be handled by the error handler
    if (error instanceof TRPCError) {
      throw error
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err.message,
      cause: error,
    })
  }
})

/**
 * Middleware for audit logging of sensitive operations
 */
export const auditLog = t.middleware(async (opts) => {
  const { ctx, next, path, input } = opts

  // Execute the procedure first to ensure it succeeds
  const result = await next()

  // Extract resource ID from input if it exists
  const resourceId = typeof input === "object" && input !== null && "id" in input ? String(input.id) : undefined

  // Create audit log entry
  await prisma.audit.create({
    data: {
      userId: ctx.session?.user?.id ?? "anonymous",
      action: path,
      resourceType: path.split(".")[0],
      resourceId,
      changes: JSON.stringify({
        before: ctx.previousData,
        after: result,
      }),
      metadata: {
        userAgent: ctx.req?.headers["user-agent"],
        ip: ctx.req?.socket.remoteAddress,
        timestamp: new Date().toISOString(),
      } as LogMetadata,
    },
  })

  return result
})

/**
 * Helper function to combine multiple logging middlewares
 * @param sensitive Whether the operation is sensitive and requires audit logging
 * @returns Combined middleware
 */
export const withLogging = (sensitive = false) => {
  return sensitive ? t.procedure.use(logActivity).use(auditLog) : t.procedure.use(logActivity)
}

