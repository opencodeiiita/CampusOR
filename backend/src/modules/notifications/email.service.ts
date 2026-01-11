import { Resend } from "resend";
import {
  getQueueJoinedEmailHtml,
  getQueueJoinedEmailText,
} from "./email-template-joined.js";
import {
  getQueueFinishedEmailHtml,
  getQueueFinishedEmailText,
} from "./email-template-finished.js";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Get the from email from environment or use default
const getFromEmail = (): string => {
  return process.env.FROM_EMAIL || "onboarding@resend.dev";
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> => {
  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data ? { id: data.id } : undefined,
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
