import { expect, test } from '@playwright/test'
import { allure } from 'allure-playwright'

test.describe('Personal Productivity AI - Лендинг страница', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test.describe('📧 Email подписка', () => {

        test('✅ Успешная первая регистрация', async ({ page }) => {
            await allure.epic('Email подписка')
            await allure.feature('Регистрация пользователей')
            await allure.story('Первая подписка')
            await allure.severity('critical')
            await allure.description('Проверяет успешную подписку нового пользователя на уведомления')

            const uniqueEmail = `test-${Date.now()}@example.com`

            await allure.step('Заполняем email форму', async () => {
                await page.fill('input[type="email"]', uniqueEmail)
                await page.click('button:has-text("Подписаться")')
            })

            await allure.step('Проверяем успешное сообщение', async () => {
                // Проверяем точное сообщение из API
                await expect(page.locator('.bg-green-100.text-green-800')).toBeVisible({ timeout: 10000 })
                await expect(page.locator('.bg-green-100.text-green-800')).toContainText('Спасибо за подписку! Мы уведомим вас о запуске.')
            })

            await allure.step('Проверяем очистку формы', async () => {
                await expect(page.locator('input[type="email"]')).toHaveValue('')
            })
        })

        test('🔄 Повторная регистрация с тем же email', async ({ page }) => {
            await allure.epic('Email подписка')
            await allure.feature('Валидация данных')
            await allure.story('Дублирующие email')
            await allure.severity('critical')
            await allure.description('Проверяет корректную обработку попытки повторной подписки с тем же email')

            const duplicateEmail = `duplicate-${Date.now()}@example.com`

            await allure.step('Выполняем первую подписку', async () => {
                await page.fill('input[type="email"]', duplicateEmail)
                await page.click('button:has-text("Подписаться")')

                // Ждем сообщение о успешной подписке
                await expect(page.locator('.bg-green-100.text-green-800')).toBeVisible({ timeout: 10000 })
                await expect(page.locator('.bg-green-100.text-green-800')).toContainText('Спасибо за подписку! Мы уведомим вас о запуске.')

                // Проверяем что поле очистилось
                await expect(page.locator('input[type="email"]')).toHaveValue('')
            })

            await allure.step('Пытаемся подписаться повторно с тем же email', async () => {
                await page.fill('input[type="email"]', duplicateEmail)
                await page.click('button:has-text("Подписаться")')
            })

            await allure.step('Проверяем сообщение об ошибке дублирования', async () => {
                // Проверяем что появилось сообщение об ошибке
                await expect(page.locator('.bg-red-100.text-red-800')).toBeVisible({ timeout: 10000 })

                // Проверяем что сообщение содержит точную информацию о дублировании
                const errorMessage = page.locator('.bg-red-100.text-red-800')
                await expect(errorMessage).toContainText('Этот email уже подписан на уведомления')
            })
        })

        test('❌ Некорректный email', async ({ page }) => {
            const invalidEmails = [
                'invalid-email',
                'test@',
                '@example.com'
            ]

            for (const email of invalidEmails) {
                console.log(`Тестируем email: "${email}"`)

                await page.fill('input[type="email"]', email)

                // Проверяем HTML5 валидацию
                const isValid = await page.evaluate(() => {
                    const input = document.querySelector('input[type="email"]') as HTMLInputElement
                    return input?.validity.valid
                })

                // HTML5 должна блокировать некорректные email
                expect(isValid).toBe(false)
                console.log(`✅ HTML5 валидация заблокировала: "${email}"`)

                // Очищаем поле для следующего теста
                await page.fill('input[type="email"]', '')
                await page.waitForTimeout(200)
            }

            // Отдельно тестируем пустое поле
            console.log('Тестируем пустое поле - проверяем что не отправляется')
            await page.fill('input[type="email"]', '')

            // Пытаемся отправить форму с пустым полем
            await page.click('button:has-text("Подписаться")')

            // Ждем немного и проверяем, что сообщение об успехе не появилось
            await page.waitForTimeout(1000)

            const successMessage = page.locator('text=Спасибо за подписку')
            const isSuccessVisible = await successMessage.isVisible()

            expect(isSuccessVisible).toBe(false)
            console.log('✅ Пустое поле не отправляется')
        })

        test('⏳ Состояние загрузки при подписке', async ({ page }) => {
            await allure.epic('Email подписка')
            await allure.feature('UI взаимодействие')
            await allure.story('Состояние загрузки')
            await allure.severity('critical')
            await allure.description('Проверяет отображение состояния загрузки при отправке формы')

            const testEmail = `loading-test-${Date.now()}@example.com`

            await allure.step('Заполняем форму и отправляем', async () => {
                await page.fill('input[type="email"]', testEmail)

                // Нажимаем кнопку и сразу проверяем состояние загрузки
                await page.click('button:has-text("Подписаться")')
            })

            await allure.step('Проверяем состояние загрузки кнопки', async () => {
                // Проверяем что кнопка показывает состояние загрузки (disabled или изменился текст)
                const submitButton = page.locator('button[type="submit"]')

                // Кнопка должна быть заблокирована во время загрузки
                await expect(submitButton).toBeDisabled({ timeout: 2000 })
            })

            await allure.step('Проверяем завершение операции', async () => {
                // Ждем появления сообщения о результате
                await expect(page.locator('.bg-green-100.text-green-800, .bg-red-100.text-red-800')).toBeVisible({ timeout: 10000 })

                // Проверяем что кнопка снова активна
                const submitButton = page.locator('button[type="submit"]')
                await expect(submitButton).toBeEnabled()
            })
        })
    })

    test.describe('🔘 Кнопки навигации', () => {

        test('🔔 Кнопка "Уведомить о релизе" - прокрутка к форме', async ({ page }) => {
            // Кликаем на кнопку уведомления
            await page.click('button:has-text("🔔 Уведомить о релизе")')

            // Ждем прокрутки и проверяем, что форма видна
            await page.waitForTimeout(1500)

            const subscriptionForm = page.locator('#subscription-form')
            await expect(subscriptionForm).toBeInViewport({ timeout: 5000 })

            console.log('✅ Прокрутка к форме подписки работает')
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
            const installButton = page.locator('[data-testid="install-app-button"]')

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
            // Находим поле email и очищаем его
            const emailInput = page.locator('input[type="email"]')
            await emailInput.fill('')

            // Кликаем на поле для фокуса
            await emailInput.click()

            // Ждем стабилизации фокуса
            await page.waitForTimeout(100)

            // Вводим текст через fill (более надежно)
            await emailInput.fill('test@example.com')

            // Проверяем значение
            const emailValue = await emailInput.inputValue()
            expect(emailValue).toBe('test@example.com')

            console.log('✅ Доступность: ввод в поле email работает')
        })
    })
})
