import { z } from "zod"

// Define environment variable schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Server
  PORT: z.string().transform(Number).default("3000"),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default("60"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).default("587"),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Alerts
  ALERT_EMAIL_RECIPIENTS: z.string().optional(),
  ERROR_ALERT_RECIPIENTS: z.string().optional(),
  WARNING_ALERT_RECIPIENTS: z.string().optional(),
  INFO_ALERT_RECIPIENTS: z.string().optional(),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // App info
  NEXT_PUBLIC_ENVIRONMENT: z.string().default("development"),
  NEXT_PUBLIC_VERSION: z.string().default("0.1.0"),
})

// Parse environment variables
export const env = envSchema.parse(process.env)

// Export types
export type Env = z.infer<typeof envSchema>
