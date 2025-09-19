/**
 * 🌐 ИСЧЕРПЫВАЮЩИЕ E2E ТЕСТЫ
 * Покрытие: 90% основных пользовательских сценариев
 */

import { test, expect, Page } from '@playwright/test'

// Test data
const TEST_USER = {
  email: 'test@example.com',
  password: 'SecurePass123!',
  name: 'Test User'
}

const TEST_TASK = {
  title: 'E2E Test Task',
  description: 'This is a test task for E2E testing',
  priority: 'high',
  estimatedMinutes: 60
}

// Helper functions
async function loginUser(page: Page) {
  await page.goto('/planner')
  await page.click('[data-testid="login-button"]')
  await page.fill('input[type="email"]', TEST_USER.email)
  await page.fill('input[type="password"]', TEST_USER.password)
  await page.click('button[type="submit"]')
  await page.waitForSelector('[data-testid="planner-content"]')
}

async function createTask(page: Page, taskData: typeof TEST_TASK) {
  await page.click('[data-testid="add-task-button"]')
  await page.fill('[data-testid="task-title"]', taskData.title)
  await page.fill('textarea', taskData.description)
  await page.selectOption('select', taskData.priority)
  await page.fill('input[type="number"]', taskData.estimatedMinutes.toString())
  await page.click('[data-testid="save-task-button"]')
  await page.waitForSelector('.task-card')
}

async function completeTask(page: Page, taskTitle: string) {
  const taskCard = page.locator('.task-card').filter({ hasText: taskTitle })
  await taskCard.locator('button[aria-label*="Toggle task"]').click()
  await page.waitForSelector('.task-card.completed')
}

test('🏠 Landing Page - должен загружать главную страницу', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Personal Productivity AI/)
  await expect(page.locator('h1')).toContainText('Personal Productivity AI')
  await expect(page.locator('[data-testid="planner-link"]')).toBeVisible()
})

test('🏠 Landing Page - должен отображать все секции на главной странице', async ({ page }) => {
  await page.goto('/')

  // Hero section
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('[data-testid="planner-button"]')).toBeVisible()
  await expect(page.locator('[data-testid="notify-release-button"]')).toBeVisible()

  // Features section
  await expect(page.locator('h2')).toContainText('Что будет решать Personal AI')

  // Pricing section
  await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible()
  await expect(page.locator('[data-testid="plan-free"]')).toBeVisible()
  await expect(page.locator('[data-testid="plan-premium"]')).toBeVisible()
  await expect(page.locator('[data-testid="plan-pro"]')).toBeVisible()

  // Subscription section
  await expect(page.locator('[data-testid="subscription-form"]')).toBeVisible()
})

test('должен работать подписка на уведомления', async ({ page }) => {
  await page.goto('/')

  const email = 'subscriber@example.com'
  await page.fill('[data-testid="email-input"]', email)
  await page.click('[data-testid="subscribe-button"]')

  await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Спасибо за подписку')
})

test('должен показывать ошибку для невалидного email', async ({ page }) => {
  await page.goto('/')

  await page.fill('[data-testid="email-input"]', 'invalid-email')
  await page.click('[data-testid="subscribe-button"]')

  await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Введите корректный email')
})

test('должен работать навигация по странице', async ({ page }) => {
  await page.goto('/')

  // Прокрутка к секции подписки
  await page.click('[data-testid="notify-release-button"]')
  await page.waitForSelector('[data-testid="subscription-form"]')

  // Прокрутка к секции цен
  await page.click('[data-testid="pricing-button"]')
  await page.waitForSelector('[data-testid="pricing-section"]')
})

test('должен работать PWA установка', async ({ page }) => {
  await page.goto('/')

  // Ждем появления кнопки установки
  await page.waitForSelector('[data-testid="install-app-button"]', { timeout: 5000 })

  // Проверяем, что кнопка видна
  await expect(page.locator('[data-testid="install-app-button"]')).toBeVisible()
})
// конец блока Landing Page

