import {
  quizTemplates,
  getTemplateById,
  getAllTemplates,
  getRecommendedTemplates,
  QuizTemplate,
  QuestionTypeDistribution,
} from "@/lib/quiz-templates";

describe("Quiz Templates Utilities", () => {
  describe("getTemplateById", () => {
    it("should return the correct template when a valid ID is provided", () => {
      const template = getTemplateById("technical");
      expect(template).not.toBeNull();
      expect(template?.id).toBe("technical");
      expect(template?.name).toBe("Technical Document");
    });

    it("should return null when an invalid ID is provided", () => {
      const template = getTemplateById("nonexistent");
      expect(template).toBeNull();
    });
  });

  describe("getAllTemplates", () => {
    it("should return all available templates", () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(quizTemplates.length);

      // Check if all expected template IDs are present
      const templateIds = templates.map((t) => t.id);
      expect(templateIds).toContain("general");
      expect(templateIds).toContain("academic");
      expect(templateIds).toContain("technical");
      expect(templateIds).toContain("business");
      expect(templateIds).toContain("narrative");
    });
  });

  describe("getRecommendedTemplates", () => {
    it("should recommend academic templates for research documents", () => {
      const filenames = [
        "research-paper.pdf",
        "academic-study.docx",
        "thesis-draft.pdf",
        "dissertation.tex",
        "Scientific_Paper_v2.pdf",
      ];

      filenames.forEach((filename) => {
        const recommendedTemplates = getRecommendedTemplates(filename);
        expect(recommendedTemplates[0].id).toBe("academic");
      });
    });

    it("should recommend technical templates for technical documents", () => {
      const filenames = [
        "technical-specification.pdf",
        "user-manual.docx",
        "api-documentation.md",
        "system-guide.rst",
        "code_implementation.pdf",
      ];

      filenames.forEach((filename) => {
        const recommendedTemplates = getRecommendedTemplates(filename);
        expect(recommendedTemplates[0].id).toBe("technical");
      });
    });

    it("should recommend business templates for business documents", () => {
      const filenames = [
        "business-plan.pdf",
        "quarterly-report.docx",
        "case-study.pdf",
        "financial-proposal.pptx",
        "market-analysis.xlsx",
      ];

      filenames.forEach((filename) => {
        const recommendedTemplates = getRecommendedTemplates(filename);
        expect(recommendedTemplates[0].id).toBe("business");
      });
    });

    it("should recommend narrative templates for literary documents", () => {
      const filenames = [
        "short-story.pdf",
        "essay-draft.docx",
        "novel-chapter.pdf",
        "literature-review.docx",
        "book.epub",
      ];

      filenames.forEach((filename) => {
        const recommendedTemplates = getRecommendedTemplates(filename);
        expect(recommendedTemplates[0].id).toBe("narrative");
      });
    });

    it("should default to general template when document type is ambiguous", () => {
      const filenames = [
        "document.pdf",
        "untitled.docx",
        "file123.pdf",
        "scan1.pdf",
        "",
      ];

      filenames.forEach((filename) => {
        const recommendedTemplates = getRecommendedTemplates(filename);
        expect(recommendedTemplates[0].id).toBe("general");
      });
    });

    it("should always include general template as a fallback in recommendations", () => {
      // Test with various file types
      const filenames = [
        "research-paper.pdf", // academic
        "technical-manual.pdf", // technical
        "business-report.pdf", // business
        "novel.epub", // narrative
        "document.pdf", // generic
      ];

      filenames.forEach((filename) => {
        const recommendedTemplates = getRecommendedTemplates(filename);

        // Second template should always be general (except when general is first)
        if (
          recommendedTemplates.length > 1 &&
          recommendedTemplates[0].id !== "general"
        ) {
          expect(recommendedTemplates[1].id).toBe("general");
        }
      });
    });

    it("should be case insensitive when matching document types", () => {
      // Test with various casings
      const testCases = [
        { filename: "RESEARCH-PAPER.PDF", expectedTemplate: "academic" },
        { filename: "Technical-Manual.PDF", expectedTemplate: "technical" },
        { filename: "business-REPORT.docx", expectedTemplate: "business" },
        { filename: "Novel.EPUB", expectedTemplate: "narrative" },
      ];

      testCases.forEach((testCase) => {
        const recommendedTemplates = getRecommendedTemplates(testCase.filename);
        expect(recommendedTemplates[0].id).toBe(testCase.expectedTemplate);
      });
    });
  });

  // Test template structure
  describe("template structure", () => {
    it("should have consistent structure for all templates", () => {
      const templates = getAllTemplates();

      templates.forEach((template) => {
        // Check for required properties
        expect(template).toHaveProperty("id");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("description");
        expect(template).toHaveProperty("documentTypes");
        expect(template).toHaveProperty("icon");
        expect(template).toHaveProperty("promptModifier");
        expect(template).toHaveProperty("questionTypes");
        expect(template).toHaveProperty("focusAreas");
        expect(template).toHaveProperty("exampleQuestions");

        // Check question type distribution
        expect(template.questionTypes).toHaveProperty("multipleChoice");
        expect(template.questionTypes).toHaveProperty("trueFalse");
        expect(template.questionTypes).toHaveProperty("shortAnswer");

        // Validate distribution percentages sum to 100
        const total =
          template.questionTypes.multipleChoice +
          template.questionTypes.trueFalse +
          template.questionTypes.shortAnswer;
        expect(total).toBe(100);
      });
    });
  });
});
