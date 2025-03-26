import { TRPCError } from "@trpc/server"
import { logger } from "../lib/logger"
import { captureException } from "../../../archive13628-pm/apps/shared/lib/sentry"
import { prisma } from "../db/prisma"
import { t } from "../trpc"

/**
 * TRPC middleware for centralized error handling
 */
export const errorHandler = t.middleware(async ({ path, type, next, ctx }) => {
  const startTime = Date.now()
  
  try {
    // Execute the procedure
    const result = await next()
    return result
  } catch (error) {
    // Calculate duration
    const duration = Date.now() - startTime
    
    // Extract error details
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorCode = error instanceof TRPCError ? error.code : "INTERNAL_SERVER_ERROR"
    const statusCode = error instanceof TRPCError ? getTRPCStatusCode(error.code) : 500
    
    // Log the error
    logger.error(`TRPC Error in ${path}: ${errorMessage}`, {
      path,
      type,
      errorCode,
      statusCode,
      duration,
      stack: errorStack,
      userId: ctx.session?.user?.id,
    })
    
    // Record error in database
    await prisma.log.create({
      data: {
        userId: ctx.session?.user?.id,
        action: path,
        type,
        status: "error",
        error: errorMessage,
        duration,
        metadata: {
          errorCode,
          statusCode,
          stack: errorStack,
          userAgent: ctx.req?.headers["user-agent"],
          ip: ctx.req?.socket.remoteAddress,
        },
      },
    }).catch(logError => {
      logger.error("Failed to log error to database", { logError })
    })
    
    // Send to error monitoring service
    captureException(error instanceof Error ? error : new Error(errorMessage), {
      path,
      type,
      errorCode,
      statusCode,
      userId: ctx.session?.user?.id,
    })
    
    // Rethrow the error if it's already a TRPCError
    if (error instanceof TRPCError) {
      throw error
    }
    
    // Convert to TRPCError if it's not already
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
      cause: error,
    })
  }
})

/**
 * Helper function to get HTTP status code from TRPC error code
 */
function getTRPCStatusCode(code: string): number {
  const statusCodeMap: Record<string, number> = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_SUPPORTED: 405,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
    CLIENT_CLOSED_REQUEST: 499,
  }
  
  return statusCodeMap[code] || 500
}

/**
 * Helper function to create a procedure with error handling
 */
export const withErrorHandler = t.procedure.use(errorHandler)