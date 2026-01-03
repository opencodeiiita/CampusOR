import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export interface QueueDelayedEmailData {
  recipientEmail: string;
  queueNumber: number;
  estimatedWaitTime: number;
  serviceName: string;
}

export interface QueueAlmostReadyEmailData {
  recipientEmail: string;
  queueNumber: number;
  estimatedWaitTime: number;
  serviceName: string;
}

export interface QueueReadyEmailData {
  recipientEmail: string;
  queueNumber: number;
  serviceName: string;
  location?: string;
}

export class EmailService {
  private static getTemplateId(templateType: 'delayed' | 'almost_ready' | 'ready'): string {
    const templateId = process.env[`RESEND_${templateType.toUpperCase()}_TEMPLATE_ID`];
    if (!templateId) {
      throw new Error(`Template ID for ${templateType} not found in environment variables`);
    }
    return templateId;
  }

  static async sendQueueDelayedEmail(data: QueueDelayedEmailData): Promise<void> {
    try {
      const templateId = this.getTemplateId('delayed');
      
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@campusor.com',
        to: [data.recipientEmail],
        subject: 'Queue Delay Notification',
        template: {
          id: templateId,
          variables: {
            queueNumber: data.queueNumber,
            estimatedWaitTime: data.estimatedWaitTime,
            serviceName: data.serviceName,
          }
        }
      });
    } catch (error) {
      console.error('Failed to send queue delayed email:', error);
      throw new Error('Failed to send queue delayed notification');
    }
  }

  static async sendQueueAlmostReadyEmail(data: QueueAlmostReadyEmailData): Promise<void> {
    try {
      const templateId = this.getTemplateId('almost_ready');
      
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@campusor.com',
        to: [data.recipientEmail],
        subject: 'Queue Almost Ready Notification',
        template: {
          id: templateId,
          variables: {
            queueNumber: data.queueNumber,
            estimatedWaitTime: data.estimatedWaitTime,
            serviceName: data.serviceName,
          }
        }
      });
    } catch (error) {
      console.error('Failed to send queue almost ready email:', error);
      throw new Error('Failed to send queue almost ready notification');
    }
  }

  static async sendQueueReadyEmail(data: QueueReadyEmailData): Promise<void> {
    try {
      const templateId = this.getTemplateId('ready');
      
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@campusor.com',
        to: [data.recipientEmail],
        subject: 'Queue Ready Notification',
        template: {
          id: templateId,
          variables: {
            queueNumber: data.queueNumber,
            serviceName: data.serviceName,
            location: data.location || 'Service Counter',
          }
        }
      });
    } catch (error) {
      console.error('Failed to send queue ready email:', error);
      throw new Error('Failed to send queue ready notification');
    }
  }
}