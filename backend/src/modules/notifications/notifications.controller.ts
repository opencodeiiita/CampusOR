import { Request, Response } from 'express';
import { EmailService, QueueDelayedEmailData, QueueAlmostReadyEmailData, QueueReadyEmailData } from './email.service.js';

export class NotificationsController {
  static async sendQueueDelayedEmail(req: Request, res: Response): Promise<void> {
    try {
      const { recipientEmail, queueNumber, estimatedWaitTime, serviceName } = req.body;

      if (!recipientEmail || !queueNumber || !estimatedWaitTime || !serviceName) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: recipientEmail, queueNumber, estimatedWaitTime, serviceName'
        });
        return;
      }

      const emailData: QueueDelayedEmailData = {
        recipientEmail,
        queueNumber,
        estimatedWaitTime,
        serviceName
      };

      await EmailService.sendQueueDelayedEmail(emailData);

      res.status(200).json({
        success: true,
        message: 'Queue delayed notification sent successfully'
      });
    } catch (error) {
      console.error('Error in sendQueueDelayedEmail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send queue delayed notification'
      });
    }
  }

  static async sendQueueAlmostReadyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { recipientEmail, queueNumber, estimatedWaitTime, serviceName } = req.body;

      if (!recipientEmail || !queueNumber || !estimatedWaitTime || !serviceName) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: recipientEmail, queueNumber, estimatedWaitTime, serviceName'
        });
        return;
      }

      const emailData: QueueAlmostReadyEmailData = {
        recipientEmail,
        queueNumber,
        estimatedWaitTime,
        serviceName
      };

      await EmailService.sendQueueAlmostReadyEmail(emailData);

      res.status(200).json({
        success: true,
        message: 'Queue almost ready notification sent successfully'
      });
    } catch (error) {
      console.error('Error in sendQueueAlmostReadyEmail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send queue almost ready notification'
      });
    }
  }

  static async sendQueueReadyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { recipientEmail, queueNumber, serviceName, location } = req.body;

      if (!recipientEmail || !queueNumber || !serviceName) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: recipientEmail, queueNumber, serviceName'
        });
        return;
      }

      const emailData: QueueReadyEmailData = {
        recipientEmail,
        queueNumber,
        serviceName,
        location
      };

      await EmailService.sendQueueReadyEmail(emailData);

      res.status(200).json({
        success: true,
        message: 'Queue ready notification sent successfully'
      });
    } catch (error) {
      console.error('Error in sendQueueReadyEmail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send queue ready notification'
      });
    }
  }
}
