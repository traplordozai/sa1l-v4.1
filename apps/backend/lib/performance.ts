import type { NextRequest, NextResponse } from "next/server"
import { logger } from "./logger"

export async function performanceMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const start = performance.now()
  const url = req.url
  const method = req.method

  try {
    // Process the request
    const response = await handler(req)

    // Calculate duration
    const duration = performance.now() - start

    // Log performance data
    logger.http(`${method} ${url} completed in ${duration.toFixed(2)}ms`, {
      duration,
      status: response.status,
      method,
      url,
    })

    return response
  } catch (error) {
    // Calculate duration even for errors
    const duration = performance.now() - start

    // Log error with performance data
    logger.error(`${method} ${url} failed after ${duration.toFixed(2)}ms`, {
      duration,
      method,
      url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw error
  }
}

