import { logger, createContextLogger, logPerformance } from "../lib/logger"
import { alertWarning, alertInfo } from "../../../../archive13628-pm/apps/backend/services/alert-service"
import { LogAnalyticsService } from "../../../../archive13628-pm/apps/backend/services/log-analytics"

async function testLoggingSystem() {
  console.log("Starting logging system test...")

  // Test basic logging
  logger.debug("This is a debug message")
  logger.info("This is an info message")
  logger.warn("This is a warning message")
  logger.error("This is an error message")

  // Test context-aware logging
  const userLogger = createContextLogger({ userId: "user-123", sessionId: "session-456" })
  userLogger.info("User logged in")
  userLogger.error("User encountered an error", { action: "checkout" })

  // Test performance logging
  const startTime = Date.now()
  await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate work
  logPerformance("test-operation", startTime, { operationId: "op-123" })

  // Test alerts
  try {
    await alertInfo("System test completed", "test-script")
    await alertWarning("This is a test warning", "test-script", { details: "Test warning details" })

    // Only uncomment this for testing critical errors
    // await alertError('This is a test error', 'test-script', { details: 'Test error details' });
  } catch (error) {
    console.error("Error testing alerts:", error)
  }

  // Test analytics
  try {
    // Generate some test metrics
    for (let i = 0; i < 10; i++) {
      logger.info(`Test log entry ${i}`, {
        responseTime: Math.floor(Math.random() * 200) + 50,
        endpoint: `/api/test/${i % 3}`,
        status: i % 10 === 0 ? 500 : 200,
      })
    }

    // Run analytics
    console.log("Running test analytics...")
    await LogAnalyticsService.generatePerformanceReport(1) // 1 hour window
  } catch (error) {
    console.error("Error testing analytics:", error)
  }

  console.log("Logging system test completed")
}

// Run the test
testLoggingSystem()
  .then(() => {
    console.log("Test script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Test script failed:", error)
    process.exit(1)
  })

