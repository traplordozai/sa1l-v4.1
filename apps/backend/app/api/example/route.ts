import { type NextRequest, NextResponse } from "next/server"
import { logger, requestLogger } from "../../../lib/logger"
import { handleApiError, createError } from "../../../lib/error-handler"

export async function GET(req: NextRequest) {
  try {
    // Log the request
    requestLogger(req)

    // Check if we should simulate an error
    const shouldFail = req.nextUrl.searchParams.get("fail") === "true"
    if (shouldFail) {
      throw createError.internal("This is a simulated error for testing")
    }

    // Log success
    logger.info("Example API called successfully", {
      path: req.nextUrl.pathname,
      query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    })

    // Return success response
    return NextResponse.json({
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      success: true,
    })
  } catch (error) {
    // Handle and log the error
    return handleApiError(error, req)
  }
}

