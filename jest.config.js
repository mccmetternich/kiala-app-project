const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Use node environment for API tests
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock ESM modules that cause issues
    '^nanoid$': '<rootDir>/src/__mocks__/nanoid.ts',
    '^uuid$': '<rootDir>/src/__mocks__/uuid.ts',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  // Transform ESM modules
  transformIgnorePatterns: [
    '/node_modules/(?!(nanoid|uuid)/)',
  ],
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration asynchronously
module.exports = createJestConfig(customJestConfig);