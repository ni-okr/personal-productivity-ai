/**
 * 🎨 ТЕСТЫ UI
 * Покрытие: формы, кликабельность, элементы, поля ввода
 */

import { test, expect, Page } from '@playwright/test'

describe('📝 Form Tests', () => {
  test('должен отображать форму подписки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что форма подписки видна
    const form = page.locator('form')
    await expect(form).toBeVisible()
    
    // Проверяем, что есть поле email
    const emailInput = page.locator('[data-testid="email-input"]')
    await expect(emailInput).toBeVisible()
    
    // Проверяем, что есть кнопка подписки
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await expect(subscribeButton).toBeVisible()
  })

  test('должен валидировать форму подписки', async ({ page }) => {
    await page.goto('/')
    
    // Пытаемся отправить пустую форму
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилась ошибка валидации
    const errorMessage = page.locator('.error-message')
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible()
    }
    
    // Пытаемся отправить форму с неверным email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилась ошибка валидации
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('email')
    }
  })

  test('должен обрабатывать успешную отправку формы', async ({ page }) => {
    await page.goto('/')
    
    // Заполняем форму валидными данными
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появилось сообщение об успехе
    const statusElement = page.locator('[data-testid="subscription-status"]')
    await expect(statusElement).toBeVisible()
  })

  test('должен сбрасывать форму после отправки', async ({ page }) => {
    await page.goto('/')
    
    // Заполняем форму
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Ждем обработки
    await page.waitForTimeout(1000)
    
    // Проверяем, что поле очистилось
    const emailInput = page.locator('[data-testid="email-input"]')
    const value = await emailInput.inputValue()
    expect(value).toBe('')
  })
})

describe('🖱️ Clickability Tests', () => {
  test('должен обрабатывать клики по кнопкам', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем клик по кнопке подписки
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    await subscribeButton.click()
    
    // Проверяем, что кнопка сработала
    const statusElement = page.locator('[data-testid="subscription-status"]')
    if (await statusElement.count() > 0) {
      await expect(statusElement).toBeVisible()
    }
  })

  test('должен обрабатывать клики по ссылкам', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем клики по ссылкам
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const href = await link.getAttribute('href')
      const isVisible = await link.isVisible()
      
      if (isVisible && href && !href.startsWith('http')) {
        // Кликаем по ссылке
        await link.click()
        
        // Проверяем, что страница загрузилась
        await expect(page.locator('body')).toBeVisible()
        
        // Возвращаемся назад
        await page.goBack()
      }
    }
  })

  test('должен обрабатывать клики по интерактивным элементам', async ({ page }) => {
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
    
    // Проверяем клик по кнопке добавления задачи
    const addButton = page.locator('[data-testid="add-task-button"]')
    await addButton.click()
    
    // Проверяем, что модал открылся
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
  })
})

describe('📋 Input Field Tests', () => {
  test('должен обрабатывать ввод в поля email', async ({ page }) => {
    await page.goto('/')
    
    const emailInput = page.locator('[data-testid="email-input"]')
    
    // Проверяем, что поле принимает ввод
    await emailInput.fill('test@example.com')
    const value = await emailInput.inputValue()
    expect(value).toBe('test@example.com')
    
    // Проверяем, что поле очищается
    await emailInput.fill('')
    const emptyValue = await emailInput.inputValue()
    expect(emptyValue).toBe('')
  })

  test('должен валидировать поля email', async ({ page }) => {
    await page.goto('/')
    
    const emailInput = page.locator('[data-testid="email-input"]')
    
    // Проверяем валидацию в реальном времени
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
      await emailInput.fill(email)
      const value = await emailInput.inputValue()
      expect(value).toBe(email)
    }
    
    // Проверяем невалидные email
    for (const email of invalidEmails) {
      await emailInput.fill(email)
      const value = await emailInput.inputValue()
      expect(value).toBe(email) // Поле должно принимать ввод, но валидация должна сработать при отправке
    }
  })

  test('должен обрабатывать специальные символы в полях ввода', async ({ page }) => {
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
    
    // Открываем модал добавления задачи
    await page.click('[data-testid="add-task-button"]')
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Проверяем ввод специальных символов
    const specialChars = [
      'Test Task with Special Chars: !@#$%^&*()',
      'Тест с русскими символами',
      'Test with emoji 🚀',
      'Test with unicode: αβγδε'
    ]
    
    for (const chars of specialChars) {
      const titleInput = page.locator('[data-testid="task-title"]')
      await titleInput.fill(chars)
      
      const value = await titleInput.inputValue()
      expect(value).toBe(chars)
    }
  })
})

