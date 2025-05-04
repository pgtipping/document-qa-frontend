// Quiz Template Definitions
// This file defines the structure and available templates for quiz generation

/**
 * Quiz Template interface
 * Represents the structure of a quiz template
 */
export interface QuizTemplate {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Template description
  documentTypes: string[]; // Document types this template is suited for
  icon: string; // Icon to display (Lucide icon name)
  promptModifier: string; // LLM prompt modification to apply
  questionTypes: QuestionTypeDistribution; // Question type distribution
  focusAreas: string[]; // Specific areas to focus on
  exampleQuestions: string[]; // Example questions to guide generation
}

/**
 * Question type distribution
 * Defines how many questions of each type should be generated
 */
export interface QuestionTypeDistribution {
  multipleChoice: number; // Percentage (0-100)
  trueFalse: number; // Percentage (0-100)
  shortAnswer: number; // Percentage (0-100)
}

/**
 * Predefined quiz templates
 */
export const quizTemplates: QuizTemplate[] = [
  {
    id: "general",
    name: "General Knowledge",
    description:
      "Balanced mix of questions covering the main points of any document type",
    documentTypes: ["any"],
    icon: "Book",
    promptModifier:
      "Focus on the main concepts and key facts presented in the document.",
    questionTypes: {
      multipleChoice: 60,
      trueFalse: 20,
      shortAnswer: 20,
    },
    focusAreas: ["Main concepts", "Key facts", "Important details"],
    exampleQuestions: [
      "What is the main thesis of this document?",
      "Which of the following best summarizes the author's perspective?",
      "What evidence supports the main argument?",
    ],
  },
  {
    id: "academic",
    name: "Academic Paper",
    description:
      "Specifically designed for scholarly articles and research papers",
    documentTypes: ["research", "academic", "scientific"],
    icon: "GraduationCap",
    promptModifier:
      "Focus on the methodology, findings, and implications of the research presented. Include questions about the experimental design, data analysis, and conclusions.",
    questionTypes: {
      multipleChoice: 50,
      trueFalse: 20,
      shortAnswer: 30,
    },
    focusAreas: [
      "Methodology",
      "Findings",
      "Research implications",
      "Literature review",
      "Data analysis",
    ],
    exampleQuestions: [
      "What research method was used in this study?",
      "Which of the following best describes the study's findings?",
      "How did the researchers address potential limitations in their study?",
    ],
  },
  {
    id: "technical",
    name: "Technical Document",
    description: "For technical documentation, manuals, and specifications",
    documentTypes: ["technical", "manual", "documentation"],
    icon: "Code",
    promptModifier:
      "Focus on technical specifications, procedures, and implementation details. Favor precision and technical accuracy in the questions.",
    questionTypes: {
      multipleChoice: 70,
      trueFalse: 20,
      shortAnswer: 10,
    },
    focusAreas: [
      "Technical specifications",
      "Procedures",
      "Implementation details",
      "System requirements",
      "Best practices",
    ],
    exampleQuestions: [
      "What is the correct sequence for implementing this procedure?",
      "Which component is responsible for handling this function?",
      "What would happen if this step was omitted from the process?",
    ],
  },
  {
    id: "business",
    name: "Business Document",
    description: "For business plans, reports, and case studies",
    documentTypes: ["business", "report", "case study"],
    icon: "BarChart",
    promptModifier:
      "Focus on business metrics, strategies, market analysis, and financial implications. Include questions about business processes and strategic decisions.",
    questionTypes: {
      multipleChoice: 50,
      trueFalse: 20,
      shortAnswer: 30,
    },
    focusAreas: [
      "Business strategy",
      "Market analysis",
      "Financial data",
      "Competitive landscape",
      "Growth projections",
    ],
    exampleQuestions: [
      "What growth strategy is being proposed in this document?",
      "Which market segment is identified as having the highest potential?",
      "What are the key performance indicators mentioned in this report?",
    ],
  },
  {
    id: "narrative",
    name: "Narrative Text",
    description: "For stories, essays, and literary works",
    documentTypes: ["narrative", "essay", "literature"],
    icon: "BookOpen",
    promptModifier:
      "Focus on plot elements, character analysis, themes, and literary devices. Ask questions that probe understanding of the narrative structure and authorial intent.",
    questionTypes: {
      multipleChoice: 40,
      trueFalse: 20,
      shortAnswer: 40,
    },
    focusAreas: [
      "Plot development",
      "Character motivation",
      "Themes",
      "Symbolism",
      "Narrative structure",
    ],
    exampleQuestions: [
      "What motivates the protagonist's actions in the story?",
      "Which theme is most prominently explored in this text?",
      "How does the author's use of symbolism contribute to the overall meaning?",
    ],
  },
];

/**
 * Get a quiz template by ID
 * @param id Template ID
 * @returns The template or null if not found
 */
export function getTemplateById(id: string): QuizTemplate | null {
  return quizTemplates.find((template) => template.id === id) || null;
}

/**
 * Get all quiz templates
 * @returns Array of all quiz templates
 */
export function getAllTemplates(): QuizTemplate[] {
  return quizTemplates;
}

/**
 * Get recommended templates for a document based on its filename
 * @param filename Document filename
 * @returns Array of recommended templates
 */
export function getRecommendedTemplates(filename: string): QuizTemplate[] {
  const lowerFilename = filename.toLowerCase();
  const fileExtension = lowerFilename.split(".").pop() || "";

  // Default to general if we can't determine
  if (!filename) {
    return [getTemplateById("general")!];
  }

  // Academic/research papers
  if (
    lowerFilename.includes("research") ||
    lowerFilename.includes("study") ||
    lowerFilename.includes("paper") ||
    lowerFilename.includes("thesis") ||
    lowerFilename.includes("dissertation") ||
    fileExtension === "tex"
  ) {
    return [getTemplateById("academic")!, getTemplateById("general")!];
  }

  // Technical documents
  if (
    lowerFilename.includes("technical") ||
    lowerFilename.includes("manual") ||
    lowerFilename.includes("guide") ||
    lowerFilename.includes("documentation") ||
    lowerFilename.includes("specification") ||
    fileExtension === "md" ||
    fileExtension === "rst"
  ) {
    return [getTemplateById("technical")!, getTemplateById("general")!];
  }

  // Business documents
  if (
    lowerFilename.includes("business") ||
    lowerFilename.includes("report") ||
    lowerFilename.includes("plan") ||
    lowerFilename.includes("case study") ||
    lowerFilename.includes("proposal") ||
    lowerFilename.includes("financial")
  ) {
    return [getTemplateById("business")!, getTemplateById("general")!];
  }

  // Narrative text
  if (
    lowerFilename.includes("story") ||
    lowerFilename.includes("essay") ||
    lowerFilename.includes("novel") ||
    lowerFilename.includes("chapter") ||
    lowerFilename.includes("literature") ||
    fileExtension === "epub" ||
    fileExtension === "lit"
  ) {
    return [getTemplateById("narrative")!, getTemplateById("general")!];
  }

  // Default to general
  return [getTemplateById("general")!];
}
