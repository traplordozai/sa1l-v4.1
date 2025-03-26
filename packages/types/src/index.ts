import type { PrismaClient } from "@prisma/client"
import type { NextRequest, NextResponse } from "next/server"

// User types
export interface User {
  id: string
  email: string
  name?: string
  role: "user" | "admin" | "faculty"
  isImpersonating?: boolean
  originalUser?: {
    id: string
    email: string
  }
}

// Session types
export interface Session {
  user: {
    id: string
    email: string
    role: "user" | "admin" | "faculty"
  }
  id: string
  lastRotated: number
}

// Context type for tRPC
export interface Context {
  req: NextRequest
  res: NextResponse
  user: User | null
  prisma: PrismaClient
  session: Session | null
  previousData: unknown
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    timestamp: string
  }
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: string
  direction: "asc" | "desc"
}

export interface FilterParams {
  field: string
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains"
  value: string | number | boolean
}

export interface QueryParams {
  pagination?: PaginationParams
  sort?: SortParams
  filters?: FilterParams[]
}

// Permission types
export type Permission =
  | "user:read"
  | "user:write"
  | "document:read"
  | "document:write"
  | "submission:read"
  | "submission:write"
  | "admin:access"
  | "faculty:access"

export interface RolePermissions {
  [role: string]: Permission[]
}

// Log types
export interface LogMetadata {
  userAgent?: string
  ip?: string
  errorStack?: string
  [key: string]: unknown
}

// Document analysis types
export interface DocumentAnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment: "positive" | "neutral" | "negative"
  topics: string[]
  entities: Array<{ name: string; type: string }>
}

// Error context types
export interface ErrorContext {
  extra?: Record<string, unknown>
  tags?: Record<string, string>
  user?: {
    id?: string
    email?: string
    username?: string
  }
  level?: "fatal" | "error" | "warning" | "info" | "debug"
}

// Message types
export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

