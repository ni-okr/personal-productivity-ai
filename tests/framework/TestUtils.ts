/**
 * 🧪 Утилиты для тестирования
 * 
 * Обеспечивает:
 * - Общие функции для тестов
 * - Помощники для рендеринга
 * - Утилиты для асинхронных операций
 * - Генераторы тестовых данных
 */

import { act, render, RenderOptions, RenderResult, waitFor } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { testLogger } from './TestLogger'
import { testMocks } from './TestMocks'

export interface TestUtilsConfig {
    defaultTimeout: number
    retryAttempts: number
    enableLogging: boolean
}

export interface TestDataGenerator {
    user: (overrides?: any) => any
    task: (overrides?: any) => any
    subscription: (overrides?: any) => any
    metric: (overrides?: any) => any
    suggestion: (overrides?: any) => any
}

class TestUtils {
    private static instance: TestUtils
    private config: TestUtilsConfig
    private dataGenerator: TestDataGenerator

    private constructor() {
        this.config = {
            defaultTimeout: 5000,
            retryAttempts: 3,
            enableLogging: true
        }

        this.dataGenerator = this.createDataGenerator()
    }

    public static getInstance(): TestUtils {
        if (!TestUtils.instance) {
            TestUtils.instance = new TestUtils()
        }
        return TestUtils.instance
    }

    private createDataGenerator(): TestDataGenerator {
        return {
            user: (overrides = {}) => ({
                id: `test-user-${Date.now()}`,
                email: `test${Date.now()}@example.com`,
                name: 'Test User',
                createdAt: new Date().toISOString(),
                ...overrides
            }),

            task: (overrides = {}) => ({
                id: `test-task-${Date.now()}`,
                title: 'Test Task',
                description: 'Test Description',
                priority: 'medium',
                status: 'todo',
                userId: 'test-user-1',
                createdAt: new Date().toISOString(),
                ...overrides
            }),

            subscription: (overrides = {}) => ({
                id: `test-sub-${Date.now()}`,
                userId: 'test-user-1',
                tier: 'free',
                status: 'active',
                createdAt: new Date().toISOString(),
                ...overrides
            }),

            metric: (overrides = {}) => ({
                id: `test-metric-${Date.now()}`,
                userId: 'test-user-1',
                completedTasks: 0,
                totalTasks: 0,
                completionRate: 0,
                createdAt: new Date().toISOString(),
                ...overrides
            }),

            suggestion: (overrides = {}) => ({
                id: `test-suggestion-${Date.now()}`,
                userId: 'test-user-1',
                type: 'productivity',
                message: 'Test suggestion',
                createdAt: new Date().toISOString(),
                ...overrides
            })
        }
    }

    // Рендеринг компонентов
    public renderWithProviders<T extends ReactElement>(
        ui: T,
        options?: RenderOptions & {
            providers?: ReactNode[]
            initialState?: any
        }
    ): RenderResult {
        if (this.config.enableLogging) {
            testLogger.debug('RENDER', 'Rendering component with providers', {
                component: ui.type,
                options
            })
        }

        const { providers = [], initialState, ...renderOptions } = options || {}

        // Если есть провайдеры, оборачиваем компонент
        let wrappedUI = ui
        if (providers.length > 0) {
            wrappedUI = providers.reduceRight(
                (acc, provider) => React.createElement(provider as any, {}, acc),
                ui
            ) as T
        }

        return render(wrappedUI, renderOptions)
    }

    // Асинхронные операции
    public async waitForState<T>(
        stateGetter: () => T,
        expectedValue: T,
        timeout = this.config.defaultTimeout
    ): Promise<void> {
        if (this.config.enableLogging) {
            testLogger.debug('WAIT', 'Waiting for state change', { expectedValue, timeout })
        }

        await waitFor(() => {
            const currentValue = stateGetter()
            if (currentValue !== expectedValue) {
                throw new Error(`Expected ${expectedValue}, but got ${currentValue}`)
            }
        }, { timeout })
    }

