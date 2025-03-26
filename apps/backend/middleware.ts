import { type NextRequest, NextResponse } from "next/server"
import { requestLogger } from "./lib/logger"

export async function middleware(req: NextRequest) {
  // Log the request
  requestLogger(req)

  // Continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on API routes
export const config = {
  matcher: "/api/:path*",
}

