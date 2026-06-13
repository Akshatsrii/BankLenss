import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run tests in Node environment (not browser)
    environment: "node",

    // Test file pattern
    include: ["tests/**/*.test.js"],

    // Timeout per test (PDF parsing can be slow)
    testTimeout: 30000,

    // Show verbose output
    reporter: "verbose",

    // Coverage config (optional: run with --coverage)
    coverage: {
      provider: "v8",
      include: ["parsers/**", "utils/**"],
      exclude: ["tests/**", "index.js"],
    },
  },
});