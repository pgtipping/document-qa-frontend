import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Password validation
function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;

  // Check for at least one number
  if (!/[0-9]/.test(password)) return false;

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("Admin credentials not configured");
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    // Validate password strength on login
    if (!isStrongPassword(ADMIN_PASSWORD)) {
      console.error("Weak admin password configured");
      return NextResponse.json(
        { error: "Admin password does not meet security requirements" },
        { status: 500 }
      );
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });

    // Create response with cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
