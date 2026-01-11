/**
 * Queue Joined Email Template
 * Informs the user that they have successfully joined a queue
 */

interface QueueJoinedEmailProps {
  userName: string;
  queueName: string;
  location?: string;
}

export const getQueueJoinedEmailHtml = ({
  userName,
  queueName,
  location,
}: QueueJoinedEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Queue Joined - Welcome</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f7;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">CampusOR</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Queue Management System</p>
            </td>
          </tr>
          
          <!-- Icon -->
          <tr>
            <td style="padding: 30px 40px 0; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🎉</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600; text-align: center;">Welcome to the Queue!</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                You have successfully joined the queue! We'll notify you when it's your turn.
              </p>
              
              <!-- Queue Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <span style="color: #1e3a8a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Queue Name</span><br>
                    <strong style="color: #2563eb; font-size: 32px; font-weight: 700;">${queueName}</strong>
                  </td>
                </tr>
              </table>
              
              <!-- Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #718096; font-size: 14px;">Queue Name:</span>
                          <strong style="color: #1a1a2e; font-size: 14px; float: right;">${queueName}</strong>
                        </td>
                      </tr>
                      ${location ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #718096; font-size: 14px;">Location:</span>
                          <strong style="color: #1a1a2e; font-size: 14px; float: right;">${location}</strong>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      ℹ️ You will receive notifications about your queue status. Please keep an eye on your email for updates.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                Thank you for using CampusOR!
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} CampusOR. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const getQueueJoinedEmailText = ({
  userName,
  queueName,
  location,
}: QueueJoinedEmailProps): string => {
  return `
Welcome to the Queue! - CampusOR

Hello ${userName},

You have successfully joined the queue! We'll notify you when it's your turn.

=============================
QUEUE NAME: ${queueName}
=============================

${location ? `Location: ${location}\n` : ''}
ℹ️ INFO: You will receive notifications about your queue status. Please keep an eye on your email for updates.

Thank you for using CampusOR!

© ${new Date().getFullYear()} CampusOR. All rights reserved.
  `;
};