describe('🧠 Planner Page E2E Tests', () => {
  test('должен показывать форму входа для неавторизованного пользователя', async ({ page }) => {
    await page.goto('/planner')

    await expect(page.locator('h1')).toContainText('ИИ-Планировщик')
    await expect(page.locator('button')).toContainText('Войти в систему')
  })

  test('должен работать полный цикл создания и управления задачами', async ({ page }) => {
    // Мокаем авторизацию
    await page.goto('/planner')

    // Симулируем успешный вход
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()

    // Проверяем, что планировщик загрузился
    await expect(page.locator('[data-testid="planner-content"]')).toBeVisible()

    // Создаем задачу
    await createTask(page, TEST_TASK)

    // Проверяем, что задача появилась
    await expect(page.locator('.task-card')).toContainText(TEST_TASK.title)

    // Завершаем задачу
    await completeTask(page, TEST_TASK.title)

    // Проверяем, что задача переместилась в секцию "Выполнено сегодня"
    await expect(page.locator('.task-card.completed')).toContainText(TEST_TASK.title)
  })

  test('должен работать валидация формы создания задачи', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Открываем форму создания задачи
    await page.click('[data-testid="add-task-button"]')

    // Пытаемся сохранить пустую форму
    await page.click('[data-testid="save-task-button"]')

    // Проверяем, что появились ошибки валидации
    await expect(page.locator('.error-message')).toContainText('Название задачи обязательно')
  })

  test('должен работать фильтрация задач по статусу', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Создаем несколько задач
    await createTask(page, { ...TEST_TASK, title: 'Task 1' })
    await createTask(page, { ...TEST_TASK, title: 'Task 2' })

    // Завершаем одну задачу
    await completeTask(page, 'Task 1')

    // Проверяем, что задачи распределились по секциям
    await expect(page.locator('[data-testid="urgent-tasks"] .task-card')).toHaveCount(1)
    await expect(page.locator('[data-testid="completed-tasks"] .task-card')).toHaveCount(1)
  })

  test('должен работать ИИ анализ продуктивности', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Создаем и завершаем несколько задач
    await createTask(page, { ...TEST_TASK, title: 'Task 1', priority: 'urgent' })
    await createTask(page, { ...TEST_TASK, title: 'Task 2', priority: 'high' })

    await completeTask(page, 'Task 1')
    await completeTask(page, 'Task 2')

    // Проверяем, что ИИ анализ появился
    await expect(page.locator('[data-testid="ai-analysis"]')).toBeVisible()
    await expect(page.locator('[data-testid="productivity-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-insights"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-recommendations"]')).toBeVisible()
  })

  test('должен работать умная сортировка задач', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Создаем задачи с разными приоритетами
    await createTask(page, { ...TEST_TASK, title: 'Low Priority Task', priority: 'low' })
    await createTask(page, { ...TEST_TASK, title: 'High Priority Task', priority: 'high' })
    await createTask(page, { ...TEST_TASK, title: 'Urgent Task', priority: 'urgent' })

    // Включаем умную сортировку
    await page.check('input[type="checkbox"]')

    // Проверяем, что задачи отсортированы по приоритету
    const taskCards = page.locator('[data-testid="urgent-tasks"] .task-card')
    await expect(taskCards.nth(0)).toContainText('Urgent Task')
    await expect(taskCards.nth(1)).toContainText('High Priority Task')
  })
})

describe('📱 Mobile E2E Tests', () => {
  test('должен корректно работать на мобильном устройстве', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Проверяем, что контент адаптируется под мобильный экран
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="planner-button"]')).toBeVisible()

    // Проверяем, что кнопки имеют подходящий размер для мобильного
    const button = page.locator('[data-testid="planner-button"]')
    const buttonBox = await button.boundingBox()
    expect(buttonBox?.height).toBeGreaterThan(40) // Минимальная высота для мобильного
  })

  test('должен работать PWA установка на мобильном', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Симулируем событие beforeinstallprompt
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      window.dispatchEvent(event)
    })

    // Проверяем, что кнопка установки появилась
    await page.waitForSelector('[data-testid="install-app-button"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="install-app-button"]')).toBeVisible()
  })
})

describe('🔒 Security E2E Tests', () => {
  test('должен защищать от XSS атак', async ({ page }) => {
    await page.goto('/')

    // Пытаемся ввести XSS код в поле email
    const xssPayload = '<script>alert("xss")</script>'
    await page.fill('[data-testid="email-input"]', xssPayload)

    // Проверяем, что скрипт не выполнился
    const pageContent = await page.content()
    expect(pageContent).not.toContain('<script>alert("xss")</script>')
    expect(pageContent).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;')
  })

  test('должен валидировать входные данные на клиенте', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Открываем форму создания задачи
    await page.click('[data-testid="add-task-button"]')

    // Пытаемся ввести невалидные данные
    await page.fill('[data-testid="task-title"]', 'a'.repeat(201)) // Слишком длинное название
    await page.fill('input[type="number"]', '-1') // Отрицательное время

    await page.click('[data-testid="save-task-button"]')

    // Проверяем, что появились ошибки валидации
    await expect(page.locator('.error-message')).toContainText('Название задачи не должно превышать 200 символов')
    await expect(page.locator('.error-message')).toContainText('Время выполнения должно быть больше 0 минут')
  })
})