    // Улучшенная версия waitForState для условий
    public async waitForCondition(
        condition: () => boolean,
        timeout = this.config.defaultTimeout
    ): Promise<void> {
        if (this.config.enableLogging) {
            testLogger.debug('WAIT', 'Waiting for condition', { timeout })
        }

        await waitFor(() => {
            const result = condition()
            if (!result) {
                throw new Error('Condition not met')
            }
        }, { timeout })
    }

    public async waitForElement(
        getElement: () => HTMLElement | null,
        timeout = this.config.defaultTimeout
    ): Promise<HTMLElement> {
        if (this.config.enableLogging) {
            testLogger.debug('WAIT', 'Waiting for element', { timeout })
        }

        return waitFor(() => {
            const element = getElement()
            if (!element) {
                throw new Error('Element not found')
            }
            return element
        }, { timeout })
    }

    public async waitForCondition(
        condition: () => boolean,
        timeout = this.config.defaultTimeout
    ): Promise<void> {
        if (this.config.enableLogging) {
            testLogger.debug('WAIT', 'Waiting for condition', { timeout })
        }

        await waitFor(() => {
            const result = condition()
            if (!result) {
                throw new Error('Condition not met')
            }
        }, { timeout })
    }

    // Работа с актами
    public async act<T>(callback: () => T | Promise<T>): Promise<T> {
        if (this.config.enableLogging) {
            testLogger.debug('ACT', 'Executing act callback')
        }

        return act(callback)
    }

    // Генераторы данных
    public generateUser(overrides?: any): any {
        const user = this.dataGenerator.user(overrides)
        if (this.config.enableLogging) {
            testLogger.debug('DATA', 'Generated user', user)
        }
        return user
    }

    public generateTask(overrides?: any): any {
        const task = this.dataGenerator.task(overrides)
        if (this.config.enableLogging) {
            testLogger.debug('DATA', 'Generated task', task)
        }
        return task
    }

    public generateTasks(count: number, overrides?: any): any[] {
        const tasks = Array.from({ length: count }, (_, index) =>
            this.dataGenerator.task({
                ...overrides,
                id: `test-task-${index + 1}`,
                title: `Test Task ${index + 1}`,
                description: `Test Description ${index + 1}`
            })
        )
        if (this.config.enableLogging) {
            testLogger.debug('DATA', `Generated ${count} tasks`, tasks)
        }
        return tasks
    }

    public generateSubscription(overrides?: any): any {
        const subscription = this.dataGenerator.subscription(overrides)
        if (this.config.enableLogging) {
            testLogger.debug('DATA', 'Generated subscription', subscription)
        }
        return subscription
    }

    public generateMetric(overrides?: any): any {
        const metric = this.dataGenerator.metric(overrides)
        if (this.config.enableLogging) {
            testLogger.debug('DATA', 'Generated metric', metric)
        }
        return metric
    }

    public generateSuggestion(overrides?: any): any {
        const suggestion = this.dataGenerator.suggestion(overrides)
        if (this.config.enableLogging) {
            testLogger.debug('DATA', 'Generated suggestion', suggestion)
        }
        return suggestion
    }

