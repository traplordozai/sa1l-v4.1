import { userSchema } from "../schemas/userSchema"
import { publicProcedure, createTRPCRouter } from "../trpc"

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({ data: input })
    }),
})