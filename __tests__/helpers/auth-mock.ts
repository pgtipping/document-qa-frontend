/**
 * Authentication mocking helpers for testing
 */

import { mockUsers } from "./quiz-fixtures";

// Define user type with correct properties
type MockUser = {
  id: string | null;
  name: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isPremium?: boolean;
};

// Mock types to match Next.js Auth.js types
export type Session = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  expires: string;
};

// Mock auth session for testing
export const mockSession = (
  userType: "authenticated" | "unauthenticated" | "premium" = "authenticated"
): Session | null => {
  const user = mockUsers[userType] as MockUser;

  if (!user.isAuthenticated) {
    return null;
  }

  return {
    user: {
      id: user.id || undefined,
      name: user.name,
      email: user.email,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
};

// Mock the auth module for Next.js
export const mockNextAuth = (
  userType: "authenticated" | "unauthenticated" | "premium" = "authenticated"
) => {
  const session = mockSession(userType);

  return jest.fn().mockImplementation(() => ({
    auth: jest.fn().mockResolvedValue(session),
  }));
};

// Mock getServerSession for API routes
export const mockGetServerSession = (
  userType: "authenticated" | "unauthenticated" | "premium" = "authenticated"
) => {
  const session = mockSession(userType);

  return jest.fn().mockResolvedValue(session);
};

// Mock useSession hook for components
export const mockUseSession = (
  userType: "authenticated" | "unauthenticated" | "premium" = "authenticated"
) => {
  const session = mockSession(userType);

  return jest.fn().mockReturnValue({
    data: session,
    status: session ? "authenticated" : "unauthenticated",
    update: jest.fn(),
  });
};

// Mock getAuthContext for server components
export const mockAuthContext = (
  userType: "authenticated" | "unauthenticated" | "premium" = "authenticated"
) => {
  const user = mockUsers[userType] as MockUser;

  return {
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    isAuthenticated: user.isAuthenticated,
    isPremium: user.isPremium || false,
  };
};

// Create auth headers for API tests
export const getAuthHeaders = (
  userType: "authenticated" | "unauthenticated" | "premium" = "authenticated"
) => {
  const user = mockUsers[userType] as MockUser;

  if (!user.isAuthenticated) {
    return {};
  }

  // This is a simplified mock, in a real app you'd typically generate a proper JWT
  return {
    Authorization: `Bearer mock-token-for-${user.id}`,
    "x-user-id": user.id,
    "x-user-email": user.email,
  };
};
