import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"
import { logger } from "./logger"

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  logger.error("JWT_SECRET environment variable is not set")
  throw new Error("JWT_SECRET environment variable is not set")
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">, expiresIn = "24h"): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn })
  } catch (error) {
    logger.error("Error generating JWT token:", error)
    throw new Error(`Failed to generate token: ${error.message}`)
  }
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    logger.error("Error verifying JWT token:", error)
    throw new Error(`Invalid token: ${error.message}`)
  }
}

// Middleware to protect API routes
export function withAuth(handler: (req: NextRequest, payload: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get("Authorization")

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized: Missing or invalid Authorization header" }, { status: 401 })
      }

      const token = authHeader.split(" ")[1]
      const payload = verifyToken(token)

      // Call the handler with the authenticated request and payload
      return await handler(req, payload)
    } catch (error) {
      logger.error("Authentication error:", error)

      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 })
    }
  }
}

// Example protected API route
export const createProtectedRoute = (handler: (req: NextRequest, payload: JWTPayload) => Promise<NextResponse>) => {
  return withAuth(handler)
}

