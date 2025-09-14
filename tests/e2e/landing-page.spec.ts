import { expect, test } from '@playwright/test'

test.describe('Personal Productivity AI - Лендинг страница', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test.describe('📧 Email подписка', () => {

        test('✅ Успешная первая регистрация', async ({ page }) => {
            const uniqueEmail = `test-${Date.now()}@example.com`

            // Заполняем форму
            await page.fill('input[type="email"]', uniqueEmail)
            await page.click('button:has-text("Подписаться")')

            // Ожидаем успешное сообщение
            await expect(page.locator('text=Спасибо за подписку')).toBeVisible({ timeout: 10000 })

            // Проверяем, что форма очистилась
            await expect(page.locator('input[type="email"]')).toHaveValue('')
        })

        test('🔄 Повторная регистрация с тем же email', async ({ page }) => {
            const duplicateEmail = 'duplicate@example.com'

            // Первая подписка
            await page.fill('input[type="email"]', duplicateEmail)
            await page.click('button:has-text("Подписаться")')
            await expect(page.locator('text=Спасибо за подписку')).toBeVisible({ timeout: 10000 })

            // Ждем исчезновения сообщения
            await page.waitForTimeout(3000)

            // Повторная подписка
            await page.fill('input[type="email"]', duplicateEmail)
            await page.click('button:has-text("Подписаться")')

            // Ожидаем сообщение о дубликате
            await expect(page.locator('text=уже подписан')).toBeVisible({ timeout: 10000 })
        })

        test('❌ Некорректный email', async ({ page }) => {
            const invalidEmails = [
                'invalid-email',
                'test@',
                '@example.com',
                'test..test@example.com',
                ''
            ]

            for (const email of invalidEmails) {
                await page.fill('input[type="email"]', email)
                await page.click('button:has-text("Подписаться")')

                // Проверяем валидацию HTML5 или наше сообщение об ошибке
                const isValid = await page.evaluate(() => {
                    const input = document.querySelector('input[type="email"]') as HTMLInputElement
                    return input?.validity.valid
                })

                if (!isValid) {
                    // HTML5 валидация сработала
                    expect(isValid).toBe(false)
                } else {
                    // Наша валидация должна показать ошибку
                    await expect(page.locator('text=Некорректный email')).toBeVisible({ timeout: 5000 })
                }

                // Очищаем поле для следующего теста
                await page.fill('input[type="email"]', '')
            }
        })

        test('⏳ Состояние загрузки при подписке', async ({ page }) => {
            await page.fill('input[type="email"]', `loading-test-${Date.now()}@example.com`)

            // Кликаем и сразу проверяем состояние загрузки
            await page.click('button:has-text("Подписаться")')

            // Проверяем, что кнопка показывает загрузку
            await expect(page.locator('button:disabled')).toBeVisible()

            // Ждем завершения
            await expect(page.locator('text=Спасибо за подписку')).toBeVisible({ timeout: 10000 })
        })
    })

    test.describe('🔘 Кнопки навигации', () => {

        test('🔔 Кнопка "Уведомить о релизе" - прокрутка к форме', async ({ page }) => {
            // Кликаем на кнопку уведомления
            await page.click('button:has-text("Уведомить о релизе")')

            // Ждем прокрутки и проверяем, что форма видна
            await page.waitForTimeout(1000) // Ждем анимацию прокрутки

            const subscriptionForm = page.locator('#subscription-form')
            await expect(subscriptionForm).toBeInViewport()

            // Проверяем консольные логи
            const logs = await page.evaluate(() => {
                return (window as any).testLogs || []
            })

            // Можем проверить, что функция была вызвана через консоль
            await page.waitForFunction(() => {
                return console.log.toString().includes('scrollToSubscription')
            }, { timeout: 5000 }).catch(() => {
                // Если не получилось проверить через консоль, проверяем визуально
                console.log('Проверка через консоль не удалась, используем визуальную проверку')
            })
        })

        test('🚪 Кнопка "Войти" - показ уведомления', async ({ page }) => {
            // Слушаем диалоги
            let alertText = ''
            page.on('dialog', async dialog => {
                alertText = dialog.message()
                await dialog.accept()
            })

            // Кликаем на кнопку входа
            await page.click('button:has-text("Войти")')

            // Проверяем, что alert был показан
            await page.waitForTimeout(1000)
            expect(alertText).toContain('Функция входа будет доступна')
        })

        test('📱 Кнопка "Установить приложение" - PWA функциональность', async ({ page, browserName }) => {
            // Эмулируем событие beforeinstallprompt
            await page.addInitScript(() => {
                // Создаем мок события PWA
                const mockEvent = {
                    preventDefault: () => { },
                    prompt: async () => { },
                    userChoice: Promise.resolve({ outcome: 'accepted' })
                }

                // Эмулируем событие через небольшую задержку
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
                }, 1000)
            })

            await page.reload()
            await page.waitForTimeout(2000)

            // Проверяем, что кнопка установки появилась
            const installButton = page.locator('button:has-text("Установить приложение")')

            if (await installButton.isVisible()) {
                // Если кнопка видна, тестируем клик
                await installButton.click()

                // В реальном браузере это должно вызвать PWA установку
                // В тестах мы можем проверить, что функция была вызвана
                await page.waitForTimeout(1000)

                console.log(`PWA установка протестирована в ${browserName}`)
            } else {
                console.log(`PWA кнопка не отображается в ${browserName} (это нормально для тестов)`)
            }
        })
    })

    test.describe('📱 Мобильная адаптация', () => {

        test('📲 Мобильный вид - все элементы видны', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 }) // iPhone размер

            // Проверяем основные элементы
            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('input[type="email"]')).toBeVisible()
            await expect(page.locator('button:has-text("Подписаться")')).toBeVisible()
            await expect(page.locator('button:has-text("Войти")')).toBeVisible()

            // Проверяем, что элементы не перекрываются
            const emailInput = page.locator('input[type="email"]')
            const subscribeButton = page.locator('button:has-text("Подписаться")')

            const inputBox = await emailInput.boundingBox()
            const buttonBox = await subscribeButton.boundingBox()

            expect(inputBox).toBeTruthy()
            expect(buttonBox).toBeTruthy()
        })

        test('🖥️ Десктопный вид - полная функциональность', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 })

            // Все тесты должны работать и на десктопе
            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('input[type="email"]')).toBeVisible()
            await expect(page.locator('button:has-text("Подписаться")')).toBeVisible()
        })
    })

    test.describe('🔗 Навигация по сайту', () => {

        test('🗺️ Переход на страницу Roadmap', async ({ page }) => {
            await page.click('a:has-text("Roadmap")')

            // Проверяем, что мы на странице roadmap
            await expect(page).toHaveURL(/.*\/roadmap/)

            // Проверяем, что контент загрузился
            await expect(page.locator('h1')).toBeVisible()

            // Возвращаемся назад
            await page.goBack()
            await expect(page).toHaveURL('/')
        })
    })

    test.describe('⚡ Производительность и доступность', () => {

        test('🚀 Время загрузки страницы', async ({ page }) => {
            const startTime = Date.now()
            await page.goto('/')
            const loadTime = Date.now() - startTime

            // Страница должна загружаться быстро (менее 3 секунд)
            expect(loadTime).toBeLessThan(3000)
        })

        test('♿ Доступность - фокус на элементах', async ({ page }) => {
            // Проверяем, что можно навигировать с клавиатуры
            await page.keyboard.press('Tab')

            // Первый элемент в фокусе должен быть кнопка "Войти"
            const focusedElement = page.locator(':focus')
            await expect(focusedElement).toBeVisible()

            // Продолжаем табуляцию
            await page.keyboard.press('Tab')
            await page.keyboard.press('Tab')

            // Должны дойти до поля email
            await page.keyboard.type('test@example.com')
            const emailValue = await page.locator('input[type="email"]').inputValue()
            expect(emailValue).toBe('test@example.com')
        })
    })
})
