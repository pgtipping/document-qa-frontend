declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-testid attribute.
       * @example cy.getByTestId('greeting')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to log in programmatically
       * @example cy.login('test@example.com', 'password123')
       */
      login(email?: string, password?: string): Chainable<void>;

      /**
       * Custom command to log out
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command for uploading a document with resilient selectors
       * @example cy.uploadDocument('test-document.pdf')
       */
      uploadDocument(
        fixturePath: string,
        options?: { fileName?: string; fileType?: string }
      ): Chainable<void>;

      /**
       * Custom command for removing an uploaded document with resilient selectors
       * @example cy.removeDocument()
       */
      removeDocument(): Chainable<void>;

      /**
       * Custom command for verifying a document was uploaded with resilient selectors
       * @example cy.verifyDocumentUploaded('test-document.pdf')
       */
      verifyDocumentUploaded(fileName: string): Chainable<void>;

      /**
       * Custom command for mocking document upload API response
       * @example cy.mockDocumentUpload('doc-123')
       */
      mockDocumentUpload(responseId: string): Chainable<void>;

      /**
       * Opens a document for viewing
       * @example cy.viewDocument('doc-123')
       */
      viewDocument(documentId: string): Chainable<void>;

      /**
       * Navigates to a specific page in the document
       * @example cy.navigateToDocumentPage(2)
       */
      navigateToDocumentPage(pageNumber: number): Chainable<void>;

      /**
       * Changes the zoom level of the document
       * @example cy.zoomDocument('in', 2)
       */
      zoomDocument(action: "in" | "out", times?: number): Chainable<void>;

      /**
       * Rotates the document
       * @example cy.rotateDocument(2)
       */
      rotateDocument(times?: number): Chainable<void>;

      /**
       * Closes the document viewer
       * @example cy.closeDocumentViewer()
       */
      closeDocumentViewer(): Chainable<void>;

      /**
       * Verifies document content is displayed correctly
       * @example cy.verifyDocumentContent('pdf')
       */
      verifyDocumentContent(documentType: string): Chainable<void>;
    }
  }
}
