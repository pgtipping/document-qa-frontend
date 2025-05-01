import globals from "globals"; // Import globals
import nextPlugin from "@next/eslint-plugin-next"; // Import the Next.js ESLint plugin
import tsParser from "@typescript-eslint/parser"; // Import the TypeScript parser
import tsPlugin from "@typescript-eslint/eslint-plugin"; // Import the TypeScript plugin

// Helper function to trim keys in an object
const trimGlobalKeys = (globalsObj) =>
  Object.entries(globalsObj).reduce((acc, [key, value]) => {
    acc[key.trim()] = value;
    return acc;
  }, {});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Explicitly configure the Next.js plugin
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], // Apply to relevant files
    plugins: {
      "@next/next": nextPlugin, // Define the plugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules, // Spread the recommended rules
      // ...nextPlugin.configs['core-web-vitals'].rules, // Optionally add core-web-vitals rules if needed and available
    },
  },

  // Configure TypeScript files
  {
    files: ["**/*.{ts,tsx,mtsx}"], // Target only TypeScript files
    languageOptions: {
      parser: tsParser, // Use the TypeScript parser
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json", // Point to your tsconfig for type-aware linting
      },
      globals: {
        ...trimGlobalKeys(globals.browser),
        ...trimGlobalKeys(globals.node),
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin, // Add the TypeScript plugin
    },
    rules: {
      ...tsPlugin.configs["eslint-recommended"].rules, // Base recommended ESLint rules for TS
      ...tsPlugin.configs["recommended"].rules, // Recommended TS-specific rules
      // ...tsPlugin.configs['recommended-requiring-type-checking'].rules, // Optional: Stricter type-aware rules
      // Add any specific rule overrides here
      "@typescript-eslint/no-unused-vars": [
        "error", // or "warn"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Configure JavaScript/JSX files (if needed separately, otherwise handled by Next.js config)
  // {
  //   files: ["**/*.{js,mjs,cjs,jsx,mjsx}"],
  //   languageOptions: {
  //     globals: {
  //       ...trimGlobalKeys(globals.browser),
  //       ...trimGlobalKeys(globals.node),
  //     },
  //     parserOptions: {
  //       ecmaFeatures: { jsx: true },
  //       ecmaVersion: "latest",
  //       sourceType: "module",
  //     },
  //   },
  // },
];

export default eslintConfig;
