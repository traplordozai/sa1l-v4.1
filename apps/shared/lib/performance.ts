import * as Sentry from "@sentry/nextjs"

/**
 * Measures the performance of an async function
 * @param name The name of the operation
 * @param fn The async function to measure
 * @param metadata Additional metadata to include in the transaction
 * @returns The result of the async function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> {
  const startTime = performance.now()

  try {
    // Start a Sentry transaction if available
    const transaction = process.env.NEXT_PUBLIC_SENTRY_DSN ? Sentry.startTransaction({ name }) : null

    if (transaction && metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        transaction.setData(key, value)
      })
    }

    // Execute the function
    const result = await fn()

    // Finish the transaction
    if (transaction) {
      transaction.finish()
    }

    // Calculate duration
    const duration = performance.now() - startTime

    // Log performance data
    console.info(`Performance: ${name} completed in ${duration.toFixed(2)}ms`)

    return result
  } catch (error) {
    // Calculate duration even if there's an error
    const duration = performance.now() - startTime

    // Log error with performance data
    console.error(`Performance Error: ${name} failed after ${duration.toFixed(2)}ms`, error)

    // Re-throw the error
    throw error
  }
}

/**
 * Starts a Sentry transaction for performance monitoring
 * @param name The name of the transaction
 * @param metadata Additional metadata to include in the transaction
 * @returns A function to finish the transaction and an object with the transaction
 */
export function startTransaction(name: string, metadata?: Record<string, any>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Return a no-op if Sentry is not configured
    return {
      finish: () => {},
      transaction: null,
    }
  }

  const transaction = Sentry.startTransaction({ name })

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      transaction.setData(key, value)
    })
  }

  return {
    finish: () => transaction.finish(),
    transaction,
  }
}

/**
 * Method decorator for measuring performance
 * @param name Optional name for the transaction (defaults to method name)
 * @returns Method decorator
 */
export function measure(name?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const methodName = name || propertyKey
      return measurePerformance(methodName, () => originalMethod.apply(this, args), { class: target.constructor.name })
    }

    return descriptor
  }
}

