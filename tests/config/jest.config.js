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
  setupFilesAfterEnv: ['<rootDir>/../../tests/setup.ts'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/../../src/$1',
    // Моки для модулей
    '^next/navigation$': '<rootDir>/../../tests/__mocks__/next/navigation.ts',
    '^next/router$': '<rootDir>/../../tests/__mocks__/next/router.ts',
    '^@/lib/supabase$': '<rootDir>/../../tests/__mocks__/@/lib/supabase.ts',
    '^@/lib/auth$': '<rootDir>/../../tests/__mocks__/@/lib/auth.ts',
    // Фреймворк тестирования
    '^@/tests/framework$': '<rootDir>/../../tests/framework/index.ts',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/../../tests/unit/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/../../tests/integration/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/../../tests/e2e/',
    '<rootDir>/../../.next/',
    '<rootDir>/../../node_modules/'
  ],
  "transformIgnorePatterns": [
    "/node_modules/"
  ],
  // Увеличиваем таймаут для API тестов
  testTimeout: 15000,
  // Переменные окружения для тестов
  setupFiles: ['<rootDir>/../../tests/setup-env.js'],
  // TypeScript конфигурация для тестов (используем next/jest)
  // preset и transform настраиваются автоматически через next/jest
  // Настройки покрытия кода
  collectCoverageFrom: [
    '../../src/**/*.{js,jsx,ts,tsx}',
    '!../../src/**/*.d.ts',
    '!../../src/**/*.stories.{js,jsx,ts,tsx}',
    '!../../src/**/index.{js,jsx,ts,tsx}'
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