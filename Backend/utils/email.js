const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Welcome Email to new user
 * @param {Object} user User object
 * @param {String} password Plain text password
 */
const sendWelcomeEmail = async (user, password) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not set. Skipping welcome email.');
    return;
  }

  const mailOptions = {
    from: `"LifeSpark" <${process.env.EMAIL_SENDER || process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to LifeSpark - Your Registration is Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; color: #333;">
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to LifeSpark!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Empowering your journey to success</p>
        </div>
        
        <div style="padding: 30px; line-height: 1.6;">
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>We are thrilled to welcome you to the LifeSpark family! Your registration has been successfully processed.</p>
          
          <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #4f46e5; font-size: 18px;">Your Account Credentials</h3>
            <p style="margin: 5px 0;"><strong>Invite Code (User ID):</strong> <span style="font-family: monospace; font-size: 16px; background: #eee; padding: 2px 6px; border-radius: 3px;">${user.inviteCode}</span></p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #eee; padding: 2px 6px; border-radius: 3px;">${password}</span></p>
          </div>

          <p>You can now use these credentials to log in to your dashboard and start exploring our platform.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_ORIGIN || 'https://lifesparkassociates.in/'}/login" 
               style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Login to Your Dashboard
            </a>
          </div>

          <p>If you have any questions or need assistance, please feel free to reach out to our support team.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message. Please do not reply directly to this email.<br/>
            &copy; ${new Date().getFullYear()} LifeSpark. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
};
