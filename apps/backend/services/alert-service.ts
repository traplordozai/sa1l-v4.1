import { logger } from "../lib/logger"
import { captureMessage } from "../../../../archive13628-pm/apps/shared/lib/sentry"
import nodemailer from "nodemailer"

// Email transport configuration
const emailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Send an error alert via email and log it
 * @param message The error message
 * @param source The source of the error
 * @param metadata Additional metadata about the error
 */
export async function alertError(message: string, source: string, metadata?: Record<string, any>) {
  try {
    // Log the error
    logger.error(`Alert: ${message}`, {
      source,
      ...metadata,
    })

    // Capture in Sentry
    captureMessage(`Alert: ${message}`, {
      level: "error",
      source,
      ...metadata,
    })

    // Send email alert
    const recipients = process.env.ERROR_ALERT_RECIPIENTS?.split(",") || []
    if (recipients.length > 0) {
      await emailTransport.sendMail({
        from: process.env.SMTP_FROM,
        to: recipients,
        subject: `Error Alert: ${message.substring(0, 50)}...`,
        text: `
Error Alert
-----------
Source: ${source}
Message: ${message}
Timestamp: ${new Date().toISOString()}
Metadata: ${JSON.stringify(metadata || {}, null, 2)}
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #d32f2f;">Error Alert</h2>
  <p><strong>Source:</strong> ${source}</p>
  <p><strong>Message:</strong> ${message}</p>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
    <pre style="margin: 0;"><code>${JSON.stringify(metadata || {}, null, 2)}</code></pre>
  </div>
</div>
        `,
      })
    }
  } catch (error) {
    // Log the error but don't throw to prevent cascading failures
    logger.error("Failed to send error alert", { error })
  }
}

/**
 * Send a warning alert via email and log it
 * @param message The warning message
 * @param source The source of the warning
 * @param metadata Additional metadata about the warning
 */
export async function alertWarning(message: string, source: string, metadata?: Record<string, any>) {
  try {
    // Log the warning
    logger.warn(`Alert: ${message}`, {
      source,
      ...metadata,
    })

    // Capture in Sentry
    captureMessage(`Alert: ${message}`, {
      level: "warning",
      source,
      ...metadata,
    })

    // Send email alert
    const recipients = process.env.WARNING_ALERT_RECIPIENTS?.split(",") || []
    if (recipients.length > 0) {
      await emailTransport.sendMail({
        from: process.env.SMTP_FROM,
        to: recipients,
        subject: `Warning Alert: ${message.substring(0, 50)}...`,
        text: `
Warning Alert
-------------
Source: ${source}
Message: ${message}
Timestamp: ${new Date().toISOString()}
Metadata: ${JSON.stringify(metadata || {}, null, 2)}
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #f57c00;">Warning Alert</h2>
  <p><strong>Source:</strong> ${source}</p>
  <p><strong>Message:</strong> ${message}</p>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
    <pre style="margin: 0;"><code>${JSON.stringify(metadata || {}, null, 2)}</code></pre>
  </div>
</div>
        `,
      })
    }
  } catch (error) {
    // Log the error but don't throw to prevent cascading failures
    logger.error("Failed to send warning alert", { error })
  }
}

/**
 * Send an info alert via email and log it
 * @param message The info message
 * @param source The source of the info
 * @param metadata Additional metadata about the info
 */
export async function alertInfo(message: string, source: string, metadata?: Record<string, any>) {
  try {
    // Log the info
    logger.info(`Alert: ${message}`, {
      source,
      ...metadata,
    })

    // Capture in Sentry
    captureMessage(`Alert: ${message}`, {
      level: "info",
      source,
      ...metadata,
    })

    // Send email alert
    const recipients = process.env.INFO_ALERT_RECIPIENTS?.split(",") || []
    if (recipients.length > 0) {
      await emailTransport.sendMail({
        from: process.env.SMTP_FROM,
        to: recipients,
        subject: `Info Alert: ${message.substring(0, 50)}...`,
        text: `
Info Alert
----------
Source: ${source}
Message: ${message}
Timestamp: ${new Date().toISOString()}
Metadata: ${JSON.stringify(metadata || {}, null, 2)}
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #2196f3;">Info Alert</h2>
  <p><strong>Source:</strong> ${source}</p>
  <p><strong>Message:</strong> ${message}</p>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
    <pre style="margin: 0;"><code>${JSON.stringify(metadata || {}, null, 2)}</code></pre>
  </div>
</div>
        `,
      })
    }
  } catch (error) {
    // Log the error but don't throw to prevent cascading failures
    logger.error("Failed to send info alert", { error })
  }
}

