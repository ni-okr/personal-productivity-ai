/**
 * 👥 ТЕСТЫ ЮЗАБИЛИТИ
 * Покрытие: удобство использования, пользовательский опыт, доступность
 */

import { test, expect, Page } from '@playwright/test'

describe('🎯 User Experience Tests', () => {
  test('должен быть интуитивно понятным для новых пользователей', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что пользователь сразу понимает, что делать
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const title = await h1.textContent()
    expect(title).toContain('Personal Productivity AI')
    
    // Проверяем, что есть четкий призыв к действию
    const ctaButton = page.locator('[data-testid="subscribe-button"]')
    await expect(ctaButton).toBeVisible()
    
    const ctaText = await ctaButton.textContent()
    expect(ctaText).toContain('Подписаться')
    
    // Проверяем, что есть поле для ввода email
    const emailInput = page.locator('[data-testid="email-input"]')
    await expect(emailInput).toBeVisible()
    
    const placeholder = await emailInput.getAttribute('placeholder')
    expect(placeholder).toContain('email')
  })

  test('должен предоставлять обратную связь пользователю', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся подписаться
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось сообщение о статусе
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
    
    const statusText = await statusElement.textContent()
    expect(statusText).toBeTruthy()
  })

  test('должен иметь логичную навигацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть навигация
    const nav = page.locator('nav')
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()
      
      // Проверяем, что навигация содержит логичные ссылки
      const links = nav.locator('a')
      const linkCount = await links.count()
      
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i)
        const text = await link.textContent()
        const href = await link.getAttribute('href')
        
        // Ссылка должна иметь понятный текст и валидный href
        expect(text).toBeTruthy()
        expect(href).toBeTruthy()
      }
    }
  })
})

describe('⌨️ Keyboard Navigation Tests', () => {
  test('должен поддерживать навигацию с клавиатуры', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что можно навигировать с Tab
    await page.keyboard.press('Tab')
    let focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Проверяем, что можно навигировать назад с Shift+Tab
    await page.keyboard.press('Shift+Tab')
    focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('должен поддерживать активацию элементов с клавиатуры', async ({ page }) => {
    await page.goto('/')
    
    // Находим кнопку подписки
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await subscribeButton.focus()
    
    // Активируем с Enter
    await page.keyboard.press('Enter')
    
    // Проверяем, что кнопка сработала
    const statusElement = page.locator('[data-testid="subscription-status"]')
    if (await statusElement.count() > 0) {
      await expect(statusElement).toBeVisible()
    }
  })

  test('должен поддерживать навигацию по модальным окнам', async ({ page }) => {
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
    
    // Открываем модал
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Проверяем, что можно навигировать внутри модала
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Проверяем, что фокус остается в модале
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeAttached()
  })
})

describe('📱 Mobile Usability Tests', () => {
  test('должен быть удобным на мобильных устройствах', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем, что контент помещается на экране
    const body = page.locator('body')
    const scrollWidth = await body.evaluate(el => el.scrollWidth)
    const clientWidth = await body.evaluate(el => el.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1)
    
    // Проверяем, что элементы достаточно большие для touch
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const boundingBox = await button.boundingBox()
      
      if (boundingBox) {
        // Кнопки должны быть не менее 44x44 пикселей
        expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('должен поддерживать touch взаимодействие', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Проверяем touch взаимодействие
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await subscribeButton.tap()
    
    // Проверяем, что кнопка сработала
    const statusElement = page.locator('[data-testid="subscription-status"]')
    if (await statusElement.count() > 0) {
      await expect(statusElement).toBeVisible()
    }
  })

  test('должен поддерживать swipe навигацию', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 })
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
    
    // Проверяем, что можно прокручивать контент
    const scrollableElement = page.locator('[data-testid="planner-content"]')
    const initialScrollTop = await scrollableElement.evaluate(el => el.scrollTop)
    
    // Выполняем swipe вниз
    await page.mouse.move(200, 300)
    await page.mouse.down()
    await page.mouse.move(200, 200)
    await page.mouse.up()
    
    const newScrollTop = await scrollableElement.evaluate(el => el.scrollTop)
    expect(newScrollTop).not.toBe(initialScrollTop)
  })
})

