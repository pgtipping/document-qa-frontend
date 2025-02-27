import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure email transporter
const getEmailTransporter = () => {
  try {
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
  } catch (error) {
    console.error("Error creating email transporter:", error);
    return null;
  }
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

    // Check if all required environment variables are set
    if (!config.service || !config.user || !config.pass || !config.recipient) {
      return NextResponse.json({
        success: false,
        message: "Email configuration incomplete",
        config,
        env: {
          NODE_ENV: process.env.NODE_ENV || "unknown",
          // List other non-sensitive environment variables
          VERCEL_ENV: process.env.VERCEL_ENV || "unknown",
          VERCEL_URL: process.env.VERCEL_URL || "unknown",
        },
      });
    }

    const transporter = getEmailTransporter();

    if (!transporter) {
      return NextResponse.json({
        success: false,
        message: "Failed to create email transporter",
        config,
      });
    }

    // Verify transporter connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      return NextResponse.json({
        success: false,
        message: "Email transporter verification failed",
        error:
          verifyError instanceof Error
            ? verifyError.message
            : String(verifyError),
        config,
      });
    }

    // Send test email
    try {
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
    } catch (sendError) {
      return NextResponse.json({
        success: false,
        message: "Failed to send email",
        error:
          sendError instanceof Error ? sendError.message : String(sendError),
        config,
      });
    }

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
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
