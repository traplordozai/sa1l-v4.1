import { createHash, randomBytes } from "crypto"
import jwt from "jsonwebtoken"
import { env } from "../config/env"
import type { User } from "@/packages/types"

/**
 * Generates a secure random token
 * @param length Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString("hex")
}

/**
 * Creates a hash of a string
 * @param data Data to hash
 * @param algorithm Hash algorithm to use
 * @returns Hex-encoded hash
 */
export function hashString(data: string, algorithm = "sha256"): string {
  return createHash(algorithm).update(data).digest("hex")
}

/**
 * Generates a JWT token for a user
 * @param user User to generate token for
 * @param expiresIn Token expiration time
 * @returns JWT token
 */
export function generateJWT(user: User, expiresIn = env.JWT_EXPIRES_IN): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isImpersonating: user.isImpersonating,
    originalUser: user.originalUser,
  }

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn })
}

/**
 * Verifies a JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyJWT(token: string): User | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload

    return {
      id: decoded.sub as string,
      email: decoded.email as string,
      name: decoded.name as string,
      role: decoded.role as User["role"],
      isImpersonating: decoded.isImpersonating as boolean,
      originalUser: decoded.originalUser as User["originalUser"],
    }
  } catch (error) {
    return null
  }
}

/**
 * Sanitizes a string for safe use in HTML
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Validates that a string contains only allowed characters
 * @param input String to validate
 * @param pattern Regex pattern of allowed characters
 * @returns Boolean indicating if the string is valid
 */
export function validateStringPattern(input: string, pattern: RegExp): boolean {
  return pattern.test(input)
}

/**
 * Generates a secure random password
 * @param length Password length
 * @returns Random password
 */
export function generateSecurePassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
  let password = ""

  // Ensure at least one character from each required group
  password += charset.match(/[a-z]/)[0]
  password += charset.match(/[A-Z]/)[0]
  password += charset.match(/[0-9]/)[0]
  password += charset.match(/[^a-zA-Z0-9]/)[0]

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}