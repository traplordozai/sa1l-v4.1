import nodemailer from "nodemailer"
import { logger } from "./logger"

interface EmailOptions {
  to: string | string[]
  subject: string
  text: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verify connection configuration
transporter
  .verify()
  .then(() => logger.info("SMTP server connection established"))
  .catch((err) => logger.error("SMTP server connection error:", err))

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const { to, subject, text, html, attachments } = options

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html: html || text,
      attachments,
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email sent: ${info.messageId}`)

    return info
  } catch (error) {
    logger.error("Error sending email:", error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

// Email templates
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: "Welcome to Archive13628PM",
    text: `Hello ${userName},\n\nWelcome to Archive13628PM! We're excited to have you on board.\n\nBest regards,\nThe Archive13628PM Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Archive13628PM!</h2>
        <p>Hello ${userName},</p>
        <p>We're excited to have you on board. Get started by exploring our features:</p>
        <ul>
          <li>Document Analysis</li>
          <li>Collaboration Tools</li>
          <li>AI-Powered Insights</li>
        </ul>
        <p>Best regards,<br>The Archive13628PM Team</p>
      </div>
    `,
  }),

  passwordReset: (resetLink: string) => ({
    subject: "Password Reset Request",
    text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <p style="text-align: center;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Archive13628PM Team</p>
      </div>
    `,
  }),

  notification: (message: string) => ({
    subject: "New Notification",
    text: message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Notification</h2>
        <p>${message}</p>
        <p>Best regards,<br>The Archive13628PM Team</p>
      </div>
    `,
  }),
}

