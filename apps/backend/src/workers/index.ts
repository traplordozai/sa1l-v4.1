import { queues } from "../index"
import { sendEmail } from "../../lib/email"
import { logger } from "../../lib/logger"
import { analyzeDocument } from "../../services/documentAnalysis"
import type { Job, Queue } from "bull"

// Type definitions for job data
interface DocumentAnalysisJob {
  documentId: string
  userId: string
  priority?: number
  retryAttempts?: number
}

interface NotificationJob {
  userId: string
  channel: "email" | "push" | "in_app"
  message: string
  metadata?: Record<string, unknown>
  priority?: number
  retryAttempts?: number
}

interface MaintenanceJob {
  operation: "cleanup_old_documents" | "database_backup" | "archive_logs"
  parameters?: Record<string, unknown>
  priority?: number
  retryAttempts?: number
}

// Common job processing options
const DEFAULT_RETRY_ATTEMPTS = 3
const DEFAULT_PRIORITY = 0

// Helper function to handle job retries
const handleJobRetry = (job: Job, error: Error, maxAttempts: number = DEFAULT_RETRY_ATTEMPTS) => {
  const attempts = job.attemptsMade
  if (attempts >= maxAttempts) {
    logger.error(`Job ${job.id} failed permanently after ${attempts} attempts`, {
      jobId: job.id,
      error: error.message,
      stack: error.stack,
      attempts
    })
    throw error
  }
  
  const backoff = Math.min(1000 * Math.pow(2, attempts), 30000) // Exponential backoff, max 30s
  logger.warn(`Retrying job ${job.id} in ${backoff}ms (attempt ${attempts + 1}/${maxAttempts})`, {
    jobId: job.id,
    error: error.message,
    attempts: attempts + 1,
    backoff
  })
  
  throw error // Let Bull handle the retry with backoff
}

// Document Analysis Worker
queues.documentAnalysis.process(async (job: Job<DocumentAnalysisJob>) => {
  const { documentId, userId, priority = DEFAULT_PRIORITY, retryAttempts = DEFAULT_RETRY_ATTEMPTS } = job.data
  
  logger.info(`Processing document analysis for document ${documentId}`, {
    documentId,
    userId,
    priority,
    attempts: job.attemptsMade
  })

  try {
    const result = await analyzeDocument(documentId, userId)
    logger.info(`Document analysis completed for ${documentId}`, { 
      documentId,
      userId,
      status: "success",
      duration: job.finishedOn ? job.finishedOn - job.processedOn : undefined
    })
    return result
  } catch (error) {
    logger.error(`Document analysis failed for ${documentId}`, { 
      documentId,
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      attempts: job.attemptsMade
    })
    handleJobRetry(job, error instanceof Error ? error : new Error(String(error)), retryAttempts)
  }
})

// Notification Worker
queues.notifications.process(async (job: Job<NotificationJob>) => {
  const { userId, channel, message, metadata, priority = DEFAULT_PRIORITY, retryAttempts = DEFAULT_RETRY_ATTEMPTS } = job.data
  
  logger.info(`Processing notification for user ${userId}`, { 
    channel, 
    metadata,
    priority,
    attempts: job.attemptsMade
  })

  try {
    switch (channel) {
      case "email":
        await sendEmail({
          to: userId,
          subject: "New Notification",
          text: message,
          html: `<p>${message}</p>`
        })
        break
      case "push":
        await queues.pushNotifications.add({
          userId,
          message,
          metadata,
          priority
        })
        break
      case "in_app":
        await queues.inAppNotifications.add({
          userId,
          message,
          metadata,
          priority
        })
        break
      default:
        throw new Error(`Unsupported notification channel: ${channel}`)
    }

    logger.info(`Notification sent to ${userId} via ${channel}`, {
      userId,
      channel,
      status: "success",
      metadata,
      duration: job.finishedOn ? job.finishedOn - job.processedOn : undefined
    })
    return { success: true, channel }
  } catch (error) {
    logger.error(`Notification failed for ${userId}`, {
      userId,
      channel,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      metadata,
      attempts: job.attemptsMade
    })
    handleJobRetry(job, error instanceof Error ? error : new Error(String(error)), retryAttempts)
  }
})

// Maintenance Worker
queues.maintenance.process(async (job: Job<MaintenanceJob>) => {
  const { operation, parameters, priority = DEFAULT_PRIORITY, retryAttempts = DEFAULT_RETRY_ATTEMPTS } = job.data
  
  logger.info(`Processing maintenance task: ${operation}`, { 
    parameters,
    priority,
    attempts: job.attemptsMade
  })

  try {
    switch (operation) {
      case "cleanup_old_documents":
        await queues.cleanup.add({
          type: "documents",
          retentionDays: parameters?.retentionDays || 90
        }, { priority })
        break
      case "database_backup":
        await queues.backup.add({
          type: "database",
          backupPath: parameters?.backupPath
        }, { priority })
        break
      case "archive_logs":
        await queues.archive.add({
          type: "logs",
          retentionDays: parameters?.retentionDays || 30
        }, { priority })
        break
      default:
        throw new Error(`Unknown maintenance operation: ${operation}`)
    }

    logger.info(`Maintenance task completed: ${operation}`, {
      operation,
      status: "success",
      parameters,
      duration: job.finishedOn ? job.finishedOn - job.processedOn : undefined
    })
    return { success: true, operation }
  } catch (error) {
    logger.error(`Maintenance task failed: ${operation}`, {
      operation,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      parameters,
      attempts: job.attemptsMade
    })
    handleJobRetry(job, error instanceof Error ? error : new Error(String(error)), retryAttempts)
  }
})

// Queue monitoring with enhanced logging
Object.entries(queues).forEach(([name, queue]) => {
  const typedQueue = queue as Queue
  
  typedQueue.on("stalled", (job) => {
    logger.warn(`Job ${job.id} in queue ${name} has stalled`, {
      jobId: job.id,
      queue: name,
      attempts: job.attemptsMade,
      timestamp: new Date().toISOString(),
      data: job.data
    })
  })

  typedQueue.on("error", (error) => {
    logger.error(`Queue ${name} error:`, {
      queue: name,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
  })

  typedQueue.on("completed", (job) => {
    logger.info(`Job ${job.id} in queue ${name} completed`, {
      jobId: job.id,
      queue: name,
      duration: job.finishedOn ? job.finishedOn - job.processedOn : undefined,
      timestamp: new Date().toISOString(),
      data: job.data
    })
  })

  typedQueue.on("failed", (job, error) => {
    logger.error(`Job ${job.id} in queue ${name} failed`, {
      jobId: job.id,
      queue: name,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      attempts: job.attemptsMade,
      timestamp: new Date().toISOString(),
      data: job.data
    })
  })
})

export const startWorkers = () => {
  logger.info("Queue workers started", {
    timestamp: new Date().toISOString(),
    queues: Object.keys(queues),
    environment: process.env.NODE_ENV
  })
} 