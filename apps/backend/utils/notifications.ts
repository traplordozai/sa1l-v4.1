import nodemailer from "nodemailer"
import { env } from "../config/env"
import { logger } from "../lib/logger"
import { prisma } from "../../../archive13628-pm/apps/backend/db/prisma"

// Initialize email transport
const emailTransport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

/**
 * Notification types
 */
export type NotificationType =
  | "document_created"
  | "document_updated"
  | "submission_created"
  | "submission_reviewed"
  | "user_created"
  | "system_alert"

/**
 * Notification channels
 */
export type NotificationChannel = "email" | "push" | "in_app"

/**
 * Notification options
 */
export interface NotificationOptions {
  userId: string
  type: NotificationType
  message: string
  channels?: NotificationChannel[]
  data?: Record<string, unknown>
}

/**
 * Sends a notification to a user
 * @param options Notification options
 * @returns Promise indicating if the notification was sent successfully
 */
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  const { userId, type, message, channels = ["in_app"], data = {} } = options

  try {
    // Get user notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        pushToken: true,
        notificationPreferences: true,
      },
    })

    if (!user) {
      logger.warn(`Cannot send notification: User ${userId} not found`)
      return false
    }

    // Create in-app notification
    if (channels.includes("in_app")) {
      await prisma.notification.create({
        data: {
          userId,
          type,
          message,
          data: data as any,
          read: false,
        },
      })
    }

    // Send email notification
    if (channels.includes("email") && user.email) {
      await sendEmailNotification(user.email, type, message, data)
    }

    // Send push notification
    if (channels.includes("push") && user.pushToken) {
      await sendPushNotification(user.pushToken, type, message, data)
    }

    return true
  } catch (error) {
    const err = error as Error
    logger.error("Failed to send notification", { error: err.message, userId, type })
    return false
  }
}

/**
 * Sends an email notification
 * @param email Recipient email
 * @param type Notification type
 * @param message Notification message
 * @param data Additional data
 * @returns Promise indicating if the email was sent successfully
 */
async function sendEmailNotification(
  email: string,
  type: NotificationType,
  message: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    // Get email template based on notification type
    const { subject, html } = getEmailTemplate(type, message, data)

    await emailTransport.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject,
      html,
    })

    return true
  } catch (error) {
    const err = error as Error
    logger.error("Failed to send email notification", { error: err.message, email, type })
    return false
  }
}

/**
 * Sends a push notification
 * @param token Push notification token
 * @param type Notification type
 * @param message Notification message
 * @param data Additional data
 * @returns Promise indicating if the push notification was sent successfully
 */
async function sendPushNotification(
  token: string,
  type: NotificationType,
  message: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  // This is a placeholder for actual push notification implementation
  // In a real application, you would use a service like Firebase Cloud Messaging
  logger.info("Push notification would be sent", { token, type, message, data })
  return true
}

/**
 * Gets an email template based on notification type
 * @param type Notification type
 * @param message Notification message
 * @param data Additional data
 * @returns Email template with subject and HTML content
 */
function getEmailTemplate(
  type: NotificationType,
  message: string,
  data: Record<string, unknown>,
): { subject: string; html: string } {
  // Base email template
  const baseTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333;">{title}</h2>
        <p style="font-size: 16px; line-height: 1.5;">{message}</p>
        {content}
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  `

  // Default values
  let title = "Notification"
  let subject = "New Notification"
  let content = ""

  // Customize based on notification type
  switch (type) {
    case "document_created":
      title = "New Document Created"
      subject = "New Document Created"
      content = `<p>A new document has been created: ${data.title || ""}</p>`
      break
    case "document_updated":
      title = "Document Updated"
      subject = "Document Updated"
      content = `<p>A document has been updated: ${data.title || ""}</p>`
      break
    case "submission_created":
      title = "New Submission"
      subject = "New Submission Received"
      content = `<p>A new submission has been received.</p>`
      break
    case "submission_reviewed":
      title = "Submission Reviewed"
      subject = "Your Submission Has Been Reviewed"
      content = `<p>Your submission has been reviewed.</p>`
      break
    case "user_created":
      title = "Welcome to the Platform"
      subject = "Welcome to the Platform"
      content = `
        <p>Your account has been created successfully.</p>
        <p>You can now log in to access the platform.</p>
      `
      break
    case "system_alert":
      title = "System Alert"
      subject = "System Alert"
      content = `<p>An important system alert has been issued.</p>`
      break
  }

  // Replace placeholders in template
  const html = baseTemplate.replace("{title}", title).replace("{message}", message).replace("{content}", content)

  return { subject, html }
}

/**
 * Marks notifications as read
 * @param userId User ID
 * @param notificationIds IDs of notifications to mark as read
 * @returns Promise with the number of notifications marked as read
 */
export async function markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<number> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return result.count
  } catch (error) {
    const err = error as Error
    logger.error("Failed to mark notifications as read", { error: err.message, userId, notificationIds })
    return 0
  }
}

/**
 * Gets unread notifications for a user
 * @param userId User ID
 * @param limit Maximum number of notifications to return
 * @returns Promise with unread notifications
 */
export async function getUnreadNotifications(userId: string, limit = 10): Promise<any[]> {
  try {
    return await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })
  } catch (error) {
    const err = error as Error
    logger.error("Failed to get unread notifications", { error: err.message, userId })
    return []
  }
}