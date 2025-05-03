// Type augmentations for Prisma Client
import { Prisma, Quiz } from "@prisma/client";

declare global {
  // Augment PrismaClient
  namespace PrismaClient {
    // Define missing properties in deployment environment
    interface QuizClient {
      create: <T extends Prisma.QuizCreateArgs>(
        args: T
      ) => Promise<Prisma.CheckSelect<T, Quiz, Prisma.QuizGetPayload<T>>>;

      findUnique: <T extends Prisma.QuizFindUniqueArgs>(
        args: T
      ) => Promise<Prisma.CheckSelect<
        T,
        Quiz,
        Prisma.QuizGetPayload<T>
      > | null>;

      findFirst: <T extends Prisma.QuizFindFirstArgs>(
        args: T
      ) => Promise<Prisma.CheckSelect<
        T,
        Quiz,
        Prisma.QuizGetPayload<T>
      > | null>;

      update: <T extends Prisma.QuizUpdateArgs>(
        args: T
      ) => Promise<Prisma.CheckSelect<T, Quiz, Prisma.QuizGetPayload<T>>>;

      delete: <T extends Prisma.QuizDeleteArgs>(args: T) => Promise<Quiz>;

      findMany: <T extends Prisma.QuizFindManyArgs>(
        args: T
      ) => Promise<
        Prisma.CheckSelect<T, Array<Quiz>, Array<Prisma.QuizGetPayload<T>>>
      >;

      count: <T extends Prisma.QuizCountArgs>(args: T) => Promise<number>;
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
