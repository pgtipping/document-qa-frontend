import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function seedTestDatabase() {
  console.log("Seeding test database...");

  try {
    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "Test User",
        password: await hash("testpassword123", 10),
      },
    });
    console.log(`Created test user: ${testUser.id}`);

    // Create an admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        name: "Admin User",
        password: await hash("adminpassword123", 10),
      },
    });
    console.log(`Created admin user: ${adminUser.id}`);

    // Create various document types for testing template recommendations
    const documentTypes = [
      {
        id: "academic-doc",
        filename: "Research Paper on Climate Change.pdf",
        s3Key: "test/academic-document.pdf",
      },
      {
        id: "technical-doc",
        filename: "System Architecture Documentation.md",
        s3Key: "test/technical-document.md",
      },
      {
        id: "business-doc",
        filename: "Quarterly Business Report.docx",
        s3Key: "test/business-document.docx",
      },
      {
        id: "narrative-doc",
        filename: "Short Story Draft.docx",
        s3Key: "test/narrative-document.docx",
      },
      {
        id: "test-doc-1",
        filename: "Test Document 1.pdf",
        s3Key: "test/test-document-1.pdf",
      },
      {
        id: "test-doc-2",
        filename: "Test Document 2.docx",
        s3Key: "test/test-document-2.docx",
      },
    ];

    // Create all document types
    for (const doc of documentTypes) {
      await prisma.document.upsert({
        where: { id: doc.id },
        update: {},
        create: {
          id: doc.id,
          filename: doc.filename,
          s3Key: doc.s3Key,
          status: "active",
          userId: testUser.id,
        },
      });
      console.log(`Created document: ${doc.id}`);
    }

    // Templates data for testing
    const templateData = [
      {
        id: "general-template-quiz",
        documentId: "test-doc-1",
        templateId: "general",
        title: "General Knowledge Quiz",
        templateInfo: {
          name: "General Knowledge",
          description: "Balanced mix of questions covering main points",
          questionDistribution: {
            multipleChoice: 60,
            trueFalse: 20,
            shortAnswer: 20,
          },
        },
      },
      {
        id: "academic-template-quiz",
        documentId: "academic-doc",
        templateId: "academic",
        title: "Academic Paper Quiz",
        templateInfo: {
          name: "Academic Paper",
          description: "Specifically designed for scholarly articles",
          questionDistribution: {
            multipleChoice: 50,
            trueFalse: 20,
            shortAnswer: 30,
          },
        },
      },
      {
        id: "technical-template-quiz",
        documentId: "technical-doc",
        templateId: "technical",
        title: "Technical Documentation Quiz",
        templateInfo: {
          name: "Technical Document",
          description: "For technical documentation and manuals",
          questionDistribution: {
            multipleChoice: 70,
            trueFalse: 20,
            shortAnswer: 10,
          },
        },
      },
      {
        id: "business-template-quiz",
        documentId: "business-doc",
        templateId: "business",
        title: "Business Report Quiz",
        templateInfo: {
          name: "Business Document",
          description: "For business plans and reports",
          questionDistribution: {
            multipleChoice: 50,
            trueFalse: 20,
            shortAnswer: 30,
          },
        },
      },
      {
        id: "narrative-template-quiz",
        documentId: "narrative-doc",
        templateId: "narrative",
        title: "Narrative Text Quiz",
        templateInfo: {
          name: "Narrative Text",
          description: "For stories and essays",
          questionDistribution: {
            multipleChoice: 40,
            trueFalse: 20,
            shortAnswer: 40,
          },
        },
      },
    ];

    // Create a basic quiz with mixed difficulty levels
    const testQuiz = await prisma.quiz.upsert({
      where: { id: "test-quiz-1" },
      update: {},
      create: {
        id: "test-quiz-1",
        title: "Test Quiz",
        documentId: "test-doc-1",
        userId: testUser.id,
        createdAt: new Date(),
        questions: {
          create: [
            {
              id: "test-question-1",
              answerType: "multiple_choice",
              questionText: "What is the capital of France?",
              options: ["London", "Paris", "Berlin", "Madrid"],
              correctAnswer: "Paris",
              explanation: "Paris is the capital of France.",
              points: 10,
            },
            {
              id: "test-question-2",
              answerType: "true_false",
              questionText: "The Earth is flat.",
              options: ["True", "False"],
              correctAnswer: "False",
              explanation: "The Earth is approximately spherical.",
              points: 5,
            },
            {
              id: "test-question-3",
              answerType: "short_answer",
              questionText: "What is the chemical symbol for water?",
              correctAnswer: "H2O",
              explanation: "H2O is the chemical formula for water.",
              points: 15,
            },
          ],
        },
      },
    });
    console.log(`Created test quiz: ${testQuiz.id}`);

    // Create quizzes for each template type
    for (const template of templateData) {
      // Create a set of mixed difficulty questions
      const questionTypes = ["multiple_choice", "true_false", "short_answer"];
      const difficulties = ["easy", "medium", "hard"];

      const questions = [];

      // Generate 9 questions (3 of each difficulty)
      for (let i = 0; i < 9; i++) {
        const answerType = questionTypes[i % 3];
        const difficulty = difficulties[Math.floor(i / 3)];

        let question = {
          id: `${template.id}-q${i + 1}`,
          points: difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15,
          explanation: `Explanation for ${difficulty} difficulty question`,
        };

        // Set type-specific properties
        if (answerType === "multiple_choice") {
          questions.push({
            ...question,
            answerType: "multiple_choice",
            questionText: `${template.templateId} multiple choice question (${difficulty})?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option B",
          });
        } else if (answerType === "true_false") {
          questions.push({
            ...question,
            answerType: "true_false",
            questionText: `${template.templateId} true/false question (${difficulty})?`,
            options: ["True", "False"],
            correctAnswer: "True",
          });
        } else {
          questions.push({
            ...question,
            answerType: "short_answer",
            questionText: `${template.templateId} short answer question (${difficulty})?`,
            correctAnswer: "Answer",
          });
        }
      }

      // Use type assertion to bypass TypeScript's type checking for known fields
      // that exist in the database schema but might not be properly represented in the TypeScript types
      await (prisma.quiz as any).create({
        data: {
          id: template.id,
          title: template.title,
          documentId: template.documentId,
          userId: testUser.id,
          difficulty: "medium", // This exists in the schema but might be missing in TypeScript types
          templateId: template.templateId, // This exists in the schema but might be missing in TypeScript types
          templateInfo: template.templateInfo, // This exists in the schema but might be missing in TypeScript types
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ), // Random date within last week
          questions: {
            create: questions,
          },
        },
      });
      console.log(`Created ${template.templateId} quiz: ${template.id}`);
    }

    // Create a quiz result
    const quizResult = await prisma.quizResult.upsert({
      where: { id: "test-result-1" },
      update: {},
      create: {
        id: "test-result-1",
        quizId: "test-quiz-1",
        userId: testUser.id,
        score: 66.67, // Percentage
        totalPoints: 30,
        earnedPoints: 20,
        timeTaken: 300, // 5 minutes
        completedAt: new Date(),
        responses: {
          create: [
            {
              id: "test-response-1",
              questionId: "test-question-1",
              userAnswer: "Paris",
              isCorrect: true,
            },
            {
              id: "test-response-2",
              questionId: "test-question-2",
              userAnswer: "False",
              isCorrect: true,
            },
            {
              id: "test-response-3",
              questionId: "test-question-3",
              userAnswer: "H3O",
              isCorrect: false,
            },
          ],
        },
      },
    });
    console.log(`Created quiz result: ${quizResult.id}`);

    // Create results for template quizzes with varying scores
    for (const template of templateData) {
      // Create quiz result with a score that varies by template
      // This allows testing different performance analytics
      const scorePercentage = Math.floor(Math.random() * 50) + 50; // 50-100% score
      const totalPoints = 9 * 10; // 9 questions, average 10 points
      const earnedPoints = Math.floor(totalPoints * (scorePercentage / 100));

      // Generate responses (some correct, some incorrect)
      const responses = [];
      for (let i = 0; i < 9; i++) {
        // Determine if answer is correct based on desired score percentage
        const isCorrect = Math.random() * 100 < scorePercentage;

        responses.push({
          id: `${template.id}-response-${i + 1}`,
          questionId: `${template.id}-q${i + 1}`,
          userAnswer: isCorrect ? "Correct Answer" : "Wrong Answer",
          isCorrect,
        });
      }

      await prisma.quizResult.upsert({
        where: { id: `${template.id}-result` },
        update: {},
        create: {
          id: `${template.id}-result`,
          quizId: template.id,
          userId: testUser.id,
          score: scorePercentage,
          totalPoints,
          earnedPoints,
          timeTaken: Math.floor(Math.random() * 300) + 300, // 5-10 minutes
          completedAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ),
          responses: {
            create: responses,
          },
        },
      });

      console.log(
        `Created result for ${template.id} with score ${scorePercentage}%`
      );
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => console.log("Seed completed successfully"))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export default seedTestDatabase;
