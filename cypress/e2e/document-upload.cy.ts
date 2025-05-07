describe("Document Upload Flow", () => {
  beforeEach(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();

    // Handle URL construction errors that may occur with NextAuth
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Failed to construct 'URL'")) {
        return false;
      }
    });
  });

  it("should show login prompt when not authenticated", () => {
    // Mock session check with no authentication
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {},
    }).as("noSessionRequest");

    // Visit docs page
    cy.visit("/docs");

    // Document upload should show login prompt
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="document-upload-container"]').length > 0) {
        cy.get('[data-testid="document-upload-container"]')
          .should("be.visible")
          .should("contain", "Please")
          .should("contain", "log in");
      } else {
        // Fallback for older versions without data-testid
        cy.contains("Please log in").should("be.visible");
      }
    });
  });

  it("should allow uploading a document when authenticated", () => {
    // Mock authenticated session
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

    // Setup document upload mock response
    cy.mockDocumentUpload("test-document-1");

    // Visit docs page
    cy.visit("/docs");
    cy.wait("@sessionRequest");

    // Check for test file fixture and create it if it doesn't exist
    cy.task("fileExists", "cypress/fixtures/test-document.pdf").then(
      (exists) => {
        if (!exists) {
          cy.writeFile(
            "cypress/fixtures/test-document.pdf",
            "%PDF-1.5 Test Document Content"
          );
        }
      }
    );

    // Upload document using custom command
    cy.uploadDocument("test-document.pdf", {
      fileName: "test-file.pdf",
      fileType: "application/pdf",
      fileSize: 1024 * 100, // 100KB
    });

    // Verify document upload was successful
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="document-file-details"]').length > 0) {
        cy.get('[data-testid="document-file-details"]').should("be.visible");
        cy.get('[data-testid="document-file-name"]').should(
          "contain",
          "test-file.pdf"
        );
      } else {
        // Fallback
        cy.contains("test-file.pdf").should("be.visible");
      }
    });

    // Local storage should contain the document ID
    cy.window()
      .its("localStorage")
      .invoke("getItem", "currentDocumentId")
      .should("eq", "test-document-1");
  });

  it("should allow removing an uploaded document", () => {
    // Mock authenticated session
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

    // Setup document upload mock
    cy.mockDocumentUpload("test-document-1");

    // Visit docs page
    cy.visit("/docs");
    cy.wait("@sessionRequest");

    // Upload document
    cy.uploadDocument("test-document.pdf");

    // Verify file is visible
    cy.verifyDocumentUploaded("test-document.pdf");

    // Remove the document using custom command
    cy.removeDocument();

    // Verify file is removed - details should no longer be visible
    cy.get('[data-testid="document-file-details"]').should("not.exist");

    // Local storage should no longer contain the document ID
    cy.window()
      .its("localStorage")
      .invoke("getItem", "currentDocumentId")
      .should("be.null");
  });

  it("should show error message for invalid file type", () => {
    // Mock authenticated session
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

    // Mock error response for invalid file type
    cy.intercept("POST", "/api/upload", {
      statusCode: 400,
      body: {
        error:
          "Invalid file type. Only PDF, DOCX, DOC, and TXT files are supported.",
      },
    }).as("invalidFileUpload");

    // Visit docs page
    cy.visit("/docs");
    cy.wait("@sessionRequest");

    // Check for test file fixture and create it if it doesn't exist
    cy.task("fileExists", "cypress/fixtures/invalid-file.json").then(
      (exists) => {
        if (!exists) {
          cy.writeFile(
            "cypress/fixtures/invalid-file.json",
            JSON.stringify({ test: "content" })
          );
        }
      }
    );

    // Try uploading invalid file type
    cy.fixture("invalid-file.json", null).then((fileContent) => {
      const testFile = new File([fileContent], "invalid-file.json", {
        type: "application/json",
      });

      // Use resilient selectors to find the upload dropzone
      cy.get('[data-testid="document-upload-dropzone"]').then((subject) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);

        const event = { dataTransfer };
        cy.wrap(subject).trigger("drop", event);
      });
    });

    // Wait for API call
    cy.wait("@invalidFileUpload");

    // Check for error toast
    cy.contains("Invalid file type").should("be.visible");
  });

  it("should show error message for file too large", () => {
    // Mock authenticated session
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

    // Mock error response for file too large
    cy.intercept("POST", "/api/upload", {
      statusCode: 413,
      body: {
        error: "File too large. Maximum file size is 10MB.",
      },
    }).as("fileTooLargeUpload");

    // Visit docs page
    cy.visit("/docs");
    cy.wait("@sessionRequest");

    // Create a mock file that is too large
    // Note: We can't actually create a 10MB+ file easily in tests,
    // so we'll mock the file size and server response
    cy.fixture("test-document.pdf", null).then((fileContent) => {
      const testFile = new File([fileContent], "large-file.pdf", {
        type: "application/pdf",
      });
      // Mock a file size larger than the limit
      Object.defineProperty(testFile, "size", { value: 15 * 1024 * 1024 }); // 15MB

      cy.get('[data-testid="document-upload-dropzone"]').then((subject) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);

        const event = { dataTransfer };
        cy.wrap(subject).trigger("drop", event);
      });
    });

    // Wait for API call
    cy.wait("@fileTooLargeUpload");

    // Check for error toast
    cy.contains("File Too Large").should("be.visible");
  });
});
