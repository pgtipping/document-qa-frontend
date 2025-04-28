import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions, getServerSession, User } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma"; // Use the singleton Prisma client instance
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

// Ensure environment variables are set
if (!process.env.GITHUB_ID) {
  console.warn("Missing GITHUB_ID environment variable for GitHub OAuth.");
}
if (!process.env.GITHUB_SECRET) {
  console.warn("Missing GITHUB_SECRET environment variable for GitHub OAuth.");
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("FATAL: Missing NEXTAUTH_SECRET environment variable.");
  // In a real app, you might throw an error or prevent startup
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Example GitHub Provider
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
    // Example Credentials Provider (implement authorization logic as needed)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      // Removed unused 'req' parameter
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Credentials provider: Missing email or password.");
          return null; // Missing credentials
        }

        try {
          // 1. Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log(
              `Credentials provider: No user found for email: ${credentials.email}`
            );
            return null; // User not found
          }

          // 2. Check if user has a password set (they might have signed up via OAuth)
          if (!user.password) {
            console.log(
              `Credentials provider: User ${credentials.email} has no password set (likely OAuth user).`
            );
            // Optionally, you could throw an error here to guide the user
            // throw new Error("Account created via social login. Please use that method.");
            return null; // No password set for this user
          }

          // 3. Compare provided password with the stored hash
          const passwordsMatch = await bcrypt.compare(
            credentials.password,
            user.password // Assuming user.password stores the hashed password
          );

          if (!passwordsMatch) {
            console.log(
              `Credentials provider: Invalid password for user: ${credentials.email}`
            );
            return null; // Passwords don't match
          }

          console.log(
            `Credentials provider: User ${credentials.email} authenticated successfully.`
          );
          // 4. Return user object if authentication succeeds
          // Ensure the returned object matches NextAuth's expected User structure
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            // Add any other necessary fields expected by your session/JWT callbacks
          };
        } catch (error) {
          console.error(
            "Credentials provider: Error during authorization:",
            error
          );
          return null; // Return null on any unexpected error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWTs, etc.
  pages: {
    // Optional: Define custom pages if needed
    signIn: "/auth/signin", // Use the custom sign-in page
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    // Optional: Customize session/JWT callbacks if needed
    async session({ session, token }) {
      // Add user ID to the session object from the JWT token
      if (token?.sub && session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist the user ID onto the JWT token after signin
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};

import { NextRequest, NextResponse } from "next/server";

/**
 * Higher-Order Function to protect API routes requiring admin access.
 * Checks if the session user's email matches the ADMIN_EMAIL env variable.
 */
export async function withAdminAuth(
  req: NextRequest,
  handler: (session: User) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  const session = await getAuthSession();

  if (!session?.user) {
    return new NextResponse("Unauthorized: No active session", { status: 401 });
  }

  // Ensure ADMIN_EMAIL is set before comparing
  if (!process.env.ADMIN_EMAIL) {
    console.error("FATAL: ADMIN_EMAIL environment variable is not set.");
    return new NextResponse(
      "Internal Server Error: Server configuration issue",
      { status: 500 }
    );
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    console.warn(
      `Admin access denied for user: ${session.user.email}. Required: ${process.env.ADMIN_EMAIL}`
    );
    return new NextResponse("Forbidden: Admin access required", {
      status: 403,
    });
  }

  // If authorized, call the original handler with the session user
  return handler(session.user);
}
/**
 * Helper function to get the server-side session.
 * Can be used in API routes or server components.
 */
export const getAuthSession = () => getServerSession(authOptions);
