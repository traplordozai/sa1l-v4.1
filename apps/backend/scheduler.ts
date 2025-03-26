import { queues } from "./queue"

// Schedule periodic tasks
export function initializeScheduler() {
  // Document cleanup - Run daily at 2 AM
  queues.maintenance.add(
    {
      id: "daily-cleanup",
      type: "maintenance",
      operation: "cleanup_expired_documents",
      params: {},
      createdAt: new Date(),
    },
    {
      repeat: {
        cron: "0 2 * * *", // Every day at 2 AM
      },
    },
  )

  // User stats update - Run every 6 hours
  queues.maintenance.add(
    {
      id: "user-stats-update",
      type: "maintenance",
      operation: "update_user_stats",
      params: {},
      createdAt: new Date(),
    },
    {
      repeat: {
        cron: "0 */6 * * *", // Every 6 hours
      },
    },
  )

  // Database health check - Run every 15 minutes
  queues.maintenance.add(
    {
      id: "db-health-check",
      type: "maintenance",
      operation: "database_health_check",
      params: {},
      createdAt: new Date(),
    },
    {
      repeat: {
        cron: "*/15 * * * *", // Every 15 minutes
      },
    },
  )

  // Cache cleanup - Run every hour
  queues.maintenance.add(
    {
      id: "cache-cleanup",
      type: "maintenance",
      operation: "cache_cleanup",
      params: {},
      createdAt: new Date(),
    },
    {
      repeat: {
        cron: "0 * * * *", // Every hour
      },
    },
  )

  // Set up error handlers for repeatable jobs
  queues.maintenance.on("failed", (job, err) => {
    console.error(`Scheduled job ${job.id} failed:`, err)
    // Implement notification system for critical failures
  })
}

// Start the scheduler
export function startScheduler() {
  try {
    initializeScheduler()
    console.log("Task scheduler initialized successfully")
  } catch (error) {
    console.error("Failed to initialize task scheduler:", error)
    process.exit(1)
  }
}

