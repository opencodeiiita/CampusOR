export const getAdminInviteEmailTemplate = (
  inviteLink: string,
  inviterName: string
) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { color: #007bff; }
    .content { margin-bottom: 20px; font-size: 16px; line-height: 1.6; }
    .btn { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admin Invitation</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You have been invited by <strong>${inviterName}</strong> to join <strong>CampusOR</strong> as an Administrator.</p>
      <p>Please click the button below to accept the invitation and set up your account:</p>
      <p style="text-align: center;">
        <a href="${inviteLink}" class="btn">Accept Invitation</a>
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you were not expecting this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CampusOR. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
