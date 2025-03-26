import { TRPCError } from "@trpc/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { prisma } from "../../../../../archive13628-pm/apps/backend/db/prisma"
import { t } from "../../trpc"
import { userInput, userOutput } from "@/packages/types"

export const userRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    // Check if user is authenticated
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      })
    }

    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })
  }),

  create: t.procedure
    .input(userInput.create)
    .output(userOutput.create)
    .mutation(async ({ input }) => {
      return prisma.user.create({
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      })
    }),

  update: t.procedure
    .input(userInput.update)
    .output(userOutput.update)
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      })
    }),

  delete: t.procedure
    .input(userInput.delete)
    .output(userOutput.delete)
    .mutation(async ({ input: id }) => {
      return prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      })
    }),

  resetPassword: t.procedure
    .input(userInput.resetPassword)
    .output(userOutput.resetPassword)
    .mutation(async ({ input: id }) => {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Generate a random reset token
      const resetToken = crypto.randomBytes(32).toString("hex")

      // Set expiration to 24 hours from now
      const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

      // Update user with reset token and expiration
      await prisma.user.update({
        where: { id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      })

      // In a real application, you would send an email with the reset link
      return {
        success: true,
      }
    }),

  impersonate: t.procedure
    .input(userInput.impersonate)
    .output(userOutput.impersonate)
    .mutation(async ({ input: id, ctx }) => {
      // Verify the current user has admin privileges
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can impersonate users",
        })
      }

      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      })

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      if (targetUser.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot impersonate inactive users",
        })
      }

      // Generate impersonation token with both user identities
      const tokenPayload = {
        sub: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        name: targetUser.name,
        originalUser: {
          id: ctx.user.id,
          email: ctx.user.email,
        },
        isImpersonating: true,
      }

      // Token expires in 1 hour
      const expiresIn = "1h"
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      // Create JWT token
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "fallback-secret-for-development-only", {
        expiresIn,
      })

      // Log the impersonation action
      await prisma.auditLog.create({
        data: {
          action: "IMPERSONATION",
          userId: ctx.user.id,
          targetId: targetUser.id,
          details: `Admin ${ctx.user.email} impersonated user ${targetUser.email}`,
        },
      })

      return {
        token,
        expiresAt,
        impersonatedUser: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
        },
      }
    }),
})

