import { type NextRequest, NextResponse } from "next/server"
import { logger } from "./logger"
import { captureException } from "../../../../archive13628-pm/apps/shared/lib/sentry"
import { alertError } from "../../../../archive13628-pm/apps/backend/services/alert-service"

// Interface for structured error responses
interface ErrorResponse {
  error: {
    message: string
    code?: string
    details?: any
  }
  success: false
}

// Custom error class with additional properties
export class AppError extends Error {
  statusCode: number
  code: string
  details?: any

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: any) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

// Function to handle errors in API routes
export async function handleApiError(
  error: unknown,
  req: NextRequest,
  shouldAlert = true,
): Promise<NextResponse<ErrorResponse>> {
  // Default values
  let statusCode = 500
  let errorMessage = "An unexpected error occurred"
  let errorCode = "INTERNAL_ERROR"
  let errorDetails = undefined

  // Extract error information based on error type
  if (error instanceof AppError) {
    statusCode = error.statusCode
    errorMessage = error.message
    errorCode = error.code
    errorDetails = error.details
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  // Log the error
  logger.error(`API Error: ${errorMessage}`, {
    error,
    path: req.nextUrl.pathname,
    method: req.method,
    statusCode,
    errorCode,
  })

  // Capture in Sentry
  captureException(error instanceof Error ? error : new Error(errorMessage), {
    path: req.nextUrl.pathname,
    method: req.method,
    statusCode,
    errorCode,
  })

  // Send alert for critical errors
  if (shouldAlert && statusCode >= 500) {
    try {
      await alertError(`API Error: ${errorMessage}`, "api-error-handler", {
        path: req.nextUrl.pathname,
        method: req.method,
        statusCode,
        errorCode,
        errorDetails,
      })
    } catch (alertError) {
      logger.error("Failed to send error alert", { alertError })
    }
  }

  // Return structured error response
  return NextResponse.json(
    {
      error: {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
      },
      success: false,
    },
    { status: statusCode },
  )
}

// Helper function to create common error types
export const createError = {
  badRequest: (message: string, code = "BAD_REQUEST", details?: any) => new AppError(message, 400, code, details),
  unauthorized: (message = "Unauthorized", code = "UNAUTHORIZED", details?: any) =>
    new AppError(message, 401, code, details),
  forbidden: (message = "Forbidden", code = "FORBIDDEN", details?: any) => new AppError(message, 403, code, details),
  notFound: (message = "Resource not found", code = "NOT_FOUND", details?: any) =>
    new AppError(message, 404, code, details),
  conflict: (message: string, code = "CONFLICT", details?: any) => new AppError(message, 409, code, details),
  internal: (message = "Internal server error", code = "INTERNAL_ERROR", details?: any) =>
    new AppError(message, 500, code, details),
}

