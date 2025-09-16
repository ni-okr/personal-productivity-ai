import { testFramework, testLogger, testMocks, testUtils } from '../framework'

/**
 * 🧪 Мигрирован с помощью единого фреймворка тестирования
 * 
 * Автоматически мигрирован: 2025-09-16T21:33:45.031Z
 * Оригинальный файл сохранен как: tests/e2e/mock-mode.spec.ts.backup
 * 
 * ВАЖНО: Все новые тесты должны использовать единый фреймворк!
 * См. документацию: tests/docs/TESTING_FRAMEWORK.md
 */

// 🧪 E2E тесты для mock режима
import { expect, test } from '@playwright/test'

test.describe('Mock Mode E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Переходим на главную страницу
        await page.goto('http://localhost:3000')

        // Ждем загрузки страницы
        await page.waitForLoadState('networkidle')
    })

    test.describe('Authentication Flow', () => {
        test('должен успешно зарегистрировать пользователя в mock режиме', async ({ page }) => {
            // Нажимаем кнопку "Войти"
            await page.click('text=Войти')

            // Ждем появления модального окна
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })

            // Переключаемся на вкладку регистрации
            await page.click('text=Регистрация')

            // Заполняем форму регистрации
            await page.fill('input[name="name"]', 'Test User')
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.fill('input[name="confirmPassword"]', 'password123')

            // Нажимаем кнопку регистрации
            await page.click('button[type="submit"]')

            // Ждем успешной регистрации
            await page.waitForSelector('text=Регистрация успешна', { timeout: 10000 })

            // Проверяем, что пользователь авторизован
            await expect(page.locator('text=Test User')).toBeVisible()
            await expect(page.locator('text=Выйти')).toBeVisible()
        })

        test('должен успешно войти в систему в mock режиме', async ({ page }) => {
            // Нажимаем кнопку "Войти"
            await page.click('text=Войти')

            // Ждем появления модального окна
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })

            // Заполняем форму входа
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')

            // Нажимаем кнопку входа
            await page.click('button[type="submit"]')

            // Ждем успешного входа
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })

            // Проверяем, что пользователь авторизован
            await expect(page.locator('text=Test User')).toBeVisible()
            await expect(page.locator('text=Выйти')).toBeVisible()
        })

        test('должен успешно выйти из системы', async ({ page }) => {
            // Сначала входим в систему
            await page.click('text=Войти')
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })

            // Выходим из системы
            await page.click('text=Выйти')

            // Проверяем, что пользователь вышел
            await expect(page.locator('text=Войти')).toBeVisible()
            await expect(page.locator('text=Выйти')).not.toBeVisible()
        })

        test('должен показать ошибку при неверных учетных данных', async ({ page }) => {
            // Нажимаем кнопку "Войти"
            await page.click('text=Войти')

            // Ждем появления модального окна
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })

            // Заполняем форму неверными данными
            await page.fill('input[name="email"]', 'wrong@example.test')
            await page.fill('input[name="password"]', 'wrongpassword')

            // Нажимаем кнопку входа
            await page.click('button[type="submit"]')

            // Проверяем, что показана ошибка
            await expect(page.locator('text=Неверный email или пароль')).toBeVisible()
        })
    })

    test.describe('Planner Page Access', () => {
        test('должен перенаправить на страницу входа при попытке доступа к планировщику без авторизации', async ({ page }) => {
            // Переходим на страницу планировщика
            await page.goto('http://localhost:3000/planner')

            // Проверяем, что показано сообщение о необходимости авторизации
            await expect(page.locator('text=Для доступа к планировщику необходимо войти в систему')).toBeVisible()
        })

        test('должен разрешить доступ к планировщику после авторизации', async ({ page }) => {
            // Входим в систему
            await page.click('text=Войти')
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })

            // Переходим на страницу планировщика
            await page.goto('http://localhost:3000/planner')

            // Проверяем, что планировщик загружен
            await expect(page.locator('text=ИИ Планировщик')).toBeVisible()
            await expect(page.locator('text=Добавить задачу')).toBeVisible()
        })
    })

    test.describe('Task Management', () => {
        test.beforeEach(async ({ page }) => {
            // Входим в систему перед каждым тестом
            await page.click('text=Войти')
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })

            // Переходим на страницу планировщика
            await page.goto('http://localhost:3000/planner')
        })

        test('должен создать новую задачу', async ({ page }) => {
            // Нажимаем кнопку "Добавить задачу"
            await page.click('text=Добавить задачу')

            // Ждем появления формы
            await page.waitForSelector('[data-testid="task-form"]', { timeout: 5000 })

            // Заполняем форму задачи
            await page.fill('input[name="title"]', 'Test Task')
            await page.fill('textarea[name="description"]', 'Test Description')
            await page.selectOption('select[name="priority"]', 'high')
            await page.fill('input[name="estimatedMinutes"]', '30')
            await page.fill('input[name="tags"]', 'test, mock')

            // Нажимаем кнопку создания
            await page.click('button[type="submit"]')

            // Ждем успешного создания
            await page.waitForSelector('text=Задача создана успешно', { timeout: 10000 })

            // Проверяем, что задача появилась в списке
            await expect(page.locator('text=Test Task')).toBeVisible()
            await expect(page.locator('text=Test Description')).toBeVisible()
        })

        test('должен отредактировать существующую задачу', async ({ page }) => {
            // Создаем задачу
            await page.click('text=Добавить задачу')
            await page.waitForSelector('[data-testid="task-form"]', { timeout: 5000 })
            await page.fill('input[name="title"]', 'Original Task')
            await page.fill('textarea[name="description"]', 'Original Description')
            await page.selectOption('select[name="priority"]', 'low')
            await page.fill('input[name="estimatedMinutes"]', '20')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Задача создана успешно', { timeout: 10000 })

            // Нажимаем кнопку редактирования
            await page.click('[data-testid="edit-task-button"]')

            // Ждем появления формы редактирования
            await page.waitForSelector('[data-testid="task-form"]', { timeout: 5000 })

            // Изменяем данные
            await page.fill('input[name="title"]', 'Updated Task')
            await page.selectOption('select[name="priority"]', 'high')

            // Сохраняем изменения
            await page.click('button[type="submit"]')

            // Ждем успешного обновления
            await page.waitForSelector('text=Задача обновлена успешно', { timeout: 10000 })

            // Проверяем, что задача обновлена
            await expect(page.locator('text=Updated Task')).toBeVisible()
        })

        test('должен завершить задачу', async ({ page }) => {
            // Создаем задачу
            await page.click('text=Добавить задачу')
            await page.waitForSelector('[data-testid="task-form"]', { timeout: 5000 })
            await page.fill('input[name="title"]', 'Task to Complete')
            await page.fill('textarea[name="description"]', 'Description')
            await page.selectOption('select[name="priority"]', 'medium')
            await page.fill('input[name="estimatedMinutes"]', '30')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Задача создана успешно', { timeout: 10000 })

            // Нажимаем кнопку завершения
            await page.click('[data-testid="complete-task-button"]')

            // Ждем успешного завершения
            await page.waitForSelector('text=Задача завершена успешно', { timeout: 10000 })

            // Проверяем, что задача переместилась в раздел завершенных
            await expect(page.locator('text=Task to Complete')).toBeVisible()
        })

        test('должен удалить задачу', async ({ page }) => {
            // Создаем задачу
            await page.click('text=Добавить задачу')
            await page.waitForSelector('[data-testid="task-form"]', { timeout: 5000 })
            await page.fill('input[name="title"]', 'Task to Delete')
            await page.fill('textarea[name="description"]', 'Description')
            await page.selectOption('select[name="priority"]', 'low')
            await page.fill('input[name="estimatedMinutes"]', '15')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Задача создана успешно', { timeout: 10000 })

            // Нажимаем кнопку удаления
            await page.click('[data-testid="delete-task-button"]')

            // Подтверждаем удаление
            await page.click('text=Удалить')

            // Ждем успешного удаления
            await page.waitForSelector('text=Задача удалена успешно', { timeout: 10000 })

            // Проверяем, что задача удалена
            await expect(page.locator('text=Task to Delete')).not.toBeVisible()
        })
    })

    test.describe('AI Features', () => {
        test.beforeEach(async ({ page }) => {
            // Входим в систему
            await page.click('text=Войти')
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })

            // Переходим на страницу планировщика
            await page.goto('http://localhost:3000/planner')
        })

        test('должен показать рекомендации ИИ', async ({ page }) => {
            // Проверяем, что рекомендации ИИ отображаются
            await expect(page.locator('text=Сфокусируйтесь на срочных задачах')).toBeVisible()
            await expect(page.locator('text=Время для перерыва')).toBeVisible()
        })

        test('должен показать метрики продуктивности', async ({ page }) => {
            // Проверяем, что метрики продуктивности отображаются
            await expect(page.locator('text=Время фокуса: 120 мин')).toBeVisible()
            await expect(page.locator('text=Завершено задач: 1')).toBeVisible()
            await expect(page.locator('text=Оценка продуктивности: 75%')).toBeVisible()
        })

        test('должен показать анализ продуктивности', async ({ page }) => {
            // Проверяем, что анализ продуктивности отображается
            await expect(page.locator('text=Анализ продуктивности')).toBeVisible()
            await expect(page.locator('text=Рекомендации ИИ')).toBeVisible()
        })
    })

    test.describe('Subscription Features', () => {
        test.beforeEach(async ({ page }) => {
            // Входим в систему
            await page.click('text=Войти')
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })
        })

        test('должен показать информацию о подписке', async ({ page }) => {
            // Переходим на страницу планировщика
            await page.goto('http://localhost:3000/planner')

            // Проверяем, что информация о подписке отображается
            await expect(page.locator('text=Free план')).toBeVisible()
            await expect(page.locator('text=Обновить до Premium')).toBeVisible()
        })

        test('должен показать планы подписок', async ({ page }) => {
            // Нажимаем кнопку обновления подписки
            await page.click('text=Обновить до Premium')

            // Ждем появления модального окна с планами
            await page.waitForSelector('[data-testid="subscription-modal"]', { timeout: 5000 })

            // Проверяем, что планы отображаются
            await expect(page.locator('text=Free')).toBeVisible()
            await expect(page.locator('text=Premium')).toBeVisible()
            await expect(page.locator('text=Pro')).toBeVisible()
        })
    })

    test.describe('Error Handling', () => {
        test('должен показать ошибку при неверных данных формы', async ({ page }) => {
            // Нажимаем кнопку "Войти"
            await page.click('text=Войти')

            // Ждем появления модального окна
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })

            // Пытаемся отправить пустую форму
            await page.click('button[type="submit"]')

            // Проверяем, что показаны ошибки валидации
            await expect(page.locator('text=Email обязателен')).toBeVisible()
            await expect(page.locator('text=Пароль обязателен')).toBeVisible()
        })

        test('должен показать ошибку при неверном формате email', async ({ page }) => {
            // Нажимаем кнопку "Войти"
            await page.click('text=Войти')

            // Ждем появления модального окна
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })

            // Вводим неверный email
            await page.fill('input[name="email"]', 'invalid-email')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')

            // Проверяем, что показана ошибка валидации
            await expect(page.locator('text=Введите корректный email')).toBeVisible()
        })

        test('должен показать ошибку при несовпадении паролей при регистрации', async ({ page }) => {
            // Нажимаем кнопку "Войти"
            await page.click('text=Войти')

            // Ждем появления модального окна
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })

            // Переключаемся на вкладку регистрации
            await page.click('text=Регистрация')

            // Заполняем форму с несовпадающими паролями
            await page.fill('input[name="name"]', 'Test User')
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.fill('input[name="confirmPassword"]', 'different123')
            await page.click('button[type="submit"]')

            // Проверяем, что показана ошибка валидации
            await expect(page.locator('text=Пароли не совпадают')).toBeVisible()
        })
    })

    test.describe('Responsive Design', () => {
        test('должен корректно отображаться на мобильных устройствах', async ({ page }) => {
            // Устанавливаем размер экрана мобильного устройства
            await page.setViewportSize({ width: 375, height: 667 })

            // Перезагружаем страницу
            await page.reload()

            // Проверяем, что основные элементы отображаются
            await expect(page.locator('text=Personal Productivity AI')).toBeVisible()
            await expect(page.locator('text=Войти')).toBeVisible()

            // Проверяем, что навигация адаптирована для мобильных
            await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
        })

        test('должен корректно отображаться на планшетах', async ({ page }) => {
            // Устанавливаем размер экрана планшета
            await page.setViewportSize({ width: 768, height: 1024 })

            // Перезагружаем страницу
            await page.reload()

            // Проверяем, что основные элементы отображаются
            await expect(page.locator('text=Personal Productivity AI')).toBeVisible()
            await expect(page.locator('text=Войти')).toBeVisible()
        })
    })

    test.describe('Performance', () => {
        test('должен быстро загружать главную страницу', async ({ page }) => {
            const startTime = Date.now()

            await page.goto('http://localhost:3000')
            await page.waitForLoadState('networkidle')

            const loadTime = Date.now() - startTime

            // Проверяем, что страница загрузилась менее чем за 3 секунды
            expect(loadTime).toBeLessThan(3000)
        })

        test('должен быстро загружать планировщик после авторизации', async ({ page }) => {
            // Входим в систему
            await page.click('text=Войти')
            await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 5000 })
            await page.fill('input[name="email"]', 'test@example.test')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForSelector('text=Вход успешен', { timeout: 10000 })

            const startTime = Date.now()

            // Переходим на страницу планировщика
            await page.goto('http://localhost:3000/planner')
            await page.waitForLoadState('networkidle')

            const loadTime = Date.now() - startTime

            // Проверяем, что планировщик загрузился менее чем за 2 секунды
            expect(loadTime).toBeLessThan(2000)
        })
    })
})
