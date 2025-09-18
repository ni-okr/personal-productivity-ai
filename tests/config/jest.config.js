const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
  // Загружаем .env.test для тестов
  env: {
    NODE_ENV: 'test',
  }
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    // Map lib mock imports to tests/mocks first
    '^@/lib/(.*-mock)$': '<rootDir>/tests/mocks/$1',
    // Map tests alias to tests directory
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    // Map framework alias
    '^@/tests/framework$': '<rootDir>/tests/framework/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    // Only run tests in the new centralized framework
    '<rootDir>/tests/framework/**/*.(test|spec).(ts)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/unit/',
    '<rootDir>/tests/integration/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  "transformIgnorePatterns": [
    "/node_modules/"
  ],
  // Увеличиваем таймаут для API тестов
  testTimeout: 15000,
  // Переменные окружения для тестов
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  // TypeScript конфигурация для тестов (используем next/jest)
  // preset и transform настраиваются автоматически через next/jest
  // Настройки покрытия кода
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)