import cron from "node-cron"
import { logger, cleanupOldLogs } from "../lib/logger"
import { prisma } from "../../../../archive13628-pm/apps/backend/db/prisma"

// Function to clean up old database logs
async function cleanupDatabaseLogs(maxAgeDays = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

  try {
    // Delete old logs
    const deletedLogs = await prisma.log.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    // Delete old metrics
    const deletedMetrics = await prisma.logMetric.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    // Delete old resolved alerts
    const deletedAlerts = await prisma.logAlert.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
        resolvedAt: {
          not: null,
        },
      },
    })

    logger.info("Database logs cleanup completed", {
      deletedLogs: deletedLogs.count,
      deletedMetrics: deletedMetrics.count,
      deletedAlerts: deletedAlerts.count,
    })

    return {
      deletedLogs: deletedLogs.count,
      deletedMetrics: deletedMetrics.count,
      deletedAlerts: deletedAlerts.count,
    }
  } catch (error) {
    logger.error("Error cleaning up database logs", { error })
    throw error
  }
}

// Function to archive logs to cold storage (could be S3, etc.)
async function archiveLogs() {
  // This is a placeholder for actual archive implementation
  // In a real implementation, you would:
  // 1. Compress logs
  // 2. Upload to cold storage (S3, etc.)
  // 3. Delete the archived logs
  logger.info("Log archiving completed")
}

// Schedule log cleanup to run daily at 3 AM
export function scheduleLogRotation() {
  // Clean up file logs daily at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    try {
      logger.info("Starting scheduled log cleanup")

      // Clean up file logs
      const deletedFiles = await cleanupOldLogs(30)

      // Clean up database logs
      const dbCleanupResult = await cleanupDatabaseLogs(30)

      // Archive logs if needed
      await archiveLogs()

      logger.info("Scheduled log cleanup completed", {
        deletedFiles,
        ...dbCleanupResult,
      })
    } catch (error) {
      logger.error("Scheduled log cleanup failed", { error })
    }
  })

  logger.info("Log rotation scheduled to run daily at 3:00 AM")
}

import cron from "node-cron"
import { logger, cleanupOldLogs } from "../lib/logger"
import { prisma } from "../db/prisma"

// Function to clean up old database logs
async function cleanupDatabaseLogs(maxAgeDays = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

  try {
    // Delete old logs
    const deletedLogs = await prisma.log.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    // Delete old metrics
    const deletedMetrics = await prisma.logMetric.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    // Delete old resolved alerts
    const deletedAlerts = await prisma.logAlert.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
        resolvedAt: {
          not: null,
        },
      },
    })

    logger.info("Database logs cleanup completed", {
      deletedLogs: deletedLogs.count,
      deletedMetrics: deletedMetrics.count,
      deletedAlerts: deletedAlerts.count,
    })

    return {
      deletedLogs: deletedLogs.count,
      deletedMetrics: deletedMetrics.count,
      deletedAlerts: deletedAlerts.count,
    }
  } catch (error) {
    logger.error("Error cleaning up database logs", { error })
    throw error
  }
}

// Function to archive logs to cold storage (could be S3, etc.)
async function archiveLogs() {
  // This is a placeholder for actual archive implementation
  // In a real implementation, you would:
  // 1. Compress logs
  // 2. Upload to cold storage (S3, etc.)
  // 3. Delete the archived logs
  logger.info("Log archiving completed")
}

// Schedule log cleanup to run daily at 3 AM
export function scheduleLogRotation() {
  // Clean up file logs daily at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    try {
      logger.info("Starting scheduled log cleanup")

      // Clean up file logs
      const deletedFiles = await cleanupOldLogs(30)

      // Clean up database logs
      const dbCleanupResult = await cleanupDatabaseLogs(30)

      // Archive logs if needed
      await archiveLogs()

      logger.info("Scheduled log cleanup completed", {
        deletedFiles,
        ...dbCleanupResult,
      })
    } catch (error) {
      logger.error("Scheduled log cleanup failed", { error })
    }
  })

  logger.info("Log rotation scheduled to run daily at 3:00 AM")
}

