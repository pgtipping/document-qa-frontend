describe("Authentication Flows", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.visit("/");
    cy.clearLocalStorage();
    cy.clearCookies();

    // Reset any mocks between tests
    cy.intercept("/api/auth/session", { body: { user: null } }).as(
      "sessionCheck"
    );
  });

  it("should allow login with valid credentials", () => {
    // Intercept auth requests
    cy.intercept("POST", "/api/auth/signin", {
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
    }).as("loginRequest");

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

    // Navigate to login page
    cy.visit("/auth/signin");

    // Fill in credentials
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get("form").submit();

    // Verify login was successful
    cy.wait("@loginRequest");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Verify user info is displayed in UI
    cy.contains("Test User");
  });

  it("should show error with invalid credentials", () => {
    // Intercept auth request with error
    cy.intercept("POST", "/api/auth/signin", {
      statusCode: 401,
      body: {
        error: "Invalid credentials",
      },
    }).as("failedLoginRequest");

    // Navigate to login page
    cy.visit("/auth/signin");

    // Fill in credentials
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get("form").submit();

    // Verify error is displayed
    cy.wait("@failedLoginRequest");
    cy.contains("Invalid email or password");
    cy.url().should("include", "/auth/signin");
  });

  it("should allow registration with valid information", () => {
    // Intercept registration request
    cy.intercept("POST", "/api/auth/signup", {
      statusCode: 200,
      body: {
        message: "Registration successful",
        user: {
          id: "new-user-id",
          email: "new@example.com",
          name: "New User",
        },
      },
    }).as("registrationRequest");

    // Intercept session request after registration
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          email: "new@example.com",
          name: "New User",
          id: "new-user-id",
          role: "user",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }).as("sessionRequest");

    // Navigate to registration page
    cy.visit("/register");

    // Fill in registration form
    cy.get('input[name="name"]').type("New User");
    cy.get('input[name="email"]').type("new@example.com");
    cy.get('input[name="password"]').type("newpassword123");
    cy.get('input[name="confirmPassword"]').type("newpassword123");
    cy.get("form").submit();

    // Verify registration was successful
    cy.wait("@registrationRequest");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Verify user info is displayed
    cy.contains("New User");
  });

  it("should require authentication for protected routes", () => {
    // Intercept session check with no authentication
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {},
    }).as("noSessionRequest");

    // Try to access protected page
    cy.visit("/docs");

    // Should redirect to login
    cy.url().should("include", "/auth/signin");

    // Should show login required message
    cy.contains("Login required");
  });

  it("should allow logout", () => {
    // First login
    cy.login("test@example.com", "password123");

    // Intercept logout request
    cy.intercept("POST", "/api/auth/signout", {
      statusCode: 200,
      body: {
        message: "Logged out successfully",
      },
    }).as("logoutRequest");

    // Click logout
    cy.contains("Profile").click();
    cy.contains("Logout").click();

    // Verify logout
    cy.wait("@logoutRequest");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Verify login button is now visible
    cy.contains("Login");
  });

  it("Should allow a user to log in with valid credentials", () => {
    // Test with mocked authentication
    cy.login("test@example.com", "testpassword123");

    // Verify the user is redirected to the documents page
    cy.url().should("include", "/docs");

    // Verify user-specific UI elements are displayed
    cy.contains("Test User").should("be.visible");
  });

  it("Should display error message with invalid credentials", () => {
    // Visit the login page
    cy.visit("/auth/signin");

    // Intercept the login request and return an error
    cy.intercept("POST", "/api/auth/callback/credentials", {
      statusCode: 401,
      body: {
        error: "Invalid credentials",
      },
    }).as("failedLogin");

    // Submit invalid credentials
    cy.get('input[name="email"]').type("wrong@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get("form").submit();

    // Wait for the request to complete
    cy.wait("@failedLogin");

    // Verify error message is displayed
    cy.contains("Invalid credentials").should("be.visible");

    // Verify we're still on the login page
    cy.url().should("include", "/auth/signin");
  });

  it("Should allow a user to log out", () => {
    // Log in first
    cy.login("test@example.com", "testpassword123");

    // Intercept the logout request
    cy.intercept("POST", "/api/auth/signout", {
      statusCode: 200,
      body: {},
    }).as("logoutRequest");

    // Click the logout button (adjust the selector based on your UI)
    cy.get('[data-testid="user-menu-button"]').click();
    cy.contains("Sign out").click();

    // Wait for the logout request
    cy.wait("@logoutRequest");

    // Verify redirect to login page
    cy.url().should("include", "/auth/signin");
  });

  it("Should redirect unauthenticated users to login page", () => {
    // Ensure no user is authenticated
    cy.intercept("/api/auth/session", {
      statusCode: 200,
      body: { user: null },
    }).as("noSession");

    // Try to access a protected page
    cy.visit("/docs");

    // Should be redirected to login
    cy.url().should("include", "/auth/signin");
  });
});
