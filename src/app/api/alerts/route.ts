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

// Alert thresholds - can be adjusted based on environment
const THRESHOLDS = {
  error_rate: process.env.NODE_ENV === "production" ? 0.05 : 0.1, // 5% in prod, 10% in dev
  response_time: process.env.NODE_ENV === "production" ? 3000 : 5000, // 3s in prod, 5s in dev
  upload_failures: process.env.NODE_ENV === "production" ? 2 : 3, // stricter in prod
};

// Alert types
type AlertType = "error_rate" | "response_time" | "upload_failures";

interface AlertData {
  type: AlertType;
  value: number;
  timestamp: string;
  details?: Record<string, any>;
}

// Test endpoint handler
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
      config,
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

// Alert endpoint handler
export async function POST(request: Request) {
  try {
    const data: AlertData = await request.json();

    // Check if threshold is exceeded
    let shouldAlert = false;
    let alertMessage = "";

    switch (data.type) {
      case "error_rate":
        if (data.value > THRESHOLDS.error_rate) {
          shouldAlert = true;
          alertMessage = `High error rate detected: ${(
            data.value * 100
          ).toFixed(1)}%`;
        }
        break;
      case "response_time":
        if (data.value > THRESHOLDS.response_time) {
          shouldAlert = true;
          alertMessage = `Slow response time detected: ${(
            data.value / 1000
          ).toFixed(1)}s`;
        }
        break;
      case "upload_failures":
        if (data.value >= THRESHOLDS.upload_failures) {
          shouldAlert = true;
          alertMessage = `Multiple upload failures detected: ${data.value} failures`;
        }
        break;
    }

    if (shouldAlert) {
      // Always log alerts
      console.log(`[ALERT] ${alertMessage}`, {
        type: data.type,
        value: data.value,
        timestamp: data.timestamp,
        details: data.details,
      });

      // Get email transporter
      const transporter = getEmailTransporter();

      if (transporter && process.env.ALERT_EMAIL_RECIPIENT) {
        // Send email alert
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ALERT_EMAIL_RECIPIENT,
          subject: `[Document QA${
            process.env.NODE_ENV === "production" ? " PROD" : ""
          }] Alert: ${alertMessage}`,
          html: `
            <h2>Alert Details</h2>
            <p><strong>Environment:</strong> ${
              process.env.NODE_ENV || "development"
            }</p>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Value:</strong> ${data.value}</p>
            <p><strong>Time:</strong> ${new Date(
              data.timestamp
            ).toLocaleString()}</p>
            ${
              data.details
                ? `<p><strong>Additional Details:</strong> ${JSON.stringify(
                    data.details,
                    null,
                    2
                  )}</p>`
                : ""
            }
            <hr>
            <p style="color: #666; font-size: 12px;">
              Threshold: ${THRESHOLDS[data.type]}
              ${
                process.env.NODE_ENV === "production"
                  ? " (Production)"
                  : " (Development)"
              }
            </p>
          `,
        });

        return NextResponse.json({ success: true, message: "Alert sent" });
      }

      return NextResponse.json({
        success: true,
        message: "Alert logged (email not configured)",
      });
    }

    return NextResponse.json({ success: true, message: "No alert needed" });
  } catch (error) {
    console.error("Error processing alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process alert" },
      { status: 500 }
    );
  }
}
