/**
 * 🧪 Personal Productivity AI - Единый фреймворк тестирования
 * 
 * Обеспечивает:
 * - Единообразное логирование
 * - Автоматическую настройку моков
 * - Гибкое масштабирование
 * - Стандартизированные утилиты
 */

import { render, RenderOptions, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

// Типы для фреймворка
export interface TestConfig {
    enableLogging?: boolean
    mockMode?: boolean
    timeout?: number
    retries?: number
    parallel?: boolean
}

export interface TestLogger {
    info: (message: string, data?: any) => void
    warn: (message: string, data?: any) => void
    error: (message: string, data?: any) => void
    debug: (message: string, data?: any) => void
    test: (testName: string, status: 'start' | 'pass' | 'fail', duration?: number) => void
}

export interface MockConfig {
    auth?: boolean
    database?: boolean
    api?: boolean
    navigation?: boolean
    storage?: boolean
}

export interface TestSuite {
    name: string
    config: TestConfig
    mocks: MockConfig
    setup: () => Promise<void> | void
    teardown: () => Promise<void> | void
    tests: TestCase[]
}

export interface TestCase {
    name: string
    description?: string
    timeout?: number
    retries?: number
    skip?: boolean
    only?: boolean
    run: (context: TestContext) => Promise<void> | void
}

export interface TestContext {
    logger: TestLogger
    config: TestConfig
    mocks: MockConfig
    utils: TestUtils
}

export interface TestUtils {
    renderWithProviders: <T extends ReactElement>(ui: T, options?: RenderOptions) => any
    waitForState: <T>(stateGetter: () => T, expectedValue: T, timeout?: number) => Promise<void>
    mockApiResponse: (endpoint: string, response: any, delay?: number) => void
    mockAuthUser: (user: any) => void
    clearAllMocks: () => void
    generateTestData: (type: string, overrides?: any) => any
}

// Глобальная конфигурация фреймворка
class TestFramework {
    private static instance: TestFramework
    private config: TestConfig
    private logger: TestLogger
    private mocks: MockConfig
    private utils: TestUtils

    private constructor() {
        this.config = {
            enableLogging: process.env.NODE_ENV === 'test',
            mockMode: process.env.NEXT_PUBLIC_DISABLE_EMAIL === 'true',
            timeout: 15000,
            retries: 3,
            parallel: false
        }

        this.logger = this.createLogger()
        this.mocks = {
            auth: true,
            database: true,
            api: true,
            navigation: true,
            storage: true
        }

        this.utils = this.createUtils()
    }

    public static getInstance(): TestFramework {
        if (!TestFramework.instance) {
            TestFramework.instance = new TestFramework()
        }
        return TestFramework.instance
    }

    private createLogger(): TestLogger {
        const isVerbose = process.env.VERBOSE_TESTS === 'true'
        const isDebug = process.env.DEBUG_TESTS === 'true'

        return {
            info: (message: string, data?: any) => {
                if (isVerbose || isDebug) {
                    console.log(`ℹ️  [TEST] ${message}`, data ? JSON.stringify(data, null, 2) : '')
                }
            },
            warn: (message: string, data?: any) => {
                if (isVerbose || isDebug) {
                    console.warn(`⚠️  [TEST] ${message}`, data ? JSON.stringify(data, null, 2) : '')
                }
            },
            error: (message: string, data?: any) => {
                console.error(`❌ [TEST] ${message}`, data ? JSON.stringify(data, null, 2) : '')
            },
            debug: (message: string, data?: any) => {
                if (isDebug) {
                    console.debug(`🐛 [TEST] ${message}`, data ? JSON.stringify(data, null, 2) : '')
                }
            },
            test: (testName: string, status: 'start' | 'pass' | 'fail', duration?: number) => {
                const durationStr = duration ? ` (${duration}ms)` : ''
                const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '🔄'
                console.log(`${statusIcon} [TEST] ${testName}${durationStr}`)
            }
        }
    }

    private createUtils(): TestUtils {
        return {
            renderWithProviders: <T extends ReactElement>(ui: T, options?: RenderOptions) => {
                this.logger.debug('Rendering component with providers', { component: ui.type })
                return render(ui, options)
            },

            waitForState: async <T>(stateGetter: () => T, expectedValue: T, timeout = 5000) => {
                this.logger.debug('Waiting for state change', { expectedValue })
                await waitFor(() => {
                    const currentValue = stateGetter()
                    expect(currentValue).toEqual(expectedValue)
                }, { timeout })
            },

            mockApiResponse: (endpoint: string, response: any, delay = 0) => {
                this.logger.debug('Mocking API response', { endpoint, response, delay })
                // Реализация мока API
                global.fetch = jest.fn().mockImplementation((url: string) => {
                    if (url.includes(endpoint)) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve(response)
                        })
                    }
                    return Promise.resolve({
                        ok: false,
                        status: 404
                    })
                })
            },

            mockAuthUser: (user: any) => {
                this.logger.debug('Mocking auth user', { user })
                // Реализация мока пользователя
                if (this.mocks.auth) {
                    // Логика мока пользователя
                }
            },

            clearAllMocks: () => {
                this.logger.debug('Clearing all mocks')
                jest.clearAllMocks()
                // Очистка всех моков
            },

            generateTestData: (type: string, overrides: any = {}) => {
                this.logger.debug('Generating test data', { type, overrides })

                const baseData = {
                    user: {
                        id: 'test-user-id',
                        email: 'test@example.com',
                        name: 'Test User'
                    },
                    task: {
                        id: 'test-task-id',
                        title: 'Test Task',
                        description: 'Test Description',
                        priority: 'medium',
                        status: 'todo'
                    },
                    subscription: {
                        id: 'test-sub-id',
                        userId: 'test-user-id',
                        tier: 'free',
                        status: 'active'
                    }
                }

                return { ...baseData[type as keyof typeof baseData], ...overrides }
            }
        }
    }

    // Публичные методы
    public getLogger(): TestLogger {
        return this.logger
    }

    public getUtils(): TestUtils {
        return this.utils
    }

    public getConfig(): TestConfig {
        return this.config
    }

    public updateConfig(newConfig: Partial<TestConfig>): void {
        this.config = { ...this.config, ...newConfig }
        this.logger.info('Test configuration updated', this.config)
    }

    public updateMocks(newMocks: Partial<MockConfig>): void {
        this.mocks = { ...this.mocks, ...newMocks }
        this.logger.info('Mock configuration updated', this.mocks)
    }

    public getMocks(): MockConfig {
        return { ...this.mocks }
    }

    public async runTestSuite(suite: TestSuite): Promise<void> {
        this.logger.info(`Starting test suite: ${suite.name}`)

        try {
            // Настройка
            await suite.setup()

            // Запуск тестов
            for (const testCase of suite.tests) {
                if (testCase.skip) {
                    this.logger.info(`Skipping test: ${testCase.name}`)
                    continue
                }

                await this.runTestCase(testCase, suite)
            }

            // Очистка
            await suite.teardown()

            this.logger.info(`Test suite completed: ${suite.name}`)
        } catch (error) {
            this.logger.error(`Test suite failed: ${suite.name}`, error)
            throw error
        }
    }

    private async runTestCase(testCase: TestCase, suite: TestSuite): Promise<void> {
        const startTime = Date.now()
        this.logger.test(testCase.name, 'start')

        try {
            const context: TestContext = {
                logger: this.logger,
                config: this.config,
                mocks: this.mocks,
                utils: this.utils
            }

            await testCase.run(context)

            const duration = Date.now() - startTime
            this.logger.test(testCase.name, 'pass', duration)
        } catch (error) {
            const duration = Date.now() - startTime
            this.logger.test(testCase.name, 'fail', duration)
            this.logger.error(`Test failed: ${testCase.name}`, error)
            throw error
        }
    }
}

