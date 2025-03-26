import { isAdmin } from "../../middleware"
import { authedProcedure, router } from "../../trpc"

export const auditRouter = router({
  getAll: authedProcedure
    .use(isAdmin)
    .query(({ ctx }) => ctx.prisma.audit.findMany({ orderBy: { timestamp: "desc" } })),
})

