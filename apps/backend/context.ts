import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import { verifyJWT } from "./utils/security"
import { prisma } from "../../../archive13628-pm/apps/backend/db/prisma"
import type { Context } from "@/packages/types"

/**
 * Creates the tRPC context for each request
 * @param opts Context options from Next.js
 * @returns Context object for tRPC
 */
export async function createContext({ req, res }: CreateNextContextOptions): Promise<Context> {
  let user = null

  // Get token from the Authorization header
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(" ")[1]
    user = verifyJWT(token)
  }

  return {
    req,
    res,
    user,
    prisma,
    session: user
      ? {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          id: user.id,
          lastRotated: Date.now(),
        }
      : null,
    previousData: undefined,
  }
}

/**
 * Helper to create a context with a specific user for testing
 * @param user User to include in the context
 * @returns Context object with the specified user
 */
export function createContextWithUser(user: Context["user"]): Context {
  return {
    req: {} as any,
    res: {} as any,
    user,
    prisma,
    session: user
      ? {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          id: user.id,
          lastRotated: Date.now(),
        }
      : null,
    previousData: undefined,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

