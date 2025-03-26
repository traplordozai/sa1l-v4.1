import Queue from "bull"
import { Redis } from "ioredis"

// Redis client for Bull queues
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// Define queue types
interface BaseTask {
  id: string
  createdAt: Date
}

interface DocumentAnalysisTask extends BaseTask {
  type: "document_analysis"
  documentId: string
  userId: string
}

interface NotificationTask extends BaseTask {
  type: "notification"
  userId: string
  message: string
  channel: "email" | "push" | "in_app"
}

interface MaintenanceTask extends BaseTask {
  type: "maintenance"
  operation: string
  params: Record<string, any>
}

type TaskTypes = DocumentAnalysisTask | NotificationTask | MaintenanceTask

// Create queues
export const queues = {
  documentAnalysis: new Queue<DocumentAnalysisTask>("document-analysis", {
    redis: { port: redis.options.port, host: redis.options.host },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  }),

  notifications: new Queue<NotificationTask>("notifications", {
    redis: { port: redis.options.port, host: redis.options.host },
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
    },
  }),

  maintenance: new Queue<MaintenanceTask>("maintenance", {
    redis: { port: redis.options.port, host: redis.options.host },
    defaultJobOptions: {
      attempts: 1,
      timeout: 5 * 60 * 1000, // 5 minutes
    },
  }),
}

// Queue event handlers
Object.values(queues).forEach((queue) => {
  queue.on("completed", (job) => {
    console.log(`Job ${job.id} completed`)
  })

  queue.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err)
  })

  queue.on("error", (err) => {
    console.error("Queue error:", err)
  })
})

// Helper functions to add jobs
export const queueTasks = {
  async addDocumentAnalysis(documentId: string, userId: string) {
    return queues.documentAnalysis.add({
      id: `doc-${documentId}`,
      type: "document_analysis",
      documentId,
      userId,
      createdAt: new Date(),
    })
  },

  async addNotification(userId: string, message: string, channel: "email" | "push" | "in_app") {
    return queues.notifications.add({
      id: `notif-${Date.now()}`,
      type: "notification",
      userId,
      message,
      channel,
      createdAt: new Date(),
    })
  },

  async addMaintenance(operation: string, params: Record<string, any>) {
    return queues.maintenance.add({
      id: `maint-${Date.now()}`,
      type: "maintenance",
      operation,
      params,
      createdAt: new Date(),
    })
  },
}

// Export types for use in workers
export type { DocumentAnalysisTask, MaintenanceTask, NotificationTask, TaskTypes }

