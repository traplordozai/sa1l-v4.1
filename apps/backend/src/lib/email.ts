import nodemailer, { SendMailOptions, SentMessageInfo } from "nodemailer"
import { logger } from "./logger"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
  metadata?: Record<string, unknown>
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: {
    message: string
    code: string
    details?: Record<string, unknown>
  }
}

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
  retryAttempts?: number
  retryDelay?: number
}

interface NodemailerError extends Error {
  code?: string
  command?: string
}

// Default configuration
const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  from: process.env.SMTP_FROM || "noreply@example.com",
  retryAttempts: parseInt(process.env.SMTP_RETRY_ATTEMPTS || "3", 10),
  retryDelay: parseInt(process.env.SMTP_RETRY_DELAY || "1000", 10),
}

// Create reusable transporter
const transporter = nodemailer.createTransport(defaultConfig)

// Verify transporter configuration
transporter.verify((error: Error | null) => {
  if (error) {
    logger.error("SMTP configuration error", {
      error: error.message,
      code: (error as NodemailerError).code,
      command: (error as NodemailerError).command,
    })
  } else {
    logger.info("SMTP connection established successfully")
  }
})

/**
 * Sends an email with retry logic and error handling
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, text, html, metadata } = options
  let attempts = 0

  while (attempts < (defaultConfig.retryAttempts || 3)) {
    try {
      logger.info("Attempting to send email", {
        to,
        subject,
        attempt: attempts + 1,
        metadata,
      })

      const mailOptions: SendMailOptions = {
        from: defaultConfig.from,
        to,
        subject,
        text,
        html,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          "Importance": "high",
        },
      }

      const info: SentMessageInfo = await transporter.sendMail(mailOptions)

      logger.info("Email sent successfully", {
        messageId: info.messageId,
        to,
        subject,
        metadata,
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      attempts++
      const isLastAttempt = attempts >= (defaultConfig.retryAttempts || 3)
      const nodemailerError = error as NodemailerError
      
      logger.error("Failed to send email", {
        to,
        subject,
        attempt: attempts,
        isLastAttempt,
        error: nodemailerError.message || "Unknown error",
        code: nodemailerError.code,
        command: nodemailerError.command,
        metadata,
      })

      if (isLastAttempt) {
        return {
          success: false,
          error: {
            message: nodemailerError.message || "Failed to send email",
            code: nodemailerError.code || "UNKNOWN_ERROR",
            details: {
              attempts,
              to,
              subject,
              metadata,
            },
          },
        }
      }

      // Wait before retrying
      await new Promise((resolve) => 
        setTimeout(resolve, (defaultConfig.retryDelay || 1000) * attempts)
      )
    }
  }

  return {
    success: false,
    error: {
      message: "Failed to send email after all retry attempts",
      code: "MAX_RETRIES_EXCEEDED",
      details: {
        attempts,
        to,
        subject,
        metadata,
      },
    },
  }
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitizes email content to prevent XSS
 */
export function sanitizeEmailContent(content: string): string {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
} 