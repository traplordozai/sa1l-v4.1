import { verifyAuth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * API route handler for logging client-side errors
 * @param req The incoming request
 * @returns NextResponse with the result
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication (optional, depends on whether you want to require auth for error logging)
    const authResult = await verifyAuth(req);
    const userId = authResult.user?.id;

    // Parse the request body
    const body = await req.json();
    const { message, stack, context, timestamp } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: "Missing required field: message" },
        { status: 400 }
      );
    }

    // Create context for logging
    const logContext = {
      userId: userId || "anonymous",
      userAgent: req.headers.get("user-agent") || "unknown",
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      ...context,
    };

    // Log the error using our logger
    logger.error(message, { stack, ...logContext });

    // Log the error to the database
    await prisma.errorLog.create({
      data: {
        message,
        stack: stack || null,
        context: context ? JSON.stringify(context) : null,
        userId: userId || null,
        userAgent: req.headers.get("user-agent") || null,
        ipAddress: req.headers.get("x-forwarded-for") || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        severity: context?.level || "error",
      },
    });

    // In a production environment, you might want to forward this to a service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   // Forward to Sentry or other error monitoring service
    // }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging client error:", error);

    // Even if there's an error in our error logging, return success to the client
    // to avoid creating an error loop
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
