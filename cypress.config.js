const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "jppswu",
  e2e: {
    baseUrl: "http://localhost:3004",
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
