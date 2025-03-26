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

declare module "../../lib/email" {
  export function sendEmail(options: EmailOptions): Promise<EmailResult>
} 