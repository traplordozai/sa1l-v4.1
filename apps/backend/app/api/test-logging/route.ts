import { type NextRequest, NextResponse } from "next/server"
import { logger } from "../../../lib/logger"
import { alertError, alertWarning, alertInfo } from "../../../../../../archive13628-pm/apps/backend/services/alert-service"

export async function GET(req: NextRequest) {
  const level = req.nextUrl.searchParams.get("level") || "info"
  const message = req.nextUrl.searchParams.get("message") || "Test log message"
  const sendAlert = req.nextUrl.searchParams.get("alert") === "true"

  try {
    // Log based on level
    switch (level) {
      case "error":
        logger.error(message, { source: "test-api", test: true })
        break
      case "warn":
        logger.warn(message, { source: "test-api", test: true })
        break
      case "info":
        logger.info(message, { source: "test-api", test: true })
        break
      case "debug":
        logger.debug(message, { source: "test-api", test: true })
        break
      default:
        logger.info(message, { source: "test-api", test: true })
    }

    // Send alert if requested
    if (sendAlert) {
      switch (level) {
        case "error":
          await alertError(message, "test-api", { test: true })
          break
        case "warn":
          await alertWarning(message, "test-api", { test: true })
          break
        default:
          await alertInfo(message, "test-api", { test: true })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Logged ${level} message: ${message}`,
      alert: sendAlert ? "sent" : "not sent",
    })
  } catch (error) {
    logger.error("Error in test-logging API", { error })
    return NextResponse.json({ error: "Failed to log message" }, { status: 500 })
  }
}

