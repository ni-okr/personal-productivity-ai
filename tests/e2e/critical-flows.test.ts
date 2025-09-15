// 🧪 E2E тесты для критических сценариев монетизации
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'

// Mock для E2E тестов
const mockBrowser = {
    goto: jest.fn(),
    click: jest.fn(),
    fill: jest.fn(),
    waitForSelector: jest.fn(),
    evaluate: jest.fn(),
    close: jest.fn()
}

describe('Critical Monetization Flows', () => {
    beforeAll(async () => {
        // Инициализация браузера
        console.log('🚀 Запуск E2E тестов для монетизации')
    })

    afterAll(async () => {
        // Закрытие браузера
        await mockBrowser.close()
    })

    describe('User Registration and Subscription Flow', () => {
        it('должен пройти полный цикл: регистрация → выбор плана → оплата', async () => {
            // 1. Переход на главную страницу
            await mockBrowser.goto('http://localhost:3000')
            
            // 2. Регистрация пользователя
            await mockBrowser.click('[data-testid="sign-up-button"]')
            await mockBrowser.fill('[data-testid="email-input"]', 'test@example.com')
            await mockBrowser.fill('[data-testid="password-input"]', 'password123')
            await mockBrowser.fill('[data-testid="name-input"]', 'Test User')
            await mockBrowser.click('[data-testid="register-button"]')
            
            // 3. Ожидание успешной регистрации
            await mockBrowser.waitForSelector('[data-testid="registration-success"]')
            
            // 4. Переход к выбору плана
            await mockBrowser.click('[data-testid="choose-plan-button"]')
            await mockBrowser.waitForSelector('[data-testid="subscription-modal"]')
            
            // 5. Выбор Premium плана
            await mockBrowser.click('[data-testid="plan-premium"]')
            await mockBrowser.click('[data-testid="select-plan-button"]')
            
            // 6. Ожидание появления деталей оплаты
            await mockBrowser.waitForSelector('[data-testid="payment-details"]')
            
            // 7. Проверка что отображаются правильные детали
            const bankDetails = await mockBrowser.evaluate(() => {
                return document.querySelector('[data-testid="bank-details"]')?.textContent
            })
            
            expect(bankDetails).toContain('Тестовый ИП')
            expect(bankDetails).toContain('12345678901234567890')
        })

        it('должен показать правильные цены и лимиты для каждого плана', async () => {
            await mockBrowser.goto('http://localhost:3000/planner')
            await mockBrowser.click('[data-testid="subscription-button"]')
            await mockBrowser.waitForSelector('[data-testid="subscription-modal"]')
            
            // Проверяем Free план
            const freePlan = await mockBrowser.evaluate(() => {
                const element = document.querySelector('[data-testid="plan-free"]')
                return {
                    price: element?.querySelector('[data-testid="plan-price"]')?.textContent,
                    tasks: element?.querySelector('[data-testid="plan-tasks"]')?.textContent,
                    aiRequests: element?.querySelector('[data-testid="plan-ai-requests"]')?.textContent
                }
            })
            
            expect(freePlan.price).toContain('0 ₽')
            expect(freePlan.tasks).toContain('50 задач')
            expect(freePlan.aiRequests).toContain('0 ИИ запросов')
            
            // Проверяем Premium план
            const premiumPlan = await mockBrowser.evaluate(() => {
                const element = document.querySelector('[data-testid="plan-premium"]')
                return {
                    price: element?.querySelector('[data-testid="plan-price"]')?.textContent,
                    tasks: element?.querySelector('[data-testid="plan-tasks"]')?.textContent,
                    aiRequests: element?.querySelector('[data-testid="plan-ai-requests"]')?.textContent
                }
            })
            
            expect(premiumPlan.price).toContain('999 ₽')
            expect(premiumPlan.tasks).toContain('500 задач')
            expect(premiumPlan.aiRequests).toContain('1000 ИИ запросов')
        })
    })

    describe('Task Management with Limits', () => {
        it('должен ограничивать создание задач на Free плане', async () => {
            // Логин как Free пользователь
            await mockBrowser.goto('http://localhost:3000/planner')
            
            // Создаем 50 задач (лимит Free плана)
            for (let i = 1; i <= 50; i++) {
                await mockBrowser.click('[data-testid="add-task-button"]')
                await mockBrowser.fill('[data-testid="task-title"]', `Задача ${i}`)
                await mockBrowser.click('[data-testid="save-task-button"]')
            }
            
            // Попытка создать 51-ю задачу должна показать ограничение
            await mockBrowser.click('[data-testid="add-task-button"]')
            await mockBrowser.fill('[data-testid="task-title"]', 'Задача 51')
            await mockBrowser.click('[data-testid="save-task-button"]')
            
            // Должно появиться сообщение об ограничении
            await mockBrowser.waitForSelector('[data-testid="limit-reached-message"]')
            
            const limitMessage = await mockBrowser.evaluate(() => {
                return document.querySelector('[data-testid="limit-reached-message"]')?.textContent
            })
            
            expect(limitMessage).toContain('Достигнут лимит')
            expect(limitMessage).toContain('перейти на Premium')
        })

        it('должен показывать кнопку обновления при достижении лимитов', async () => {
            await mockBrowser.goto('http://localhost:3000/planner')
            
            // Создаем задачи до лимита
            for (let i = 1; i <= 50; i++) {
                await mockBrowser.click('[data-testid="add-task-button"]')
                await mockBrowser.fill('[data-testid="task-title"]', `Задача ${i}`)
                await mockBrowser.click('[data-testid="save-task-button"]')
            }
            
            // Проверяем что появилась кнопка обновления
            await mockBrowser.waitForSelector('[data-testid="upgrade-button"]')
            
            const upgradeButton = await mockBrowser.evaluate(() => {
                return document.querySelector('[data-testid="upgrade-button"]')?.textContent
            })
            
            expect(upgradeButton).toContain('Обновить до Premium')
        })
    })

    describe('Payment Processing', () => {
        it('должен генерировать QR код для оплаты', async () => {
            await mockBrowser.goto('http://localhost:3000/planner')
            await mockBrowser.click('[data-testid="subscription-button"]')
            await mockBrowser.click('[data-testid="plan-premium"]')
            await mockBrowser.click('[data-testid="select-plan-button"]')
            
            // Выбираем QR код как способ оплаты
            await mockBrowser.click('[data-testid="payment-method-qr"]')
            
            // Проверяем что появился QR код
            await mockBrowser.waitForSelector('[data-testid="qr-code"]')
            
            const qrCode = await mockBrowser.evaluate(() => {
                const element = document.querySelector('[data-testid="qr-code"]')
                return element?.tagName === 'IMG' && element?.getAttribute('src')?.startsWith('data:image')
            })
            
            expect(qrCode).toBe(true)
        })

        it('должен показывать банковские реквизиты для перевода', async () => {
            await mockBrowser.goto('http://localhost:3000/planner')
            await mockBrowser.click('[data-testid="subscription-button"]')
            await mockBrowser.click('[data-testid="plan-premium"]')
            await mockBrowser.click('[data-testid="select-plan-button"]')
            
            // Выбираем банковский перевод
            await mockBrowser.click('[data-testid="payment-method-bank"]')
            
            // Проверяем что появились банковские реквизиты
            await mockBrowser.waitForSelector('[data-testid="bank-details"]')
            
            const bankDetails = await mockBrowser.evaluate(() => {
                const element = document.querySelector('[data-testid="bank-details"]')
                return {
                    recipient: element?.querySelector('[data-testid="recipient"]')?.textContent,
                    account: element?.querySelector('[data-testid="account"]')?.textContent,
                    bank: element?.querySelector('[data-testid="bank"]')?.textContent,
                    bik: element?.querySelector('[data-testid="bik"]')?.textContent,
                    inn: element?.querySelector('[data-testid="inn"]')?.textContent
                }
            })
            
            expect(bankDetails.recipient).toContain('Тестовый ИП')
            expect(bankDetails.account).toContain('12345678901234567890')
            expect(bankDetails.bank).toContain('АО «ТБанк»')
            expect(bankDetails.bik).toContain('044525225')
            expect(bankDetails.inn).toContain('123456789012')
        })
    })

    describe('User Experience', () => {
        it('должен показывать статус подписки в интерфейсе', async () => {
            await mockBrowser.goto('http://localhost:3000/planner')
            
            // Проверяем что отображается статус подписки
            await mockBrowser.waitForSelector('[data-testid="subscription-status"]')
            
            const status = await mockBrowser.evaluate(() => {
                return document.querySelector('[data-testid="subscription-status"]')?.textContent
            })
            
            expect(status).toContain('Free')
        })

        it('должен показывать прогресс использования лимитов', async () => {
            await mockBrowser.goto('http://localhost:3000/planner')
            
            // Создаем несколько задач
            for (let i = 1; i <= 10; i++) {
                await mockBrowser.click('[data-testid="add-task-button"]')
                await mockBrowser.fill('[data-testid="task-title"]', `Задача ${i}`)
                await mockBrowser.click('[data-testid="save-task-button"]')
            }
            
            // Проверяем что отображается прогресс
            await mockBrowser.waitForSelector('[data-testid="usage-progress"]')
            
            const progress = await mockBrowser.evaluate(() => {
                return document.querySelector('[data-testid="usage-progress"]')?.textContent
            })
            
            expect(progress).toContain('10 из 50')
        })
    })
})