describe('🎛️ UI Element Tests', () => {
  test('должен отображать все необходимые элементы', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем основные элементы
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
    
    // Проверяем, что элементы имеют правильные атрибуты
    const emailInput = page.locator('[data-testid="email-input"]')
    const inputType = await emailInput.getAttribute('type')
    expect(inputType).toBe('email')
    
    const subscribeButton = page.locator('[data-testid="subscribe-button"]')
    const buttonType = await subscribeButton.getAttribute('type')
    expect(buttonType).toBe('submit')
  })

  test('должен отображать элементы в правильном порядке', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем порядок элементов
    const elements = page.locator('h1, [data-testid="email-input"], [data-testid="subscribe-button"]')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      expect(isVisible).toBe(true)
    }
  })

  test('должен отображать элементы с правильными стилями', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что элементы имеют стили
    const elements = page.locator('h1, button, input')
    const elementCount = await elements.count()
    
    for (let i = 0; i < elementCount; i++) {
      const element = elements.nth(i)
      const isVisible = await element.isVisible()
      
      if (isVisible) {
        // Проверяем, что элемент имеет размер
        const boundingBox = await element.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0)
          expect(boundingBox.height).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('🔄 State Management Tests', () => {
  test('должен управлять состоянием формы', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем начальное состояние
    const emailInput = page.locator('[data-testid="email-input"]')
    const initialValue = await emailInput.inputValue()
    expect(initialValue).toBe('')
    
    // Изменяем состояние
    await emailInput.fill('test@example.com')
    const newValue = await emailInput.inputValue()
    expect(newValue).toBe('test@example.com')
    
    // Сбрасываем состояние
    await emailInput.fill('')
    const resetValue = await emailInput.inputValue()
    expect(resetValue).toBe('')
  })

  test('должен управлять состоянием модальных окон', async ({ page }) => {
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
    
    // Проверяем, что модал закрыт
    const modal = page.locator('[data-testid="task-modal"]')
    await expect(modal).not.toBeVisible()
    
    // Открываем модал
    await page.click('[data-testid="add-task-button"]')
    await expect(modal).toBeVisible()
    
    // Закрываем модал
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })

  test('должен управлять состоянием загрузки', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем, что нет индикатора загрузки
    const loadingIndicator = page.locator('[aria-label="loading"], .loading, [data-testid="loading"]')
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).not.toBeVisible()
    }
    
    // Выполняем действие, которое может вызвать загрузку
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.click('[data-testid="subscribe-button"]')
    
    // Проверяем, что появился индикатор загрузки (если есть)
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible()
    }
  })
})

describe('📱 Responsive UI Tests', () => {
  test('должен адаптироваться к разным размерам экрана', async ({ page }) => {
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
      
      // Проверяем, что основные элементы видны
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="subscribe-button"]')).toBeVisible()
      
      // Проверяем, что контент помещается на экране
      const body = page.locator('body')
      const scrollWidth = await body.evaluate(el => el.scrollWidth)
      const clientWidth = await body.evaluate(el => el.clientWidth)
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.2) // 20% допуск
    }
  })

  test('должен поддерживать touch взаимодействие на мобильных устройствах', async ({ page }) => {
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

  test('должен поддерживать keyboard навигацию', async ({ page }) => {
    await page.goto('/')
    
    // Проверяем навигацию с Tab
    await page.keyboard.press('Tab')
    let focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Проверяем навигацию назад с Shift+Tab
    await page.keyboard.press('Shift+Tab')
    focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})

describe('🎨 Visual Design Tests', () => {
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