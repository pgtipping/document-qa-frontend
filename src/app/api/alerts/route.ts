import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Alert thresholds
const THRESHOLDS = {
  error_rate: 0.1, // 10% error rate
  response_time: 5000, // 5 seconds
  upload_failures: 3, // 3 failures in succession
};

// Alert types
type AlertType = "error_rate" | "response_time" | "upload_failures";

interface AlertData {
  type: AlertType;
  value: number;
  timestamp: string;
  details?: Record<string, any>;
}

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
      // Send email alert
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL_RECIPIENT,
        subject: `[Document QA] Alert: ${alertMessage}`,
        html: `
          <h2>Alert Details</h2>
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
        `,
      });

      return NextResponse.json({ success: true, message: "Alert sent" });
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
