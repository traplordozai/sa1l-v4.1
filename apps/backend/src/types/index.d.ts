import type { Queue } from "bull"

declare module "../index" {
  interface QueueMap {
    documentAnalysis: Queue<{
      documentId: string
      userId: string
      priority?: number
      retryAttempts?: number
    }>
    notifications: Queue<{
      userId: string
      channel: "email" | "push" | "in_app"
      message: string
      metadata?: Record<string, unknown>
      priority?: number
      retryAttempts?: number
    }>
    pushNotifications: Queue<{
      userId: string
      message: string
      metadata?: Record<string, unknown>
      priority?: number
    }>
    inAppNotifications: Queue<{
      userId: string
      message: string
      metadata?: Record<string, unknown>
      priority?: number
    }>
    cleanup: Queue<{
      type: "documents"
      retentionDays?: number
    }>
    backup: Queue<{
      type: "database"
      backupPath?: string
    }>
    archive: Queue<{
      type: "logs"
      retentionDays?: number
    }>
  }

  export const queues: QueueMap
} 