const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

const sendResetEmail = async (email, otp) => {
  const logoPath = path.join(process.cwd(), "public", "logo", "logo.png");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const logoHtml = `<h1 style="color: #2a7d73; font-size: 28px; font-weight: bold; margin: 0 0 20px 0;">FlowTrack</h1>`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - FlowTrack",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f7f7f7;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              ${logoHtml}
              
              <h1 style="margin: 0 0 20px; color: #2a7d73; font-size: 24px; font-weight: 600; text-align: center;">
                Password Reset Request
              </h1>
              
              <p style="margin: 0 0 20px; color: #555;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px; color: #555;">
                We received a request to reset your password for your FlowTrack account. To proceed with the password reset, please use the following verification code:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f8f9fa; border: 2px dashed #2a7d73; border-radius: 8px; padding: 20px; display: inline-block;">
                  <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #2a7d73; letter-spacing: 4px;">
                    ${otp}
                  </span>
                </div>
                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                  This code will expire in 10 minutes for security reasons
                </p>
              </div>
              
              <p style="margin: 0 0 20px; color: #555;">
                If you didn't request a password reset, please ignore this email and ensure your account is secure by checking your security settings.
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 30px 0; border-left: 4px solid #2a7d73;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  For your security:<br>
                  • Never share this code with anyone<br>
                  • FlowTrack will never ask for this code through any other channel<br>
                  • Consider enabling two-factor authentication for additional security
                </p>
              </div>
              
              <p style="margin: 0; color: #555;">
                Best regards,<br>
                The FlowTrack Team
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666;">
                © ${new Date().getFullYear()} FlowTrack. All rights reserved.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #2a7d73; text-decoration: none; margin: 0 10px; font-size: 14px;">Privacy Policy</a>
                <a href="#" style="color: #2a7d73; text-decoration: none; margin: 0 10px; font-size: 14px;">Terms of Service</a>
                <a href="#" style="color: #2a7d73; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact Us</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

module.exports = sendResetEmail;
