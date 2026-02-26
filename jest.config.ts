import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/app/api/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
};

// next/jest adds transformIgnorePatterns that block MSW ESM.
// We wrap the config to fix this after next/jest resolves.
const baseConfig = createJestConfig(config);

export default async function () {
  const resolved = await baseConfig();
  // Replace next/jest's transformIgnorePatterns to also allow msw/@mswjs
  resolved.transformIgnorePatterns = [
    "/node_modules/(?!.pnpm)(?!(msw|@mswjs|until-async|geist)/)",
    "/node_modules/.pnpm/(?!(msw|@mswjs|until-async|geist)@)",
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return resolved;
}
