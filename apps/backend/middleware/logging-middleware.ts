import type { NextRequest, NextResponse } from "next/server"
import { logger, requestLogger } from "../lib/logger"

export async function loggingMiddleware(req: NextRequest, next: () => Promise<NextResponse>) {
  const startTime = Date.now()
  const method = req.method
  const url = req.url

  // Log the request
  requestLogger(req)

  try {
    // Process the request
    const response = await next()

    // Calculate response time
    const responseTime = Date.now() - startTime

    // Log the response
    logger.http(`${method} ${url} ${response.status}`, {
      responseTime,
      status: response.status,
    })

    return response
  } catch (error) {
    // Log the error
    logger.error(`${method} ${url} failed`, {
      error,
      responseTime: Date.now() - startTime,
    })

    throw error
  }
}

