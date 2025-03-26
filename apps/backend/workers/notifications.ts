import type { Job } from "bull"
import { Expo } from "expo-server-sdk"
import nodemailer from "nodemailer"
import { prisma } from "../../../../archive13628-pm/apps/backend/docs/prisma"
import type { NotificationTask } from "../queue"

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Initialize Expo SDK for push notifications
const expo = new Expo()

export async function processNotification(job: Job<NotificationTask>) {
  const { userId, message, channel } = job.data

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      pushToken: true,
      notificationPreferences: true,
    },
  })

  if (!user) {
    throw new Error(`User ${userId} not found`)
  }

  // Check if user has enabled this notification channel
  if (user.notificationPreferences?.[channel] === false) {
    console.log(`User ${userId} has disabled ${channel} notifications`)
    return
  }

  let success = false

  try {
    switch (channel) {
      case "email":
        await sendEmail(user.email, message)
        success = true
        break

      case "push":
        if (user.pushToken) {
          await sendPushNotification(user.pushToken, message)
          success = true
        }
        break

      case "in_app":
        await createInAppNotification(userId, message)
        success = true
        break
    }

    // Log notification
    await prisma.notificationLog.create({
      data: {
        userId,
        channel,
        message,
        status: success ? "delivered" : "failed",
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error(`Failed to send ${channel} notification to user ${userId}:`, error)
    throw error
  }
}

async function sendEmail(email: string, message: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Notification from SA1L",
    text: message,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Notification</h2>
      <p>${message}</p>
    </div>`,
  })
}

async function sendPushNotification(pushToken: string, message: string) {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error(`Invalid Expo push token: ${pushToken}`)
  }

  const messages = [
    {
      to: pushToken,
      sound: "default",
      body: message,
      data: { withSome: "data" },
    },
  ]

  const chunks = expo.chunkPushNotifications(messages)

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk)
    } catch (error) {
      console.error("Error sending push notification:", error)
      throw error
    }
  }
}

async function createInAppNotification(userId: string, message: string) {
  await prisma.notification.create({
    data: {
      userId,
      message,
      read: false,
      createdAt: new Date(),
    },
  })
}