    // Работа с моками
    public mockApiResponse(endpoint: string, response: any, delay = 0): void {
        if (this.config.enableLogging) {
            testLogger.mock('API', `Mocking ${endpoint}`, { response, delay })
        }

        global.fetch = jest.fn().mockImplementation((url: string) => {
            if (url.includes(endpoint)) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: () => Promise.resolve(response)
                        })
                    }, delay)
                })
            }
            return Promise.resolve({
                ok: false,
                status: 404
            })
        })
    }

    public mockAuthUser(user: any): void {
        if (this.config.enableLogging) {
            testLogger.mock('AUTH', 'Mocking auth user', user)
        }

        testMocks.addUser(user)

        // Обновляем мок Supabase
        if (global.supabase?.auth) {
            (global.supabase.auth as any).getSession = jest.fn().mockResolvedValue({
                data: { session: { user } },
                error: null
            })
        }
    }

    public clearAllMocks(): void {
        if (this.config.enableLogging) {
            testLogger.debug('MOCK', 'Clearing all mocks')
        }

        testMocks.clearAllMocks()
        jest.clearAllMocks()
    }

    // Утилиты для тестирования производительности
    public async measurePerformance<T>(
        operation: () => T | Promise<T>,
        operationName: string,
        threshold?: number
    ): Promise<{ result: T; duration: number }> {
        const startTime = Date.now()

        try {
            const result = await operation()
            const duration = Date.now() - startTime

            testLogger.performance(operationName, duration, threshold)

            return { result, duration }
        } catch (error) {
            const duration = Date.now() - startTime
            testLogger.performance(operationName, duration, threshold)
            throw error
        }
    }

    // Утилиты для тестирования ошибок
    public async expectToThrow<T>(
        operation: () => T | Promise<T>,
        expectedError?: string | RegExp
    ): Promise<void> {
        try {
            await operation()
            throw new Error('Expected operation to throw, but it did not')
        } catch (error) {
            if (expectedError) {
                if (typeof expectedError === 'string') {
                    expect(error.message).toContain(expectedError)
                } else {
                    expect(error.message).toMatch(expectedError)
                }
            }
        }
    }

    // Утилиты для работы с формами
    public async fillForm(
        container: HTMLElement,
        formData: Record<string, string>
    ): Promise<void> {
        for (const [name, value] of Object.entries(formData)) {
            const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement
            if (input) {
                await this.act(async () => {
                    input.value = value
                    input.dispatchEvent(new Event('input', { bubbles: true }))
                    input.dispatchEvent(new Event('change', { bubbles: true }))
                })
            }
        }
    }

    public async submitForm(container: HTMLElement): Promise<void> {
        const form = container.querySelector('form')
        if (form) {
            await this.act(async () => {
                form.dispatchEvent(new Event('submit', { bubbles: true }))
            })
        }
    }

    // Утилиты для работы с событиями
    public async fireEvent(
        element: HTMLElement,
        eventType: string,
        eventData?: any
    ): Promise<void> {
        await this.act(async () => {
            const event = new Event(eventType, { bubbles: true, ...eventData })
            element.dispatchEvent(event)
        })
    }

    // Утилиты для работы с таймерами
    public async advanceTimers(ms: number): Promise<void> {
        await this.act(async () => {
            jest.advanceTimersByTime(ms)
        })
    }

    public async runAllTimers(): Promise<void> {
        await this.act(async () => {
            jest.runAllTimers()
        })
    }

    // Утилиты для работы с URL
    public mockUrl(url: string): void {
        Object.defineProperty(window, 'location', {
            value: {
                href: url,
                pathname: new URL(url).pathname,
                search: new URL(url).search,
                hash: new URL(url).hash
            },
            writable: true
        })
    }

    // Конфигурация
    public updateConfig(newConfig: Partial<TestUtilsConfig>): void {
        this.config = { ...this.config, ...newConfig }
        if (this.config.enableLogging) {
            testLogger.info('CONFIG', 'Updated test utils config', this.config)
        }
    }

    public getConfig(): TestUtilsConfig {
        return { ...this.config }
    }
}

// Экспорт синглтона
export const testUtils = TestUtils.getInstance()

// Экспорт утилит
export const {
    renderWithProviders,
    waitForState,
    waitForCondition,
    waitForElement,
    generateUser,
    generateTask,
    generateTasks,
    generateSubscription,
    generateMetric,
    generateSuggestion,
    mockApiResponse,
    mockAuthUser,
    clearAllMocks,
    measurePerformance,
    expectToThrow,
    fillForm,
    submitForm,
    fireEvent,
    advanceTimers,
    runAllTimers,
    mockUrl,
    updateConfig,
    getConfig
} = testUtils

// Декораторы для автоматического использования утилит
export function WithPerformance(threshold?: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            return testUtils.measurePerformance(
                () => originalMethod.call(this, ...args),
                propertyKey,
                threshold
            )
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

export default testUtils