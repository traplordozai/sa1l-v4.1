import { createNextApiHandler } from "@trpc/server/adapters/next"
import { createContext } from "../../../../backend/trpc"
import { appRouter } from "../../../../backend/server"

// This file is a Next.js API route handler for tRPC
export default createNextApiHandler({
  router: appRouter,
  createContext,
})

