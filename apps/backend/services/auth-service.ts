import type { PrismaClient, User } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { logger } from "../lib/logger"
import { z } from "zod"

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

export interface AuthResult {
  user: Omit<User, "password">
  token: string
}

export class AuthService {
  private prisma: PrismaClient
  private jwtSecret: string
  private tokenExpiry: string

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.jwtSecret = process.env.JWT_SECRET || "default-secret-change-in-production"
    this.tokenExpiry = "7d" // 7 days
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      loginSchema.parse({ email, password })

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Check password
      const passwordValid = await compare(password, user.password)
      if (!passwordValid) {
        throw new Error("Invalid email or password")
      }

      // Generate token
      const token = this.generateToken(user.id)

      // Log successful login
      logger.info("User logged in successfully", { userId: user.id, email: user.email })

      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        token,
      }
    } catch (error) {
      const err = error as Error
      logger.error("Login error", { error: err })
      throw new Error(`Authentication failed: ${err.message}`)
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Validate input
      registerSchema.parse({ email, password, name })

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const hashedPassword = await hash(password, 12)

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "user", // Default role
        },
      })

      // Generate token
      const token = this.generateToken(user.id)

      // Log successful registration
      logger.info("User registered successfully", { userId: user.id, email: user.email })

      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        token,
      }
    } catch (error) {
      const err = error as Error
      logger.error("Registration error", { error: err })
      throw new Error(`Registration failed: ${err.message}`)
    }
  }

  async validateToken(token: string): Promise<Omit<User, "password">> {
    try {
      // Verify token
      const decoded = verify(token, this.jwtSecret) as { userId: string }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      const err = error as Error
      logger.error("Token validation error", { error: err })
      throw new Error(`Invalid token: ${err.message}`)
    }
  }

  private generateToken(userId: string): string {
    return sign({ userId }, this.jwtSecret, { expiresIn: this.tokenExpiry })
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Verify current password
      const passwordValid = await compare(currentPassword, user.password)
      if (!passwordValid) {
        throw new Error("Current password is incorrect")
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 12)

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      logger.info("Password changed successfully", { userId })
      return true
    } catch (error) {
      const err = error as Error
      logger.error("Password change error", { error: err, userId })
      throw new Error(`Failed to change password: ${err.message}`)
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Return true even if user doesn't exist for security reasons
        return true
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = sign({ userId: user.id }, this.jwtSecret, { expiresIn: "1h" })

      // Store reset token in database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken },
      })

      // In a real application, send email with reset link
      logger.info("Password reset requested", { userId: user.id, email })
      return true
    } catch (error) {
      const err = error as Error
      logger.error("Password reset request error", { error: err, email })
      throw new Error(`Failed to request password reset: ${err.message}`)
    }
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    try {
      // Verify reset token
      const decoded = verify(resetToken, this.jwtSecret) as { userId: string }

      // Find user with matching reset token
      const user = await this.prisma.user.findFirst({
        where: {
          id: decoded.userId,
          resetToken,
        },
      })

      if (!user) {
        throw new Error("Invalid or expired reset token")
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 12)

      // Update password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
        },
      })

      logger.info("Password reset successfully", { userId: user.id })
      return true
    } catch (error) {
      const err = error as Error
      logger.error("Password reset error", { error: err })
      throw new Error(`Failed to reset password: ${err.message}`)
    }
  }
}