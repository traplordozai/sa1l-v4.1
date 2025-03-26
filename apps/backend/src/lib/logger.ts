import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import type { NextRequest } from "next/server"
import path from "path"
import fs from "fs"
import nodemailer from "nodemailer"
import { SentryTransport } from "./sentry-transport"
import Transport from "winston-transport"

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

interface EmailTransportOptions extends Transport.TransportStreamOptions {
  recipients?: string[]
  from?: string
  subject?: string
}

interface LogInfo {
  level: string
  message: string
  timestamp: string
  stack?: string
  metadata?: Record<string, unknown>
  critical?: boolean
}

// Email transport configuration for critical logs
const emailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Custom email transport for Winston
class EmailTransport extends Transport {
  recipients: string[]
  from: string
  subject: string
  level: string

  constructor(opts: EmailTransportOptions) {
    super(opts)
    this.level = opts.level || "error"
    this.recipients = opts.recipients || process.env.ALERT_EMAIL_RECIPIENTS?.split(",") || []
    this.from = opts.from || process.env.SMTP_FROM || "alerts@yourdomain.com"
    this.subject = opts.subject || "Critical Error Alert"
  }

  async log(info: LogInfo, callback: () => void) {
    if (info.level !== "error") {
      return callback()
    }

    try {
      // Only send emails for critical errors
      if (info.critical === true || info.level === "error") {
        const mailOptions = {
          from: this.from,
          to: this.recipients,
          subject: `${this.subject}: ${info.message.substring(0, 50)}...`,
          text: `
Error Level: ${info.level}
Timestamp: ${info.timestamp}
Message: ${info.message}
Stack Trace: ${info.stack || "No stack trace available"}
Additional Info: ${JSON.stringify(info.metadata || {}, null, 2)}
          `,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #d32f2f;">Critical Error Alert</h2>
  <p><strong>Error Level:</strong> ${info.level}</p>
  <p><strong>Timestamp:</strong> ${info.timestamp}</p>
  <p><strong>Message:</strong> ${info.message}</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
    <pre style="margin: 0;"><code>${info.stack || "No stack trace available"}</code></pre>
  </div>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
    <pre style="margin: 0;"><code>${JSON.stringify(info.metadata || {}, null, 2)}</code></pre>
  </div>
</div>
          `,
        }

        await emailTransport.sendMail(mailOptions)
      }
    } catch (error) {
      console.error("Failed to send error email:", error)
    }

    callback()
  }
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Determine the appropriate log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development"
  const isDevelopment = env === "development"
  return isDevelopment ? "debug" : process.env.LOG_LEVEL || "info"
}

// Custom format for structured logging
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
)

// Console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${info.stack ? "\n" + info.stack : ""}${
        info.metadata && Object.keys(info.metadata).length ? "\n" + JSON.stringify(info.metadata, null, 2) : ""
      }`,
  ),
)

// Create rotating file transports
const errorRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
  format,
})

const combinedRotateTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
  format,
})

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  defaultMeta: { service: "archive-app" },
  transports: [
    // Write logs to console in all environments
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
})

// Add Sentry transport in all environments if DSN is available
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  logger.add(
    new SentryTransport({
      level: "warn", // Capture warnings and errors
    }),
  )
}

// Add rotating file transports in production
if (process.env.NODE_ENV === "production") {
  logger.add(errorRotateTransport)
  logger.add(combinedRotateTransport)

  // Add email transport for critical errors
  logger.add(
    new EmailTransport({
      level: "error",
      recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(","),
      from: process.env.SMTP_FROM,
      subject: "Archive13628PM - Critical Error Alert",
    }),
  )

  // Setup event handlers for rotate events
  errorRotateTransport.on("rotate", (oldFilename: string, newFilename: string) => {
    logger.info("Error log rotated", { oldFilename, newFilename })
  })

  combinedRotateTransport.on("rotate", (oldFilename: string, newFilename: string) => {
    logger.info("Combined log rotated", { oldFilename, newFilename })
  })
}

// Add request logger middleware for API routes
export const requestLogger = (req: NextRequest) => {
  const { method, url, headers } = req
  const userAgent = headers.get("user-agent") || "unknown"
  const ip = headers.get("x-forwarded-for") || "unknown"

  logger.http(`${method} ${url}`, {
    ip,
    userAgent,
    referer: headers.get("referer") || "unknown",
  })
}

// Create a context-aware logger
export const createContextLogger = (context: Record<string, unknown>) => {
  return {
    error: (message: string, meta: Record<string, unknown> = {}, critical = false) =>
      logger.error(message, { ...meta, ...context, critical }),
    warn: (message: string, meta: Record<string, unknown> = {}) => logger.warn(message, { ...meta, ...context }),
    info: (message: string, meta: Record<string, unknown> = {}) => logger.info(message, { ...meta, ...context }),
    http: (message: string, meta: Record<string, unknown> = {}) => logger.http(message, { ...meta, ...context }),
    debug: (message: string, meta: Record<string, unknown> = {}) => logger.debug(message, { ...meta, ...context }),
  }
}

// Add a log cleanup utility
export const cleanupOldLogs = async (maxAgeDays = 30) => {
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
  const now = Date.now()

  try {
    const files = fs.readdirSync(logsDir)
    let deletedCount = 0

    for (const file of files) {
      const filePath = path.join(logsDir, file)
      const stats = fs.statSync(filePath)

      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath)
        deletedCount++
      }
    }

    logger.info(`Cleaned up old log files`, { deletedCount })
    return deletedCount
  } catch (error) {
    const err = error as Error
    logger.error("Error cleaning up old logs", { error: err })
    throw error
  }
}

// Add a function to log performance metrics
export const logPerformance = (operation: string, startTime: number, metadata: Record<string, unknown> = {}) => {
  const duration = Date.now() - startTime
  logger.info(`Performance: ${operation} completed in ${duration}ms`, {
    ...metadata,
    performance: {
      operation,
      duration,
      timestamp: new Date().toISOString(),
    },
  })
}

export { logger } 