import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
    const transporter = getEmailTransporter();

    if (!transporter || !process.env.ALERT_EMAIL_RECIPIENT) {
      return NextResponse.json({
        success: false,
        message: "Email configuration incomplete",
        config: {
          service: !!process.env.EMAIL_SERVICE,
          user: !!process.env.EMAIL_USER,
          pass: !!process.env.EMAIL_PASSWORD,
          recipient: !!process.env.ALERT_EMAIL_RECIPIENT,
        },
      });
    }

    // Send test email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ALERT_EMAIL_RECIPIENT,
      subject: `[Document QA${
        process.env.NODE_ENV === "production" ? " PROD" : ""
      }] Test Alert`,
      html: `
        <h2>Test Alert</h2>
        <p>This is a test alert to verify your email configuration.</p>
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
      message: "Test alert sent successfully",
    });
  } catch (error) {
    console.error("Error sending test alert:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send test alert",
      },
      { status: 500 }
    );
  }
}
