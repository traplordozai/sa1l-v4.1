import { isAdmin } from "../../middleware"
import { authedProcedure, router } from "../../trpc"
import { roleInput, roleOutput } from "@/packages/types"

export const roleRouter = router({
  getAll: authedProcedure
    .use(isAdmin)
    .output(roleOutput.getAll)
    .query(({ ctx }) => ctx.prisma.role.findMany()),

  create: authedProcedure
    .use(isAdmin)
    .input(roleInput.create)
    .output(roleOutput.create)
    .mutation(({ ctx, input }) => ctx.prisma.role.create({ data: input })),

  update: authedProcedure
    .use(isAdmin)
    .input(roleInput.update)
    .output(roleOutput.update)
    .mutation(({ ctx, input }) =>
      ctx.prisma.role.update({
        where: { id: input.id },
        data: {
          name: input.name,
          permissions: input.permissions,
        },
      }),
    ),

  delete: authedProcedure
    .use(isAdmin)
    .input(roleInput.delete)
    .output(roleOutput.delete)
    .mutation(({ ctx, input }) => ctx.prisma.role.delete({ where: { id: input } })),
})

