import { router } from "../trpc"
import { contentManagementRouter } from "./v1/content"

export const appRouter = router({
  contentManagement: contentManagementRouter,
  // other routers...
})

