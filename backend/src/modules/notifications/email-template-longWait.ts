

interface QueueDelayedEmailProps {
  userName: string;
  queueNumber: number;
  estimatedWaitTime: string;
  queueName: string;
}

export const getQueueDelayedEmailHtml = ({
  userName,
  queueNumber,
  estimatedWaitTime,
  queueName,
}: QueueDelayedEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Queue Update - Delay Notice</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f7;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">CampusOR</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Queue Management System</p>
            </td>
          </tr>
          
          <!-- Icon -->
          <tr>
            <td style="padding: 30px 40px 0; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #fff3cd; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">⏳</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600; text-align: center;">Queue Delay Notice</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We wanted to let you know that there's a slight delay in the queue. Your position is being maintained, but the wait time has increased.
              </p>
              
              <!-- Queue Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                          <span style="color: #718096; font-size: 14px;">Queue Name</span><br>
                          <strong style="color: #1a1a2e; font-size: 16px;">${queueName}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                          <span style="color: #718096; font-size: 14px;">Your Queue Number</span><br>
                          <strong style="color: #667eea; font-size: 24px;">#${queueNumber}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #718096; font-size: 14px;">Estimated Wait Time</span><br>
                          <strong style="color: #e53e3e; font-size: 18px;">${estimatedWaitTime}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We apologize for any inconvenience. You don't need to take any action – we'll notify you when your turn is approaching.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                Thank you for your patience!
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

export const getQueueDelayedEmailText = ({
  userName,
  queueNumber,
  estimatedWaitTime,
  queueName,
}: QueueDelayedEmailProps): string => {
  return `
Queue Delay Notice - CampusOR

Hello ${userName},

We wanted to let you know that there's a slight delay in the queue. Your position is being maintained, but the wait time has increased.

Queue Details:
- Queue Name: ${queueName}
- Your Queue Number: #${queueNumber}
- Estimated Wait Time: ${estimatedWaitTime}

We apologize for any inconvenience. You don't need to take any action – we'll notify you when your turn is approaching.

Thank you for your patience!

© ${new Date().getFullYear()} CampusOR. All rights reserved.
  `;
};
