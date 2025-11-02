import nodemailer from "nodemailer";

/**
 * Sends OTP either using configured SMTP or falls back to Ethereal (test) account.
 * Returns info object. For Ethereal, nodemailer.getTestMessageUrl(info) will be logged.
 */
export async function sendOtpEmail(to, otp) {
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // create a test account (Ethereal) for local development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const from = process.env.FROM_EMAIL || "Auth Service <no-reply@example.com>";

  const message = {
    from,
    to,
    subject: "Your verification OTP",
    text: `Your OTP code is ${otp}. It expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.`,
    html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px 25px; color: #facc15; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">💸 Fintech Tracker</h2>
        <p style="margin: 5px 0 0; font-size: 14px; color: #e2e8f0;">Secure Email Verification</p>
      </div>
      <div style="padding: 25px 30px; text-align: center; color: #1e293b;">
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 15px; color: #475569; margin-top: 5px;">
          Please use the One-Time Password (OTP) below to verify your email address for Fintech Tracker.
        </p>
        <div style="margin: 25px auto; display: inline-block; background: #fef9c3; border: 2px solid #facc15; padding: 18px 28px; border-radius: 10px;">
          <span style="font-size: 30px; font-weight: bold; color: #b45309; letter-spacing: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #475569; margin-top: 20px;">
          This OTP will expire in <b>${process.env.OTP_TTL_MINUTES || 10} minutes</b>.
        </p>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 25px;">
          If you didn’t request this verification, please ignore this email.
        </p>
      </div>
      <div style="background-color: #0f172a; padding: 12px; text-align: center; color: #cbd5e1; font-size: 12px;">
        © ${new Date().getFullYear()} Fintech Tracker. All rights reserved.
      </div>
    </div>
  </div>
`,

  };

  const info = await transporter.sendMail(message);

  // if using ethereal, print preview URL for the developer
  if (!process.env.SMTP_HOST) {
    console.log("Ethereal message preview URL:", nodemailer.getTestMessageUrl(info));
  }
  
  return info;
}
