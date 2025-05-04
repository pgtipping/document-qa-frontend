// Type augmentations for Prisma Client
import { Prisma, Quiz } from "@prisma/client";

// Define a type for template info instead of using 'any'
interface TemplateInfo {
  name: string;
  focusAreas: string[];
  questionTypes: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  };
  promptModifier?: string;
}

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

  namespace PrismaJson {
    interface QuizCreateInput extends Prisma.QuizCreateInput {
      templateId?: string;
      templateInfo?: TemplateInfo | Prisma.JsonNull;
    }

    interface QuizUncheckedCreateInput extends Prisma.QuizUncheckedCreateInput {
      templateId?: string;
      templateInfo?: TemplateInfo | Prisma.JsonNull;
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

  interface Prisma {
    QuizCreateInput: Prisma.QuizCreateInput & {
      templateId?: string;
      templateInfo?: TemplateInfo | Prisma.JsonNull;
    };

    QuizUncheckedCreateInput: Prisma.QuizUncheckedCreateInput & {
      templateId?: string;
      templateInfo?: TemplateInfo | Prisma.JsonNull;
    };
  }
}

export {};
