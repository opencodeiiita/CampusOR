/**
 * Queue Ready Email Template
 * Informs the user that their queue number is now active
 */

interface QueueReadyEmailProps {
  userName: string;
  queueNumber: number;
  queueName: string;
  servicePoint?: string;
}

export const getQueueReadyEmailHtml = ({
  userName,
  queueNumber,
  queueName,
  servicePoint,
}: QueueReadyEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Queue Update - Your Turn!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f7;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">CampusOR</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Queue Management System</p>
            </td>
          </tr>
          
          <!-- Icon -->
          <tr>
            <td style="padding: 30px 40px 0; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✅</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600; text-align: center;">It's Your Turn!</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your queue number is now being called! Please proceed to the service point immediately.
              </p>
              
              <!-- Queue Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #d1fae5; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <span style="color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Queue Number</span><br>
                    <strong style="color: #059669; font-size: 48px; font-weight: 700;">#${queueNumber}</strong>
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
                      ${servicePoint ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #718096; font-size: 14px;">Service Point:</span>
                          <strong style="color: #1a1a2e; font-size: 14px; float: right;">${servicePoint}</strong>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Urgent Alert -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fee2e2; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                      🚨 Please proceed immediately! Your number may be skipped if you don't arrive within the designated time.
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
                We look forward to serving you!
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

export const getQueueReadyEmailText = ({
  userName,
  queueNumber,
  queueName,
  servicePoint,
}: QueueReadyEmailProps): string => {
  return `
IT'S YOUR TURN! - CampusOR

Hello ${userName},

Your queue number is now being called! Please proceed to the service point immediately.

=============================
YOUR QUEUE NUMBER: #${queueNumber}
=============================

Queue Name: ${queueName}
${servicePoint ? `Service Point: ${servicePoint}` : ''}

🚨 URGENT: Please proceed immediately! Your number may be skipped if you don't arrive within the designated time.

We look forward to serving you!

© ${new Date().getFullYear()} CampusOR. All rights reserved.
  `;
};
