import { TRPCError } from "@trpc/server"
import { createHash } from "crypto"
import csrf from "csrf"
import { Redis } from "ioredis"
import { env } from "../config/env"
import { t } from "../trpc"
import type { Context } from "@/packages/types"

const redis = new Redis(env.REDIS_URL)
const tokens = new csrf()

/**
 * Rate limiting middleware
 */
export const rateLimiter = t.middleware(async ({ ctx, next, path }) => {
  const ip = ctx.req?.socket.remoteAddress || "unknown"
  const key = `ratelimit:${ip}:${path}`

  const result = await redis.multi().incr(key).expire(key, env.RATE_LIMIT_WINDOW).exec()

  if (!result) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Rate limiting error",
    })
  }

  const [incrResult] = result
  const count = incrResult[1] as number

  if (count > env.RATE_LIMIT_MAX) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded",
    })
  }

  return next()
})

/**
 * CSRF Protection middleware
 */
export const csrfProtection = t.middleware(async ({ ctx, next }) => {
  if (!ctx.req?.headers["x-csrf-token"]) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CSRF token missing",
    })
  }

  const secret = await getCSRFSecret(ctx.session?.user?.id)
  if (!tokens.verify(secret, ctx.req.headers["x-csrf-token"] as string)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Invalid CSRF token",
    })
  }

  return next()
})

/**
 * Session security middleware
 */
export const sessionSecurity = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No session found",
    })
  }

  // Verify session integrity
  const sessionHash = createHash("sha256").update(JSON.stringify(ctx.session)).digest("hex")

  const storedHash = await redis.get(`session:${ctx.session.id}:hash`)
  if (sessionHash !== storedHash) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session tampering detected",
    })
  }

  // Check if session is expired
  const sessionExpiry = await redis.ttl(`session:${ctx.session.id}`)
  if (sessionExpiry <= 0) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session expired",
    })
  }

  // Rotate session ID periodically
  if (shouldRotateSession(ctx.session)) {
    await rotateSessionId(ctx.session)
  }

  return next()
})

/**
 * Secure headers middleware
 */
export const secureHeaders = t.middleware(async ({ ctx, next }) => {
  if (ctx.res) {
    ctx.res.setHeader("X-Content-Type-Options", "nosniff")
    ctx.res.setHeader("X-Frame-Options", "DENY")
    ctx.res.setHeader("X-XSS-Protection", "1; mode=block")
    ctx.res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
    ctx.res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    )

    if (env.NODE_ENV === "production") {
      ctx.res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    }
  }

  return next()
})

/**
 * Helper function to get CSRF secret
 * @param userId User ID or undefined for anonymous users
 * @returns Promise with the CSRF secret
 */
async function getCSRFSecret(userId?: string): Promise<string> {
  const key = `csrf:${userId || "anonymous"}`
  let secret = await redis.get(key)

  if (!secret) {
    secret = tokens.secretSync()
    await redis.set(key, secret, "EX", 86400) // 24 hours
  }

  return secret
}

/**
 * Helper function to check if session should be rotated
 * @param session The session object
 * @returns Boolean indicating if session should be rotated
 */
function shouldRotateSession(session: Context["session"]): boolean {
  if (!session) return false
  const rotationInterval = 15 * 60 * 1000 // 15 minutes
  return Date.now() - session.lastRotated > rotationInterval
}

/**
 * Helper function to rotate session ID
 * @param session The session object
 */
async function rotateSessionId(session: Context["session"]): Promise<void> {
  if (!session) return

  const oldId = session.id
  const newId = createHash("sha256")
    .update(oldId + Date.now().toString())
    .digest("hex")

  await redis
    .multi()
    .rename(`session:${oldId}`, `session:${newId}`)
    .rename(`session:${oldId}:hash`, `session:${newId}:hash`)
    .exec()

  session.id = newId
  session.lastRotated = Date.now()
}

