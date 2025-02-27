import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure email transporter
const getEmailTransporter = () => {
  if (
    !process.env.EMAIL_SERVICE ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    console.warn(
      "Email configuration missing. Alerts will be logged but not sent."
    );
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export async function GET() {
  try {
    // First check if we have all required environment variables
    const config = {
      service: !!process.env.EMAIL_SERVICE,
      user: !!process.env.EMAIL_USER,
      pass: !!process.env.EMAIL_PASSWORD,
      recipient: !!process.env.ALERT_EMAIL_RECIPIENT,
    };

    // Log the configuration for debugging
    console.log("Email configuration:", {
      ...config,
      // Mask sensitive data
      user: config.user
        ? process.env.EMAIL_USER?.split("@")[0] + "@..."
        : false,
      pass: config.pass ? "***" : false,
    });

    const transporter = getEmailTransporter();

    if (!transporter || !process.env.ALERT_EMAIL_RECIPIENT) {
      return NextResponse.json({
        success: false,
        message: "Email configuration incomplete",
        config,
      });
    }

    // Send test email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ALERT_EMAIL_RECIPIENT,
      subject: `[Document QA${
        process.env.NODE_ENV === "production" ? " PROD" : ""
      }] Test Email`,
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify your email configuration.</p>
        <hr>
        <p><strong>Environment:</strong> ${
          process.env.NODE_ENV || "development"
        }</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Sender:</strong> ${process.env.EMAIL_USER}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      config,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}
