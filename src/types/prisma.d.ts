// Type augmentations for Prisma Client
import { PrismaClient } from "@prisma/client";

declare global {
  // Augment PrismaClient
  namespace PrismaClient {
    // Define missing properties in deployment environment
    interface QuizClient {
      create: Function;
      findUnique: Function;
      findFirst: Function;
      update: Function;
      delete: Function;
    }
  }
}

// Augment the PrismaClient instance
declare module "@prisma/client" {
  interface PrismaClient {
    quiz: PrismaClient.QuizClient;
  }

  // Add proper JSON handling types for Prisma
  type NullableJsonNullValueInput = { JsonNull: true } | null;
  type InputJsonValue =
    | string
    | number
    | boolean
    | { [key: string]: InputJsonValue }
    | InputJsonValue[]
    | null;
}

export {};
