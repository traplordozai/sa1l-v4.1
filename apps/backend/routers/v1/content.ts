import { z } from "zod"
import { isAdmin } from "../../middleware"
import { procedure, router } from "../../trpc"

export const contentManagementRouter = router({
  getAll: procedure.use(isAdmin).query(({ ctx }) => ctx.prisma.content.findMany()),
  create: procedure
    .use(isAdmin)
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        body: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => ctx.prisma.content.create({ data: input })),
})

