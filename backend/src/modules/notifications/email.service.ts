import { Resend } from "resend";

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
