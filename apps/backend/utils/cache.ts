import { Redis } from "ioredis"
import { env } from "../config/env"
import { logger } from "../lib/logger"

// Initialize Redis client
const redis = new Redis(env.REDIS_URL)

// Default cache expiration time (1 hour)
const DEFAULT_EXPIRATION = 3600

/**
 * Gets a value from the cache
 * @param key Cache key
 * @returns Promise with the cached value or null if not found
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cachedData = await redis.get(key)
    if (!cachedData) return null

    return JSON.parse(cachedData) as T
  } catch (error) {
    const err = error as Error
    logger.error("Cache get error", { key, error: err.message })
    return null
  }
}

/**
 * Sets a value in the cache
 * @param key Cache key
 * @param value Value to cache
 * @param expiration Expiration time in seconds
 * @returns Promise indicating if the operation was successful
 */
export async function setCached<T>(key: string, value: T, expiration = DEFAULT_EXPIRATION): Promise<boolean> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", expiration)
    return true
  } catch (error) {
    const err = error as Error
    logger.error("Cache set error", { key, error: err.message })
    return false
  }
}

/**
 * Removes a value from the cache
 * @param key Cache key
 * @returns Promise indicating if the operation was successful
 */
export async function removeCached(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    const err = error as Error
    logger.error("Cache remove error", { key, error: err.message })
    return false
  }
}

/**
 * Gets a value from the cache or computes it if not found
 * @param key Cache key
 * @param fn Function to compute the value if not in cache
 * @param expiration Expiration time in seconds
 * @returns Promise with the cached or computed value
 */
export async function getCachedOrCompute<T>(
  key: string,
  fn: () => Promise<T>,
  expiration = DEFAULT_EXPIRATION,
): Promise<T> {
  const cachedValue = await getCached<T>(key)
  if (cachedValue !== null) return cachedValue

  const computedValue = await fn()
  await setCached(key, computedValue, expiration)
  return computedValue
}

/**
 * Invalidates all cache keys matching a pattern
 * @param pattern Pattern to match cache keys
 * @returns Promise with the number of keys invalidated
 */
export async function invalidatePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length === 0) return 0

    const result = await redis.del(...keys)
    return result
  } catch (error) {
    const err = error as Error
    logger.error("Cache invalidate pattern error", { pattern, error: err.message })
    return 0
  }
}

/**
 * Creates a cache key from parts
 * @param parts Parts to include in the cache key
 * @returns Formatted cache key
 */
export function createCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(":")
}