import { t } from "../../trpc"
import { z } from "zod"
import { prisma } from "../../../../../archive13628-pm/apps/backend/docs/prisma"
import { Redis } from "ioredis"
import { env } from "../../config/env"
import os from "os"

const redis = new Redis(env.REDIS_URL)

export const healthRouter = t.router({
  check: t.procedure.query(async () => {
    const startTime = process.hrtime()

    // Check database connection
    let dbStatus = "healthy"
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      dbStatus = "unhealthy"
    }

    // Check Redis connection
    let cacheStatus = "healthy"
    try {
      await redis.ping()
    } catch (error) {
      cacheStatus = "unhealthy"
    }

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length,
      },
    }

    // Calculate response time
    const [seconds, nanoseconds] = process.hrtime(startTime)
    const responseTime = seconds * 1000 + nanoseconds / 1000000

    return {
      status: dbStatus === "healthy" && cacheStatus === "healthy" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          type: "postgres",
        },
        cache: {
          status: cacheStatus,
          type: "redis",
        },
      },
      system: systemMetrics,
      performance: {
        responseTime: `${responseTime.toFixed(2)}ms`,
      },
    }
  }),

  ping: t.procedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    }
  }),

  metrics: t.procedure
    .input(
      z.object({
        detailed: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ input }) => {
      const metrics = {
        system: {
          memory: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem(),
          },
          cpu: {
            load: os.loadavg(),
            cores: os.cpus().length,
          },
          uptime: process.uptime(),
        },
      }

      if (input.detailed) {
        const [dbConnections, cacheKeys] = await Promise.all([
          prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity`,
          redis.dbsize(),
        ])

        return {
          ...metrics,
          detailed: {
            database: {
              activeConnections: dbConnections,
            },
            cache: {
              totalKeys: cacheKeys,
            },
            process: {
              pid: process.pid,
              version: process.version,
              platform: process.platform,
              arch: process.arch,
              nodeEnv: process.env.NODE_ENV,
            },
          },
        }
      }

      return metrics
    }),
})

