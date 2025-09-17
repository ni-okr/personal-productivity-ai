/**
 * 🧪 Единая система логирования для тестов
 * 
 * Обеспечивает:
 * - Консистентное логирование во всех тестах
 * - Различные уровни детализации
 * - Форматированный вывод
 * - Интеграцию с Allure
 */

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

export interface LogEntry {
    timestamp: string
    level: LogLevel
    category: string
    message: string
    data?: any
    testName?: string
    duration?: number
}

export interface LoggerConfig {
    level: LogLevel
    enableColors: boolean
    enableTimestamps: boolean
    enableTestContext: boolean
    outputToFile: boolean
    filePath?: string
}

class TestLogger {
    private static instance: TestLogger
    private config: LoggerConfig
    private entries: LogEntry[] = []
    private currentTestName?: string
    private testStartTime?: number

    private constructor() {
        this.config = {
            level: this.getLogLevelFromEnv(),
            enableColors: process.env.NODE_ENV !== 'test',
            enableTimestamps: true,
            enableTestContext: true,
            outputToFile: process.env.LOG_TO_FILE === 'true',
            filePath: 'test-logs.json'
        }
    }

    public static getInstance(): TestLogger {
        if (!TestLogger.instance) {
            TestLogger.instance = new TestLogger()
        }
        return TestLogger.instance
    }

    private getLogLevelFromEnv(): LogLevel {
        const level = process.env.LOG_LEVEL?.toUpperCase()
        switch (level) {
            case 'ERROR': return LogLevel.ERROR
            case 'WARN': return LogLevel.WARN
            case 'INFO': return LogLevel.INFO
            case 'DEBUG': return LogLevel.DEBUG
            default: return LogLevel.INFO
        }
    }

