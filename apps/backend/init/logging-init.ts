import { logger } from "../lib/logger"
import { scheduleLogRotation } from "../cron/log-rotation"
import { scheduleLogAnalytics } from "../../../../archive13628-pm/apps/backend/services/log-analytics"

export function initializeLoggingSystem() {
  logger.info("Initializing logging system", {
    environment: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
  })

  // Schedule log rotation
  scheduleLogRotation()

  // Schedule log analytics
  scheduleLogAnalytics()

  logger.info("Logging system initialized successfully")

  return {
    logger,
    createContextLogger: (context: Record<string, any>) => {
      return {
        error: (message: string, meta: Record<string, any> = {}, critical = false) =>
          logger.error(message, { ...meta, ...context, critical }),
        warn: (message: string, meta: Record<string, any> = {}) => logger.warn(message, { ...meta, ...context }),
        info: (message: string, meta: Record<string, any> = {}) => logger.info(message, { ...meta, ...context }),
        http: (message: string, meta: Record<string, any> = {}) => logger.http(message, { ...meta, ...context }),
        debug: (message: string, meta: Record<string, any> = {}) => logger.debug(message, { ...meta, ...context }),
      }
    },
  }
}

