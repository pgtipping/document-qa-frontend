// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the default interfaces
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string; // Add the user ID field
    } & DefaultSession["user"]; // Keep the default fields (name, email, image)
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User extends DefaultUser {
    // You can add other custom fields here if needed in the future
    // e.g., role?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface JWT extends DefaultJWT {
    // The user ID is typically stored in the 'sub' (subject) claim by default
    // You can add other custom claims here if needed
    // e.g., role?: string;
  }
}
