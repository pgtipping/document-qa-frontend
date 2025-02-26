import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^lucide-react$":
      "<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js",
    "^lucide-react/(.*)$": "<rootDir>/node_modules/lucide-react/dist/cjs/$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@radix-ui|@hookform|next/dist/client)/)",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/index.{js,jsx,ts,tsx}",
  ],
  testMatch: ["**/__tests__/**/*.test.{js,jsx,ts,tsx}"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
