import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// Define the expected request body structure (optional but good practice)
interface RegisterRequestBody {
  email?: string;
  password?: string;
  name?: string; // Optional name field
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, password, name } = body;

    // 1. Validate input
    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 });
    }

    // Basic email format validation (consider a more robust library for production)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    // Basic password length validation (adjust as needed)
    if (password.length < 8) {
      return new NextResponse("Password must be at least 8 characters long", {
        status: 400,
      });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409, // Conflict
      });
    }

    // 3. Hash the password
    const saltRounds = 10; // Standard salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create the new user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword, // Store the hashed password
        name: name, // Store name if provided
        // emailVerified is null by default as per schema, indicating not verified
      },
    });

    // 5. Return success response (excluding password)
    // Important: Never return the password hash in the response
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Registration error:", error);
    // Generic error for unexpected issues
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
