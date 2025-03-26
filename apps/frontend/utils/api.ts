import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "../../backend/routers/_app"

export type RouterOutputs = inferRouterOutputs<AppRouter>

