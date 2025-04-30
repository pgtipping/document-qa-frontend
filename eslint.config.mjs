import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals"; // Import globals

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Apply Next.js recommended rules
  ...compat.extends("next/core-web-vitals"),

  // Add explicit language options for common file types
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], // Target relevant files
    languageOptions: {
      globals: {
        ...globals.browser, // Standard browser globals
        ...globals.node, // Standard Node.js globals
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Ensure JSX is enabled
        },
      },
    },
    // Specific rules can be added here if needed
    // rules: { ... }
  },
];

export default eslintConfig;
