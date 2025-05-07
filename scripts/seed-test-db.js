// CommonJS version of the database seeding script for better compatibility
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Main cleanup function to ensure a clean database before seeding
async function cleanupDatabase() {
  try {
    // Delete in correct order to respect foreign key constraints
    console.log("Cleaning up existing test data...");

    await prisma.quizQuestion.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Database cleaned successfully");
    return true;
  } catch (error) {
    console.error("Error cleaning database:", error);
    return false;
  }
}

// Seed function with test data
async function seedDatabase() {
  try {
    console.log("Seeding test database...");

    // Create test users
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password:
          "$2b$10$dPXEHVqfvMCQyjdtRWd.Oe5fB1oBXcQMmEVRGG7KGlHkIJ8YLm3R6", // hashed "password123"
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password:
          "$2b$10$dPXEHVqfvMCQyjdtRWd.Oe5fB1oBXcQMmEVRGG7KGlHkIJ8YLm3R6", // hashed "password123"
        role: "admin",
      },
    });

    // Create test documents
    const document1 = await prisma.document.create({
      data: {
        title: "Test Document 1",
        content: "This is a test document for E2E testing",
        userId: testUser.id,
      },
    });

    const document2 = await prisma.document.create({
      data: {
        title: "Test Document 2",
        content: "Another test document for test user",
        userId: testUser.id,
      },
    });

    // Create test quizzes
    const quiz1 = await prisma.quiz.create({
      data: {
        title: "Test Quiz 1",
        documentId: document1.id,
        userId: testUser.id,
        status: "PUBLISHED",
      },
    });

    // Create quiz questions
    await prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        type: "MULTIPLE_CHOICE",
        text: "Question 1",
        options: JSON.stringify([
          "Option A",
          "Option B",
          "Option C",
          "Option D",
        ]),
        correctAnswerIndex: 0,
        difficulty: "MEDIUM",
      },
    });

    await prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        type: "MULTIPLE_CHOICE",
        text: "Question 2",
        options: JSON.stringify([
          "Option 1",
          "Option 2",
          "Option 3",
          "Option 4",
        ]),
        correctAnswerIndex: 2,
        difficulty: "EASY",
      },
    });

    console.log("Database seeded successfully");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}

// Validation function to ensure data was created properly
async function validateSeeding() {
  try {
    const userCount = await prisma.user.count();
    const documentCount = await prisma.document.count();
    const quizCount = await prisma.quiz.count();
    const questionCount = await prisma.quizQuestion.count();

    console.log(
      `Validation: Found ${userCount} users, ${documentCount} documents, ${quizCount} quizzes, and ${questionCount} questions`
    );

    if (
      userCount < 2 ||
      documentCount < 2 ||
      quizCount < 1 ||
      questionCount < 2
    ) {
      throw new Error("Validation failed: Missing test data");
    }

    console.log("Seeding validation successful");
    return true;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}

// Main execution flow
async function main() {
  try {
    const cleanupSuccess = await cleanupDatabase();
    if (!cleanupSuccess) {
      process.exit(1);
    }

    const seedSuccess = await seedDatabase();
    if (!seedSuccess) {
      process.exit(1);
    }

    const validationSuccess = await validateSeeding();
    if (!validationSuccess) {
      process.exit(1);
    }

    console.log("Database seeding completed successfully");
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for external use
module.exports = {
  main,
  cleanupDatabase,
  seedDatabase,
  validateSeeding,
};
