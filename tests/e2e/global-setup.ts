/**
 * 🌐 ГЛОБАЛЬНАЯ НАСТРОЙКА E2E ТЕСТОВ
 * Настройка глобальных переменных и окружения для Playwright
 */

import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
    // Устанавливаем глобальные переменные для E2E тестов
    process.env.NODE_ENV = 'test'
    process.env.NEXT_PUBLIC_DEV_MODE = 'true'
    process.env.NEXT_PUBLIC_DISABLE_EMAIL = 'true'

    // Настройка глобальных переменных для describe/test
    global.describe = global.describe || (() => { })
    global.test = global.test || (() => { })
    global.beforeEach = global.beforeEach || (() => { })
    global.afterEach = global.afterEach || (() => { })
    global.beforeAll = global.beforeAll || (() => { })
    global.afterAll = global.afterAll || (() => { })
    global.expect = global.expect || (() => { })

    console.log('🌐 E2E глобальная настройка завершена')
}

export default globalSetup
