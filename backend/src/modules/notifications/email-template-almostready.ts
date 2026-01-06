
interface QueueAlmostReadyEmailProps {
  userName: string;
  queueNumber: number;
  positionsAhead: number;
  queueName: string;
}

export const getQueueAlmostReadyEmailHtml = ({
  userName,
  queueNumber,
  positionsAhead,
  queueName,
}: QueueAlmostReadyEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Queue Update - Almost Ready</title>
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
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #fed7aa; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🔔</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600; text-align: center;">Your Turn is Almost Here!</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Great news! Your queue number is approaching. Please start making your way to the service point.
              </p>
              
              <!-- Queue Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff7ed; border: 2px solid #fb923c; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #fed7aa;">
                          <span style="color: #9a3412; font-size: 14px;">Queue Name</span><br>
                          <strong style="color: #1a1a2e; font-size: 16px;">${queueName}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #fed7aa;">
                          <span style="color: #9a3412; font-size: 14px;">Your Queue Number</span><br>
                          <strong style="color: #ea580c; font-size: 28px;">#${queueNumber}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #9a3412; font-size: 14px;">Positions Ahead</span><br>
                          <strong style="color: #ea580c; font-size: 20px;">${positionsAhead} ${positionsAhead === 1 ? 'person' : 'people'}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Alert Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      ⚠️ Please be ready when your number is called. Missing your turn may result in being moved to the back of the queue.
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
                See you soon!
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

export const getQueueAlmostReadyEmailText = ({
  userName,
  queueNumber,
  positionsAhead,
  queueName,
}: QueueAlmostReadyEmailProps): string => {
  return `
Your Turn is Almost Here! - CampusOR

Hello ${userName},

Great news! Your queue number is approaching. Please start making your way to the service point.

Queue Details:
- Queue Name: ${queueName}
- Your Queue Number: #${queueNumber}
- Positions Ahead: ${positionsAhead} ${positionsAhead === 1 ? 'person' : 'people'}

⚠️ IMPORTANT: Please be ready when your number is called. Missing your turn may result in being moved to the back of the queue.

See you soon!

© ${new Date().getFullYear()} CampusOR. All rights reserved.
  `;
};
