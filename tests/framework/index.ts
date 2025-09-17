/**
 * 🧪 Единый фреймворк тестирования - Главный экспорт
 * 
 * Предоставляет все необходимые компоненты для тестирования:
 * - TestFramework - основной фреймворк
 * - TestLogger - система логирования
 * - TestMocks - система моков
 * - TestUtils - утилиты для тестов
 */

// Основной фреймворк
export { TestFramework, testFramework } from './TestFramework'
export type { TestConfig, TestContext } from './TestFramework'

// Система логирования
export { LogLevel, TestLogger, testLogger } from './TestLogger'
export type { LogEntry, LoggerConfig } from './TestLogger'

// Система моков
export { TestMocks, testMocks } from './TestMocks'
export type { MockConfig, MockData } from './TestMocks'

// Утилиты
export { TestUtils, testUtils } from './TestUtils'
export type { TestDataGenerator, TestUtilsConfig } from './TestUtils'

// Декораторы из TestFramework
export { TestCase, TestSuite, WithMockData, WithMocks, WithPerformance, WithRetry } from './TestFramework'

// Декораторы из TestLogger
export { LogPerformance, LogStep, LogTest } from './TestLogger'

// Декораторы из TestUtils
export { WithPerformance as WithPerformanceUtils, WithRetry as WithRetryUtils } from './TestUtils'

// Хуки
export { useTestFramework } from './TestFramework'

// Утилиты для моков
export { mockUtils } from './TestFramework'

// Константы
export const TEST_CONSTANTS = {
    DEFAULT_TIMEOUT: 5000,
    DEFAULT_RETRIES: 3,
    MOCK_USER_ID: 'mock-user-1',
    MOCK_TASK_ID: 'mock-task-1',
    MOCK_SUBSCRIPTION_ID: 'mock-sub-1',
    TEST_EMAIL: 'test@example.com',
    TEST_PASSWORD: 'testpassword123'
} as const

// Предустановленные конфигурации
export const TEST_CONFIGS = {
    UNIT: {
        enableLogging: false,
        mockMode: true,
        timeout: 5000,
        retries: 1,
        parallel: false
    },
    INTEGRATION: {
        enableLogging: true,
        mockMode: true,
        timeout: 10000,
        retries: 2,
        parallel: false
    },
    E2E: {
        enableLogging: true,
        mockMode: false,
        timeout: 30000,
        retries: 3,
        parallel: true
    }
} as const

// Предустановленные моки
export const MOCK_CONFIGS = {
    MINIMAL: {
        enableAuth: true,
        enableDatabase: false,
        enableAPI: false,
        enableNavigation: false,
        enableStorage: false,
        enableNotifications: false
    },
    FULL: {
        enableAuth: true,
        enableDatabase: true,
        enableAPI: true,
        enableNavigation: true,
        enableStorage: true,
        enableNotifications: true
    },
    API_ONLY: {
        enableAuth: false,
        enableDatabase: false,
        enableAPI: true,
        enableNavigation: false,
        enableStorage: false,
        enableNotifications: false
    }
} as const

// Функции для быстрого старта
export const quickStart = {
    unit: () => {
        testFramework.updateConfig(TEST_CONFIGS.UNIT)
        testMocks.updateConfig(MOCK_CONFIGS.MINIMAL)
        testMocks.setupAllMocks()
    },

    integration: () => {
        testFramework.updateConfig(TEST_CONFIGS.INTEGRATION)
        testMocks.updateConfig(MOCK_CONFIGS.FULL)
        testMocks.setupAllMocks()
    },

    e2e: () => {
        testFramework.updateConfig(TEST_CONFIGS.E2E)
        testMocks.updateConfig(MOCK_CONFIGS.API_ONLY)
        testMocks.setupAllMocks()
    }
}

// Функции для очистки
export const cleanup = {
    all: () => {
        testMocks.clearAllMocks()
        testLogger.clear()
    },

    mocks: () => {
        testMocks.clearAllMocks()
    },

    logs: () => {
        testLogger.clear()
    }
}

// Импорты для экспорта по умолчанию
import { testFramework } from './TestFramework'
import { testLogger } from './TestLogger'
import { testMocks } from './TestMocks'
import { testUtils } from './TestUtils'

// Экспорт по умолчанию
export default {
    framework: testFramework,
    logger: testLogger,
    mocks: testMocks,
    utils: testUtils,
    constants: TEST_CONSTANTS,
    configs: TEST_CONFIGS,
    mockConfigs: MOCK_CONFIGS,
    quickStart,
    cleanup
}