// Экспорт синглтона
export const testFramework = TestFramework.getInstance()

// Экспорт утилит для удобства
export const { logger, utils, config } = testFramework

// Декораторы для тестов
export function TestSuite(name: string, config: TestConfig = {}, mocks: MockConfig = {}) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            static testSuiteName = name
            static testConfig = config
            static mockConfig = mocks
        }
    }
}

export function TestCase(name: string, description?: string, options: Partial<TestCase> = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const context: TestContext = {
                logger: testFramework.getLogger(),
                config: testFramework.getConfig(),
                mocks: testFramework.getMocks(),
                utils: testFramework.getUtils()
            }

            return originalMethod.call(this, context, ...args)
        }

        // Добавляем метаданные теста
        descriptor.value.testName = name
        descriptor.value.testDescription = description
        descriptor.value.testOptions = options
    }
}

// Хуки для тестов
export const useTestFramework = () => {
    return {
        logger: testFramework.getLogger(),
        utils: testFramework.getUtils(),
        config: testFramework.getConfig()
    }
}

// Утилиты для моков
export const mockUtils = {
    createMockUser: (overrides: any = {}) => {
        return testFramework.getUtils().generateTestData('user', overrides)
    },

    createMockTask: (overrides: any = {}) => {
        return testFramework.getUtils().generateTestData('task', overrides)
    },

    createMockSubscription: (overrides: any = {}) => {
        return testFramework.getUtils().generateTestData('subscription', overrides)
    },

    setupMockEnvironment: () => {
        testFramework.updateMocks({
            auth: true,
            database: true,
            api: true,
            navigation: true,
            storage: true
        })
    },

    clearMockEnvironment: () => {
        testFramework.getUtils().clearAllMocks()
    }
}

// Дополнительные декораторы
export function WithPerformance(threshold?: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now()

            try {
                const result = await originalMethod.call(this, ...args)
                const duration = Date.now() - startTime
                testLogger.performance(propertyKey, duration, threshold)
                return result
            } catch (error) {
                const duration = Date.now() - startTime
                testLogger.performance(propertyKey, duration, threshold)
                throw error
            }
        }
    }
}

export function WithRetry(attempts = 3) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            let lastError: Error

            for (let i = 0; i < attempts; i++) {
                try {
                    return await originalMethod.call(this, ...args)
                } catch (error) {
                    lastError = error as Error
                    if (i < attempts - 1) {
                        testLogger.warn('RETRY', `Attempt ${i + 1} failed, retrying...`, { error: lastError.message })
                        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
                    }
                }
            }

            throw lastError!
        }
    }
}

export default testFramework