    private createLogEntry(level: LogLevel, category: string, message: string, data?: any): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            data,
            testName: this.currentTestName,
            duration: this.testStartTime ? Date.now() - this.testStartTime : undefined
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level <= this.config.level
    }

    private formatMessage(entry: LogEntry): string {
        let formatted = ''

        if (this.config.enableTimestamps) {
            formatted += `[${entry.timestamp}] `
        }

        if (this.config.enableTestContext && entry.testName) {
            formatted += `[${entry.testName}] `
        }

        const levelIcon = this.getLevelIcon(entry.level)
        const levelName = LogLevel[entry.level]

        if (this.config.enableColors) {
            const color = this.getLevelColor(entry.level)
            formatted += `${color}${levelIcon} [${levelName}] ${entry.message}${this.resetColor()}`
        } else {
            formatted += `${levelIcon} [${levelName}] ${entry.message}`
        }

        if (entry.data) {
            formatted += `\n${JSON.stringify(entry.data, null, 2)}`
        }

        if (entry.duration !== undefined) {
            formatted += ` (${entry.duration}ms)`
        }

        return formatted
    }

    private getLevelIcon(level: LogLevel): string {
        switch (level) {
            case LogLevel.ERROR: return '❌'
            case LogLevel.WARN: return '⚠️'
            case LogLevel.INFO: return 'ℹ️'
            case LogLevel.DEBUG: return '🐛'
            default: return '📝'
        }
    }

    private getLevelColor(level: LogLevel): string {
        if (!this.config.enableColors) return ''

        switch (level) {
            case LogLevel.ERROR: return '\x1b[31m' // Red
            case LogLevel.WARN: return '\x1b[33m'  // Yellow
            case LogLevel.INFO: return '\x1b[36m'  // Cyan
            case LogLevel.DEBUG: return '\x1b[90m' // Gray
            default: return '\x1b[0m'              // Reset
        }
    }

    private resetColor(): string {
        return this.config.enableColors ? '\x1b[0m' : ''
    }

    private log(level: LogLevel, category: string, message: string, data?: any): void {
        if (!this.shouldLog(level)) return

        const entry = this.createLogEntry(level, category, message, data)
        this.entries.push(entry)

        const formattedMessage = this.formatMessage(entry)

        // Вывод в консоль
        switch (level) {
            case LogLevel.ERROR:
                console.error(formattedMessage)
                break
            case LogLevel.WARN:
                console.warn(formattedMessage)
                break
            case LogLevel.INFO:
                console.log(formattedMessage)
                break
            case LogLevel.DEBUG:
                console.debug(formattedMessage)
                break
        }

        // Вывод в файл
        if (this.config.outputToFile) {
            this.writeToFile(entry)
        }
    }

    private writeToFile(entry: LogEntry): void {
        // Простая реализация записи в файл
        // В реальном проекте можно использовать fs.writeFileSync
        try {
            const fs = require('fs')
            const path = require('path')

            const logDir = path.dirname(this.config.filePath || 'test-logs.json')
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true })
            }

            const logData = JSON.stringify(entry, null, 2) + '\n'
            fs.appendFileSync(this.config.filePath || 'test-logs.json', logData)
        } catch (error) {
            console.error('Failed to write log to file:', error)
        }
    }

    // Публичные методы
    public error(category: string, message: string, data?: any): void {
        this.log(LogLevel.ERROR, category, message, data)
    }

    public warn(category: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, category, message, data)
    }

    public info(category: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, category, message, data)
    }

    public debug(category: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, category, message, data)
    }

    // Методы для тестов
    public startTest(testName: string): void {
        this.currentTestName = testName
        this.testStartTime = Date.now()
        this.info('TEST', `Starting test: ${testName}`)
    }

    public endTest(testName: string, success: boolean): void {
        const duration = this.testStartTime ? Date.now() - this.testStartTime : 0
        const status = success ? 'PASSED' : 'FAILED'
        const icon = success ? '✅' : '❌'

        this.info('TEST', `${icon} Test ${status}: ${testName} (${duration}ms)`)

        this.currentTestName = undefined
        this.testStartTime = undefined
    }

    public step(stepName: string, data?: any): void {
        this.info('STEP', `Step: ${stepName}`, data)
    }

    public assertion(description: string, success: boolean, expected?: any, actual?: any): void {
        const icon = success ? '✅' : '❌'
        const message = `Assertion: ${description}`
        const data = success ? undefined : { expected, actual }

        if (success) {
            this.debug('ASSERT', message, data)
        } else {
            this.error('ASSERT', message, data)
        }
    }

    public mock(mockType: string, action: string, data?: any): void {
        this.debug('MOCK', `Mock ${mockType}: ${action}`, data)
    }

    public api(endpoint: string, method: string, status: number, data?: any): void {
        const icon = status < 400 ? '✅' : '❌'
        this.info('API', `${icon} ${method} ${endpoint} - ${status}`, data)
    }

    public performance(operation: string, duration: number, threshold?: number): void {
        const icon = threshold && duration > threshold ? '⚠️' : '✅'
        this.info('PERF', `${icon} ${operation}: ${duration}ms`, { threshold })
    }

    // Утилиты
    public getEntries(): LogEntry[] {
        return [...this.entries]
    }

    public getEntriesByTest(testName: string): LogEntry[] {
        return this.entries.filter(entry => entry.testName === testName)
    }

    public getEntriesByLevel(level: LogLevel): LogEntry[] {
        return this.entries.filter(entry => entry.level === level)
    }

    public clear(): void {
        this.entries = []
    }

    public updateConfig(newConfig: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...newConfig }
    }

    public exportToAllure(): any[] {
        return this.entries.map(entry => ({
            timestamp: entry.timestamp,
            level: LogLevel[entry.level],
            category: entry.category,
            message: entry.message,
            data: entry.data,
            testName: entry.testName,
            duration: entry.duration
        }))
    }
}

// Экспорт синглтона
export const testLogger = TestLogger.getInstance()

// Экспорт утилит
export const { error, warn, info, debug, startTest, endTest, step, assertion, mock, api, performance } = testLogger

// Декораторы для автоматического логирования
export function LogTest(testName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            testLogger.startTest(testName)

            try {
                const result = await originalMethod.call(this, ...args)
                testLogger.endTest(testName, true)
                return result
            } catch (error) {
                testLogger.endTest(testName, false)
                testLogger.error('TEST', `Test failed: ${testName}`, error)
                throw error
            }
        }
    }
}

export function LogStep(stepName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = function (...args: any[]) {
            testLogger.step(stepName)
            return originalMethod.call(this, ...args)
        }
    }
}

export function LogPerformance(threshold?: number) {
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

export default testLogger