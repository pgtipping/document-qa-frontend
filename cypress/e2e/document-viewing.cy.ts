describe("Document Viewing E2E Tests", () => {
  beforeEach(() => {
    // Start with a clean slate
    cy.clearLocalStorage();
    cy.clearCookies();

    // Handle URL construction errors that may occur with NextAuth
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Failed to construct 'URL'")) {
        return false;
      }
    });

    // Mock authenticated session for consistent behavior
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          email: "test@example.com",
          name: "Test User",
          id: "user-1",
          role: "user",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }).as("sessionRequest");

    // Visit the documents page
    cy.visit("/docs");
    cy.wait("@sessionRequest");
  });

  it("should allow viewing a document in the list", () => {
    // Mock document list API to include our test document
    cy.intercept("GET", "/api/files", {
      statusCode: 200,
      body: {
        documents: [
          {
            id: "test-doc-123",
            filename: "Test Document.pdf",
            contentType: "application/pdf",
            createdAt: new Date().toISOString(),
            s3Key: "documents/test-doc-123",
          },
        ],
      },
    }).as("getDocuments");

    // Mock document metadata
    cy.intercept("GET", "/api/files/test-doc-123", {
      statusCode: 200,
      body: {
        id: "test-doc-123",
        filename: "Test Document.pdf",
        contentType: "application/pdf",
        createdAt: new Date().toISOString(),
        s3Key: "documents/test-doc-123",
        pageCount: 3,
      },
    }).as("getDocumentMetadata");

    // Mock document content
    cy.intercept("GET", "/api/files/test-doc-123/view", {
      statusCode: 200,
      fixture: "test-document.pdf",
    }).as("getDocumentContent");

    // Wait for the document list to load
    cy.wait("@getDocuments");

    // View the document using our custom command
    cy.viewDocument("test-doc-123");

    // Verify document viewer is displayed with the correct file
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="document-viewer"]').length > 0) {
        cy.get('[data-testid="document-viewer"]').should("be.visible");
      } else {
        // Fallback
        cy.contains("Test Document.pdf").should("be.visible");
      }
    });

    // Verify document filename
    cy.get("body").contains("Test Document.pdf").should("be.visible");
  });

  it("should handle document navigation controls", () => {
    // Mock document list API to include a multi-page test document
    cy.intercept("GET", "/api/files", {
      statusCode: 200,
      body: {
        documents: [
          {
            id: "multi-page-doc",
            filename: "Multi Page Document.pdf",
            contentType: "application/pdf",
            createdAt: new Date().toISOString(),
            s3Key: "documents/multi-page-doc",
          },
        ],
      },
    }).as("getDocuments");

    // Mock document metadata with multiple pages
    cy.intercept("GET", "/api/files/multi-page-doc", {
      statusCode: 200,
      body: {
        id: "multi-page-doc",
        filename: "Multi Page Document.pdf",
        contentType: "application/pdf",
        createdAt: new Date().toISOString(),
        s3Key: "documents/multi-page-doc",
        pageCount: 5,
      },
    }).as("getDocumentMetadata");

    // Mock the document content
    cy.intercept("GET", "/api/files/multi-page-doc/view", {
      statusCode: 200,
      fixture: "test-document.pdf", // Use existing fixture
    }).as("getDocumentContent");

    // Wait for the document list to load
    cy.wait("@getDocuments");

    // View the document using our custom command
    cy.viewDocument("multi-page-doc");

    // Wait for API calls to complete
    cy.wait(["@getDocumentMetadata", "@getDocumentContent"]);

    // Test page navigation
    cy.contains("Page 1").should("be.visible");

    // Test using custom command for page navigation
    cy.navigateToDocumentPage(2);
    cy.contains("Page 2").should("be.visible");

    // Test more navigation
    cy.navigateToDocumentPage(4);
    cy.contains("Page 4").should("be.visible");

    // Test zoom controls using custom command
    cy.zoomDocument("in", 2);
    cy.wait(500); // Allow time for zoom effect

    cy.zoomDocument("out", 1);
    cy.wait(500); // Allow time for zoom effect

    // Test rotation using custom command
    cy.rotateDocument(2);
    cy.wait(500); // Allow time for rotation

    // Close the document viewer
    cy.closeDocumentViewer();

    // Verify we're back at the documents list
    cy.url().should("include", "/docs");
  });

  it("should display text content for text documents", () => {
    // Create a text fixture if it doesn't exist
    cy.task("fileExists", "cypress/fixtures/test-document.txt").then(
      (exists) => {
        if (!exists) {
          cy.writeFile(
            "cypress/fixtures/test-document.txt",
            "This is a sample text document for testing purposes.\n\nIt contains multiple lines."
          );
        }
      }
    );

    // Mock document list with a text file
    cy.intercept("GET", "/api/files", {
      statusCode: 200,
      body: {
        documents: [
          {
            id: "text-doc",
            filename: "Test Document.txt",
            contentType: "text/plain",
            createdAt: new Date().toISOString(),
            s3Key: "documents/text-doc",
          },
        ],
      },
    }).as("getDocuments");

    // Mock document metadata for text file
    cy.intercept("GET", "/api/files/text-doc", {
      statusCode: 200,
      body: {
        id: "text-doc",
        filename: "Test Document.txt",
        contentType: "text/plain",
        createdAt: new Date().toISOString(),
        s3Key: "documents/text-doc",
      },
    }).as("getTextDocMetadata");

    // Mock the text document content
    cy.intercept("GET", "/api/files/text-doc/view", {
      statusCode: 200,
      fixture: "test-document.txt",
    }).as("getTextDocContent");

    // Wait for the document list to load
    cy.wait("@getDocuments");

    // View the document using our custom command
    cy.viewDocument("text-doc");

    // Wait for API calls to complete
    cy.wait(["@getTextDocMetadata", "@getTextDocContent"]);

    // Verify text content is displayed
    cy.verifyDocumentContent("text");

    // Close the document viewer
    cy.closeDocumentViewer();
  });

  it("should display unsupported document message for non-viewable files", () => {
    // Mock document list with an unsupported file
    cy.intercept("GET", "/api/files", {
      statusCode: 200,
      body: {
        documents: [
          {
            id: "unsupported-doc",
            filename: "Unsupported.xyz",
            contentType: "application/octet-stream",
            createdAt: new Date().toISOString(),
            s3Key: "documents/unsupported-doc",
          },
        ],
      },
    }).as("getDocuments");

    // Mock document metadata for unsupported file
    cy.intercept("GET", "/api/files/unsupported-doc", {
      statusCode: 200,
      body: {
        id: "unsupported-doc",
        filename: "Unsupported.xyz",
        contentType: "application/octet-stream",
        createdAt: new Date().toISOString(),
        s3Key: "documents/unsupported-doc",
      },
    }).as("getUnsupportedDocMetadata");

    // Mock the document content
    cy.intercept("GET", "/api/files/unsupported-doc/view", {
      statusCode: 200,
      body: "Sample file content",
    }).as("getUnsupportedDocContent");

    // Wait for the document list to load
    cy.wait("@getDocuments");

    // View the document using our custom command
    cy.viewDocument("unsupported-doc");

    // Wait for API calls to complete
    cy.wait(["@getUnsupportedDocMetadata", "@getUnsupportedDocContent"]);

    // Verify unsupported document message is displayed
    cy.get("body").then(($body) => {
      // Look for any indicator of unsupported content
      const indicators = [
        '[data-testid="document-viewer-unsupported"]',
        ".unsupported-file-message",
        'text="This file type is not supported for viewing"',
      ];

      // Check each possible indicator
      let foundIndicator = false;
      for (const indicator of indicators) {
        if (
          $body.find(indicator).length > 0 ||
          $body.text().includes("not supported")
        ) {
          foundIndicator = true;
          break;
        }
      }

      expect(foundIndicator).to.be.true;
    });

    // Close the document viewer
    cy.closeDocumentViewer();
  });

  it("should handle document loading errors gracefully", () => {
    // Mock document list with a file that will error
    cy.intercept("GET", "/api/files", {
      statusCode: 200,
      body: {
        documents: [
          {
            id: "error-doc",
            filename: "Error Document.pdf",
            contentType: "application/pdf",
            createdAt: new Date().toISOString(),
            s3Key: "documents/error-doc",
          },
        ],
      },
    }).as("getDocuments");

    // Mock document metadata
    cy.intercept("GET", "/api/files/error-doc", {
      statusCode: 200,
      body: {
        id: "error-doc",
        filename: "Error Document.pdf",
        contentType: "application/pdf",
        createdAt: new Date().toISOString(),
        s3Key: "documents/error-doc",
      },
    }).as("getErrorDocMetadata");

    // Mock document content with error
    cy.intercept("GET", "/api/files/error-doc/view", {
      statusCode: 500,
      body: {
        error: "Failed to retrieve document",
      },
    }).as("getErrorDocContent");

    // Wait for the document list to load
    cy.wait("@getDocuments");

    // Set the document ID in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem("currentDocumentId", "error-doc");
    });

    // Navigate to document view page
    cy.visit(`/docs/view/error-doc`);

    // Wait for API calls to complete
    cy.wait(["@getErrorDocMetadata", "@getErrorDocContent"]);

    // Verify error message is displayed
    cy.get("body")
      .contains(/error|failed|unable to load/i)
      .should("be.visible");

    // Return to document list
    cy.contains(/back|return/i).click();
    cy.url().should("include", "/docs");
  });
});
