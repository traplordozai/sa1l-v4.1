import Redis from "ioredis"
import { env } from "../config/env"
import { logger } from "../lib/logger"

export class CacheService {
  private redis: Redis | null = null
  private prefix: string
  private defaultTTL: number

  constructor(options: { prefix?: string; defaultTTL?: number } = {}) {
    this.prefix = options.prefix || "app:"
    this.defaultTTL = options.defaultTTL || 3600 // 1 hour in seconds

    try {
      if (env.REDIS_URL) {
        this.redis = new Redis(env.REDIS_URL)

        this.redis.on("error", (error) => {
          logger.error("Redis connection error", { error })
        })

        logger.info("Redis cache initialized")
      } else {
        logger.warn("Redis URL not provided, cache disabled")
      }
    } catch (error) {
      const err = error as Error
      logger.error("Failed to initialize Redis cache", { error: err })
      this.redis = null
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null

    try {
      const data = await this.redis.get(this.getKey(key))

      if (!data) return null

      return JSON.parse(data) as T
    } catch (error) {
      const err = error as Error
      logger.error("Cache get error", { error: err, key })
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.redis) return false

    try {
      const serializedValue = JSON.stringify(value)
      const expiry = ttl || this.defaultTTL

      await this.redis.set(this.getKey(key), serializedValue, "EX", expiry)

      return true
    } catch (error) {
      const err = error as Error
      logger.error("Cache set error", { error: err, key })
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.del(this.getKey(key))
      return true
    } catch (error) {
      const err = error as Error
      logger.error("Cache delete error", { error: err, key })
      return false
    }
  }

  async flush(): Promise<boolean> {
    if (!this.redis) return false

    try {
      const keys = await this.redis.keys(`${this.prefix}*`)

      if (keys.length > 0) {
        await this.redis.del(...keys)
      }

      return true
    } catch (error) {
      const err = error as Error
      logger.error("Cache flush error", { error: err })
      return false
    }
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    // Try to get from cache first
    const cachedData = await this.get<T>(key)

    if (cachedData !== null) {
      return cachedData
    }

    // If not in cache, fetch fresh data
    const freshData = await fetchFn()

    // Store in cache for future requests
    await this.set(key, freshData, ttl)

    return freshData
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.redis) return 0

    try {
      const keys = await this.redis.keys(`${this.prefix}${pattern}`)

      if (keys.length === 0) return 0

      await this.redis.del(...keys)

      return keys.length
    } catch (error) {
      const err = error as Error
      logger.error("Cache invalidate pattern error", { error: err, pattern })
      return 0
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService()