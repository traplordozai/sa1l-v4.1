import * as Sentry from "@sentry/node"
import Transport from "winston-transport"

interface LogInfo {
  level: string
  message: string
  stack?: string
  userId?: string
  user?: {
    id?: string
    email?: string
    name?: string
  }
  [key: string]: unknown
}

// Initialize Sentry if DSN is available
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
    release: process.env.NEXT_PUBLIC_VERSION || "0.1.0",
  })
}

/**
 * Winston transport for Sentry
 * Sends log messages to Sentry based on log level
 */
export class SentryTransport extends Transport {
  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts)
    this.level = opts?.level || "warn"
  }

  log(info: LogInfo, callback: () => void) {
    const { level, message, ...meta } = info

    // Map Winston log levels to Sentry severity levels
    const severityMap: Record<string, Sentry.SeverityLevel> = {
      error: "error",
      warn: "warning",
      info: "info",
      http: "info",
      debug: "debug",
    }

    const severity = severityMap[level] || "info"

    // Create Sentry context
    const sentryContext: Record<string, unknown> = {}

    // Add user context if available
    if (meta.userId || meta.user) {
      sentryContext.user = {
        id: meta.userId || meta.user?.id,
        email: meta.user?.email,
        username: meta.user?.name,
      }
    }

    // Add extra context
    if (Object.keys(meta).length > 0) {
      sentryContext.extra = meta
    }

    // Set context and capture event
    Sentry.withScope((scope) => {
      if (sentryContext.user) {
        scope.setUser(sentryContext.user as Sentry.User)
      }

      if (sentryContext.extra) {
        Object.entries(sentryContext.extra).forEach(([key, value]) => {
          scope.setExtra(key, value)
        })
      }

      // Capture exception if it's an error
      if (meta.stack || meta instanceof Error) {
        Sentry.captureException(meta.stack ? new Error(message) : meta)
      } else {
        // Otherwise capture as a message
        Sentry.captureMessage(message, { level: severity })
      }
    })

    callback()
  }
} 