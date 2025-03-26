import { CronJob } from "cron"
import { cleanupOldLogs, logger } from "../lib/logger"

// Run at 3:00 AM every day
const logCleanupJob = new CronJob("0 3 * * *", async () => {
  try {
    logger.info("Starting log cleanup job")

    // Clean up logs older than 30 days
    const deletedCount = await cleanupOldLogs(30)

    logger.info("Log cleanup job completed", { deletedCount })
  } catch (error) {
    logger.error("Error in log cleanup job", { error })
  }
})

export function startLogCleanupJob() {
  logCleanupJob.start()
  logger.info("Log cleanup job scheduled")
}

