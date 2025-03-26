import { z } from "zod"
import { isAdmin } from "../../middleware"
import { procedure, router } from "../../trpc"
import { analyticsOutput } from "@/packages/types"

export const analyticsRouter = router({
  visitsByPath: procedure
    .use(isAdmin)
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .output(
      z.object({
        data: analyticsOutput.visitsByPath,
        meta: z.object({
          total: z.number(),
          limit: z.number(),
          offset: z.number(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { limit = 10, offset = 0 } = input || {}

        const visits = await ctx.prisma.visit.groupBy({
          by: ["path"],
          _count: true,
          orderBy: {
            _count: "desc",
          },
          take: limit,
          skip: offset,
        })

        const total = await ctx.prisma.visit.groupBy({
          by: ["path"],
          _count: {
            _all: true,
          },
        })

        return {
          data: visits,
          meta: {
            total: total.length,
            limit,
            offset,
          },
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        throw new Error("Failed to fetch analytics data")
      }
    }),
})

