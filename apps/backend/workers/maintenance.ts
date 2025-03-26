import type { Job } from "bull"
import { env } from "../config/env"
import { prisma } from "../../../../archive13628-pm/apps/backend/docs/prisma"
import type { MaintenanceTask } from "../queue"

export async function processMaintenance(job: Job<MaintenanceTask>) {
  const { operation, params } = job.data

  switch (operation) {
    case "cleanup_expired_documents":
      await cleanupExpiredDocuments()
      break

    case "update_user_stats":
      await updateUserStats()
      break

    case "database_health_check":
      await checkDatabaseHealth()
      break

    case "cache_cleanup":
      await cleanupCache()
      break

    default:
      throw new Error(`Unknown maintenance operation: ${operation}`)
  }
}

async function cleanupExpiredDocuments() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Archive expired documents
  const expiredDocs = await prisma.document.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      status: "active",
    },
  })

  for (const doc of expiredDocs) {
    await prisma.$transaction([
      // Move to archive
      prisma.documentArchive.create({
        data: {
          originalId: doc.id,
          ...doc,
          archivedAt: new Date(),
        },
      }),
      // Update status
      prisma.document.update({
        where: { id: doc.id },
        data: { status: "archived" },
      }),
    ])
  }

  // Clean up old logs
  await prisma.log.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  })
}

async function updateUserStats() {
  const users = await prisma.user.findMany()

  for (const user of users) {
    const [documents, submissions] = await Promise.all([
      prisma.document.count({
        where: { userId: user.id },
      }),
      prisma.submission.count({
        where: { userId: user.id },
      }),
    ])

    await prisma.userStats.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        documentCount: documents,
        submissionCount: submissions,
        lastUpdated: new Date(),
      },
      update: {
        documentCount: documents,
        submissionCount: submissions,
        lastUpdated: new Date(),
      },
    })
  }
}

async function checkDatabaseHealth() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    // Check for long-running queries
    const longQueries = await prisma.$queryRaw`
      SELECT pid, now() - pg_stat_activity.query_start AS duration, query
      FROM pg_stat_activity
      WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes'
    `

    if (Array.isArray(longQueries) && longQueries.length > 0) {
      console.warn("Long-running queries detected:", longQueries)
    }

    // Check database size
    const dbSize = await prisma.$queryRaw`
      SELECT pg_database_size(current_database()) / 1024 / 1024 as size_mb
    `

    // Log health check results
    await prisma.healthCheck.create({
      data: {
        type: "database",
        status: "healthy",
        details: {
          longQueries: longQueries.length,
          databaseSizeMB: dbSize[0].size_mb,
        },
        timestamp: new Date(),
      },
    })
  } catch (error) {
    await prisma.healthCheck.create({
      data: {
        type: "database",
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      },
    })
    throw error
  }
}

async function cleanupCache() {
  // Implement cache cleanup logic here
  // This would depend on your caching strategy (Redis, Memcached, etc.)
  const redis = new (await import("ioredis")).default(env.REDIS_URL)

  try {
    // Clear expired cache entries
    const keys = await redis.keys("cache:*")
    for (const key of keys) {
      const ttl = await redis.ttl(key)
      if (ttl <= 0) {
        await redis.del(key)
      }
    }

    // Log cleanup
    await prisma.maintenanceLog.create({
      data: {
        operation: "cache_cleanup",
        details: {
          keysScanned: keys.length,
        },
        timestamp: new Date(),
      },
    })
  } finally {
    await redis.quit()
  }
}

