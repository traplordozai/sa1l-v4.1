import type { ApiResponse } from "@/packages/types"

/**
 * Creates a successful API response
 * @param data The data to include in the response
 * @param meta Additional metadata for the response
 * @returns A standardized successful API response
 */
export function successResponse<T>(data: T, meta?: Omit<ApiResponse["meta"], "timestamp">): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Creates an error API response
 * @param code Error code
 * @param message Error message
 * @param details Additional error details
 * @returns A standardized error API response
 */
export function errorResponse(code: string, message: string, details?: unknown): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Creates a paginated API response
 * @param data The data to include in the response
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns A standardized paginated API response
 */
export function paginatedResponse<T>(data: T[], page: number, limit: number, total: number): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      timestamp: new Date().toISOString(),
    },
  }
}