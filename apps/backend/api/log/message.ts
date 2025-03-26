import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import { verifyAuth } from "@/utils/auth"

/**
 * API route handler for logging client-side messages
 * @param req The incoming request
 * @returns NextResponse with the result
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication (optional, depends on whether you want to require auth for message logging)
    const authResult = await verifyAuth(req)
    const userId = authResult.user?.id

    // Parse the request body
    const body = await req.json()
    const { message, level, context, timestamp } = body

    // Validate required fields
    if (!message) {
      return NextResponse.json({ error: "Missing required field: message" }, { status: 400 })
    }

    // Log the message to the database
    await prisma.messageLog.create({
      data: {
        message,
        level: level || "info",
        context: context ? JSON.stringify(context) : null,
        userId: userId || null,
        userAgent: req.headers.get("user-agent") || null,
        ipAddress: req.headers.get("x-forwarded-for") || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging client message:", error)

    // Even if there's an error in our message logging, return success to the client
    // to avoid creating an error loop
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