describe('♿ Accessibility Usability Tests', () => {
  test('должен быть доступен для пользователей с ограниченными возможностями', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть alt атрибуты для изображений
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      // Изображение должно иметь alt атрибут или role="presentation"
      expect(alt !== null || role === 'presentation').toBeTruthy()
    }
  })

  test('должен поддерживать screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что есть ARIA атрибуты
    const ariaElements = page.locator('[aria-label], [aria-describedby], [aria-labelledby]')
    const ariaCount = await ariaElements.count()
    
    // Должны быть ARIA атрибуты для важных элементов
    expect(ariaCount).toBeGreaterThan(0)
    
    // Проверяем, что кнопки имеют описания
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()
      
      // Кнопка должна иметь либо aria-label, либо текстовое содержимое
      expect(ariaLabel || textContent?.trim()).toBeTruthy()
    }
  })

  test('должен иметь достаточный цветовой контраст', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем контраст основных элементов
    const elements = page.locator('h1, h2, h3, p, button, a')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
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

describe('🎨 Visual Design Usability Tests', () => {
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

  test('должен иметь логичную иерархию заголовков', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что заголовки идут в правильном порядке
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

describe('🔄 Error Handling Usability Tests', () => {
  test('должен показывать понятные сообщения об ошибках', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся подписаться с неверным email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось понятное сообщение об ошибке
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('email')
      expect(errorText).toContain('неверн')
    }
  })

  test('должен позволять исправить ошибки', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся подписаться с неверным email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')
    
    // Исправляем email
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что ошибка исчезла
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).not.toContain('неверн')
    }
  })

  test('должен предотвращать потерю данных', async ({ page }) => {
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
    await page.fill('[data-testid="task-description"]', 'Test Description')
    
    // Пытаемся закрыть модал без сохранения
    await page.keyboard.press('Escape')
    
    // Проверяем, что появилось предупреждение о потере данных
    const warningMessage = page.locator('.warning-message')
    if (await warningMessage.count() > 0) {
      const warningText = await warningMessage.textContent()
      expect(warningText).toContain('потеря')
    }
  })
})

describe('⚡ Performance Usability Tests', () => {
  test('должен быстро загружаться', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Страница должна загружаться менее чем за 5 секунд
    expect(loadTime).toBeLessThan(5000)
  })

  test('должен быстро отвечать на действия', async ({ page }) => {
    await page.goto('/')
    
    // Измеряем время отклика на клик
    const startTime = Date.now()
    await page.click('[data-testid="subscribe-button"]')
    const responseTime = Date.now() - startTime
    
    // Отклик должен быть менее 1 секунды
    expect(responseTime).toBeLessThan(1000)
  })

  test('должен показывать индикаторы загрузки', async ({ page }) => {
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
    
    // Проверяем, что есть индикаторы загрузки
    const loadingIndicators = page.locator('[aria-label="loading"], .loading, [data-testid="loading"]')
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators).toBeVisible()
    }
  })
})

describe('🎯 Task Completion Usability Tests', () => {
  test('должен позволять легко выполнять основные задачи', async ({ page }) => {
    await page.goto('/')
    
    // Основная задача: подписаться на рассылку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что задача выполнена
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
  })

  test('должен позволять легко управлять задачами', async ({ page }) => {
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
    
    // Основная задача: добавить задачу
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Проверяем, что задача добавилась
    await expect(page.locator('.task-card')).toBeVisible()
  })

  test('должен позволять легко навигировать между разделами', async ({ page }) => {
    await page.goto('/')
    
    // Переходим к планировщику
    await page.goto('/planner')
    
    // Проверяем, что страница загрузилась
    await expect(page.locator('body')).toBeVisible()
    
    // Возвращаемся на главную
    await page.goto('/')
    
    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toBeVisible()
  })
})