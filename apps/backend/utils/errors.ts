import { TRPCError } from "@trpc/server"
import { ZodError } from "zod"
import { prisma } from "../../../../archive13628-pm/apps/backend/docs/prisma"

/**
 * Extended error classes for domain-specific errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = "ResourceNotFoundError"
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthorizationError"
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BusinessRuleError"
  }
}

/**
 * Error mapper for converting domain errors to TRPC errors
 */
const errorMap = new Map<string, (error: Error) => TRPCError>([
  [
    "ValidationError",
    (error) =>
      new TRPCError({
        code: "BAD_REQUEST",
        message: error.message,
      }),
  ],
  [
    "ResourceNotFoundError",
    (error) =>
      new TRPCError({
        code: "NOT_FOUND",
        message: error.message,
      }),
  ],
  [
    "AuthorizationError",
    (error) =>
      new TRPCError({
        code: "UNAUTHORIZED",
        message: error.message,
      }),
  ],
  [
    "BusinessRuleError",
    (error) =>
      new TRPCError({
        code: "BAD_REQUEST",
        message: error.message,
      }),
  ],
  [
    "PrismaClientKnownRequestError",
    (error: any) => {
      // Handle common Prisma errors
      switch (error.code) {
        case "P2002":
          return new TRPCError({
            code: "CONFLICT",
            message: "A record with this information already exists.",
          })
        case "P2025":
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Record not found.",
          })
        case "P2003":
          return new TRPCError({
            code: "BAD_REQUEST",
            message: "Foreign key constraint failed.",
          })
        default:
          return new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database error",
          })
      }
    },
  ],
])

/**
 * Centralized error handler for logging and converting errors
 * @param error The error to handle
 * @returns Promise with TRPC error
 */
export const errorHandler = async (error: Error): Promise<TRPCError> => {
  // Log error
  await prisma.log.create({
    data: {
      type: "error",
      action: error.name,
      status: "error",
      error: error.message,
      metadata: {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      duration: 0,
    },
  })

  // Convert to TRPC error
  if (error instanceof TRPCError) {
    return error
  }

  if (error instanceof ZodError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: "Validation error",
      cause: error.flatten(),
    })
  }

  const errorConverter = errorMap.get(error.name)
  if (errorConverter) {
    return errorConverter(error)
  }

  // Default error
  console.error("Unhandled error:", error)
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  })
}

/**
 * Error boundary middleware for wrapping procedures
 * @param fn The function to execute
 * @param context Optional context for logging
 * @returns Promise with function result
 */
export const errorBoundary = async <T>(\
  fn: () => Promise<T>,
  context?: { userId?: string
action?: string
}
)
: Promise<T> =>
{
  try {
    return await fn();
  } catch (error: any) {
    // Log error with context
    await prisma.log.create({
      data: {
        userId: context?.userId,
        type: "error",
        action: context?.action || "unknown",
        status: "error",
        error: error.message,
        metadata: {
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
        },
        duration: 0,
      },
    })

    throw error
  }
}

