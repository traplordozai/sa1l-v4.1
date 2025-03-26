import * as Sentry from "@sentry/browser"

interface LogContext {
  extra?: Record<string, unknown>
  tags?: Record<string, string>
  user?: {
    id?: string
    email?: string
    username?: string
  }
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
}

// Initialize Sentry if DSN is available
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
    release: process.env.NEXT_PUBLIC_VERSION || "0.1.0",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

class FrontendLogger {
  private static instance: FrontendLogger
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  static getInstance(): FrontendLogger {
    if (!FrontendLogger.instance) {
      FrontendLogger.instance = new FrontendLogger()
    }
    return FrontendLogger.instance
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    let formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (context?.extra) {
      formattedMessage += `\nContext: ${JSON.stringify(context.extra, null, 2)}`
    }
    
    return formattedMessage
  }

  private logToServer(level: string, message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'production' && level !== 'debug') {
      fetch('/api/log/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          level,
          context,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(console.error)
    }
  }

  private logToSentry(level: string, message: string, context?: LogContext) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (context?.user) {
          scope.setUser(context.user)
        }
        if (context?.tags) {
          scope.setTags(context.tags)
        }
        if (context?.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value)
          })
        }

        if (level === 'error' || level === 'fatal') {
          Sentry.captureException(new Error(message))
        } else {
          Sentry.captureMessage(message, { level })
        }
      })
    }
  }

  error(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('error', message, context)
    if (this.isDevelopment) {
      console.error(formattedMessage)
    }
    this.logToServer('error', message, context)
    this.logToSentry('error', message, context)
  }

  warn(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('warn', message, context)
    if (this.isDevelopment) {
      console.warn(formattedMessage)
    }
    this.logToServer('warn', message, context)
    this.logToSentry('warning', message, context)
  }

  info(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('info', message, context)
    if (this.isDevelopment) {
      console.info(formattedMessage)
    }
    this.logToServer('info', message, context)
    this.logToSentry('info', message, context)
  }

  debug(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage('debug', message, context)
    if (this.isDevelopment) {
      console.debug(formattedMessage)
    }
    this.logToServer('debug', message, context)
    this.logToSentry('debug', message, context)
  }

  // Performance logging
  performance(operation: string, startTime: number, metadata: Record<string, unknown> = {}): void {
    const duration = Date.now() - startTime
    const message = `Performance: ${operation} completed in ${duration}ms`
    this.debug(message, { extra: { ...metadata, performance: { operation, duration } } })
  }
}

export const logger = FrontendLogger.getInstance() 