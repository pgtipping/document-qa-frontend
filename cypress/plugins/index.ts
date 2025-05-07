import { promises as fs } from "fs";
import * as path from "path";

// Check if files exist and create them if they don't
async function ensureFileExists(
  filepath: string,
  defaultContent: string = "Test file content"
): Promise<boolean> {
  try {
    try {
      await fs.access(filepath);
      return true; // File exists
    } catch {
      // Ensure the directory exists
      const dirname = path.dirname(filepath);
      try {
        await fs.mkdir(dirname, { recursive: true });
      } catch (err) {
        console.error(`Error creating directory ${dirname}:`, err);
      }

      // Create the file with default content
      await fs.writeFile(filepath, defaultContent);
      return true; // File created
    }
  } catch (err) {
    console.error(`Error ensuring file ${filepath} exists:`, err);
    return false;
  }
}

export default (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) => {
  // ... existing code ...

  on("task", {
    // ... existing tasks ...

    // Check if a file exists and create it if needed
    async fileExists({
      filepath,
      defaultContent = "Test file content",
    }: {
      filepath: string;
      defaultContent?: string;
    }) {
      const fullPath = path.join(config.fixturesFolder, filepath);
      return ensureFileExists(fullPath, defaultContent);
    },

    // Create all required document test fixtures
    async createDocumentFixtures() {
      const fixturesDir = path.join(config.fixturesFolder, "documents");

      // Define the fixtures needed for document viewing tests
      const fixtures = [
        {
          name: "test-document.pdf",
          content:
            "%PDF-1.3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 73 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Test PDF Document for Cypress Tests) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000200 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n324\n%%EOF",
        },
        {
          name: "multi-page-document.pdf",
          content:
            "%PDF-1.3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R 6 0 R 7 0 R] /Count 5 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 8 0 R >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 9 0 R >>\nendobj\n5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 10 0 R >>\nendobj\n6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 11 0 R >>\nendobj\n7 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 12 0 R >>\nendobj\n8 0 obj\n<< /Length 63 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Multi-Page Test Document - Page 1) Tj\nET\nendstream\nendobj\n9 0 obj\n<< /Length 63 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Multi-Page Test Document - Page 2) Tj\nET\nendstream\nendobj\n10 0 obj\n<< /Length 63 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Multi-Page Test Document - Page 3) Tj\nET\nendstream\nendobj\n11 0 obj\n<< /Length 63 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Multi-Page Test Document - Page 4) Tj\nET\nendstream\nendobj\n12 0 obj\n<< /Length 63 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Multi-Page Test Document - Page 5) Tj\nET\nendstream\nendobj\nxref\n0 13\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000145 00000 n\n0000000230 00000 n\n0000000315 00000 n\n0000000401 00000 n\n0000000487 00000 n\n0000000573 00000 n\n0000000685 00000 n\n0000000797 00000 n\n0000000910 00000 n\n0000001023 00000 n\ntrailer\n<< /Size 13 /Root 1 0 R >>\nstartxref\n1136\n%%EOF",
        },
        {
          name: "sample-text-document.txt",
          content:
            "This is a sample text document for testing the document viewer component.\n\nLine 1: Testing text rendering\nLine 2: Making sure scrolling works\nLine 3: Ensuring proper styling\n\nThe document viewer should handle this plain text file correctly.",
        },
      ];

      // Create all fixtures
      const results = await Promise.all(
        fixtures.map(async (fixture) => {
          const fullPath = path.join(fixturesDir, fixture.name);
          return {
            name: fixture.name,
            created: await ensureFileExists(fullPath, fixture.content),
          };
        })
      );

      return results;
    },
  });

  // ... existing code ...

  return config;
};
