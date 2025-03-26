import { isAdmin } from "../../middleware"
import { authedProcedure, router } from "../../trpc"

export const logRouter = router({
  getAll: authedProcedure.use(isAdmin).query(({ ctx }) => {
    return ctx.prisma.log.findMany({ orderBy: { createdAt: "desc" } })
  }),
})

