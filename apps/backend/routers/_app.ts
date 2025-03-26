import { t } from "../trpc"
import { analyticsRouter } from "./v1/analytics"
import { roleRouter } from "./v1/role"
import { userRouter } from "./v1/user"

export const appRouter = t.router({
  user: userRouter,
  role: roleRouter,
  analytics: analyticsRouter,
})

export type AppRouter = typeof appRouter

