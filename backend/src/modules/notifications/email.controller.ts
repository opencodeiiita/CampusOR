import { Request, Response } from "express";
import { sendEmail } from "./email.service.js";
import {
  getQueueDelayedEmailHtml,
  getQueueDelayedEmailText,
} from "./email-template-longWait.js";
import {
  getQueueAlmostReadyEmailHtml,
  getQueueAlmostReadyEmailText,
} from "./email-template-almostready.js";
import {
  getQueueReadyEmailHtml,
  getQueueReadyEmailText,
} from "./email-template-ready.js";

interface QueueDelayedRequest {
  email: string;
  userName: string;
  queueNumber: number;
  estimatedWaitTime: string;
  queueName: string;
}

/**
 * Request body for queue almost ready notification
 */
interface QueueAlmostReadyRequest {
  email: string;
  userName: string;
  queueNumber: number;
  positionsAhead: number;
  queueName: string;
}

/**
 * Request body for queue ready notification
 */
interface QueueReadyRequest {
  email: string;
  userName: string;
  queueNumber: number;
  queueName: string;
  servicePoint?: string;
}

/**
 * Send queue delayed email notification
 * Informs the user that their queue number will take some time
 */
export const sendQueueDelayedEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, userName, queueNumber, estimatedWaitTime, queueName } =
      req.body as QueueDelayedRequest;

    // Validate required fields
    if (
      !email ||
      !userName ||
      !queueNumber ||
      !estimatedWaitTime ||
      !queueName
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: email, userName, queueNumber, estimatedWaitTime, queueName",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    const html = getQueueDelayedEmailHtml({
      userName,
      queueNumber,
      estimatedWaitTime,
      queueName,
    });

    const text = getQueueDelayedEmailText({
      userName,
      queueNumber,
      estimatedWaitTime,
      queueName,
    });

    const result = await sendEmail({
      to: email,
      subject: `Queue Delay Notice - ${queueName}`,
      html,
      text,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Queue delayed email sent successfully",
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in sendQueueDelayedEmail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Send queue almost ready email notification
 * Informs the user that their queue number is approaching
 */
export const sendQueueAlmostReadyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, userName, queueNumber, positionsAhead, queueName } =
      req.body as QueueAlmostReadyRequest;

    // Validate required fields
    if (
      !email ||
      !userName ||
      !queueNumber ||
      positionsAhead === undefined ||
      !queueName
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: email, userName, queueNumber, positionsAhead, queueName",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    const html = getQueueAlmostReadyEmailHtml({
      userName,
      queueNumber,
      positionsAhead,
      queueName,
    });

    const text = getQueueAlmostReadyEmailText({
      userName,
      queueNumber,
      positionsAhead,
      queueName,
    });

    const result = await sendEmail({
      to: email,
      subject: `Your Turn is Almost Here - ${queueName}`,
      html,
      text,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Queue almost ready email sent successfully",
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in sendQueueAlmostReadyEmail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Send queue ready email notification
 * Informs the user that their queue number is now active
 */
export const sendQueueReadyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, userName, queueNumber, queueName, servicePoint } =
      req.body as QueueReadyRequest;

    // Validate required fields
    if (!email || !userName || !queueNumber || !queueName) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: email, userName, queueNumber, queueName",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    const html = getQueueReadyEmailHtml({
      userName,
      queueNumber,
      queueName,
      servicePoint,
    });

    const text = getQueueReadyEmailText({
      userName,
      queueNumber,
      queueName,
      servicePoint,
    });

    const result = await sendEmail({
      to: email,
      subject: `It's Your Turn! - ${queueName}`,
      html,
      text,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Queue ready email sent successfully",
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in sendQueueReadyEmail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
