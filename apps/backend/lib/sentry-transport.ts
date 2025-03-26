import * as Sentry from "@sentry/node"
import Transport from "winston-transport"

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

  log(info: any, callback: () => void) {
    const { level, message, ...meta } = info

    // Map Winston log levels to Sentry severity levels
    const severityMap: Record<string, Sentry.Severity> = {
      error: Sentry.Severity.Error,
      warn: Sentry.Severity.Warning,
      info: Sentry.Severity.Info,
      http: Sentry.Severity.Info,
      debug: Sentry.Severity.Debug,
    }

    const severity = severityMap[level] || Sentry.Severity.Info

    // Create Sentry context
    const sentryContext: Record<string, any> = {}

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
    Sentry.configureScope((scope) => {
      if (sentryContext.user) {
        scope.setUser(sentryContext.user)
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
        Sentry.captureMessage(message, severity)
      }
    })

    callback()
  }
}

