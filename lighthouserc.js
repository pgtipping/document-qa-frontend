module.exports = {
  ci: {
    collect: {
      // Specify pages to run Lighthouse on
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/docs",
        "http://localhost:3000/quiz/new",
      ],
      startServerCommand: "npm run start",
      numberOfRuns: 3, // Run Lighthouse multiple times for more consistent results
    },
    upload: {
      target: "temporary-public-storage", // Upload reports to temporary storage
    },
    assert: {
      // Add performance score thresholds
      // (Consider setting low thresholds initially and increasing gradually)
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // Core Web Vitals thresholds
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 200 }],

        // Disable some assertions that might be too strict initially
        "uses-responsive-images": "off",
        "unsized-images": "off",
        "unused-javascript": "off",
        "unused-css-rules": "off",
        "no-vulnerable-libraries": "off",
      },
    },
  },
};
