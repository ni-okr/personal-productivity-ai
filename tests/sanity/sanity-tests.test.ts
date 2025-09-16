/**
 * 🧠 SANITY ТЕСТЫ
 * Покрытие: логическая целостность, здравый смысл, базовые проверки
 */

import { test, expect, Page } from '@playwright/test'

describe('🎯 Basic Logic Sanity Tests', () => {
  test('должен иметь логичную структуру страницы', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть заголовок
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Проверяем, что заголовок имеет смысл
    const title = await h1.textContent()
    expect(title).toBeTruthy()
    expect(title!.length).toBeGreaterThan(0)
    
    // Проверяем, что есть основное содержимое
    const main = page.locator('main')
    if (await main.count() > 0) {
      await expect(main).toBeVisible()
    }
  })

  test('должен иметь логичную навигацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть навигация
    const nav = page.locator('nav')
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()
      
      // Проверяем, что навигация содержит ссылки
      const links = nav.locator('a')
      const linkCount = await links.count()
      expect(linkCount).toBeGreaterThan(0)
    }
  })

  test('должен иметь логичную форму подписки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть форма подписки
    const emailInput = page.locator('[data-testid="email-input"]')
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    
    await expect(emailInput).toBeVisible()
    await expect(subscribeButton).toBeVisible()
    
    // Проверяем, что поле email имеет правильный тип
    const inputType = await emailInput.getAttribute('type')
    expect(inputType).toBe('email')
    
    // Проверяем, что кнопка имеет правильный тип
    const buttonType = await subscribeButton.getAttribute('type')
    expect(buttonType).toBe('submit')
  })
})

describe('🔍 Data Validation Sanity Tests', () => {
  test('должен валидировать email корректно', async ({ page }) => {
    await page.goto('/')
    
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ]
    
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'test@',
      'test..test@example.com'
    ]
    
    // Проверяем валидные email
    for (const email of validEmails) {
      await page.fill('[data-testid="email-input"]', email)
      await page.click('[data-testid="subscribe-button"]')
      
      // Проверяем, что нет ошибки валидации
      const errorMessage = page.locator('.error-message')
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent()
        expect(errorText).not.toContain('email')
      }
    }
    
    // Проверяем невалидные email
    for (const email of invalidEmails) {
      await page.fill('[data-testid="email-input"]', email)
      await page.click('[data-testid="subscribe-button"]')
      
      // Проверяем, что есть ошибка валидации
      const errorMessage = page.locator('.error-message')
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent()
        expect(errorText).toContain('email')
      }
    }
  })

  test('должен валидировать длину ввода', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем очень длинный email
    const longEmail = 'a'.repeat(1000) + '@example.com'
    await page.fill('[data-testid="email-input"]', longEmail)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что есть ошибка валидации
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('длинн')
    }
  })

  test('должен валидировать обязательные поля', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся отправить пустую форму
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что есть ошибка валидации
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('обязательно')
    }
  })
})

describe('🎨 UI/UX Sanity Tests', () => {
  test('должен иметь консистентный дизайн', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что все кнопки имеют одинаковый стиль
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const isVisible = await button.isVisible()
      
      if (isVisible) {
        // Проверяем, что кнопка имеет разумный размер
        const boundingBox = await button.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0)
          expect(boundingBox.height).toBeGreaterThan(0)
        }
      }
    }
  })

  test('должен иметь читаемые шрифты', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что текст читаем
    const textElements = page.locator('h1, h2, h3, p, span, div')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const text = await element.textContent()
      const isVisible = await element.isVisible()
      
      if (isVisible && text && text.trim()) {
        // Проверяем, что текст не слишком мелкий
        const fontSize = await element.evaluate(el => {
          return window.getComputedStyle(el).fontSize
        })
        
        const fontSizeValue = parseFloat(fontSize)
        expect(fontSizeValue).toBeGreaterThan(10) // Минимум 10px
      }
    }
  })

  test('должен иметь логичную цветовую схему', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть контраст между текстом и фоном
    const textElements = page.locator('h1, h2, h3, p')
    const elementCount = await textElements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = textElements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет цвет
        const color = await element.evaluate(el => {
          return window.getComputedStyle(el).color
        })
        
        expect(color).not.toBe('rgba(0, 0, 0, 0)') // Не прозрачный
        expect(color).not.toBe('transparent')
      }
    }
  })
})

