/**
 * Error reporting utility functions
 * This module provides functions for capturing and reporting errors to monitoring services
 */

import { logger } from "./logger"

interface ErrorContext {
  extra?: Record<string, unknown>
  tags?: Record<string, string>
  user?: {
    id?: string
    email?: string
    username?: string
  }
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
}

/**
 * Captures an error and sends it to the error monitoring service
 * @param error The error to capture
 * @param context Additional context information about the error
 */
export function captureError(error: Error, context?: ErrorContext): void {
  logger.error(error.message, {
    ...context,
    extra: {
      ...context?.extra,
      stack: error.stack,
      name: error.name,
    }
  })
}

/**
 * Captures a message and sends it to the error monitoring service
 * @param message The message to capture
 * @param context Additional context information about the message
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  const level = context?.level || 'info'
  switch (level) {
    case 'fatal':
    case 'error':
      logger.error(message, context)
      break
    case 'warning':
      logger.warn(message, context)
      break
    case 'info':
      logger.info(message, context)
      break
    case 'debug':
      logger.debug(message, context)
      break
    default:
      logger.info(message, context)
  }
}

/**
 * Sets user context for error reporting
 * @param user User information to associate with error reports
 */
export function setUserContext(user: ErrorContext['user']): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.info('Setting user context for error reporting', { extra: { user } })
  }
}

/**
 * Clears user context from error reporting
 */
export function clearUserContext(): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.info('Clearing user context from error reporting')
  }
}