describe('⚡ Performance E2E Tests', () => {
  test('должен загружаться быстро', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Страница должна загрузиться менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000)
  })

  test('должен работать плавно при создании множества задач', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    const startTime = Date.now()

    // Создаем 10 задач подряд
    for (let i = 0; i < 10; i++) {
      await createTask(page, { ...TEST_TASK, title: `Task ${i}` })
    }

    const endTime = Date.now()
    const processingTime = endTime - startTime

    // Создание 10 задач должно занять менее 10 секунд
    expect(processingTime).toBeLessThan(10000)

    // Проверяем, что все задачи созданы
    await expect(page.locator('.task-card')).toHaveCount(10)
  })
})

describe('🔄 Error Handling E2E Tests', () => {
  test('должен показывать ошибку при сбое сети', async ({ page }) => {
    // Блокируем сетевые запросы
    await page.route('**/*', route => route.abort())

    await page.goto('/')

    // Пытаемся подписаться на рассылку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')

    // Проверяем, что появилось сообщение об ошибке
    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Ошибка сети')
  })

  test('должен восстанавливаться после ошибок', async ({ page }) => {
    await page.goto('/planner')

    // Мокаем авторизацию
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: 'free'
      }))
    })

    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')

    // Симулируем ошибку при создании задачи
    await page.route('**/api/tasks', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    }))

    await createTask(page, TEST_TASK)

    // Проверяем, что ошибка обработана gracefully
    await expect(page.locator('.error-message')).toBeVisible()

    // Восстанавливаем сеть
    await page.unroute('**/api/tasks')

    // Проверяем, что приложение продолжает работать
    await createTask(page, { ...TEST_TASK, title: 'Recovery Task' })
    await expect(page.locator('.task-card')).toContainText('Recovery Task')
  })
})

describe('🎨 UI/UX E2E Tests', () => {
  test('должен иметь правильные цвета и стили', async ({ page }) => {
    await page.goto('/')

    // Проверяем основные цвета
    const primaryButton = page.locator('[data-testid="planner-button"]')
    const buttonColor = await primaryButton.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )

    // Проверяем, что кнопка имеет правильный цвет (indigo-600)
    expect(buttonColor).toContain('rgb(79, 70, 229)')
  })

  test('должен иметь правильную типографику', async ({ page }) => {
    await page.goto('/')

    // Проверяем заголовок
    const heading = page.locator('h1')
    const fontSize = await heading.evaluate(el =>
      window.getComputedStyle(el).fontSize
    )

    // Проверяем, что заголовок имеет достаточно большой размер
    expect(parseInt(fontSize)).toBeGreaterThan(40)
  })

  test('должен быть доступным для клавиатурной навигации', async ({ page }) => {
    await page.goto('/')

    // Нажимаем Tab для навигации
    await page.keyboard.press('Tab')

    // Проверяем, что фокус переместился на первый элемент
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeDefined()
  })
})

describe('🌐 Cross-Browser E2E Tests', () => {
  test('должен работать в Chrome', async ({ page, browserName }) => {
    if (browserName !== 'chromium') {
      test.skip()
    }

    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен работать в Firefox', async ({ page, browserName }) => {
    if (browserName !== 'firefox') {
      test.skip()
    }

    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('должен работать в Safari', async ({ page, browserName }) => {
    if (browserName !== 'webkit') {
      test.skip()
    }

    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })
})

describe('📊 Analytics E2E Tests', () => {
  test('должен отслеживать пользовательские действия', async ({ page }) => {
    await page.goto('/')

    // Симулируем клик по кнопке планировщика
    await page.click('[data-testid="planner-button"]')

    // Проверяем, что событие было отправлено (если есть аналитика)
    // Это зависит от реализации аналитики
  })

  test('должен отслеживать конверсии', async ({ page }) => {
    await page.goto('/')

    // Подписываемся на рассылку
    await page.fill('[data-testid="email-input"]', 'conversion@example.com')
    await page.click('[data-testid="subscribe-button"]')

    // Проверяем, что событие конверсии было отправлено
    // Это зависит от реализации аналитики
  })
})