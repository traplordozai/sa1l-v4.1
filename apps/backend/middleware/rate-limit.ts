import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { logger } from "../lib/logger"
import { errorResponse } from "../utils/api-response"

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || "",
})

interface RateLimitOptions {
  limit: number
  window: number // in seconds
  keyGenerator?: (req: NextRequest) => string
}

const defaultKeyGenerator = (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const path = new URL(req.url).pathname
  return `ratelimit:${ip}:${path}`
}

/**
 * Rate limiting middleware for API routes
 */
export function rateLimit(options: RateLimitOptions) {
  const { limit, window, keyGenerator = defaultKeyGenerator } = options

  return async function rateLimitMiddleware(
    req: NextRequest,
    next: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      const key = keyGenerator(req)

      // Get current count
      const current = (await redis.get<number>(key)) || 0

      // Check if limit exceeded
      if (current >= limit) {
        logger.warn("Rate limit exceeded", { key, limit, current })
        return NextResponse.json(errorResponse("RATE_LIMIT_EXCEEDED", "Too many requests, please try again later"), {
          status: 429,
          headers: { "Retry-After": window.toString() },
        })
      }

      // Increment counter
      const multi = redis.multi()
      multi.incr(key)
      multi.expire(key, window)
      await multi.exec()

      // Add rate limit headers
      const response = await next()
      response.headers.set("X-RateLimit-Limit", limit.toString())
      response.headers.set("X-RateLimit-Remaining", (limit - current - 1).toString())

      return response
    } catch (error) {
      // If Redis fails, allow the request to proceed
      logger.error("Rate limit error", { error })
      return next()
    }
  }
}