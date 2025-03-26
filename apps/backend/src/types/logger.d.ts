interface Logger {
  info(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  debug(message: string, meta?: Record<string, unknown>): void
  trace(message: string, meta?: Record<string, unknown>): void
}

declare module "../../lib/logger" {
  export const logger: Logger
} 