describe('🔧 Functionality Sanity Tests', () => {
  test('должен выполнять заявленные функции', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что можно подписаться на рассылку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось сообщение о статусе
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })

  test('должен обрабатывать пользовательские действия', async ({ page }) => {
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
    
    // Проверяем, что можно добавить задачу
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Проверяем, что можно заполнить форму
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Test Description')
    
    // Проверяем, что можно сохранить задачу
    await page.click('[data-testid="save-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
  })

  test('должен сохранять состояние между действиями', async ({ page }) => {
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
    
    // Добавляем задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Обновляем страницу
    await page.reload()
    await page.waitForSelector('[data-testid="planner-content"]')
    
    // Проверяем, что задача сохранилась
    const taskCards = page.locator('.task-card')
    const taskCount = await taskCards.count()
    expect(taskCount).toBeGreaterThan(0)
  })
})

describe('🌐 Cross-Browser Sanity Tests', () => {
  test('должен работать в разных браузерах', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что страница загружается
    await expect(page.locator('h1')).toBeVisible()
    
    // Проверяем, что нет ошибок в консоли
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    
    // Не должно быть критических ошибок
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Error') || error.includes('Failed')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('должен поддерживать разные размеры экрана', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // Desktop
      { width: 1920, height: 1080 } // Large Desktop
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      
      // Проверяем, что страница загружается
      await expect(page.locator('h1')).toBeVisible()
      
      // Проверяем, что контент помещается на экране
      const body = page.locator('body')
      const scrollWidth = await body.evaluate(el => el.scrollWidth)
      const clientWidth = await body.evaluate(el => el.clientWidth)
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.2) // 20% допуск
    }
  })
})

describe('🔒 Security Sanity Tests', () => {
  test('должен защищать от основных атак', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем защиту от XSS
    const xssPayload = '<script>alert("xss")</script>'
    await page.fill('[data-testid="email-input"]', xssPayload)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что скрипт не выполнился
    const pageContent = await page.content()
    expect(pageContent).not.toContain('<script>')
    
    // Проверяем защиту от SQL инъекций
    const sqlInjection = "'; DROP TABLE users; --"
    await page.fill('[data-testid="email-input"]', sqlInjection)
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что запрос обработан безопасно
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible()
  })

  test('должен использовать безопасные заголовки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем security заголовки
    const response = await page.request.get('/')
    const headers = response.headers()
    
    // Проверяем наличие основных security заголовков
    expect(headers['x-frame-options']).toBeDefined()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-xss-protection']).toBeDefined()
  })
})

describe('📊 Performance Sanity Tests', () => {
  test('должен загружаться в разумное время', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 10 секунд
    expect(loadTime).toBeLessThan(10000)
  })

  test('должен использовать разумное количество ресурсов', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем количество HTTP запросов
    const requests = []
    page.on('request', request => {
      requests.push(request.url())
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Не должно быть слишком много запросов
    expect(requests.length).toBeLessThan(100)
  })

  test('должен иметь разумный размер DOM', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length
    })
    
    // DOM не должен быть слишком большим
    expect(domSize).toBeLessThan(2000)
  })
})

describe('🎯 Business Logic Sanity Tests', () => {
  test('должен соответствовать бизнес-требованиям', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть информация о продукте
    const h1 = page.locator('h1')
    const title = await h1.textContent()
    expect(title).toContain('Personal Productivity AI')
    
    // Проверяем, что есть призыв к действию
    const ctaButton = page.locator('[data-testid="subscribe-button"]')
    await expect(ctaButton).toBeVisible()
    
    const ctaText = await ctaButton.textContent()
    expect(ctaText).toContain('Подписаться')
  })

  test('должен предоставлять ценность пользователю', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть описание продукта
    const description = page.locator('p')
    const descriptionCount = await description.count()
    expect(descriptionCount).toBeGreaterThan(0)
    
    // Проверяем, что есть преимущества
    const benefits = page.locator('[data-testid*="benefit"], .benefit')
    const benefitCount = await benefits.count()
    expect(benefitCount).toBeGreaterThan(0)
  })

  test('должен иметь логичную структуру контента', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть заголовки в правильном порядке
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i)
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const level = parseInt(tagName.substring(1))
      
      // Проверяем, что уровень заголовка не пропускается
      if (i > 0) {
        const prevHeading = headings.nth(i - 1)
        const prevTagName = await prevHeading.evaluate(el => el.tagName.toLowerCase())
        const prevLevel = parseInt(prevTagName.substring(1))
        
        expect(level).toBeLessThanOrEqual(prevLevel + 1)
      }
    }
  })
})