import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import {
  getQueueJoinedEmailHtml,
  getQueueJoinedEmailText,
} from "./email-template-joined.js";
import {
  getQueueFinishedEmailHtml,
  getQueueFinishedEmailText,
} from "./email-template-finished.js";
import {
  getEmailVerificationHtml,
  getEmailVerificationText,
} from "./email-template-verification.js";
import { getAdminInviteEmailTemplate } from "./email-template-admin-invite.js";

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

// Get the from email from environment
const getFromEmail = (): string => {
  return env.FROM_EMAIL;
};

interface SendEmailOptions {
  to: string | string[]; // Support single email or array of emails
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  data?: { messageId: string };
  error?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> => {
  try {
    const transporter = createTransporter();

    // Ensure 'to' is always an array
    const recipients = Array.isArray(to) ? to : [to];

    const mailOptions = {
      from: getFromEmail(),
      to: recipients,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);
    return {
      success: true,
      data: { messageId: info.messageId },
    };
  } catch (err) {
    console.error("Email sending error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
};

/**
 * Send queue joined email notification (service function)
 * This is called from service layer, not from controllers
 * Email failures do not block database updates
 */
export const sendQueueJoinedEmail = async (
  email: string,
  userName: string,
  queueName: string,
  location?: string
): Promise<void> => {
  try {
    const html = getQueueJoinedEmailHtml({
      userName,
      queueName,
      location,
    });

    const text = getQueueJoinedEmailText({
      userName,
      queueName,
      location,
    });

    const result = await sendEmail({
      to: email,
      subject: `Welcome to ${queueName}!`,
      html,
      text,
    });

    if (!result.success) {
      console.error("Failed to send queue joined email:", result.error);
    }
  } catch (error) {
    // Email failures must not block database updates
    console.error("Error sending queue joined email:", error);
  }
};

/**
 * Send queue finished email notification (service function)
 * This is called from service layer, not from controllers
 * Email failures do not block database updates
 */
export const sendQueueFinishedEmail = async (
  email: string,
  userName: string,
  queueName: string,
  location?: string
): Promise<void> => {
  try {
    const html = getQueueFinishedEmailHtml({
      userName,
      queueName,
      location,
    });

    const text = getQueueFinishedEmailText({
      userName,
      queueName,
      location,
    });

    const result = await sendEmail({
      to: email,
      subject: `Queue Completed - ${queueName}`,
      html,
      text,
    });

    if (!result.success) {
      console.error("Failed to send queue finished email:", result.error);
    }
  } catch (error) {
    // Email failures must not block database updates
    console.error("Error sending queue finished email:", error);
  }
};

/**
 * Send email verification OTP
 * Keeps signup/resend flows resilient to email failures
 */
export const sendEmailVerificationOtp = async (
  email: string,
  userName: string,
  otp: string,
  expiresInMinutes: number
): Promise<void> => {
  try {
    const html = getEmailVerificationHtml({
      userName,
      otp,
      expiresInMinutes,
    });

    const text = getEmailVerificationText({
      userName,
      otp,
      expiresInMinutes,
    });

    const result = await sendEmail({
      to: email,
      subject: "Verify your email - CampusOR",
      html,
      text,
    });

    if (!result.success) {
      console.error("Failed to send verification email:", result.error);
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

/**
 * Send email to multiple recipients
 */
export const sendBulkEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> => {
  return sendEmail({ to, subject, html, text });
};
