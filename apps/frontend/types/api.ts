import type { AppRouter, User, Role, RouterInputs, RouterOutputs } from "@/packages/types"
import { initTRPC } from "@trpc/server"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import { z } from "zod"

// Re-export types from the shared package
export type { User, Role, RouterInputs, RouterOutputs }

// Session interface for frontend use
export interface Session {
  user: {
    id: string
    email: string
    role: string
  }
  id: string
  lastRotated: number
}

// Context interface for frontend use
export interface Context {
  prisma: any
  session: Session
  req: CreateNextContextOptions["req"]
  res: CreateNextContextOptions["res"]
  previousData: unknown
}

// Create a dummy router for type inference in the frontend
const t = initTRPC.context<Context>().create()

// User schema for frontend validation
export const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  role: z.enum(["user", "admin", "faculty"]),
  status: z.enum(["active", "suspended"]),
})

// Create a simplified router for frontend type inference
export const appRouter = t.router({
  user: t.router({
    getAll: t.procedure.query(() => Promise.resolve([] as User[])),
    create: t.procedure.input(userSchema.omit({ id: true })).mutation(() => Promise.resolve({} as User)),
    update: t.procedure
      .input(userSchema.partial().extend({ id: z.string() }))
      .mutation(() => Promise.resolve({} as User)),
    delete: t.procedure.input(z.object({ id: z.string() })).mutation(() => Promise.resolve({} as User)),
    resetPassword: t.procedure.input(z.object({ id: z.string() })).mutation(() => Promise.resolve({ success: true })),
    impersonate: t.procedure.input(z.object({ id: z.string() })).mutation(() =>
      Promise.resolve({
        token: "",
        expiresAt: new Date(),
        impersonatedUser: {
          id: "",
          email: "",
          name: "",
          role: "user",
        },
      }),
    ),
  }),
  role: t.router({
    getAll: t.procedure.query(() => Promise.resolve([] as Role[])),
    create: t.procedure
      .input(z.object({ name: z.string(), permissions: z.array(z.string()) }))
      .mutation(() => Promise.resolve({} as Role)),
    update: t.procedure
      .input(
        z.object({
          id: z.string(),
          name: z.string(),
          permissions: z.array(z.string()),
        }),
      )
      .mutation(() => Promise.resolve({} as Role)),
    delete: t.procedure.input(z.string()).mutation(() => Promise.resolve({} as Role)),
  }),
  analytics: t.router({
    visitsByPath: t.procedure.query(() => Promise.resolve([] as { path: string; _count: number }[])),
  }),
})

// Re-export the router type
export type { AppRouter }

